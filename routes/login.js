const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
let Student = require('../models/student');

const app=express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

router.get('/',function(req,res){
    res.render('login');
});

// Login Process
router.post('/', passport.authenticate('local', {
      successRedirect:'/issue',
      failureRedirect:'/login',
      failureFlash: true
    })
);
  
  // logout
  router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/');
  });

module.exports = router;