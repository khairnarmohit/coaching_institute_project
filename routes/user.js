var express = require("express");
var router = express.Router();

router.get("/",(req,res)=>{
    res.render("user/home.ejs")
})

router.get("/contact",(req,res)=>{
    res.render("user/contact.ejs")
})



module.exports = router;