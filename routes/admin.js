const express = require("express");
const router = express.Router();

/* Admin Dashboard */
router.get("/", (req, res) => {
    res.render("admin/dashboard");
});

router.get("/dashboard", function(req,res){
    res.render("admin/dashboard.ejs")
})

/* Admin Home Page */
router.get("/home", (req, res) => {
    res.render("admin/home.ejs");
});



module.exports = router;
