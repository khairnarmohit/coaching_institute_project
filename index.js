const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const upload = require("express-fileupload");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload());
app.set("view engine", "ejs");
app.use(express.static('public/'));
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.listen(1000, () => {
  console.log("Server running on port 1000");
});
