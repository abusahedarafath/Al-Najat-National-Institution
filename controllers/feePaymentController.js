const Class = require("../models/Class");
const FeePayment = require("../models/FeePayment");
const Student = require("../models/Student");
const FeeCategory = require("../models/FeeCategory");

// ======================================
// Display All Fee Payments
// ======================================

exports.showPayments = async (req, res) => {

    try {

        const payments = await FeePayment.getAll();

        res.render("admin/fee-payments", {

            title: "Fee Collection",

            payments

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

//====================
//ADD PAYMENT
//=====================π
exports.addPaymentPage = async (req, res) => {

    try {

        const receiptNo = await FeePayment.generateReceiptNo();

        const students = await Student.getAll();

        const classes = await Class.getActive();

        const categories = await FeeCategory.getActive();

        res.render("admin/add-fee-payment", {

            title: "Collect Fee",

            receiptNo,

            students,

            classes,

            categories

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Save Payment
// ======================================

exports.createPayment = async (req, res) => {

    try {

        await FeePayment.create(req.body);

        res.redirect("/admin/fee-payments");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// View Payment
// ======================================

exports.viewPayment = async (req, res) => {

    try {

        const payment = await FeePayment.getById(req.params.id);

        if (!payment) {

            return res.redirect("/admin/fee-payments");

        }

        res.render("admin/fee-payment-details", {

            title: "Payment Details",

            payment

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Payment Page
// ======================================
exports.editPaymentPage = async (req, res) => {

    try {

        const payment = await FeePayment.getById(req.params.id);

        if (!payment) {
            return res.redirect("/admin/fee-payments");
        }

        const students = await Student.getAll();
        const classes = await Class.getActive();
        const categories = await FeeCategory.getActive();

        res.render("admin/edit-fee-payment", {
            title: "Edit Fee Payment",
            payment,
            students,
            classes,
            categories
        });

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }

};

// ======================================
// Update Payment
// ======================================

exports.updatePayment = async (req, res) => {

    try {

        await FeePayment.update(req.params.id, req.body);

        res.redirect("/admin/fee-payments");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete Payment
// ======================================

exports.deletePayment = async (req, res) => {

    try {

        await FeePayment.delete(req.params.id);

        res.redirect("/admin/fee-payments");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
