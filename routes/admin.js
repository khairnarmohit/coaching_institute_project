const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("admin/dashboard");
});

router.get("/login", (req, res) => {
    res.render("admin/login");
});

module.exports = router;