const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");

router.get("/notice", publicController.noticeList);
router.get("/notice/:id", publicController.noticeDetails);

router.get("/news", publicController.newsList);
router.get("/news/:id", publicController.newsDetails);

module.exports = router;
