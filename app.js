require("dotenv").config({ path: "./src/.env" });
const methodOverride = require("method-override"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  express = require("express"),
  Fabric = require("./src/models/fabric"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  User = require("./src/models/user"),
  flash = require("connect-flash"),
  Comment = require("./src/models/comment"),
  seedDB = require("./src/seeds");

const commentRoutes = require("./src/routes/comments");
const fabricRoutes = require("./src/routes/fabric");
const indexRoutes = require("./src/routes/index");

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.log("ERROR", err.message);
  });

// seedDB();
const app = express();
app.locals.moment = require("moment");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());

//passport configuration
app.use(
  require("express-session")({
    secret: "I am the best",
    resave: false,
    saveUninitialized: false,
  })
);

//method override
app.use(methodOverride("_method"));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(commentRoutes);
app.use(fabricRoutes);
app.use(indexRoutes);

app.listen(4000, function () {
  console.log("Server started");
});
