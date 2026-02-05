const express = require("express");
const router = express.Router();
const exe = require("../config/db");
const path = require("path");
const fs = require("fs");


function veryfyLogin(req, res, next) {
  if (req.session.admin_id) {
    next();
  } else {
    res.redirect("/admin");
  }
}

router.get("/", (req, res) => {
  res.render('admin/login.ejs');

});
router.post("/login", async (req, res) => {
  try {

    var sql = `SELECT email,password FROM admin WHERE email = ? AND password = ?`;
    var result = await exe(sql, [req.body.email, req.body.password]);
    if (result.length > 0) {
      req.session.admin_id = 1;
      // res.send("Login Successfull");
      res.redirect("/admin/dashboard");

    } else {
      res.send("<script> alert('Invalid email or password'); window.location.href='/admin';</script>");
      // res.render("admin/login.ejs", { message: "Invalid email or password" });
    }
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

router.use(veryfyLogin);

router.get("/dashboard", async (req, res) => {
  try {
    const [
      students,
      batches,
      courses,
      faculty,
      admissions,
      enquiryActive,
      enquiryClosed
    ] = await Promise.all([
      exe("SELECT COUNT(*) AS total FROM admissions"),
      exe("SELECT COUNT(*) AS total FROM upcoming_batches WHERE is_active=1"),
      exe("SELECT COUNT(*) AS total FROM courses_list"),
      exe("SELECT COUNT(*) AS total FROM faculty"),
      exe("SELECT COUNT(*) AS total FROM admissions WHERE status='Approved'"),
      exe("SELECT COUNT(*) AS total FROM contact_enquiries WHERE status='1'"),
      exe("SELECT COUNT(*) AS total FROM contact_enquiries WHERE status='0'")
    ]);

    res.render("admin/dashboard", {
      counts: {
        students: students[0].total,
        batches: batches[0].total,
        courses: courses[0].total,
        faculty: faculty[0].total,
        admissions: admissions[0].total,
        contact_active: enquiryActive[0].total,
        contact_closed: enquiryClosed[0].total,
        contact_enquiries:
          enquiryActive[0].total + enquiryClosed[0].total
      }
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.render("admin/dashboard", {
      counts: {
        students: 0,
        batches: 0,
        courses: 0,
        faculty: 0,
        admissions: 0,
        contact_active: 0,
        contact_closed: 0,
        contact_enquiries: 0
      }
    });
  }
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

  res.render('admin/contact/contact.ejs', {
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

    // ✅ redirect to GET route (NOT .ejs)
    res.redirect('/admin/contact');

  } catch (err) {
    console.error(err);
    res.send('Update Failed');
  }
});


router.get("/hero-banner", async (req, res) => {
  var sql = `select * from batches_banner`;
  var result = await exe(sql);
  res.render("admin/batches/hero_banner.ejs", { result });
});

router.post("/update_hero", async (req, res) => {
  var d = req.body
  var sql = `update batches_banner set heading =? , sub_heading=? where id=1`;
  var result = await exe(sql, [d.heading, d.sub_heading]);
  res.redirect("/admin/hero-banner");
})


router.get("/upcoming", async (req, res) => {
  var sql = `select * from upcoming_batches where is_active=1`;
  var result = await exe(sql);
  res.render("admin/batches/upcoming.ejs", { result });
});
router.post("/add_batch", async (req, res) => {
  var d = req.body;
  var sql = `insert into upcoming_batches (batch_title,status_label,batch_status,duration,fees,total_strength) values (?,?,?,?,?,?)`;
  var result = await exe(sql, [d.title, d.statusLabel, d.batch_status, d.duration, d.fees, d.total_strength]);
  res.redirect("/admin/upcoming");

})
router.post("/update_batch", async (req, res) => {
  var d = req.body;
  var sql = `update upcoming_batches set batch_title=?,status_label=?,batch_status=?,duration=?,fees=?,total_strength=?,mode=? where id=?`;
  var result = await exe(sql, [d.title, d.statusLabel, d.batch_status, d.duration, d.fees, d.total_strength, d.mode, d.batch_id]);
  res.redirect("/admin/upcoming");
});
router.get("/delete_batch/:id", async (req, res) => {
  var id = req.params.id;
  var sql = `update upcoming_batches set is_active = 0 where id=?`;
  var result = await exe(sql, [id]);
  res.redirect("/admin/upcoming");
});


router.get("/information", async (req, res) => {
  var sql = `select * from info_boxes where status=1`;
  var result = await exe(sql);
  res.render("admin/batches/batches_imformation.ejs", { result });
});

router.post("/add_info_box", async (req, res) => {
  var d = req.body;
  var sql = `insert into info_boxes (title,description) values (?,?)`;
  var result = await exe(sql, [d.title, d.description]);
  res.redirect("/admin/information");
});

router.post("/update_info_box", async (req, res) => {
  var d = req.body;
  var sql = `update info_boxes set title=?,description=? where id=? `;
  var result = await exe(sql, [d.title, d.description, d.info_box_id]);
  res.redirect("/admin/information");


});


router.get("/delete_info_box/:id", async (req, res) => {
  var id = req.params.id;
  var sql = `update info_boxes set status=0 where id=?`;
  var result = await exe(sql, [id]);
  res.redirect("/admin/information");
});

router.get("/syllabus", async (req, res) => {
  var sql = `select * from syllabus where status=1`;
  var syllabus = await exe(sql);
  res.render("admin/syllabus/syllabus.ejs", { syllabus });
});



router.post("/add_syllabus", async (req, res) => {

  var d = req.body;
  var filename = Date.now() + ".pdf";

  req.files.pdf_file.mv('public/pdf/' + filename);
  var sql = `insert into syllabus (exam_name,description,pdf_path,icon_class) values (?,?,?,?)`;
  var result = await exe(sql, [d.exam_name, d.description, filename, d.icon_class]);
  res.redirect("/admin/syllabus");



});

router.post("/update_syllabus", async (req, res) => {
  var d = req.body;
  var old_path = await exe(`select pdf_path from syllabus where id=?`, [d.syllabus_id]);
  if (req.files && req.files.pdf_file) {
    req.files.pdf_file.mv("public/pdf/" + old_path[0].pdf_path);

  }


  var sql = `update syllabus set exam_name=?,description=?,icon_class=? where id=?`;
  var result = await exe(sql, [d.exam_name, d.description, d.icon_class, d.syllabus_id]);
  res.redirect("/admin/syllabus");

  // res.send(old_path);

});

router.get("/delete_syllabus/:id", async (req, res) => {
  var id = req.params.id;
  var sql = `update syllabus set status=0 where id=?`;
  var result = await exe(sql, [id]);
  res.redirect("/admin/syllabus");
});




// Post add-courses page
router.post("/add-course", async (req, res) => {
  try {
    const d = req.body;
    let filename = "";
    if (req.files && req.files.image) {
      filename = Date.now() + "_" + req.files.image.name;
      req.files.image.mv("public/images/" + filename);
    }
    const sql = `
      INSERT INTO courses_list
      (course_key, title, shortDesc, duration, image, category, status, eligibility, features, admission_notice, fees_structure)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      d.course_key.trim().toLowerCase(),
      d.title,
      d.shortDesc,
      d.duration,
      filename,
      d.category,
      d.status,
      d.eligibility,
      d.features,
      d.admission_notice,
      d.fees_structure,
    ];

    await exe(sql, values);
    res.redirect("/admin/courses_list");
  } catch (err) {
    console.log(err);
    res.send("Error while inserting course");
  }
});



router.get("/enquiries", async (req, res) => {
  var sql = `select * from contact_enquiries where status="1" order by id desc`;
  var result = await exe(sql);
  res.render("admin/contact/contact_enquiries.ejs", { result });
  // res.send(result)
});

router.get("/delete_enquiry/:id", async (req, res) => {
  var id = req.params.id;
  var sql = `update contact_enquiries set status="0" where id=?`;
  var result = await exe(sql, [id]);
  res.redirect("/admin/enquiries");
});

router.get("/faculty_expert", async (req, res) => {
  console.log("FACULTY EXPERT ROUTE HIT");
  var sql = `SELECT * FROM faculty ORDER BY id DESC`;
  var facultyList = await exe(sql);
  res.render("admin/Faculty/faculty_expert", { facultyList });
});


router.post("/faculty_expert_add", async (req, res) => {
  try {
    const {
      name,
      designation,
      category,
      qualification,
      expertise,
      experience,
      description,
      badge
    } = req.body;

    // image check
    if (!req.files || !req.files.image) {
      return res.send("Image required");
    }

    const imageFile = req.files.image;
    const fileName = Date.now() + "_" + imageFile.name;
    const uploadPath = path.join(__dirname, "../public/images/", fileName);

    // move image
    await imageFile.mv(uploadPath);

    const image = "/images/" + fileName;

    const sql = `
      INSERT INTO faculty
      (name, designation, category, qualification, expertise, experience, description, image, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await exe(sql, [
      name,
      designation,
      category,
      qualification,
      expertise,
      experience,
      description,
      image,
      badge
    ]);


    res.redirect("/admin/faculty_expert");

  } catch (err) {
    console.log(err);
    res.send("Insert Error");
  }
});


router.get("/edit_faculty_expert/:id", async (req, res) => {
  const facultyId = req.params.id;
  const sql = "SELECT * FROM faculty WHERE id = ?";
  const [faculty] = await exe(sql, [facultyId]);
  res.render("admin/Faculty/faculty_expert_edit.ejs", { faculty });
});

router.post("/update_faculty_expert/:id", async (req, res) => {
  const id = req.params.id;
  const { name, designation, category, qualification,
    expertise, experience, description, badge } = req.body;

  let imageSql = "";
  let values = [
    name, designation, category,
    qualification, expertise,
    experience, description, badge
  ];

  if (req.files && req.files.image) {
    const img = req.files.image;
    const imgName = Date.now() + "_" + img.name;
    await img.mv("public/images/" + imgName);
    imageSql = ", image = ?";
    values.push("/images/" + imgName);
  }

  values.push(id);

  await exe(`
    UPDATE faculty SET
      name=?, designation=?, category=?,
      qualification=?, expertise=?,
      experience=?, description=?, badge=?
      ${imageSql}
    WHERE id=?
  `, values);

  res.redirect("/admin/faculty_expert");
});

router.get("/delete_faculty_expert/:id", async (req, res) => {
  const facultyId = req.params.id;
  const sql = "DELETE FROM faculty WHERE id = ?";
  await exe(sql, [facultyId]);
  res.redirect("/admin/faculty_expert");
});

// GET courses_list page
router.get("/courses_list", async (req, res) => {
  const sql = "SELECT * FROM courses_list";
  const courses = await exe(sql);
  res.render("admin/courses_list.ejs", { courses });
});


// GET Delete page
router.get("/delete_course/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const sql = "DELETE FROM courses_list WHERE id = ?";
    await exe(sql, [courseId]);
    res.redirect("/admin/courses_list");
  } catch (err) {
    console.log(err);
    res.send("Error while deleting course");
  }
});


// GET edit page
router.get("/edit_course/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const sql = "SELECT * FROM courses_list WHERE id = ?";
    const courses = await exe(sql, [courseId]);

    if (courses.length === 0) {
      return res.send("Course not found");
    }
    res.render("admin/edit_course.ejs", { course: courses[0] });
  } catch (err) {
    console.log(err);
    res.send("Error while fetching course");
  }
});



// POST updated data
router.post("/edit_course/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const d = req.body;
    let filename = d.old_image; // hidden input in form for old image

    if (req.files && req.files.image) {
      filename = Date.now() + "_" + req.files.image.name;
      req.files.image.mv("public/images/" + filename);
    }

    const sql = `
      UPDATE courses_list
      SET course_key = ?, title = ?, shortDesc = ?, duration = ?, image = ?, category = ?, status = ?, eligibility = ?, features = ?, admission_notice = ?, fees_structure = ?
      WHERE id = ?
    `;

    const values = [
      d.course_key.trim().toLowerCase(),
      d.title,
      d.shortDesc,
      d.duration,
      filename,
      d.category,
      d.status,
      d.eligibility,
      d.features,
      d.admission_notice,
      d.fees_structure,
      courseId
    ];

    await exe(sql, values);

    console.log(values)

    res.redirect("/admin/courses_list");

  } catch (err) {
    console.log(err);
    res.send("Error while updating course");
  }
});


router.get("/courses_details", (req, res) => {
  res.render("admin/courses_details.ejs");
});


// router.get("/academy_information", async function (req, res) {
//   try {
//     var sql = `
//       SELECT *
//       FROM academy_info
//       ORDER BY id DESC
//     `;

//     var rows = await exe(sql);

//     res.render("admin/academy_information.ejs", {
//       academyInfo: rows
//     });

//   } catch (err) {
//     console.error("Academy Info Fetch Error:", err);
//     res.status(500).send("Something went wrong");
//   }
// });


router.get("/gallery_image", async (req, res) => {
  let sql = `SELECT * FROM gallery_images`;
  let gallery = await exe(sql);
  res.render("admin/gallery_image.ejs", { gallery });
});

// router.post("/academy_information", async function (req, res) {
//   try {
//     var short_info = req.body.short_info;
//     var vision = req.body.vision;
//     var mission = req.body.mission;
//     var specializations = req.body.specializations;
//     var methodology = req.body.methodology;

//     var about_image = null;

// ===== IMAGE UPLOAD (NO MULTER) =====
// if (req.files && req.files.about_image) {
//   var image = req.files.about_image;

//   var ext = path.extname(image.name);
//   var fileName = Date.now() + ext;

//   var uploadPath = path.join(
//     __dirname,
//     "../public/images/",
//     fileName
//   );

//   await image.mv(uploadPath);

//   about_image = fileName;
// }

// ===== INSERT QUERY =====
//     var sql = `
//       INSERT INTO academy_info
//       (short_info, vision, mission, specializations, methodology, about_image)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     var values = [
//       short_info,
//       vision,
//       mission,
//       specializations,
//       methodology,
//       about_image
//     ];

//     await exe(sql, values);

//     res.redirect("/admin/academy_information");
//   } catch (err) {
//     console.error("Academy Info Insert Error:", err);
//     res.status(500).send("Something went wrong");
//   }
// });

// router.get("/edit_academy/:id", async function (req, res) {
//   try {
//     var sql = `
//       SELECT *
//       FROM academy_info
//       WHERE id = ?
//     `;

//     var rows = await exe(sql, [req.params.id]);

//     if (rows.length > 0) {
//       res.render("admin/edit_academy.ejs", {
//         academy: rows[0]
//       });
//     } else {
//       res.redirect("/admin/academy_information");
//     }

//   } catch (err) {
//     console.error("Academy Info Fetch Error:", err);
//     res.status(500).send("Something went wrong");
//   }
// });

// router.post("/edit_academy/:id", async function (req, res) {
//   try {
//     var id = req.params.id;
//     var d = req.body;
//     var about_image = d.old_about_image;

//     if (req.files && req.files.about_image) {
//       var image = req.files.about_image;
//       var ext = path.extname(image.name);
//       var fileName = Date.now() + ext;
//       var uploadPath = path.join(__dirname, "../public/images/", fileName);
//       await image.mv(uploadPath);
//       about_image = fileName;
//     }

//     var sql = `
//       UPDATE academy_info
//       SET short_info = ?, vision = ?, mission = ?, specializations = ?, methodology = ?, about_image = ?
//       WHERE id = ?
//     `;

//     var values = [
//       d.short_info,
//       d.vision,
//       d.mission,
//       d.specializations,
//       d.methodology,
//       about_image,
//       id
//     ];

//     await exe(sql, values);
//     res.redirect("/admin/academy_information");

//   } catch (err) {
//     console.error("Academy Info Update Error:", err);
//     res.status(500).send("Something went wrong");
//   }
// });

// router.get("/delete_academy/:id", async function (req, res) {
//   try {
//     var sql = `
//       DELETE FROM academy_info
//       WHERE id = ?
//     `;
//     await exe(sql, [req.params.id]);
//     res.redirect("/admin/academy_information");
//   } catch (err) {
//     console.error("Academy Info Delete Error:", err);
//     res.status(500).send("Something went wrong");
//   }
// });

// POST route to add gallery image
router.post("/gallery_image/add", async (req, res) => {
  let d = req.body;
  let imageName = "";
  if (req.files && req.files.image) {
    imageName = Date.now() + "_" + req.files.image.name;
    req.files.image.mv("public/images/" + imageName);
  }
  let sql = `INSERT INTO gallery_images (title, subtitle, image, status) VALUES 
             ('${d.title}', '${d.subtitle}', '${imageName}', '${d.status}')`;
  await exe(sql);
  res.redirect("/admin/gallery_image");
});


router.get("/delete_gallery_image/:id", async (req, res) => {
  let id = req.params.id;
  let sql = `DELETE FROM gallery_images WHERE id='${id}'`;
  await exe(sql);
  res.redirect("/admin/gallery_image");
});

router.get("/edit_gallery_image/:id", async (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM gallery_images WHERE id='${id}'`;
  let result = await exe(sql);
  if (result.length > 0) {
    res.render("admin/edit_gallery_image.ejs", {
      item: result[0]
    });
  } else {
    res.redirect("/admin/gallery_image");
  }
});


router.post("/edit_gallery_image/:id", async (req, res) => {
  let id = req.params.id;
  let d = req.body;
  let imageName = d.old_image;
  if (req.files && req.files.image) {
    imageName = Date.now() + "_" + req.files.image.name;
    req.files.image.mv("public/images/" + imageName);
  }
  let sql = `UPDATE gallery_images SET
                title='${d.title}',
                subtitle='${d.subtitle}',
                image='${imageName}',
                status='${d.status}'
               WHERE id='${id}'`;

  await exe(sql);
  res.redirect("/admin/gallery_image");
});

// =======================
// GET : Gallery Video List
// =======================
router.get("/gallery_video", async (req, res) => {
  try {
    let sql = "SELECT * FROM gallery_videos";
    let results = await exe(sql);

    res.render("admin/gallery_video.ejs", {
      videos: results
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading gallery videos");
  }
});


// =======================
// POST : Add New Video
// =======================
router.post("/gallery_video/add", async (req, res) => {
  try {
    let d = req.body;

    let sql = `
      INSERT INTO gallery_videos
      (title, subtitle, video_url, status)
      VALUES (?, ?, ?, ?)
    `;

    await exe(sql, [
      d.title,
      d.subtitle,
      d.video_url || "",
      d.status
    ]);

    res.redirect("/admin/gallery_video");

  } catch (err) {
    console.log(err);
    res.send("Error adding video");
  }
});


// =======================
// GET : Delete Video
// =======================
router.get("/delete_gallery_video/:id", async (req, res) => {
  try {
    let id = req.params.id;

    let sql = "DELETE FROM gallery_videos WHERE gallery_id = ?";
    await exe(sql, [id]);

    res.redirect("/admin/gallery_video");

  } catch (err) {
    console.log("Delete error:", err);
    res.send("Error while deleting video");
  }
});
// =======================
// GET : Open Edit Page
// =======================
router.get("/edit_gallery_video/:id", async (req, res) => {
  try {
    let id = req.params.id;

    let sql = "SELECT * FROM gallery_videos WHERE gallery_id = ?";
    let result = await exe(sql, [id]);

    if (result.length === 0) {
      return res.send("Video not found");
    }

    res.render("admin/edit_gallery_video.ejs", {
      video: result[0]
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading edit page");
  }
});

// =======================
// POST : Update Video
// =======================
router.post("/edit_gallery_video/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let d = req.body;

    let sql = `
      UPDATE gallery_videos SET
        title = ?,
        subtitle = ?,
        video_url = ?,
        status = ?
      WHERE gallery_id = ?
    `;

    await exe(sql, [
      d.title,
      d.subtitle,
      d.video_url,
      d.status,
      id
    ]);

    res.redirect("/admin/gallery_video");

  } catch (err) {
    console.log(err);
    res.send("Error updating video");
  }
});

router.get("/admission", async (req, res) => {
  let sql = `SELECT * FROM admissions`;
  let data = await exe(sql);
  res.render("admin/admission.ejs", { admissions: data });
});


router.post("/addmission_form", async function (req, res) {
  let d = req.body;

  let photoName = "";
  let idProofName = "";

  // FILE UPLOAD
  if (req.files) {

    if (req.files.photo) {
      photoName = Date.now() + "_" + req.files.photo.name;
      req.files.photo.mv("public/images/" + photoName);
    }

    if (req.files.id_proof) {
      idProofName = Date.now() + "_" + req.files.id_proof.name;
      req.files.id_proof.mv("public/images/" + idProofName);
    }
  }

  let sql = `
            INSERT INTO admissions
            (
                full_name, gender, date_of_birth, mobile_number, email, address,
                qualification, college_name, passing_year,
                course_name, mode_of_class,
                parent_name, parent_contact,
                photo, id_proof
            )
            VALUES
            (
                '${d.full_name}', '${d.gender}', '${d.date_of_birth}',
                '${d.mobile_number}', '${d.email}', '${d.address}',
                '${d.qualification}', '${d.college_name}', '${d.passing_year}',
                '${d.course_name}', '${d.mode_of_class}',
                '${d.parent_name}', '${d.parent_contact}',
                '${photoName}', '${idProofName}'
            )
        `;

  await exe(sql);

  res.redirect("/admission");
});


// Delete Admission
router.get("/admission/delete/:id", async (req, res) => {
  var id = req.params.id;
  var sql = `DELETE  FROM admissions WHERE admission_id = '${id}'`;
  var data = await exe(sql);
  res.redirect("/admin/admission")
});


router.post("/admission/approve/:id", async (req, res) => {
  await exe(`UPDATE admissions SET status='Approved' WHERE admission_id='${req.params.id}'`);
  res.json({ success: true });
});

router.post("/admission/reject/:id", async (req, res) => {
  await exe(`UPDATE admissions SET status='Rejected' WHERE admission_id='${req.params.id}'`);
  res.json({ success: true });
});


// Academy Information Start
router.get("/academy_information", async (req, res) => {
  try {
    const rows = await exe(
      "SELECT * FROM academy_info ORDER BY id DESC LIMIT 1"
    );

    // console.log("ACADEMY DATA:", rows); //

    res.render("admin/academy_information.ejs", {
      academy: rows[0] || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});


router.post("/academy_information_update", async (req, res) => {
  try {
    const { id, old_about_image, ...data } = req.body;

    let fields = [];
    let values = [];

    // ===== IMAGE UPLOAD (OPTIONAL) =====
    if (req.files && req.files.about_image) {
      const image = req.files.about_image;
      const ext = path.extname(image.name);
      const fileName = Date.now() + ext;

      const uploadPath = path.join(
        __dirname,
        "../public/images/",
        fileName
      );

      await image.mv(uploadPath);
      data.about_image = fileName;
    } else {
      data.about_image = old_about_image;
    }

    // ===== DYNAMIC FIELD BUILD =====
    for (let key in data) {
      if (
        data[key] !== "" &&
        data[key] !== null &&
        data[key] !== undefined
      ) {
        fields.push(`${key}=?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return res.redirect("/admin/academy_information");
    }

    values.push(id);

    const sql = `
      UPDATE academy_info
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await exe(sql, values);

    res.redirect("/admin/academy_information");

  } catch (err) {
    console.error("Academy Info Update Error:", err);
    res.status(500).send("Something went wrong");
  }
});

// academy information end


// Founder Information Start  
router.get("/founder_information", async (req, res) => {
  try {
    const rows = await exe(
      "SELECT * FROM founder_info ORDER BY id DESC LIMIT 1"
    );

    // console.log("FOUNDER DATA:", rows); // debug

    res.render("admin/founder_information.ejs", {
      founder: rows[0] || null
    });

  } catch (err) {
    console.error("Founder Info Fetch Error:", err);
    res.status(500).send("Something went wrong");
  }
});
router.post("/founder_information_update", async (req, res) => {
  try {
    const { id, old_founder_image, ...data } = req.body;

    let fields = [];
    let values = [];

    // ===== IMAGE UPLOAD (OPTIONAL) =====
    if (req.files && req.files.founder_image) {
      const image = req.files.founder_image;
      const ext = path.extname(image.name);
      const fileName = Date.now() + ext;

      const uploadPath = path.join(
        __dirname,
        "../public/images/",
        fileName
      );

      await image.mv(uploadPath);
      data.founder_image = fileName;

      // 🔹 old image delete
      if (old_founder_image) {
        const oldPath = path.join(
          __dirname,
          "../public/images/",
          old_founder_image
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    } else {
      data.founder_image = old_founder_image;
    }

    // ===== DYNAMIC FIELD BUILD =====
    for (let key in data) {
      if (
        data[key] !== "" &&
        data[key] !== null &&
        data[key] !== undefined
      ) {
        fields.push(`${key}=?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return res.redirect("/admin/founder_information");
    }

    values.push(id);

    const sql = `
      UPDATE founder_info
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await exe(sql, values);

    res.redirect("/admin/founder_information");

  } catch (err) {
    console.error("Founder Info Update Error:", err);
    res.status(500).send("Something went wrong");
  }
});

// founder information end

module.exports = router;
