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
    res.render('register');
});


//match info and register student
router.post('/add',function(req,res){
  const name = req.body.name;
  const enroll= req.body.enroll;
  const libcard= req.body.libcard;
  const branch= req.body.branch;
  const sem= req.body.sem;
  const mobile= req.body.mobile;
  const email= req.body.email;
  const password= req.body.password;   
  const cpwd= req.body.cpwd;
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('enroll', 'Enrollment is required').notEmpty();
  req.checkBody('libcard', 'Library card number is required').notEmpty();
  req.checkBody('branch', 'Branch is required').notEmpty();
  req.checkBody('sem', 'Semester is required').notEmpty();
  req.checkBody('mobile', 'Phone number is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('cpwd', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    
    let student = {};
      student.name = name;
      student.enroll= enroll;
      student.libcard= libcard;
      student.branch=branch;
      student.sem= sem;
      student.mobile= mobile;
      student.email= email;
      student.password= password;

    bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(student.password, salt, function(err, hash){
      if(err){
        console.log(err);
      }
      student.password = hash;
      let query = {enroll:enroll,libcard:libcard}
    
    Student.updateOne(query, student, function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'Registered Successfully !!');
        res.redirect('/login');
      }
    });
    });
    }); 
    
}
});



module.exports = router;
