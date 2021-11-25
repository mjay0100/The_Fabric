const express = require("express")
const router = express.Router()
const passport = require("passport")
const User = require("../models/user")
const Fabric = require("../models/fabric")
const async  = require("async")
const nodemailer  = require("nodemailer")
const crypto  = require("crypto")

//Main Route
router.get("/", (req, res) =>{
    res.render("home");
 });
 
  // show register form
router.get("/register", (req, res) => {
    res.render("register", {page: 'register'}); 
 });
 
 //*handle sign up logic
router.post("/register",async function(req, res){
    const newUser = new User({
        username: req.body.username,
        fullName: req.body.fullName,
        email: req.body.email,
        number: req.body.number,
        adminCode: req.body.adminCode,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
      });

    if(req.body.adminCode === process.env.CODE) {
      newUser.isAdmin = true;
    }
    await User.register(newUser, req.body.password)
        try{
            await passport.authenticate("local")
             req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
             res.redirect("/fabrics"); 
        } catch (err) {
            console.log(err);
            req.flash("error", "Please fill the form and try again.");
            return res.render("register", {error: err.message});
        }
});
 //show login form
 router.get("/login", function(req, res){
    res.render("login", {page: 'login'}); 
 });
 
 router.post("/login", passport.authenticate("local",
  {
      successRedirect : "/fabrics",
      failureRedirect : "/login"
     }), (req, res)=>{
});
 
 //logout
 router.get("/logout", (req, res)=>{
     req.logout();
     req.flash("success", "Logged you out!")
     res.redirect("/fabrics")
 })

 // USER PROFILE
router.get("/users/:id", async function(req, res) {
  try{
    foundUser = await User.findById(req.params.id)
    fabrics = await Fabric.find().where('author.id').equals(foundUser._id).exec()
    res.render("users/show", {user: foundUser, fabrics: fabrics});
  } catch (err) {
    req.flash("error", "Something went wrong.");
    return res.redirect("/");
  }
});

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});
 
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'mustaphajay3@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'mustaphajay3@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'mustaphajay3@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'mustaphajay3@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/fabrics');
  });
});




 module.exports = router

 