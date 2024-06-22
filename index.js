import express from "express";
import bodyParser from "body-parser";
import Cred from "./models/cred.js";
import bcrypt from "bcrypt";
import session from "express-session"; 
import passport from "passport";
import { Strategy } from "passport-local";
import env from 'dotenv'

const app = express();
const port = 3000;
env.config();


const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 + 24,
    },
  })
);

app.use(passport.initialize()); 
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/logout", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secretes", (req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    res.render("secrets.ejs");
  } else {
    res.redirect("/login"); 
  }
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.log("Error while generating hash!");
      } else {
        const cred = new Cred({
          username: username,
          password: hash,
        });
        // console.log(cred);
        const savedProduct = await cred.save();
        console.log("Product saved successfully:");

          req.login(cred, (err) => {
          console.log(err);
          res.redirect("/secretes");
        });
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      console.error("Email already exists");
      res.status(400).send("Email already exists");
    } else {
      console.error(err);
      res.status(500).send("Error registering user");
    }
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secretes",
    failureRedirect: "/login",
  })
);

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const user = await Cred.findOne({ username: username });
      if (user != null) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return cb(err);
          } else {
            if (result) {
              return cb(null, user); 
            } else {
              return cb(null, false); 
            }
          }
        });
      } else {
        return cb("No Such User Found!");
      }
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});


passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


