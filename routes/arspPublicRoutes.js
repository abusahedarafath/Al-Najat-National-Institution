const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const processArspMemberPhoto = require("../middleware/processArspMemberPhoto");
const arspPublicController =
require("../controllers/arspPublicController");

// Upload Storage

const storage = multer.diskStorage({

destination(req,file,cb){

cb(

null,

"public/uploads/arsp-members"

);

},

filename(req,file,cb){

cb(

null,

Date.now()

+

path.extname(file.originalname)

);

}

});

const upload = multer({

storage

});

router.get(

"/arsp/register",

arspPublicController.registerPage

);

router.post(

"/arsp/register",

upload.fields([

    {

        name:"photo",

        maxCount:1

    },

    {

        name:"identity_front",

        maxCount:1

    },

    {

        name:"identity_back",

        maxCount:1

    }

]),
processArspMemberPhoto,
    arspPublicController.review

);

    
// =====================================
// Confirm Membership Registration
// =====================================

router.post(
    "/arsp/register/confirm",
    arspPublicController.confirm
);

module.exports = router;
