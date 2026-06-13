import mongoose from "mongoose";
import CompanyGSTProfile from "../models/CompanyGSTProfile.js";
import GSTTax from "../models/GSTTax.js";
import HSNSAC from "../models/HSNSAC.js";
import InvoiceSequence from "../models/InvoiceSequence.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import createLogger from "../utils/logger.js";

const logger = createLogger("gst");

const STATE_CODE_MAP = {
  "Jammu and Kashmir": "01", "Himachal Pradesh": "02", "Punjab": "03", "Chandigarh": "04", "Uttarakhand": "05",
  "Haryana": "06", "Delhi": "07", "Rajasthan": "08", "Uttar Pradesh": "09", "Bihar": "10",
  "Sikkim": "11", "Arunachal Pradesh": "12", "Nagaland": "13", "Manipur": "14", "Mizoram": "15",
  "Tripura": "16", "Meghalaya": "17", "Assam": "18", "West Bengal": "19", "Jharkhand": "20",
  "Odisha": "21", "Chhattisgarh": "22", "Madhya Pradesh": "23", "Gujarat": "24", "Daman and Diu": "25",
  "Dadra and Nagar Haveli": "26", "Maharashtra": "27", "Andhra Pradesh": "37", "Karnataka": "29", "Goa": "30",
  "Lakshadweep": "31", "Kerala": "32", "Tamil Nadu": "33", "Puducherry": "34", "Andaman and Nicobar Islands": "35",
  "Telangana": "36", "Ladakh": "38"
};

// Helper: resolve financial year based on invoice date
export function getFinancialYear(invoiceDate) {
  const date = new Date(invoiceDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-indexed

  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }
  return `${year - 1}-${String(year).slice(-2)}`;
}

// Helper: format GST invoice number
export function formatGSTInvoiceNumber(prefix, financialYear, sequenceNumber) {
  return `${prefix}/${financialYear}/${String(sequenceNumber).padStart(4, "0")}`;
}

// Allocate the next unique invoice number in a concurrency-safe manner.
async function allocateNextInvoiceNumber(financialYear, prefix = "COV") {
  for (let attempt = 0; attempt < 25; attempt++) {
    const seq = await InvoiceSequence.findOneAndUpdate(
      { financialYear, prefix },
      [
        {
          $set: {
            lastSequenceNumber: {
              $add: [
                {
                  $ifNull: [
                    "$lastSequenceNumber",
                    { $subtract: [{ $ifNull: ["$nextSequenceNumber", 1] }, 1] }
                  ]
                },
                1
              ]
            }
          }
        },
        {
          $set: {
            nextSequenceNumber: { $add: ["$lastSequenceNumber", 1] }
          }
        }
      ],
      { returnDocument: "after", upsert: true, updatePipeline: true }
    );

    const seqNum = Number(seq?.lastSequenceNumber);
    if (!Number.isFinite(seqNum) || seqNum <= 0) {
      continue;
    }

    const invNo = formatGSTInvoiceNumber(prefix, financialYear, seqNum);
    const alreadyUsed = await Invoice.exists({ invoiceNumber: invNo });
    if (!alreadyUsed) {
      return { seqNum, invNo };
    }
  }

  throw new Error(`Could not allocate a unique invoice number for ${prefix}/${financialYear}.`);
}

// ── COMPANY GST PROFILE CRUD ──

export const getCompanyProfiles = async (req, res) => {
  try {
    const profiles = await CompanyGSTProfile.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: profiles });
  } catch (error) {
    logger.error("getCompanyProfiles failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCompanyProfile = async (req, res) => {
  try {
    const { companyName, companyAddress, email, phone, gstNumber, state, stateCode, pan, bankDetails, authorizedSignatory, isActive, isDefault } = req.body;

    // Validation
    if (!companyName || !companyAddress || !email || !phone || !gstNumber || !state || !stateCode) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      return res.status(400).json({ success: false, message: "Invalid GSTIN format." });
    }

    if (gstNumber.slice(0, 2) !== stateCode) {
      return res.status(400).json({ success: false, message: "State code must match the first two digits of the GSTIN." });
    }

    // If isDefault is true, unset other defaults
    if (isDefault) {
      await CompanyGSTProfile.updateMany({}, { isDefault: false });
    }

    const profile = new CompanyGSTProfile({
      companyName, companyAddress, email, phone, gstNumber, state, stateCode, pan,
      bankDetails, authorizedSignatory, isActive, isDefault, createdBy: req.user.id
    });
    await profile.save();

    return res.json({ success: true, message: "Company profile created successfully", data: profile });
  } catch (error) {
    logger.error("createCompanyProfile failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.gstNumber) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(updateData.gstNumber)) {
        return res.status(400).json({ success: false, message: "Invalid GSTIN format." });
      }
      if (updateData.stateCode && updateData.gstNumber.slice(0, 2) !== updateData.stateCode) {
        return res.status(400).json({ success: false, message: "State code must match the first two digits of the GSTIN." });
      }
    }

    if (updateData.isDefault) {
      await CompanyGSTProfile.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    updateData.updatedBy = req.user.id;
    const profile = await CompanyGSTProfile.findByIdAndUpdate(id, updateData, { new: true });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found." });

    return res.json({ success: true, message: "Profile updated successfully.", data: profile });
  } catch (error) {
    logger.error("updateCompanyProfile failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await CompanyGSTProfile.findByIdAndDelete(id);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found." });
    return res.json({ success: true, message: "Profile deleted successfully." });
  } catch (error) {
    logger.error("deleteCompanyProfile failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GST TAX CRUD ──

export const getGSTTaxes = async (req, res) => {
  try {
    const taxes = await GSTTax.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: taxes });
  } catch (error) {
    logger.error("getGSTTaxes failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createGSTTax = async (req, res) => {
  try {
    const { name, gstPercentage, cgstPercentage, sgstPercentage, igstPercentage, description, isActive } = req.body;

    if (!name || gstPercentage === undefined || cgstPercentage === undefined || sgstPercentage === undefined || igstPercentage === undefined) {
      return res.status(400).json({ success: false, message: "All tax percentages are required." });
    }

    const tax = new GSTTax({
      name, gstPercentage, cgstPercentage, sgstPercentage, igstPercentage, description, isActive, createdBy: req.user.id
    });
    await tax.save();

    return res.json({ success: true, message: "Tax configuration created.", data: tax });
  } catch (error) {
    logger.error("createGSTTax failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGSTTax = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.id;

    const tax = await GSTTax.findByIdAndUpdate(id, updateData, { new: true });
    if (!tax) return res.status(404).json({ success: false, message: "Tax configuration not found." });

    return res.json({ success: true, message: "Tax configuration updated.", data: tax });
  } catch (error) {
    logger.error("updateGSTTax failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGSTTax = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await GSTTax.findByIdAndDelete(id);
    if (!tax) return res.status(404).json({ success: false, message: "Tax configuration not found." });
    return res.json({ success: true, message: "Tax configuration deleted." });
  } catch (error) {
    logger.error("deleteGSTTax failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── HSN/SAC CRUD ──

export const getHSNSACs = async (req, res) => {
  try {
    const codes = await HSNSAC.find().populate("taxRate").sort({ createdAt: -1 });
    return res.json({ success: true, data: codes });
  } catch (error) {
    logger.error("getHSNSACs failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createHSNSAC = async (req, res) => {
  try {
    const { code, type, taxRate, description, isActive } = req.body;

    if (!code || !type || !taxRate) {
      return res.status(400).json({ success: false, message: "Code, Type, and Tax Rate are required." });
    }

    const hsn = new HSNSAC({
      code, type, taxRate, description, isActive, createdBy: req.user.id
    });
    await hsn.save();

    return res.json({ success: true, message: "HSN/SAC code registered.", data: hsn });
  } catch (error) {
    logger.error("createHSNSAC failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHSNSAC = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.id;

    const hsn = await HSNSAC.findByIdAndUpdate(id, updateData, { new: true }).populate("taxRate");
    if (!hsn) return res.status(404).json({ success: false, message: "HSN/SAC record not found." });

    return res.json({ success: true, message: "HSN/SAC record updated.", data: hsn });
  } catch (error) {
    logger.error("updateHSNSAC failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHSNSAC = async (req, res) => {
  try {
    const { id } = req.params;
    const hsn = await HSNSAC.findByIdAndDelete(id);
    if (!hsn) return res.status(404).json({ success: false, message: "HSN/SAC record not found." });
    return res.json({ success: true, message: "HSN/SAC record deleted." });
  } catch (error) {
    logger.error("deleteHSNSAC failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── INVOICE CONFIG AND GENERATION ──

export const getInvoices = async (req, res) => {
  try {
    const query = {};
    const isAdmin = req.user.role === "admin" || req.user.role === "super-admin";
    if (!isAdmin) {
      query.user = req.user.id;
    } else {
      if (req.query.userId) {
        query.user = req.query.userId;
      }
    }
    if (req.query.orderId) {
      query.paymentOrderId = req.query.orderId;
    }

    const invoices = await Invoice.find(query).populate("user", "firstName lastName email").sort({ createdAt: -1 });
    return res.json({ success: true, data: invoices });
  } catch (error) {
    logger.error("getInvoices failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate("user", "firstName lastName email");
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found." });

    // Enforce ownership check: Admins can view all, users can only view their own
    const isAdmin = req.user.role === "admin" || req.user.role === "super-admin";
    if (!isAdmin && invoice.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied. You cannot view another member's invoice." });
    }

    return res.json({ success: true, data: invoice });
  } catch (error) {
    logger.error("getInvoiceById failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Core helper: generates a new invoice for a verified payment
export const generateInvoice = async (userId, orderId, performerId = null) => {
  try {
    // 1. Check if invoice already exists for this payment
    const existing = await Invoice.findOne({ user: userId, paymentOrderId: orderId });
    if (existing) {
      logger.info("Invoice already exists for payment", { userId, orderId, invoiceNumber: existing.invoiceNumber });
      return existing;
    }

    // 2. Fetch User
    const user = await User.findById(userId);
    if (!user) throw new Error("Customer not found.");

    // Find the specific payment
    const payment = user.payments.find(p => p.orderId === orderId);
    if (!payment) throw new Error("Payment record not found.");

    // 3. Fetch Company GST Profile
    const company = await CompanyGSTProfile.findOne({ isDefault: true, isActive: true }) 
      || await CompanyGSTProfile.findOne({ isActive: true });

    if (!company) throw new Error("No active company GST profile found. Configure one in admin dashboard.");

    // 4. Resolve Customer GST / Address snapshot
    let custName = `${user.firstName} ${user.lastName}`;
    let custAddress = `${user.permAddress?.line1 || ""} ${user.permAddress?.line2 || ""}, ${user.permAddress?.city || ""}, ${user.permAddress?.district || ""}, ${user.permAddress?.pincode || ""}`.trim();
    let custState = user.permAddress?.state || company.state;
    let custStateCode = STATE_CODE_MAP[custState] || company.stateCode;
    let custGstNumber = "";
    let custCompanyName = "";

    if (user.gstDetails && user.gstDetails.gstNumber) {
      custGstNumber = user.gstDetails.gstNumber;
      custCompanyName = user.gstDetails.companyName || custName;
      custState = user.gstDetails.state || custState;
      custStateCode = user.gstDetails.stateCode || custStateCode;
      if (user.gstDetails.billingAddress) {
        custAddress = user.gstDetails.billingAddress;
      }
    }

    // 5. Calculate Inclusive GST Tax
    const paidAmount = parseFloat(payment.amount) || 0;
    
    // Resolve GST rate for the payment.
    // Prefer the tax selected on the fee row, otherwise fall back to the active service HSN/SAC mapping.
    let sacCode = "999591";
    let gstPercent = 18;
    let cgstPercent = 9;
    let sgstPercent = 9;
    let igstPercent = 18;

    let selectedTax = null;
    if (payment.gstTaxId) {
      selectedTax = await GSTTax.findById(payment.gstTaxId).lean();
    }

    if (selectedTax) {
      gstPercent = selectedTax.gstPercentage;
      cgstPercent = selectedTax.cgstPercentage;
      sgstPercent = selectedTax.sgstPercentage;
      igstPercent = selectedTax.igstPercentage;
    } else {
      let sacRecord = await HSNSAC.findOne({ code: sacCode, isActive: true }).populate("taxRate");
      if (!sacRecord) {
        sacRecord = await HSNSAC.findOne({ type: "Services", isActive: true }).populate("taxRate");
      }

      if (sacRecord && sacRecord.taxRate) {
        sacCode = sacRecord.code;
        gstPercent = sacRecord.taxRate.gstPercentage;
        cgstPercent = sacRecord.taxRate.cgstPercentage;
        sgstPercent = sacRecord.taxRate.sgstPercentage;
        igstPercent = sacRecord.taxRate.igstPercentage;
      }
    }

    // Calc base price from inclusive amount
    const divisor = 1 + (gstPercent / 100);
    const taxableValue = parseFloat((paidAmount / divisor).toFixed(2));
    const totalTax = parseFloat((paidAmount - taxableValue).toFixed(2));

    // Resolve CGST / SGST / IGST based on location
    const isIntrastate = (custStateCode === company.stateCode);
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isIntrastate) {
      cgstAmount = parseFloat((totalTax / 2).toFixed(2));
      sgstAmount = parseFloat((totalTax / 2).toFixed(2));
      igstPercent = 0;
    } else {
      igstAmount = totalTax;
      cgstPercent = 0;
      sgstPercent = 0;
    }

    // Description
    const itemDesc = `COV Membership Registration - ${payment.memberType || "Annual"} Member (${payment.memberClass || "Chartered"})`;

    const items = [{
      description: itemDesc,
      hsnSac: sacCode,
      basePrice: paidAmount,
      discountPercent: 0,
      discountAmount: 0,
      taxableValue: taxableValue,
      gstPercent,
      cgstPercent,
      cgstAmount,
      sgstPercent,
      sgstAmount,
      igstPercent,
      igstAmount,
      totalAmount: paidAmount
    }];

    // 6. Concurrency-Safe Sequential Invoice ID allocation
    const fy = getFinancialYear(payment.paidAt || new Date());
    const prefix = "COV";
    const { seqNum, invNo } = await allocateNextInvoiceNumber(fy, prefix);

    // 7. Write Invoice document
    const invoice = new Invoice({
      invoiceNumber: invNo,
      invoiceDate: payment.paidAt || new Date(),
      financialYear: fy,
      sequenceNumber: seqNum,
      user: userId,
      paymentOrderId: orderId,
      companySnapshot: {
        companyName: company.companyName,
        companyAddress: company.companyAddress,
        email: company.email,
        phone: company.phone,
        gstNumber: company.gstNumber,
        state: company.state,
        stateCode: company.stateCode,
        pan: company.pan,
        bankDetails: company.bankDetails,
        authorizedSignatory: company.authorizedSignatory
      },
      customerSnapshot: {
        name: custName,
        email: user.email,
        phone: user.phone,
        companyName: custCompanyName || null,
        billingAddress: custAddress,
        gstNumber: custGstNumber || null,
        state: custState,
        stateCode: custStateCode
      },
      items,
      totalTaxableValue: taxableValue,
      totalCGST: cgstAmount,
      totalSGST: sgstAmount,
      totalIGST: igstAmount,
      grandTotal: paidAmount,
      status: "Finalized",
      auditLogs: [{
        action: "Finalized",
        performedBy: performerId || userId,
        details: `Invoice generated automatically on payment completion. Sequence #${seqNum}.`
      }]
    });

    await invoice.save();
    logger.info("Invoice generated successfully", { invoiceNumber: invNo });
    return invoice;
  } catch (err) {
    logger.error("generateInvoice failed", { error: err.message });
    throw err;
  }
};

export const generateInvoiceForPayment = async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    if (!userId || !orderId) {
      return res.status(400).json({ success: false, message: "User ID and Order ID are required." });
    }

    const invoice = await generateInvoice(userId, orderId, req.user.id);
    return res.json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found." });

    if (invoice.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Invoice is already cancelled." });
    }

    invoice.status = "Cancelled";
    invoice.auditLogs.push({
      action: "Cancelled",
      performedBy: req.user.id,
      details: reason || "Invoice cancelled by administrator."
    });
    await invoice.save();

    return res.json({ success: true, message: "Invoice cancelled successfully.", data: invoice });
  } catch (error) {
    logger.error("cancelInvoice failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin utility: generate invoices for old completed/success payments that don't have one yet.
export const backfillInvoices = async (req, res) => {
  try {
    const dryRun = String(req.query.dryRun || req.body?.dryRun || "false").toLowerCase() === "true";
    const users = await User.find({ role: "user" }).select("_id payments");

    let scannedPayments = 0;
    let eligiblePayments = 0;
    let generatedInvoices = 0;
    let alreadyPresent = 0;
    let failed = 0;
    const failures = [];

    for (const user of users) {
      const payments = Array.isArray(user.payments) ? user.payments : [];
      for (const payment of payments) {
        scannedPayments += 1;
        const orderId = payment?.orderId;
        const status = payment?.status;
        if (!orderId) continue;
        if (!(status === "Completed" || status === "Success")) continue;

        eligiblePayments += 1;
        const exists = await Invoice.exists({ user: user._id, paymentOrderId: orderId });
        if (exists) {
          alreadyPresent += 1;
          continue;
        }

        if (dryRun) {
          generatedInvoices += 1;
          continue;
        }

        try {
          await generateInvoice(user._id.toString(), orderId, req.user?.id || user._id.toString());
          generatedInvoices += 1;
        } catch (err) {
          failed += 1;
          if (failures.length < 50) {
            failures.push({
              userId: user._id.toString(),
              orderId,
              error: err.message
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      dryRun,
      summary: {
        scannedUsers: users.length,
        scannedPayments,
        eligiblePayments,
        generatedInvoices,
        alreadyPresent,
        failed
      },
      failures
    });
  } catch (error) {
    logger.error("backfillInvoices failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin utility: repair malformed invoice numbers like .../0000 and missing numbers.
export const repairInvoiceNumbers = async (req, res) => {
  try {
    const dryRun = String(req.query.dryRun || req.body?.dryRun || "false").toLowerCase() === "true";

    const brokenInvoices = await Invoice.find({
      $or: [
        { invoiceNumber: { $exists: false } },
        { invoiceNumber: null },
        { invoiceNumber: "" },
        { invoiceNumber: /\/0000$/ },
        { sequenceNumber: { $lte: 0 } }
      ]
    }).sort({ createdAt: 1 });

    let repaired = 0;
    let skipped = 0;
    let failed = 0;
    const details = [];

    for (const inv of brokenInvoices) {
      try {
        const fy = inv.financialYear || getFinancialYear(inv.invoiceDate || inv.createdAt || new Date());
        const currentPrefix = inv.invoiceNumber && inv.invoiceNumber.includes("/")
          ? inv.invoiceNumber.split("/")[0]
          : "COV";
        const prefix = currentPrefix || "COV";
        const { seqNum, invNo } = await allocateNextInvoiceNumber(fy, prefix);

        if (dryRun) {
          repaired += 1;
          if (details.length < 100) {
            details.push({
              invoiceId: inv._id.toString(),
              oldInvoiceNumber: inv.invoiceNumber || null,
              newInvoiceNumber: invNo,
              financialYear: fy,
              sequenceNumber: seqNum
            });
          }
          continue;
        }

        const oldInvoiceNumber = inv.invoiceNumber || null;
        inv.invoiceNumber = invNo;
        inv.financialYear = fy;
        inv.sequenceNumber = seqNum;
        inv.auditLogs = Array.isArray(inv.auditLogs) ? inv.auditLogs : [];
        inv.auditLogs.push({
          action: "NumberRepaired",
          performedBy: req.user?.id || null,
          details: `Invoice number repaired from ${oldInvoiceNumber || "N/A"} to ${invNo}.`
        });
        await inv.save();

        repaired += 1;
        if (details.length < 100) {
          details.push({
            invoiceId: inv._id.toString(),
            oldInvoiceNumber,
            newInvoiceNumber: invNo,
            financialYear: fy,
            sequenceNumber: seqNum
          });
        }
      } catch (err) {
        failed += 1;
        if (details.length < 100) {
          details.push({
            invoiceId: inv._id.toString(),
            oldInvoiceNumber: inv.invoiceNumber || null,
            error: err.message
          });
        }
      }
    }

    const untouched = brokenInvoices.length - repaired - failed;
    skipped += untouched > 0 ? untouched : 0;

    return res.json({
      success: true,
      dryRun,
      summary: {
        scanned: brokenInvoices.length,
        repaired,
        skipped,
        failed
      },
      details
    });
  } catch (error) {
    logger.error("repairInvoiceNumbers failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};
