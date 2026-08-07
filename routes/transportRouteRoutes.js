const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const transportRouteController = require("../controllers/transportRouteController");

// ======================================
// Transport Route Routes
// ======================================

// All Routes
router.get(
    "/transport-routes",
    transportRouteController.showRoutes
);

// Add Route
router.get(
    "/transport-route/add",
    transportRouteController.addRoutePage
);

router.post(
    "/transport-route/add",
    transportRouteController.createRoute
);

// View Route
router.get(
    "/transport-route/:id",
    transportRouteController.viewRoute
);

// Edit Route
router.get(
    "/transport-route/:id/edit",
    transportRouteController.editRoutePage
);

router.post(
    "/transport-route/:id/edit",
    transportRouteController.updateRoute
);

// Delete Route
router.post(
    "/transport-route/:id/delete",
    transportRouteController.deleteRoute
);

module.exports = router;
