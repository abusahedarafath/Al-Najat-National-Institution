const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const honourHeartController = require("../controllers/honourHeartController");
const { isAdmin } = require("../middleware/auth");

// ======================================
// MULTER
// ======================================

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        if(file.fieldname==="hero_banner"){

            cb(null,"public/uploads/honour-heart/settings");

        }else if(file.fieldname==="photo"){

            if(req.originalUrl.includes("/legends")){

                cb(null,"public/uploads/honour-heart/legends");

            }else if(req.originalUrl.includes("/board")){

                cb(null,"public/uploads/honour-heart/board");

            }else{

                cb(null,"public/uploads/honour-heart/awardees");

            }

        }

    },

    filename:(req,file,cb)=>{

        cb(

            null,

            Date.now()+path.extname(file.originalname)

        );

    }

});

const upload=multer({storage});

// ======================================
// PUBLIC
// ======================================

router.get(

"/honour-heart",

honourHeartController.index

);

router.get(

"/honour-heart/popup",

honourHeartController.popup

);


router.get(

"/admin/honour-heart",

isAdmin,

honourHeartController.dashboard

);



// ======================================
// LEGENDS
// ======================================

router.get(

"/admin/honour-heart/legends",

isAdmin,

honourHeartController.legendList

);

router.get(

"/admin/honour-heart/legends/add",

isAdmin,

honourHeartController.legendAddForm

);

router.post(

"/admin/honour-heart/legends/add",

isAdmin,

upload.single("photo"),

honourHeartController.legendSave

);

router.get(

"/admin/honour-heart/legends/edit/:id",

isAdmin,

honourHeartController.legendEditForm

);

router.post(

"/admin/honour-heart/legends/edit/:id",

isAdmin,

upload.single("photo"),

honourHeartController.legendUpdate

);

router.get(

"/admin/honour-heart/legends/delete/:id",

isAdmin,

honourHeartController.legendDelete

);



// ======================================
// SELECTION BOARD
// ======================================

router.get(

"/admin/honour-heart/board",

isAdmin,

honourHeartController.boardList

);

router.get(

"/admin/honour-heart/board/add",

isAdmin,

honourHeartController.boardAddForm

);

router.post(

"/admin/honour-heart/board/add",

isAdmin,

upload.single("photo"),

honourHeartController.boardSave

);

router.get(

"/admin/honour-heart/board/edit/:id",

isAdmin,

honourHeartController.boardEditForm

);

router.post(

"/admin/honour-heart/board/edit/:id",

isAdmin,

upload.single("photo"),

honourHeartController.boardUpdate

);

router.get(

"/admin/honour-heart/board/delete/:id",

isAdmin,

honourHeartController.boardDelete

);



// ======================================
// AWARDEES
// ======================================

router.get(

"/admin/honour-heart/awardees",

isAdmin,

honourHeartController.awardeeList

);

router.get(

"/admin/honour-heart/awardees/add",

isAdmin,

honourHeartController.awardeeAddForm

);

router.post(

"/admin/honour-heart/awardees/add",

isAdmin,

upload.single("photo"),

honourHeartController.awardeeSave

);

router.get(

"/admin/honour-heart/awardees/edit/:id",

isAdmin,

honourHeartController.awardeeEditForm

);

router.post(

"/admin/honour-heart/awardees/edit/:id",

isAdmin,

upload.single("photo"),

honourHeartController.awardeeUpdate

);

router.get(

"/admin/honour-heart/awardees/delete/:id",

isAdmin,

honourHeartController.awardeeDelete

);

// ======================================
// SETTINGS
// ======================================

router.get(

"/admin/honour-heart/settings",

isAdmin,

honourHeartController.settings

);

router.post(

"/admin/honour-heart/settings",

isAdmin,

upload.single("hero_banner"),

honourHeartController.updateSettings

);



// ======================================
// LEGEND DETAILS
// ======================================

router.get(

"/honour-heart/legend/:slug",

honourHeartController.legendDetails

);



// ======================================
// AWARDEE DETAILS
// ======================================

router.get(

"/honour-heart/awardee/:id",

honourHeartController.awardeeDetails

);


// ======================================
// POPUP API
// ======================================

router.get(

"/honour-heart/popup",

honourHeartController.popup

);


// ======================================
// LEGENDS
// ======================================

router.get(

"/admin/honour-heart/legends",

isAdmin,

honourHeartController.legendList

);

router.get(

"/admin/honour-heart/legends/add",

isAdmin,

honourHeartController.legendAddForm

);

router.post(

"/admin/honour-heart/legends/add",

isAdmin,

upload.single("photo"),

honourHeartController.legendSave

);

router.get(

"/admin/honour-heart/legends/edit/:id",

isAdmin,

honourHeartController.legendEditForm

);

router.post(

"/admin/honour-heart/legends/edit/:id",

isAdmin,

upload.single("photo"),

honourHeartController.legendUpdate

);

router.get(

"/admin/honour-heart/legends/delete/:id",

isAdmin,

honourHeartController.legendDelete

);

// ======================================
// SELECTION BOARD
// ======================================

router.get(

"/admin/honour-heart/selection-board",

isAdmin,

honourHeartController.selectionBoardList

);

router.get(

"/admin/honour-heart/selection-board/add",

isAdmin,

honourHeartController.selectionBoardAddForm

);

router.post(

"/admin/honour-heart/selection-board/add",

isAdmin,

upload.single("photo"),

honourHeartController.selectionBoardSave

);

router.get(

"/admin/honour-heart/selection-board/edit/:id",

isAdmin,

honourHeartController.selectionBoardEditForm

);

router.post(

"/admin/honour-heart/selection-board/edit/:id",

isAdmin,

upload.single("photo"),

honourHeartController.selectionBoardUpdate

);

router.get(

"/admin/honour-heart/selection-board/delete/:id",

isAdmin,

honourHeartController.selectionBoardDelete

);


// ======================================
// LEGENDARY PERSONALITIES
// ======================================

router.get(

"/honour-heart/legends",

honourHeartController.legends

);

module.exports = router;
