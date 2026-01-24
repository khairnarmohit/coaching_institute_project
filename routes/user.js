const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("user/home.ejs");
});

router.get("/about", (req, res) => {
  res.render("user/about.ejs");
});



module.exports = router;
