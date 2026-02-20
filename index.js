const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const upload = require("express-fileupload");
var session = require('express-session');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
 
}));



app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload());
app.set("view engine", "ejs");
app.use(express.static('public/'));
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.listen(3002, () => {
  console.log("Server running on port 1000");
});
