const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const rtsePublicController =
    require("../controllers/rtsePublicController");


// =====================================
// RTSE Upload Configuration
// =====================================

const storage = multer.diskStorage({

    destination(req,file,cb){

        cb(
            null,
            "public/uploads/rtse"
        );

    },

    filename(req,file,cb){

        cb(

            null,

            Date.now() +
            "-" +
            Math.round(Math.random()*1E9) +
            path.extname(file.originalname)

        );

    }

});

const upload = multer({

    storage

});


// =====================================
// RTSE Home
// =====================================

router.get(

    "/",

    (req,res)=>{

        res.redirect("/rtse/apply");

    }

);


// =====================================
// Application Form
// =====================================

router.get(

    "/rtse/apply",

    rtsePublicController.applicationPage

);


// =====================================
// Submit Application
// =====================================

router.post(

    "/rtse/apply",

    upload.fields([

        {

            name:"photo",

            maxCount:1

        },

        {

            name:"identity_document",

            maxCount:1

        }

    ]),

    rtsePublicController.submitApplication

);

module.exports = router;
