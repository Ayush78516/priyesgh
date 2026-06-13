import GSTTax from "../models/GSTTax.js";
import CMS from "../models/CMS.js";
import User from "../models/User.js";
import createLogger from "../utils/logger.js";
import {
  DEFAULT_MEMBERSHIP_FEES,
  MEMBERSHIP_FEES_CMS_KEY,
  parseMembershipFees,
  resolveMembershipPaymentAmount,
} from "../utils/membershipFees.js";
import crypto from "crypto";

const logger = createLogger("payment");

const FEE_MAP = {
  Monthly: process.env.FEE_MONTHLY || "1",
  Quarterly: process.env.FEE_QUARTERLY || "1",
  Annual: process.env.FEE_ANNUAL || "1",
  Institutional: process.env.FEE_INSTITUTIONAL || "1",
};

async function loadMembershipFeeRows() {
  const record = await CMS.findOne({ key: MEMBERSHIP_FEES_CMS_KEY }).lean();
  const rows = parseMembershipFees(record?.value);
  return rows.length > 0 ? rows : DEFAULT_MEMBERSHIP_FEES;
}

async function loadGstTaxes() {
  const taxes = await GSTTax.find().sort({ createdAt: -1 }).lean();
  const byId = {};
  taxes.forEach((tax) => {
    byId[tax._id.toString()] = tax;
  });
  const activeTax = taxes.find((tax) => tax.isActive !== false) || taxes[0] || null;
  const rate = Number(activeTax?.gstPercentage);
  return {
    taxes,
    byId,
    activeTaxId: activeTax?._id?.toString() || "",
    activeRate: Number.isFinite(rate) ? rate : 18,
  };
}

export const getPaymentData = async (req, res) => {
  try {
    logger.info("[getPaymentData] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      logger.warn("[getPaymentData] User not found", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });

      return res.status(404).json({ success: false, message: "User not found" });
    }

    const memberType = user.memberDetails?.memberType || "Annual";
    const memberClass = user.memberDetails?.memberClass || "";
    const validTill = user.memberDetails?.validTill || "";
    const feeRows = await loadMembershipFeeRows();
    const { byId: gstTaxesById, activeTaxId, activeRate: gstRate } = await loadGstTaxes();
    const hasCompletedPayment = Array.isArray(user.payments)
      && user.payments.some((payment) => ["Success", "Completed"].includes(payment?.status));
    const feeBreakdown = resolveMembershipPaymentAmount({
      rows: feeRows,
      memberClass,
      memberType,
      hasCompletedPayment,
      gstRate,
      taxRatesById: gstTaxesById,
    });
    const amount = (feeBreakdown.components.length > 0 || feeBreakdown.selectedCategory)
      ? String(feeBreakdown.amount)
      : (FEE_MAP[memberType] || "1");
    const selectedTaxId = feeBreakdown.selectedTaxRateId || activeTaxId;
    const orderId = `COV${Date.now()}${req.user.id.toString().slice(-4)}`;
    const ccavServerUrl = process.env.CCAVENUE_SERVER_URL || "http://localhost:3001";

    logger.info("[getPaymentData] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      orderId,
      memberType,
      amount
    });

    return res.json({
      success: true,
      formData: {
        merchant_id: process.env.CCAVENUE_MERCHANT_ID,
        order_id: orderId,
        currency: "INR",
        amount,
        redirect_url: `${ccavServerUrl}/ccavResponseHandler`,
        cancel_url: `${ccavServerUrl}/ccavResponseHandler`,
        language: "EN",
        billing_name: `${user.firstName} ${user.lastName}`,
        billing_address: user.permAddress?.line1 || "NA",
        billing_city: user.permAddress?.city || "NA",
        billing_state: user.permAddress?.state || "NA",
        billing_zip: user.permAddress?.pincode || "000000",
        billing_country: "India",
        billing_tel: user.personal?.mobile || user.phone || "9999999999",
        billing_email: user.email,
        delivery_name: `${user.firstName} ${user.lastName}`,
        delivery_address: user.permAddress?.line1 || "NA",
        delivery_city: user.permAddress?.city || "NA",
        delivery_state: user.permAddress?.state || "NA",
        delivery_zip: user.permAddress?.pincode || "000000",
        delivery_country: "India",
        delivery_tel: user.personal?.mobile || user.phone || "9999999999",
        merchant_param1: req.user.id.toString(),
        merchant_param2: user.tempMembershipId || "",
        merchant_param3: memberType,
        merchant_param4: memberClass,
        merchant_param5: validTill,
        merchant_param6: selectedTaxId,
        promo_code: "",
        customer_identifier: user.email,
      },
      ccavRequestUrl: `${ccavServerUrl}/ccavRequestHandler`,
      amount,
      memberType,
      feeCategory: feeBreakdown.selectedCategory || "",
      feeComponents: feeBreakdown.components,
      gstRate,
      gstTaxId: selectedTaxId,
      orderId,
    });
  } catch (err) {
    logger.error("[getPaymentData] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const savePayment = async (req, res) => {
  try {
    logger.info("[savePayment] Request received", {
      requestId: req.requestId,
      userId: req.body?.merchantParam1 || null,
      orderId: req.body?.orderId || null
    });

    const {
      orderId, trackingId, bankRefNo, amount,
      memberType, memberClass, membershipNo, validTill,
      paymentMode, status, paidAt, merchantParam1, gstTaxId, gstRate,
    } = req.body;

    if (!merchantParam1) {
      logger.warn("[savePayment] No user ID supplied", {
        requestId: req.requestId,
        orderId: orderId || null
      });

      return res.status(400).json({ success: false, message: "No user ID" });
    }

    // Verify payment signature to prevent direct endpoint spoofing
    const signature = req.headers["x-payment-signature"];
    const expectedSignature = crypto.createHmac("sha256", process.env.CCAVENUE_WORKING_KEY || "")
      .update((orderId || "") + (amount || "") + (merchantParam1 || ""))
      .digest("hex");

    if (signature !== expectedSignature) {
      logger.warn("[savePayment] Invalid signature provided", {
        requestId: req.requestId,
        orderId: orderId || null,
        provided: signature || "none"
      });
      return res.status(403).json({ success: false, message: "Unauthorized payment save callback" });
    }

    const finalStatus = (status === "Success" || status === "Completed") ? "Completed" : (status || "Failed");
    let resolvedGstRate = Number.isFinite(Number(gstRate)) ? Number(gstRate) : undefined;
    if (!resolvedGstRate && gstTaxId) {
      const taxDoc = await GSTTax.findById(gstTaxId).lean();
      const taxRate = Number(taxDoc?.gstPercentage);
      if (Number.isFinite(taxRate)) resolvedGstRate = taxRate;
    }

    await User.findByIdAndUpdate(merchantParam1, {
      isLocked: true,
      $push: {
        payments: {
          orderId, trackingId, bankRefNo, amount,
          memberType, memberClass, membershipNo, validTill,
          paymentMode, status: finalStatus,
          gstTaxId: gstTaxId || "",
          gstRate: resolvedGstRate,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        }
      }
    });

    logger.info("[savePayment] Payment saved successfully", {
      requestId: req.requestId,
      userId: merchantParam1,
      orderId,
      amount,
      status: finalStatus
    });

    return res.json({ success: true, message: "Payment saved" });
  } catch (err) {
    logger.error("[savePayment] Failed", {
      requestId: req.requestId,
      userId: req.body?.merchantParam1 || null,
      orderId: req.body?.orderId || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};
