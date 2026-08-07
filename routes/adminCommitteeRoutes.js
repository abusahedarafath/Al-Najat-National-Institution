const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const adminCommitteeController =
require("../controllers/adminCommitteeController");


// ================================
// Committee List
// ================================

router.get(

"/admin/arsp/committees",

authMiddleware.isLoggedIn,

adminCommitteeController.index

);


// ================================
// Create Committee
// ================================

router.get(

"/admin/arsp/committees/create",

authMiddleware.isLoggedIn,

adminCommitteeController.createPage

);

router.post(

"/admin/arsp/committees/create",

authMiddleware.isLoggedIn,

adminCommitteeController.store

);


// ================================
// Edit Committee
// ================================

router.get(

"/admin/arsp/committees/:id/edit",

authMiddleware.isLoggedIn,

adminCommitteeController.editPage

);

router.post(

"/admin/arsp/committees/:id/edit",

authMiddleware.isLoggedIn,

adminCommitteeController.update

);


// ================================
// Delete Committee
// ================================

router.post(

"/admin/arsp/committees/:id/delete",

authMiddleware.isLoggedIn,

adminCommitteeController.delete

);

module.exports = router;
