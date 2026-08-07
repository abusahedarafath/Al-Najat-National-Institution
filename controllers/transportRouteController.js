const TransportRoute = require("../models/TransportRoute");

// ======================================
// Display All Transport Routes
// ======================================

exports.showRoutes = async (req, res) => {

    try {

        const routes = await TransportRoute.getAll();

        res.render("admin/transport-routes", {

            title: "Transport Routes",

            routes

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Add Route Page
// ======================================

exports.addRoutePage = (req, res) => {

    res.render("admin/add-transport-route", {

        title: "Add Transport Route"

    });

};

// ======================================
// Create Route
// ======================================

// ======================================
// Create Route
// ======================================

exports.createRoute = async (req, res) => {

    try {

        const routeData = {

            route_code: req.body.route_code,
            route_name: req.body.route_name,
            start_point: req.body.start_point,
            end_point: req.body.end_point,
            distance: req.body.distance,
            estimated_time: req.body.estimated_time,
            fare: req.body.fare,
            status: req.body.status || "Active"

        };

        await TransportRoute.create(routeData);

        res.redirect("/admin/transport-routes");

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }

};

// ======================================
// View Route
// ======================================

exports.viewRoute = async (req, res) => {

    try {

        const route = await TransportRoute.getById(req.params.id);

        if (!route) {

            return res.redirect("/admin/transport-routes");

        }

        res.render("admin/transport-route-details", {

            title: "Transport Route Details",

            route

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Route Page
// ======================================

exports.editRoutePage = async (req, res) => {

    try {

        const route = await TransportRoute.getById(req.params.id);

        if (!route) {

            return res.redirect("/admin/transport-routes");

        }

        res.render("admin/edit-transport-route", {

            title: "Edit Transport Route",

            route

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};


// ======================================
// Update Route
// ======================================

exports.updateRoute = async (req, res) => {

    try {

        const routeData = {

            route_code: req.body.route_code,
            route_name: req.body.route_name,
            start_point: req.body.start_point,
            end_point: req.body.end_point,
            distance: req.body.distance,
            estimated_time: req.body.estimated_time,
            fare: req.body.fare,
            status: req.body.status

        };

        await TransportRoute.update(req.params.id, routeData);

        res.redirect("/admin/transport-route/" + req.params.id);

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete Route
// ======================================

exports.deleteRoute = async (req, res) => {

    try {

        await TransportRoute.delete(req.params.id);

        res.redirect("/admin/transport-routes");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
