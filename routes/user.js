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

router.get("/admission",function(req,res){
    res.render("user/admission.ejs")
});

router.get("/syllabus",(req,res)=>{
  res.render("user/syllabus.ejs")
})

router.get("/gallery",(req,res)=>{
  res.render("user/gallery.ejs")
})

router.get("/faculty",(req,res)=>{
  res.render("user/faculty.ejs")
})

router.get("/batches",(req,res)=>{
  res.render("user/batches.ejs")
})



module.exports = router;
