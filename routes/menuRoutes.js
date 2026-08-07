const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const menuController = require("../controllers/menuController");



// ===================================
// Menu List
// ===================================

router.get(

    "/admin/menu",

    authMiddleware.isLoggedIn,

    menuController.index

);


// ===================================
// Add Menu
// ===================================

router.get(

    "/admin/menu/create",

    authMiddleware.isLoggedIn,

    menuController.createPage

);

router.post(

    "/admin/menu/create",

    authMiddleware.isLoggedIn,

    menuController.store

);


// ===================================
// Edit Menu
// ===================================

router.get(

    "/admin/menu/:id/edit",

    authMiddleware.isLoggedIn,

    menuController.editPage

);

router.post(

    "/admin/menu/:id/edit",

    authMiddleware.isLoggedIn,

    menuController.update

);


// ===================================
// Delete Menu
// ===================================

router.post(

    "/admin/menu/:id/delete",

    authMiddleware.isLoggedIn,

    menuController.delete

);

module.exports = router;
