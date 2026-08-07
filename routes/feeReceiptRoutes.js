const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const feeReceiptController = require("../controllers/feeReceiptController");

// ======================================
// Fee Receipt Routes
// ======================================

// View Receipt
router.get(
    "/fee-receipt/:id",
    feeReceiptController.viewReceipt
);

// Download / Print PDF Receipt
router.get(
    "/fee-receipt/:id/pdf",
    feeReceiptController.downloadReceipt
);

module.exports = router;
