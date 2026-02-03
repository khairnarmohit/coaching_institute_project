const express = require("express");
const router = express.Router();
const exe = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const banner = await exe(
      "SELECT * FROM home_banner ORDER BY id DESC LIMIT 1"
    );

    const courses = await exe(
      "SELECT * FROM featured_courses"
    );

    const achievements = await exe(
      "SELECT * FROM achievements WHERE status = 1"
    );

    const batches = await exe(
      "SELECT * FROM home_upcoming_batches WHERE status = 1"
    );

    const testimonials = await exe(
      "SELECT * FROM testimonials"
    );

    res.render("user/home", {
      banner: banner[0] || null,
      courses,
      achievements,
      batches,
      testimonials
    });

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});




router.get("/about", (req, res) => {
  res.render("user/about.ejs");
});

router.get('/contact', async (req, res) => {
    try {
        const result = await exe(
            "SELECT * FROM contact_details WHERE id = 1"
        );

        res.render('user/contact', {
            contact: result[0]
        });

    } catch (err) {
        console.error(err);
        res.send('Database Error');
    }
});




router.get("/admission", function (req, res) {
  res.render("user/admission.ejs")
});

router.get("/syllabus", (req, res) => {
  res.render("user/syllabus.ejs")
})

router.get("/gallery", (req, res) => {
  res.render("user/gallery.ejs")
})

const facultyList = [
  // FOUNDER & LEADERSHIP
  {
    name: "Mr. Ramesh Patil",
    designation: "Founder & Chairman | Ex-IRS Officer",
    dept_badge: "Founder",
    image_url: "/images/Mr. Ramesh Patil.jpeg",
    linkedin_url: "#",
    experience: "Ex-IRS Officer",
    qualification: "M.A. Pol. Sci., NET",
    expertise: "Polity, Ethics & Essay",
    description: "Highly experienced mentor specializing in civil services ethics and political science."
  },
  {
    name: "Dr. Sunita Deshmukh",
    designation: "Academic Director",
    dept_badge: "Academic Head",
    image_url: "/images/Dr. Sunita Deshmukh.png",
    linkedin_url: "#",
    experience: "Senior Academician",
    qualification: "Ph.D. History (JNU)",
    expertise: "History, Art & Culture",
    description: "Expert in historical research and art & culture for competitive exams."
  },
  // GENERAL STUDIES
  {
    name: "Prof. Amit Kulkarni",
    designation: "Senior Faculty – Polity & Governance",
    dept_badge: "Polity & Governance",
    image_url: "/images/Prof. Amit Kulkarni.jpg",
    experience: "10+ Years",
    qualification: "LL.M., NET Qualified",
    expertise: "Polity & Governance",
    description: "Specialist in Indian Constitution and Administrative law."
  },
  {
    name: "Dr. Priya Sharma",
    designation: "Faculty – Geography & Environment",
    dept_badge: "Geography & Environment",
    image_url: "/images/Dr. Priya Sharma.jpg",
    experience: "8+ Years",
    qualification: "Ph.D. Geography, SET",
    expertise: "Geography & Environment",
    description: "Expert in environmental science and physical geography."
  },
  {
    name: "Prof. Rajesh Verma",
    designation: "Faculty – Indian Economy",
    dept_badge: "Economics",
    image_url: "/images/Prof. Rajesh Verma.jpeg",
    experience: "9+ Years",
    qualification: "M.A. Eco (DSE), UGC-NET",
    expertise: "Indian Economy",
    description: "Master of economic analysis and current fiscal trends."
  },
  // OPTIONAL SUBJECTS
  {
    name: "Dr. Anil Kumar",
    designation: "Faculty – Public Administration",
    dept_badge: "Optional Subject",
    image_url: "/images/Dr. Anil Kumar.png",
    experience: "12+ Years",
    qualification: "Ph.D. Pub. Admin",
    expertise: "Public Administration",
    description: "Dedicated coach for Public Administration optional papers."
  },
  {
    name: "Prof. Meena Singh",
    designation: "Faculty – Sociology",
    dept_badge: "Optional Subject",
    image_url: "/images/Prof. Meena Singh.jpg",
    experience: "8+ Years",
    qualification: "M.A. Sociology, NET, JRF",
    expertise: "Sociology",
    description: "Expert in sociological theories and social issues in India."
  },
  {
    name: "Prof. Arvind Joshi",
    designation: "Faculty – Political Science",
    dept_badge: "Optional Subject",
    image_url: "/images/Prof. Arvind Joshi.jpg",
    experience: "10+ Years",
    qualification: "M.Phil. Pol. Sci.",
    expertise: "Political Science",
    description: "Specializing in political theory and international relations."
  },
  // APTITUDE & CSAT
  {
    name: "Prof. Rahul Sharma",
    designation: "Faculty – Quantitative Aptitude",
    dept_badge: "Quantitative Aptitude",
    image_url: "/images/Prof. Rahul Sharma.jpeg",
    experience: "11+ Years",
    qualification: "M.Sc. Math (IITD)",
    expertise: "Mathematics",
    description: "Master of shortcut methods and quantitative reasoning."
  },
  {
    name: "Prof. Neha Gupta",
    designation: "Faculty – Reasoning & CSAT",
    dept_badge: "Reasoning & CSAT",
    image_url: "/images/Prof. Neha Gupta.jpg",
    experience: "7+ Years",
    qualification: "M.Sc. Psychology, MBA",
    expertise: "Reasoning & CSAT",
    description: "Expert in logical reasoning and psychological aptitude for CSAT."
  }
];

router.get("/faculty", async (req, res) => {
  res.render("user/faculty.ejs", { facultyList: facultyList })
})

router.get("/batches", (req, res) => {
  res.render("user/batch.ejs")
})

const coursesData = {
  upsc: {
    title: "UPSC (Union Public Service Commission)",
    shortDesc: "IAS / IPS / IFS Preparation",
    fullDesc: "Complete guidance for Civil Services Examination including Prelims, Mains, and Interview preparation. Our expert faculty provides personalized mentorship and comprehensive study materials.",
    duration: "12–18 Months",
    eligibility: "Any Graduate",
    fees: "₹80,000 – ₹1,20,000",
    features: ["GS Pre + Mains", "Optional Subject Guidance", "CSAT Specialized Training", "Weekly Answer Writing", "Mock Interviews by Experts"],
    image: "https://images.unsplash.com/photo-1544654803-b69140b285a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  mpsc: {
    title: "MPSC (Maharashtra Public Service Commission)",
    shortDesc: "State Services & Subordinate Exams",
    fullDesc: "Specialized coaching for Maharashtra State Services. We cover the entire syllabus with special focus on Maharashtra geography, history, and administration.",
    duration: "10–12 Months",
    eligibility: "Any Graduate",
    fees: "₹35,000 – ₹65,000",
    features: ["Integrated Batch (Pre+Mains)", "Marathi & English Language focus", "Maharashtra Static GK", "Weekly Test Series", "Current Affairs (State focused)"],
    image: "https://www.ndaclasses.in/images/mpsc.jpeg"
  },
  banking: {
    title: "Banking Exams",
    shortDesc: "IBPS / SBI / RRB PO & Clerk",
    fullDesc: "Bank recruitment preparation focusing on speed and accuracy. Specialized faculty for Quantitative Aptitude, Reasoning, and English.",
    duration: "4–8 Months",
    eligibility: "Graduate",
    fees: "₹20,000 – ₹30,000",
    features: ["Maths Shortcut Tricks", "Reasoning Depth Analysis", "English Grammar & Vocab", "Computer Awareness", "Speed Test Series"],
    image: "https://bankedge.in/wp-content/uploads/2024/07/CBO_Web-Banner_v01.jpg"
  },
  police: {
    title: "Police Bharti",
    shortDesc: "Maharashtra Police Recruitment",
    fullDesc: "Dedicated preparation for Police Constable and Sub-Inspector posts. We provide both written and physical training guidance.",
    duration: "2–5 Months",
    eligibility: "10th / 12th Pass",
    fees: "₹10,000 – ₹15,000",
    features: ["Written Exam Practice", "Physical Ground Guidance", "Basic Maths & GK", "Marathi Grammar", "Previous Year Paper Solving"],
    image: "https://www.cgi.guru/wp-content/uploads/2022/01/police-online-test-_-thumb-1-scaled.jpg"
  },
  talathi: {
    title: "Talathi Exam",
    shortDesc: "Revenue Department Recruitment",
    fullDesc: "Preparation for Talathi and other Group-C government posts. Focus on Marathi, English, GK, and Intelligence tests.",
    duration: "3–6 Months",
    eligibility: "Graduate",
    fees: "₹15,000 – ₹20,000",
    features: ["4-Pillar Subject Focus", "Topic-wise Test Series", "Previous Year Analysis", "Short Duration Intensive Batch", "Focus on Accuracy"],
    image: "https://assets.pratahkal.com/h-upload/2025/11/19/2093985-how-to-apply-for-the-talathi-recruitment-2025.webp"
  },
  railway: {
    title: "Railway Exams",
    shortDesc: "RRB NTPC / ALP / Group-D",
    fullDesc: "Comprehensive coaching for various Railway recruitment board examinations. Focus on General Science and Technical Aptitude.",
    duration: "3–6 Months",
    eligibility: "10th / 12th / ITI / Graduate",
    fees: "₹18,000 – ₹28,000",
    features: ["General Science Specialization", "Technical Subject Guidance", "Reasoning & Aptitude", "CBT Pattern Tests", "Online Test Skills"],
    image: "https://blog.bihartouch.in/wp-content/uploads/2025/10/bihartouchNTPC.png"
  },
  ssc: {
    title: "SSC (Staff Selection Commission)",
    shortDesc: "CGL / CHSL / MTS / GD",
    fullDesc: "Complete preparation for Central Government jobs. We provide specialized training for SSC CGL, CHSL, and other competitive exams with focus on speed and accuracy.",
    duration: "6–10 Months",
    eligibility: "10th / 12th / Graduate",
    fees: "₹25,000 – ₹45,000",
    features: ["Quantitative Aptitude Special", "English Language Mastery", "General Intelligence & Reasoning", "General Awareness Workshops", "Tier-1 & Tier-2 Mock Tests"],
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }
};

router.get("/courses", (req, res) => {
  res.render("user/courses.ejs", { courses: coursesData })
})

router.get("/course-details", (req, res) => {
  const type = req.query.type;
  if (!type || !coursesData[type]) {
    return res.redirect("/courses");
  }
  const course = coursesData[type];
  res.render("user/course-details.ejs", { course: course })
})

router.get("/academy_info", (req, res) => {
  res.render("user/academy_info.ejs")
})

router.get("/founder_info", (req, res) => {
  res.render("user/founder_info.ejs")
})

module.exports = router;
