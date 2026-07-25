const express = require("express");
const router = express.Router();

const adminNoticeController = require("../controllers/adminNoticeController");
const authMiddleware = require("../middleware/auth");
const { createUploader } = require("../middleware/uploadFactory");

const upload = createUploader("notices");
