var express = require("express");
var bodyparser = require("body-parser")
var session = require("express-session")

var user = require("./routes/user.js");
var admin = require("./routes/admin.js");

require("dotenv").config()
var app = express();



app.use(session({
    secret : "jhgjh",
    resave : true,
    saveUninitialized : false
}))
app.use(bodyparser.urlencoded({extended : true}));
app.use(express.static("public"))



app.use("/",user);
app.use("/admin",admin);



app.listen(process.env.PORT);
