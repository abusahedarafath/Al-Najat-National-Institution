const express = require("express");
const path = require("path");
const db = require("./config/database");

const homeRoutes = require("./routes/homeRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const session = require("express-session");
const admission2027Routes = require("./routes/admission2027Routes");



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "al_najat_secret_key",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", homeRoutes);
app.use("/", aboutRoutes);
app.use("/", admissionRoutes);
app.use("/", adminRoutes);
app.use("/", authRoutes);
app.use("/", admission2027Routes);


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
