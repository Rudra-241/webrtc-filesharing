const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("ws");
const path = require('path');
const app = express();
const server = http.createServer(app);
const wss = new Server({ server });
const PORT = 3000;
const JWT_SECRET = "FileTransfer123@CN";

mongoose.connect("mongodb://localhost:27017/authDB", {
}).then(() => console.log("Connected to MongoDB")).catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

app.get("/register", (req, res) => res.render("register"));

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    try {
        await user.save();
        res.redirect("/login");
    } catch (error) {
        res.status(500).send("Error registering user");
    }
});

app.get("/",(req,res) => res.sendFile(path.join(__dirname, '../frontend/landing.html')));

app.get("/login", (req, res) => res.render("login"));

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    
    res.cookie("token", token,);
    res.redirect("/dashboard")
});

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.redirect("/login");
    }
}

app.get("/dashboard", authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/login");
});


server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
