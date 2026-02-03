const express = require("express");
const router = express.Router();
const exe = require("../config/db");


router.get("/", (req, res) => {
    res.render("admin/dashboard");
});

router.get("/dashboard", (req, res) => {
    res.render("admin/dashboard");
});

// Home Banner Code start...................................................
router.get("/home_banner", async (req, res) => {
  const banner = await exe("SELECT * FROM home_banner ORDER BY id DESC LIMIT 1");
  res.render("admin/Home/home_banner.ejs", { banner: banner[0] });
});
router.post("/home-update", async (req, res) => {
  try {
    const { id, img, ...data } = req.body;

    let fields = [];
    let values = [];

    // banner_image fallback
    if (!data.banner_image || data.banner_image === "") {
      data.banner_image = img;
    }

    for (let key in data) {
      if (
        key !== "img" &&
        data[key] !== "" &&
        data[key] !== null &&
        data[key] !== undefined
      ) {
        fields.push(`${key}=?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return res.redirect("/admin/home_banner");
    }

    values.push(id);

    const sql = `UPDATE home_banner SET ${fields.join(", ")} WHERE id=?`;
    await exe(sql, values);

    res.redirect("/admin/home_banner");

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
// Home Banner Code end...................................................

router.get("/featured_courses", async (req, res) => {
  const courses = await exe("SELECT * FROM featured_courses");
  res.render("admin/Home/featured_courses.ejs", {
    courses,
    editCourse: null
  });
});

router.post("/featured-courses/save", async (req, res) => {
  try {
    const { title, description, url } = req.body;

    await exe(
      "INSERT INTO featured_courses (title, description, url) VALUES (?,?,?)",
      [title, description, url]
    );

    res.redirect("/admin/featured_courses");
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

router.get("/featured-courses/edit/:id", async (req, res) => {
  const courses = await exe("SELECT * FROM featured_courses");
  const result = await exe(
    "SELECT * FROM featured_courses WHERE id=?",
    [req.params.id]
  );

  res.render("admin/Home/featured_courses.ejs", {
    courses,
    editCourse: result[0]
  });
});

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

router.get("/featured-courses/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await exe("DELETE FROM featured_courses WHERE id=?", [id]);

    res.redirect("/admin/featured_courses");
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

router.get('/achievements', async (req, res) => {
  const achievements = await exe("SELECT * FROM achievements");

  res.render("admin/Home/achievements.ejs", {
    achievements,
    achievement: null
  });
});

router.get('/achievements/add', async (req, res) => {
  const achievements = await exe("SELECT * FROM achievements");
  res.render("admin/Home/achievements.ejs", {
    achievements,
    achievement: null
  });
});

router.get('/achievements/edit/:id', async (req, res) => {
  const achievements = await exe("SELECT * FROM achievements");
  const result = await exe(
    "SELECT * FROM achievements WHERE id=?",
    [req.params.id]
  );

  res.render("admin/Home/achievements.ejs", {
    achievements,
    achievement: result[0]
  });
});

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

  res.redirect("/admin/achievements"); // ✅ FINAL FIX
});

router.get('/achievements/delete/:id', async (req, res) => {
  await exe(
    "DELETE FROM achievements WHERE id=?",
    [req.params.id]
  );

  res.redirect("/admin/achievements");
});


router.get('/home_upcoming_batches', async (req, res) => {
  const batches = await exe("SELECT * FROM home_upcoming_batches");

  res.render("admin/Home/home_upcoming_batches.ejs", {
    batches,
    batch: null
  });
});

router.get('/home_upcoming_batches/edit/:id', async (req, res) => {
  const batches = await exe("SELECT * FROM home_upcoming_batches");
  const result = await exe(
    "SELECT * FROM home_upcoming_batches WHERE id=?",
    [req.params.id]
  );

  res.render("admin/Home/home_upcoming_batches.ejs", {
    batches,
    batch: result[0]
  });
});

router.post('/home_upcoming_batches/save', async (req, res) => {
  const { id, title, description, duration, fees } = req.body;

  if (id) {
    await exe(
      "UPDATE home_upcoming_batches SET title=?, description=?, duration=?, fees=? WHERE id=?",
      [title, description, duration, fees, id]
    );
  } else {
    await exe(
      "INSERT INTO home_upcoming_batches (title, description, duration, fees) VALUES (?,?,?,?)",
      [title, description, duration, fees]
    );
  }

  res.redirect("/admin/home_upcoming_batches");
});

router.get('/home_upcoming_batches/delete/:id', async (req, res) => {
  await exe(
    "DELETE FROM home_upcoming_batches WHERE id=?",
    [req.params.id]
  );

  res.redirect("/admin/home_upcoming_batches");
});







// LIST
router.get('/testimonials', async (req, res) => {
  const testimonials = await exe("SELECT * FROM testimonials ORDER BY id DESC");
  res.render("admin/Home/testimonials", { testimonials, edit: null });
});

// EDIT
router.get('/testimonials/edit/:id', async (req, res) => {
  const testimonials = await exe("SELECT * FROM testimonials ORDER BY id DESC");
  const edit = await exe("SELECT * FROM testimonials WHERE id=?", [req.params.id]);
  res.render("admin/Home/testimonials", { testimonials, edit: edit[0] });
});

// SAVE (ADD + UPDATE)
router.post('/testimonials/save', async (req, res) => {
  const { id, name, role, message, video_url, type } = req.body;

  if (id) {
    await exe(
      `UPDATE testimonials 
       SET name=?, role=?, message=?, video_url=?, type=? 
       WHERE id=?`,
      [name, role, message, video_url, type, id]
    );
  } else {
    await exe(
  "INSERT INTO testimonials (name, role, message, type, video_url) VALUES (?,?,?,?,?)",
  [name, role, message, type, video_url]
);

  }

  res.redirect("/admin/testimonials");
});

// DELETE
router.get('/testimonials/delete/:id', async (req, res) => {
  await exe("DELETE FROM testimonials WHERE id=?", [req.params.id]);
  res.redirect("/admin/testimonials");
});



router.get('/contact', async (req, res) => {
    const result = await exe("SELECT * FROM contact_details WHERE id=1");

    res.render('admin/contact.ejs', {
        contact: result[0]
    });
});

router.post('/contact', async (req, res) => {
    try {
        const {
            address,
            phone1,
            phone2,
            email,
            map_embed,
            weekday_time,
            saturday_time,
            sunday_time,
            office_note
        } = req.body;

        await exe(
            `UPDATE contact_details SET
                address = ?,
                phone1 = ?,
                phone2 = ?,
                email = ?,
                map_embed = ?,
                weekday_time = ?,
                saturday_time = ?,
                sunday_time = ?,
                office_note = ?
             WHERE id = 1`,
            [
                address,
                phone1,
                phone2,
                email,
                map_embed,
                weekday_time,
                saturday_time,
                sunday_time,
                office_note
            ]
        );

        // redirect back to edit page
        res.redirect('/admin/contact');

    } catch (err) {
        console.error(err);
        res.send('Update Failed');
    }
});








module.exports = router;
