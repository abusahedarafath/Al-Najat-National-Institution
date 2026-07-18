const express = require("express");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("home/index");
});
app.get("/about", (req, res) => {
    res.render("about/index");
});
app.get("/admission", (req, res) => {
    res.render("admission/index");
});

app.get("/apply", (req, res) => {
    res.render("admission/apply");
});

app.post("/apply", (req, res) => {
    console.log(req.body);

    res.send("<h1>Application Submitted Successfully!</h1>");
});
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

