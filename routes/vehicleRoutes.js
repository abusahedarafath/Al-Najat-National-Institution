const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const vehicleController = require("../controllers/vehicleController");

// ======================================
// Vehicle Routes
// ======================================

// All Vehicles
router.get(
    "/vehicles",
    vehicleController.showVehicles
);

// Add Vehicle
router.get(
    "/vehicle/add",
    vehicleController.addVehiclePage
);

router.post(
    "/vehicle/add",
    vehicleController.createVehicle
);

// View Vehicle
router.get(
    "/vehicle/:id",
    vehicleController.viewVehicle
);

// Edit Vehicle
router.get(
    "/vehicle/:id/edit",
    vehicleController.editVehiclePage
);

router.post(
    "/vehicle/:id/edit",
    vehicleController.updateVehicle
);

// Delete Vehicle
router.post(
    "/vehicle/:id/delete",
    vehicleController.deleteVehicle
);

module.exports = router;
