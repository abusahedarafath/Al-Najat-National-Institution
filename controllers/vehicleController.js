const Vehicle = require("../models/Vehicle");
const TransportRoute = require("../models/TransportRoute");

// ======================================
// Display All Vehicles
// ======================================

exports.showVehicles = async (req, res) => {

    try {

        const vehicles = await Vehicle.getAll();

        res.render("admin/vehicles", {

            title: "Vehicle Management",

            vehicles

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Add Vehicle Page
// ======================================

exports.addVehiclePage = async (req, res) => {

    try {

        const routes = await TransportRoute.getActive();

        res.render("admin/add-vehicle", {

            title: "Add Vehicle",

            routes

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Create Vehicle
// ======================================

exports.createVehicle = async (req, res) => {

    try {

        await Vehicle.create(req.body);

        res.redirect("/admin/vehicles");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// View Vehicle
// ======================================

exports.viewVehicle = async (req, res) => {

    try {

        const vehicle = await Vehicle.getById(req.params.id);

        if (!vehicle) {

            return res.redirect("/admin/vehicles");

        }

        res.render("admin/vehicle-details", {

            title: "Vehicle Details",

            vehicle

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Vehicle Page
// ======================================

exports.editVehiclePage = async (req, res) => {

    try {

        const vehicle = await Vehicle.getById(req.params.id);

        if (!vehicle) {

            return res.redirect("/admin/vehicles");

        }

        const routes = await TransportRoute.getActive();

        res.render("admin/edit-vehicle", {

            title: "Edit Vehicle",

            vehicle,

            routes

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Update Vehicle
// ======================================

exports.updateVehicle = async (req, res) => {

    try {

        await Vehicle.update(req.params.id, req.body);

        res.redirect("/admin/vehicles");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete Vehicle
// ======================================

exports.deleteVehicle = async (req, res) => {

    try {

        await Vehicle.delete(req.params.id);

        res.redirect("/admin/vehicles");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
