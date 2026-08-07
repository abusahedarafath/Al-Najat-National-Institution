const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const feePaymentController = require("../controllers/feePaymentController");

// ======================================
// Fee Payment Routes
// ======================================

// All Fee Payments
router.get(
    "/fee-payments",
    feePaymentController.showPayments
);

// Add Fee Payment
router.get(
    "/fee-payment/add",
    feePaymentController.addPaymentPage
);

router.post(
    "/fee-payment/add",
    feePaymentController.createPayment
);

// Fee Payment Details
router.get(
    "/fee-payment/:id",
    feePaymentController.viewPayment
);

// Edit Fee Payment
router.get(
    "/fee-payment/:id/edit",
    feePaymentController.editPaymentPage
);

router.post(
    "/fee-payment/:id/edit",
    feePaymentController.updatePayment
);

// Delete Fee Payment
router.post(
    "/fee-payment/:id/delete",
    feePaymentController.deletePayment
);

module.exports = router;
