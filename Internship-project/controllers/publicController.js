import CMS from "../models/CMS.js";
import GSTTax from "../models/GSTTax.js";
import createLogger from "../utils/logger.js";

const logger = createLogger("main-route");

export const getPublicCms = async (req, res) => {
  try {
    logger.info("[getPublicCms] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const cms = await CMS.find();

    logger.info("[getPublicCms] Completed successfully", {
      requestId: req.requestId,
      count: cms.length
    });

    return res.status(200).json({
      success: true,
      data: cms
    });
  } catch (error) {
    logger.error("[getPublicCms] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPublicGstTaxes = async (req, res) => {
  try {
    logger.info("[getPublicGstTaxes] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const taxes = await GSTTax.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: taxes
    });
  } catch (error) {
    logger.error("[getPublicGstTaxes] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
