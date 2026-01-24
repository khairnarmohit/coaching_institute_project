const express = require("express");
const app = express();



app.set("view engine", "ejs");
app.use(express.static('public/'));
const userRoutes = require("./routes/user");

// app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.listen(1000, () => {
  console.log("Server running on port 1000");
});
