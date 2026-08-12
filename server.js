require("dotenv").config();
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "NOT SET");
console.log("DB_NAME:", process.env.DB_NAME);

const express = require("express");
const path = require("path");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");


const homeRoutes = require("./routes/homeRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const adminRoutes = require("./routes/adminRoutes");

const menuRoutes = require("./routes/menuRoutes");
const loadWebsiteData = require("./middleware/loadWebsiteData");
const identityCardRoutes = require("./routes/identityCardRoutes");


const adminArspRoutes = require("./routes/adminArspRoutes");
const arspRoutes = require("./routes/arspRoutes");
const arspMemberRoutes = require("./routes/arspMemberRoutes");
const adminCommitteeRoutes = require("./routes/adminCommitteeRoutes");
const arspSettingRoutes = require("./routes/arspSettingRoutes");
const arspPublicRoutes = require("./routes/arspPublicRoutes");

const personalityRoutes = require("./routes/personalityRoutes");
const honourHeartRoutes = require("./routes/honourHeartRoutes");



const authRoutes = require("./routes/authRoutes");
const adminRecoveryRoutes = require("./routes/adminRecoveryRoutes");

const studentRoutes = require("./routes/studentRoutes");
const session = require("express-session");
const flash = require("connect-flash");
const admission2027Routes = require("./routes/admission2027Routes");
const adminNoticeRoutes = require("./routes/adminNoticeRoutes");
const adminNewsRoutes = require("./routes/adminNewsRoutes");
const publicRoutes = require("./routes/publicRoutes");
const adminGalleryRoutes = require("./routes/adminGalleryRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const classRoutes = require("./routes/classRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const examRoutes = require("./routes/examRoutes");
const markRoutes = require("./routes/markRoutes");
const feeCategoryRoutes = require("./routes/feeCategoryRoutes");
const feePaymentRoutes = require("./routes/feePaymentRoutes");
const feeReceiptRoutes = require("./routes/feeReceiptRoutes");
const bookCategoryRoutes = require("./routes/bookCategoryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const bookIssueRoutes = require("./routes/bookIssueRoutes");
const libraryDashboardRoutes = require("./routes/libraryDashboardRoutes");
const transportRouteRoutes = require("./routes/transportRouteRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const certificatePrintRoutes = require("./routes/certificatePrintRoutes");
const welcomeSectionRoutes = require("./routes/welcomeSectionRoutes");
const principalMessageRoutes = require("./routes/principalMessageRoutes");
const chancellorMessageRoutes = require("./routes/chancellorMessageRoutes");
const quickAccessRoutes = require("./routes/quickAccessRoutes");
const headerButtonRoutes = require("./routes/headerButtonRoutes");
const chairmanMessageRoutes = require("./routes/chairmanMessageRoutes");
const siteSettingRoutes = require("./routes/siteSettingRoutes");
const footerRoutes = require("./routes/footerRoutes");
const rtseRoutes = require("./routes/rtse");
const seoRoutes = require("./routes/seoRoutes");
const adminRtseRoutes = require("./routes/adminRtseRoutes");



const app = express();
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);
app.use(compression());
app.use(morgan("dev"));


const PORT = process.env.PORT || 3000;

// Body Parser
app.use(express.urlencoded({ extended: true }));

// Website Data (Menus + Site Settings)
app.use(loadWebsiteData);

// Session
app.use(
    session({
       secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        }
    })
);

// Flash Messages
app.use(flash());

// Global Flash Variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");
    next();
});

// Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));





// ===============================
// Public Routes
// ===============================

app.use("/", homeRoutes);
app.use("/", seoRoutes);
app.use("/", aboutRoutes);
app.use("/", admissionRoutes);

// Login routes MUST come before protected admin routes
app.use("/", authRoutes);
app.use("/", adminRecoveryRoutes);
// RTSE public routes MUST be registered before admin routes
app.use("/rtse", rtseRoutes);

app.use("/", adminRoutes);
app.use("/", personalityRoutes);
app.use("/", menuRoutes);

app.use("/", adminArspRoutes);
app.use("/", arspRoutes);
app.use("/", arspMemberRoutes);
app.use("/", adminCommitteeRoutes);


app.use(honourHeartRoutes);
app.use(arspSettingRoutes);
app.use(arspPublicRoutes);
app.use(require("./routes/arspVerificationRoutes"));

app.use("/", studentRoutes);
app.use("/", admission2027Routes);

app.use(adminNoticeRoutes);
app.use(adminNewsRoutes);
app.use(adminGalleryRoutes);

app.use("/", publicRoutes);
app.use(galleryRoutes);
app.use("/", identityCardRoutes);

app.use("/", footerRoutes);

// ===============================
// RTSE Public Routes



// ===============================
// Admin Module Routes
// ===============================

app.use("/admin", teacherRoutes);
app.use("/admin", classRoutes);
app.use("/admin", attendanceRoutes);
app.use("/admin", examRoutes);
app.use("/admin", markRoutes);
app.use("/admin", feeCategoryRoutes);
app.use("/admin", feePaymentRoutes);
app.use("/admin", feeReceiptRoutes);
app.use("/admin", bookCategoryRoutes);
app.use("/admin", bookRoutes);
app.use("/admin", bookIssueRoutes);
app.use("/admin", libraryDashboardRoutes);
app.use("/admin", transportRouteRoutes);
app.use("/admin", vehicleRoutes);
app.use("/admin", certificateRoutes);
app.use("/admin", certificatePrintRoutes);
app.use("/admin", welcomeSectionRoutes);
app.use("/admin", principalMessageRoutes);
app.use("/admin", chancellorMessageRoutes);
app.use("/admin", quickAccessRoutes);
app.use("/", headerButtonRoutes);
app.use("/admin", chairmanMessageRoutes);
app.use("/admin", siteSettingRoutes);


// ===============================
// RTSE Admin Routes
// ===============================

app.use("/admin", adminRtseRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render("errors/404");
});

// 500 Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("errors/500");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
