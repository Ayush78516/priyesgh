import { body, validationResult } from "express-validator";

export const contactValidationRules = () => [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("subject").trim().isLength({ min: 3 }).withMessage("Subject must be at least 3 characters long"),
  body("message").trim().isLength({ min: 3 }).withMessage("Message must be at least 3 characters long"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({ 
        success: false, 
        message: firstError?.msg || "Validation failed",
        errors: errors.array() 
    });
  }
  next();
};
