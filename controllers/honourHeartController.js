 const fs = require("fs");
const path = require("path");

const HonourHeartLegend = require("../models/HonourHeartLegend");
const HonourHeartSelectionBoard = require("../models/HonourHeartSelectionBoard");
const HonourHeartAwardee = require("../models/HonourHeartAwardee");
const HonourHeartSetting = require("../models/HonourHeartSetting");

// ======================================
// PUBLIC HOME
// ======================================

exports.index = async (req, res) => {

    try {

        const settings = await HonourHeartSetting.get();

        const board = await HonourHeartSelectionBoard.getActive();

        const legends = await HonourHeartLegend.getActive();

        const upcomingAwardee = await HonourHeartAwardee.getUpcoming();

        const previousAwardees = await HonourHeartAwardee.getPrevious();

        res.render(

            "honour-heart/index",

            {

                title: "ARSP Honour Heart Award",

                settings,

                board,

                legends,

                upcomingAwardee,

                previousAwardees

            }

        );

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};


// ========================================
// POPUP DATA
// ========================================

exports.popup = async (req,res)=>{

    try{

        const popup = await HonourHeartAwardee.getPopup();

        res.json(popup || {});

    }catch(err){

        console.error(err);

        res.json({});

    }

};

// ========================================
// LEGENDS
// ========================================

exports.legendList = async(req,res)=>{

    try{

        const legends = await HonourHeartLegend.getAll();

        res.render("admin/honour-heart/legends/index",{

            title:"Legendary Personalities",

            legends

        });

    }catch(err){

        console.error(err);

        res.send(err);

    }

};

exports.legendAddForm = (req,res)=>{

    res.render("admin/honour-heart/legends/add",{

        title:"Add Legendary Personality"

    });

};

exports.legendSave = async(req,res)=>{

    try{

        const data={

            photo:req.file ? req.file.filename : "",

            name:req.body.name,

            designation:req.body.designation,

            slug:req.body.slug,

            biography:req.body.biography,

            display_order:req.body.display_order,

            status:req.body.status

        };

        await HonourHeartLegend.create(data);

        res.redirect("/admin/honour-heart/legends");

    }catch(err){

        console.error(err);

        res.send(err);

    }

};

exports.legendEditForm = async(req,res)=>{

    try{

        const legend = await HonourHeartLegend.getById(req.params.id);

        if(!legend){

            return res.redirect("/admin/honour-heart/legends");

        }

        res.render("admin/honour-heart/legends/edit",{

            title:"Edit Legendary Personality",

            legend

        });

    }catch(err){

        console.error(err);

        res.send(err);

    }

};

exports.legendUpdate = async(req,res)=>{

    try{

        const old = await HonourHeartLegend.getById(req.params.id);

        if(!old){

            return res.redirect("/admin/honour-heart/legends");

        }

        if(req.file && old.photo){

            const file = path.join(

                "public/uploads/honour-heart/legends",

                old.photo

            );

            if(fs.existsSync(file)){

                fs.unlinkSync(file);

            }

        }

        const data={

            photo:req.file ? req.file.filename : old.photo,

            name:req.body.name,

            designation:req.body.designation,

            slug:req.body.slug,

            biography:req.body.biography,

            display_order:req.body.display_order,

            status:req.body.status

        };

        await HonourHeartLegend.update(req.params.id,data);

        res.redirect("/admin/honour-heart/legends");

    }catch(err){

        console.error(err);

        res.send(err);

    }

};

exports.legendDelete = async(req,res)=>{

    try{

        const old = await HonourHeartLegend.getById(req.params.id);

        if(old && old.photo){

            const file = path.join(

                "public/uploads/honour-heart/legends",

                old.photo

            );

            if(fs.existsSync(file)){

                fs.unlinkSync(file);

            }

        }

        await HonourHeartLegend.delete(req.params.id);

        res.redirect("/admin/honour-heart/legends");

    }catch(err){

        console.error(err);

        res.send(err);

    }

};




// ========================================
// SELECTION BOARD
// ========================================

exports.boardList = async (req, res) => {

    try {

        const board = await HonourHeartSelectionBoard.getAll();

        res.render("admin/honour-heart/board/index", {

            title: "Honour Heart Selection Board",

            board

        });

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.boardAddForm = (req, res) => {

    res.render("admin/honour-heart/board/add", {

        title: "Add Board Member"

    });

};

exports.boardSave = async (req, res) => {

    try {

        const data = {

            photo: req.file ? req.file.filename : "",

            name: req.body.name,

            designation: req.body.designation,

            organisation: req.body.organisation,

            display_order: req.body.display_order,

            status: req.body.status

        };

        await HonourHeartSelectionBoard.create(data);

        res.redirect("/admin/honour-heart/board");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.boardEditForm = async (req, res) => {

    try {

        const member = await HonourHeartSelectionBoard.getById(req.params.id);

        if (!member) {

            return res.redirect("/admin/honour-heart/board");

        }

        res.render("admin/honour-heart/board/edit", {

            title: "Edit Board Member",

            member

        });

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.boardUpdate = async (req, res) => {

    try {

        const old = await HonourHeartSelectionBoard.getById(req.params.id);

        if (!old) {

            return res.redirect("/admin/honour-heart/board");

        }

        if (req.file && old.photo) {

            const file = path.join(

                "public/uploads/honour-heart/board",

                old.photo

            );

            if (fs.existsSync(file)) {

                fs.unlinkSync(file);

            }

        }

        const data = {

            photo: req.file ? req.file.filename : old.photo,

            name: req.body.name,

            designation: req.body.designation,

            organisation: req.body.organisation,

            display_order: req.body.display_order,

            status: req.body.status

        };

        await HonourHeartSelectionBoard.update(req.params.id, data);

        res.redirect("/admin/honour-heart/board");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.boardDelete = async (req, res) => {

    try {

        const old = await HonourHeartSelectionBoard.getById(req.params.id);

        if (old && old.photo) {

            const file = path.join(

                "public/uploads/honour-heart/board",

                old.photo

            );

            if (fs.existsSync(file)) {

                fs.unlinkSync(file);

            }

        }

        await HonourHeartSelectionBoard.delete(req.params.id);

        res.redirect("/admin/honour-heart/board");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};




// ======================================
// PUBLIC HONOUR HEART PAGE
// ======================================

exports.index = async (req, res) => {

    try {

        const settings = await HonourHeartSetting.get();

        const legends = await HonourHeartLegend.getActive();

        const board = await HonourHeartSelectionBoard.getActive();

        const previousAwardees = await HonourHeartAwardee.getPrevious();

        const upcomingAwardee = await HonourHeartAwardee.getUpcoming();

        res.render(

            "honour-heart/index",

            {

                title:"ARSP Honour Heart Award",

                settings,

                legends,

                board,

                previousAwardees,

                upcomingAwardee

            }

        );

    } catch(err){

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};





// ======================================
// POPUP API
// ======================================

exports.popup = async (req, res) => {

    try {

        const settings = await HonourHeartSetting.get();

        if (!settings || settings.popup_enabled !== "Yes") {

            return res.json({});

        }

        const awardee = await HonourHeartAwardee.getPopup();

        if (!awardee) {

            return res.json({});

        }

        res.json(awardee);

    } catch (err) {

        console.error(err);

        res.json({});

    }

};


// ======================================
// AWARDEES
// ======================================

exports.awardeeList = async (req, res) => {

    try {

        const awardees = await HonourHeartAwardee.getAll();

        res.render("admin/honour-heart/awardees/index", {

            title: "Honour Heart Awardees",

            awardees

        });

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.awardeeAddForm = async (req, res) => {

    try {

        const legends = await HonourHeartLegend.getActive();

        res.render("admin/honour-heart/awardees/add", {

            title: "Add Awardee",

            legends

        });

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.awardeeSave = async (req, res) => {

    try {

        const data = {

            award_year: req.body.award_year,
            photo: req.file ? req.file.filename : "",
            name: req.body.name,
            designation: req.body.designation,
            state: req.body.state,
            country: req.body.country,
            award_category: req.body.award_category,
            legend_id: req.body.legend_id,
            biography: req.body.biography,
            achievements: req.body.achievements,
            citation: req.body.citation,
            ceremony_date: req.body.ceremony_date || null,
            venue: req.body.venue,
            status: req.body.status,
            popup: req.body.popup,
            published: req.body.published

        };

        await HonourHeartAwardee.create(data);

        res.redirect("/admin/honour-heart/awardees");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.awardeeEditForm = async (req, res) => {

    try {

        const awardee = await HonourHeartAwardee.getById(req.params.id);

        const legends = await HonourHeartLegend.getActive();

        if (!awardee) {

            return res.redirect("/admin/honour-heart/awardees");

        }

        res.render("admin/honour-heart/awardees/edit", {

            title: "Edit Awardee",

            awardee,

            legends

        });

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.awardeeUpdate = async (req, res) => {

    try {

        const old = await HonourHeartAwardee.getById(req.params.id);

        if (!old) {

            return res.redirect("/admin/honour-heart/awardees");

        }

        if (req.file && old.photo) {

            const file = path.join(

                "public/uploads/honour-heart/awardees",

                old.photo

            );

            if (fs.existsSync(file)) {

                fs.unlinkSync(file);

            }

        }

        const data = {

            award_year: req.body.award_year,
            photo: req.file ? req.file.filename : old.photo,
            name: req.body.name,
            designation: req.body.designation,
            state: req.body.state,
            country: req.body.country,
            award_category: req.body.award_category,
            legend_id: req.body.legend_id,
            biography: req.body.biography,
            achievements: req.body.achievements,
            citation: req.body.citation,
            ceremony_date: req.body.ceremony_date || null,
            venue: req.body.venue,
            status: req.body.status,
            popup: req.body.popup,
            published: req.body.published

        };

        await HonourHeartAwardee.update(req.params.id, data);

        res.redirect("/admin/honour-heart/awardees");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.awardeeDelete = async (req, res) => {

    try {

        const old = await HonourHeartAwardee.getById(req.params.id);

        if (old && old.photo) {

            const file = path.join(

                "public/uploads/honour-heart/awardees",

                old.photo

            );

            if (fs.existsSync(file)) {

                fs.unlinkSync(file);

            }

        }

        await HonourHeartAwardee.delete(req.params.id);

        res.redirect("/admin/honour-heart/awardees");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};



// ======================================
// SETTINGS
// ======================================

exports.settings = async (req, res) => {

    try {

        const settings = await HonourHeartSetting.get();

        res.render(

            "admin/honour-heart/settings",

            {

                title: "Honour Heart Settings",

                settings

            }

        );

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.updateSettings = async (req, res) => {

    try {

        const old = await HonourHeartSetting.get();

        let heroBanner = old.hero_banner;

        if (req.file) {

            if (old.hero_banner) {

                const oldFile = path.join(

                    "public/uploads/honour-heart/settings",

                    old.hero_banner

                );

                if (fs.existsSync(oldFile)) {

                    fs.unlinkSync(oldFile);

                }

            }

            heroBanner = req.file.filename;

        }

        const data = {

            about_title: req.body.about_title,

            about_description: req.body.about_description,

            hero_banner: heroBanner,

            popup_title: req.body.popup_title,

            popup_description: req.body.popup_description,

            popup_enabled: req.body.popup_enabled

        };

        await HonourHeartSetting.update(data);

        res.redirect("/admin/honour-heart/settings");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};



// ======================================
// PUBLIC LEGEND DETAILS
// ======================================

exports.legendDetails = async (req, res) => {

    try {

        const legend = await HonourHeartLegend.getBySlug(req.params.slug);

        if (!legend) {

            return res.status(404).send("Legendary Personality Not Found");

        }

        res.render(

            "honour-heart/legend-details",

            {

                title: legend.name,

                legend

            }

        );

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};



// ======================================
// PREVIOUS AWARDEE DETAILS
// ======================================

exports.awardeeDetails = async (req,res)=>{

    try{

        const awardee = await HonourHeartAwardee.getById(req.params.id);

        if(!awardee){

            return res.status(404).send("Awardee Not Found");

        }

        let legend = null;

        if(awardee.legend_id){

            legend = await HonourHeartLegend.getById(

                awardee.legend_id

            );

        }

        res.render(

            "honour-heart/awardee-details",

            {

                title:awardee.name,

                awardee,

                legend

            }

        );

    }catch(err){

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};



// ======================================
// DASHBOARD
// ======================================

exports.dashboard = async (req,res)=>{

    res.render(

        "admin/honour-heart/dashboard",

        {

            title:"ARSP Honour Heart Award"

        }

    );

};



// ======================================
// LEGENDS
// ======================================

exports.legendList = async (req, res) => {

    try {

        const legends = await HonourHeartLegend.getAll();

        res.render(

            "admin/honour-heart/legends/index",

            {

                title: "Legendary Personalities",

                legends

            }

        );

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.legendAddForm = async (req, res) => {

    res.render(

        "admin/honour-heart/legends/add",

        {

            title: "Add Legendary Personality"

        }

    );

};

exports.legendSave = async (req, res) => {

    try {

        const data = {

            photo: req.file ? req.file.filename : "",

            name: req.body.name,

            designation: req.body.designation,

            slug: req.body.slug,

            biography: req.body.biography,

            display_order: req.body.display_order,

            status: req.body.status

        };

        await HonourHeartLegend.create(data);

        res.redirect("/admin/honour-heart/legends");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.legendEditForm = async (req, res) => {

    try {

        const legend = await HonourHeartLegend.getById(req.params.id);

        if (!legend) {

            return res.redirect("/admin/honour-heart/legends");

        }

        res.render(

            "admin/honour-heart/legends/edit",

            {

                title: "Edit Legendary Personality",

                legend

            }

        );

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.legendUpdate = async (req, res) => {

    try {

        const old = await HonourHeartLegend.getById(req.params.id);

        if (!old) {

            return res.redirect("/admin/honour-heart/legends");

        }

        if (req.file && old.photo) {

            const oldFile = path.join(

                "public/uploads/honour-heart/legends",

                old.photo

            );

            if (fs.existsSync(oldFile)) {

                fs.unlinkSync(oldFile);

            }

        }

        const data = {

            photo: req.file ? req.file.filename : old.photo,

            name: req.body.name,

            designation: req.body.designation,

            slug: req.body.slug,

            biography: req.body.biography,

            display_order: req.body.display_order,

            status: req.body.status

        };

        await HonourHeartLegend.update(

            req.params.id,

            data

        );

        res.redirect("/admin/honour-heart/legends");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};

exports.legendDelete = async (req, res) => {

    try {

        const legend = await HonourHeartLegend.getById(req.params.id);

        if (legend && legend.photo) {

            const file = path.join(

                "public/uploads/honour-heart/legends",

                legend.photo

            );

            if (fs.existsSync(file)) {

                fs.unlinkSync(file);

            }

        }

        await HonourHeartLegend.delete(req.params.id);

        res.redirect("/admin/honour-heart/legends");

    } catch (err) {

        console.error(err);

        res.send(err);

    }

};



// ======================================
// SELECTION BOARD
// ======================================

exports.selectionBoardList = async (req, res) => {

    try {

        const board = await HonourHeartSelectionBoard.getAll();

        res.render(
            "admin/honour-heart/selection-board/index",
            {
                title: "Selection Board",
                board
            }
        );

    } catch (err) {

        console.error(err);
        res.send(err);

    }

};

exports.selectionBoardAddForm = async (req, res) => {

    res.render(
        "admin/honour-heart/selection-board/add",
        {
            title: "Add Selection Board Member"
        }
    );

};

exports.selectionBoardSave = async (req, res) => {

    try {

        const data = {

            photo: req.file ? req.file.filename : "",

            name: req.body.name,

            designation: req.body.designation,

            organisation: req.body.organisation,

            display_order: req.body.display_order,

            status: req.body.status

        };

        await HonourHeartSelectionBoard.create(data);

        res.redirect("/admin/honour-heart/selection-board");

    } catch (err) {

        console.error(err);
        res.send(err);

    }

};

exports.selectionBoardEditForm = async (req, res) => {

    try {

        const member = await HonourHeartSelectionBoard.getById(req.params.id);

        if (!member) {

            return res.redirect("/admin/honour-heart/selection-board");

        }

        res.render(
            "admin/honour-heart/selection-board/edit",
            {
                title: "Edit Selection Board Member",
                member
            }
        );

    } catch (err) {

        console.error(err);
        res.send(err);

    }

};

exports.selectionBoardUpdate = async (req, res) => {

    try {

        const old = await HonourHeartSelectionBoard.getById(req.params.id);

        if (!old) {

            return res.redirect("/admin/honour-heart/selection-board");

        }

        if (req.file && old.photo) {

            const file = path.join(
                "public/uploads/honour-heart/selection-board",
                old.photo
            );

            if (fs.existsSync(file)) {

                fs.unlinkSync(file);

            }

        }

        const data = {

            photo: req.file ? req.file.filename : old.photo,

            name: req.body.name,

            designation: req.body.designation,

            organisation: req.body.organisation,

            display_order: req.body.display_order,

            status: req.body.status

        };

        await HonourHeartSelectionBoard.update(
            req.params.id,
            data
        );

        res.redirect("/admin/honour-heart/selection-board");

    } catch (err) {

        console.error(err);
        res.send(err);

    }

};

exports.selectionBoardDelete = async (req, res) => {

    try {

        const member = await HonourHeartSelectionBoard.getById(req.params.id);

        if (member && member.photo) {

            const file = path.join(
                "public/uploads/honour-heart/selection-board",
                member.photo
            );

            if (fs.existsSync(file)) {

                fs.unlinkSync(file);

            }

        }

        await HonourHeartSelectionBoard.delete(req.params.id);

        res.redirect("/admin/honour-heart/selection-board");

    } catch (err) {

        console.error(err);
        res.send(err);

    }

};




// ======================================
// LEGENDS PAGE
// ======================================

exports.legends = async (req, res) => {

    try {

        const legends = await HonourHeartLegend.getActive();

        res.render(

            "honour-heart/legends",

            {

                title: "Legendary Personalities",

                legends

            }

        );

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};


