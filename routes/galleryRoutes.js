const express = require("express");
const router = express.Router();

const galleryController = require("../controllers/galleryController");

// Public Gallery
router.get("/gallery", galleryController.index);

// Album Details
router.get("/gallery/:id", galleryController.show);

module.exports = router;
