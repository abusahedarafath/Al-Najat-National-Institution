const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const feeCategoryController = require("../controllers/feeCategoryController");

// ======================================
// Fee Category Routes
// ======================================

// All Fee Categories
router.get(
    "/fee-categories",
    feeCategoryController.showFeeCategories
);

// Add Fee Category
router.get(
    "/fee-category/add",
    feeCategoryController.addFeeCategoryPage
);

router.post(
    "/fee-category/add",
    feeCategoryController.createFeeCategory
);

// Fee Category Details
router.get(
    "/fee-category/:id",
    feeCategoryController.viewFeeCategory
);

// Edit Fee Category
router.get(
    "/fee-category/:id/edit",
    feeCategoryController.editFeeCategoryPage
);

router.post(
    "/fee-category/:id/edit",
    feeCategoryController.updateFeeCategory
);

// Delete Fee Category
router.post(
    "/fee-category/:id/delete",
    feeCategoryController.deleteFeeCategory
);

module.exports = router;
