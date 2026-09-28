"use strict";

const express = require("express");
const multer = require("multer");

const router = express.Router();

const categoryFormBody = multer().none();
const auth = require("../middleware/auth");
const controller = require("../controllers/adminRtsePyqCategoryController");

router.get(
    "/rtse/pyq/categories",
    auth.isAdmin,
    controller.index
);

router.get(
    "/rtse/pyq/categories/create",
    auth.isAdmin,
    controller.createPage
);

router.post(
    "/rtse/pyq/categories",
    categoryFormBody,
    auth.isAdmin,
    controller.store
);

router.get(
    "/rtse/pyq/categories/:id/edit",
    auth.isAdmin,
    controller.editPage
);

router.post(
    "/rtse/pyq/categories/:id",
    auth.isAdmin,
    controller.update
);

router.post(
    "/rtse/pyq/categories/:id/toggle",
    auth.isAdmin,
    controller.toggle
);

router.post(
    "/rtse/pyq/categories/:id/delete",
    auth.isAdmin,
    controller.delete
);

module.exports = router;
