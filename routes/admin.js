const express = require("express");
const router = express.Router();
const exe = require("../config/db");

/* ================================
   1. Admin Dashboard
================================ */
router.get("/", (req, res) => {
    res.render("admin/dashboard");
});

router.get("/dashboard", (req, res) => {
    res.render("admin/dashboard");
});

/* ================================
   2. Admin Home Page (Normal View)
================================ */
router.get("/home", async (req, res) => {
    try {
        // Home banner
        const banner = await exe(
            "SELECT * FROM home_banner ORDER BY id DESC LIMIT 1"
        );

        // Featured courses
        const courses = await exe(
            "SELECT * FROM featured_courses"
        );

        // Achievements
        const achievements = await exe(
            "SELECT * FROM achievements"
        );

        // Upcoming Batches (home_upcoming_batches)
        const batches = await exe(
            "SELECT * FROM home_upcoming_batches"
        );

        res.render("admin/home", {
            banner: banner[0] || null,
            courses,
            achievements,        // achievement table
            achievement: null,   // achievement form safe
            batches,             // upcoming batches table
            editBatch: null,     // batch form safe
            editCourse: null     // featured course form safe
        });

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});



/* ================================
   3. Home Banner Update
================================ */
router.post("/home-update", async (req, res) => {
    try {
        const {
            id,
            badge_text,
            heading_main,
            heading_highlight,
            description,
            banner_image,
            btn1_text,
            btn1_link,
            years_exp,
            selections,
            satisfaction
        } = req.body;

        await exe(
            `UPDATE home_banner SET
                badge_text=?,
                heading_main=?,
                heading_highlight=?,
                description=?,
                banner_image=?,
                btn1_text=?,
                btn1_link=?,
                years_exp=?,
                selections=?,
                satisfaction=?
             WHERE id=?`,
            [
                badge_text,
                heading_main,
                heading_highlight,
                description,
                banner_image,
                btn1_text,
                btn1_link,
                years_exp,
                selections,
                satisfaction,
                id
            ]
        );

        res.redirect("/admin/home");
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});

/* ================================
   4. Edit Featured Course
   (Same admin/home page)
================================ */
router.get("/featured-courses/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Home banner
        const banner = await exe(
            "SELECT * FROM home_banner ORDER BY id DESC LIMIT 1"
        );

        // Featured courses (list)
        const courses = await exe(
            "SELECT * FROM featured_courses"
        );

        // Single course for edit
        const result = await exe(
            "SELECT * FROM featured_courses WHERE id=?",
            [id]
        );

        // Achievements (for admin section)
        const achievements = await exe(
            "SELECT * FROM achievements"
        );

        // Upcoming batches (home_upcoming_batches)
        const batches = await exe(
            "SELECT * FROM home_upcoming_batches"
        );

        res.render("admin/home", {
            banner: banner[0] || null,
            courses,
            editCourse: result[0],   // 👈 course edit
            achievements,
            achievement: null,      // 👈 important (form safe)
            batches,
            editBatch: null         // 👈 important (batch form safe)
        });

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});


/* ================================
   5. Update Featured Course
================================ */
router.post("/featured-courses/update", async (req, res) => {
    try {
        const { id, title, description, url } = req.body;

        await exe(
            "UPDATE featured_courses SET title=?, description=?, url=? WHERE id=?",
            [title, description, url, id]
        );

        res.redirect("/admin/home");
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});


// Show achievements
router.get('/achievements', async (req, res) => {
    const banner = await exe("SELECT * FROM home_banner ORDER BY id DESC LIMIT 1");
    const courses = await exe("SELECT * FROM featured_courses");
    const achievements = await exe("SELECT * FROM achievements");

    res.render("admin/home", {
        banner: banner[0] || null,
        courses,
        achievements,
        achievement: null,
        editCourse: null
    });
});


// Save (Add / Update)
router.post('/achievements/save', async (req, res) => {
    const { id, title, value, suffix } = req.body;

    if (id) {
        await exe(
            "UPDATE achievements SET title=?, value=?, suffix=? WHERE id=?",
            [title, value, suffix, id]
        );
    } else {
        await exe(
            "INSERT INTO achievements (title, value, suffix) VALUES (?,?,?)",
            [title, value, suffix]
        );
    }

    res.redirect('/admin/home');
});

// Edit
router.get('/achievements/edit/:id', async (req, res) => {
    try {
        // Fetch banner
        const banner = await exe(
            "SELECT * FROM home_banner ORDER BY id DESC LIMIT 1"
        );

        // Fetch courses (because admin/home expects it)
        const courses = await exe(
            "SELECT * FROM featured_courses"
        );

        // Fetch all achievements (for table)
        const achievements = await exe(
            "SELECT * FROM achievements"
        );

        // Fetch single achievement (for edit form)
        const result = await exe(
            "SELECT * FROM achievements WHERE id=?",
            [req.params.id]
        );

        res.render("admin/home", {
            banner: banner[0] || null,
            courses,
            achievements,
            achievement: result[0], // edit data
            editCourse: null
        });

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});


router.get("/batches/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // 🔥 banner MUST be fetched here
        const banner = await exe(
            "SELECT * FROM home_banner ORDER BY id DESC LIMIT 1"
        );

        // Featured courses
        const courses = await exe(
            "SELECT * FROM featured_courses"
        );

        // Achievements
        const achievements = await exe(
            "SELECT * FROM achievements"
        );

        // All batches (for table)
        const batches = await exe(
            "SELECT * FROM home_upcoming_batches"
        );

        // Single batch for edit
        const result = await exe(
            "SELECT * FROM home_upcoming_batches WHERE id=?",
            [id]
        );

        res.render("admin/home", {
            banner: banner[0] || null,
            courses,
            achievements,
            batches,
            editBatch: result[0],   // 👈 edit form data
            achievement: null,
            editCourse: null
        });

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});

router.post("/batches/save", async (req, res) => {
    try {
        const { id, title, description, duration, fees } = req.body;

        if (id) {
            // UPDATE
            await exe(
                "UPDATE home_upcoming_batches SET title=?, description=?, duration=?, fees=? WHERE id=?",
                [title, description, duration, fees, id]
            );
        } else {
            // INSERT
            await exe(
                "INSERT INTO home_upcoming_batches (title, description, duration, fees) VALUES (?,?,?,?)",
                [title, description, duration, fees]
            );
        }

        res.redirect("/admin/home");

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});


router.get("/batches/delete/:id", async (req, res) => {
    const id = req.params.id;

    await exe(
        "DELETE FROM home_upcoming_batches WHERE id=?",
        [id]
    );

    res.redirect("/admin/home");
});




module.exports = router;
