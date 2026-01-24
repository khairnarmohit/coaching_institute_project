const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("user/home.ejs");
});

router.get("/about", (req, res) => {
  res.render("user/about.ejs");
});

router.get("/contact",(req,res)=>{
    res.render("user/contact.ejs")
})

route.get("/admission",function(req,res){
    res.render("user/admission.ejs")
});


module.exports = router;
