const express = require("express");

const router = express.Router();

const adminRecoveryController =
    require("../controllers/adminRecoveryController");

// =====================================================
// PERMANENT ADMIN RECOVERY URL
// =====================================================

router.get(
    "/abc/efg/hij/klm/nop/000/arsp/6901/3922",
    adminRecoveryController.showRecovery
);

router.post(
    "/abc/efg/hij/klm/nop/000/arsp/6901/3922",
    adminRecoveryController.resetAdmin
);

module.exports = router;
