const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const async = require('async');
const Books = require('../models/books');
let Student = require('../models/student');
let Issue = require('../models/issued_books')


router.get('/',ensureAuthenticated,function(req,res){
    res.render('adminpage');
});

router.get('/login',function(req,res){
    res.render('adminlogin');
});

//admin Login Process
router.post('/login', passport.authenticate('local', {
  successRedirect:'/adminpage',
  failureRedirect:'/adminpage/login',
  failureFlash: true
})
);

router.get('/addstud',ensureAuthenticated,function(req,res){
    res.render('new_stud');
});

//make entry of student by admin
router.post('/addstud',ensureAuthenticated,function(req,res){
    let student = new Student({enroll:req.body.enroll_id, libcard:req.body.lib_id});
    student.save(function(err){
      if(err){
        console.log(err);
      }else{
        req.flash('success',"Student added ");
        res.redirect('/adminpage/addstud');
      }
    });
});

router.get('/addBook',ensureAuthenticated,function(req,res){
    res.render('add_book');
});

  //add new book
router.post('/addBook',ensureAuthenticated,function(req,res){
    let newBook = new Books({
        reference_id:req.body.ref_id,
        bookname : req.body.name,
        slot : req.body.slot,
        status : "available"
    });
    newBook.save(function(err){
        if(err){
            console.log(err);
        }else{
            req.flash('success',"Book added ");
            res.redirect('/adminpage/addBook');
        }
    });
});

router.get('/issuebook',ensureAuthenticated,function(req,res){
  res.render('issue_book');
});

router.post('/issue',ensureAuthenticated,function(req,res){
  Issue.find({book_ref:req.body.isbn},function(err,result){
    if(result[0].issue_date == null){
      result[0].issue_date = new Date();
      res.render('issue_book',{requested : result[0]});
    }
    else{
      req.flash('danger','already issued');
      res.redirect('/adminpage/issuebook')
    }
  });
});

router.post('/issueSave',ensureAuthenticated,function(req,res){
  let isbn = req.body.isbn;
  let issue_date = req.body.issue_date;
  async function initial1(isbn,issue_date){
    await Books.updateOne({reference_id : isbn},{$set:{status:"issued"}});
    Issue.updateOne({book_ref:isbn},{$set:{issue_date:issue_date}},function(err){
    if(err){
      console.log(err);
    }else{
      req.flash('success','Book Issued');
      res.redirect('/adminpage/issuebook');
    }
  });
  }
  
  initial1(isbn,issue_date);
});

router.get('/returned',ensureAuthenticated,function(req,res){
  res.render('return_book');
});


router.post('/takeBook',function(req,res){
 
  let fine_rate = 1;
  Issue.find({book_ref:req.body.isbn},function(err,res2){
    let result = res2[0];
    if(result.return_date == null){
      result.return_date = new Date();
      let date1 = Date.parse(result.req_date); //returns miliseconds
      let date2 = Date.parse(result.return_date);
      let timediff = date2 - date1;
      let days = Math.round(timediff/(1000*3600*24));
      days = days - 30;
      if(days>0){
        
        result.fine = days*fine_rate;
      }
      else{
        result.fine = 0;
      }
      res.render('return_book',{returned : result});
    }else{
      req.flash('danger','Already Returned');
      res.redirect('/adminpage/returned');
    }
    
  });
});

router.post('/returnedSave',function(req,res){
  let isbn = req.body.isbn;
  let return_date = req.body.return_date;
  async function initial2(isbn,return_date){
    await Books.updateOne({reference_id : isbn},{$set:{status:"available"}});
    Issue.updateOne({book_ref:isbn},{$set:{return_date:return_date}},function(err){
    if(err){
      console.log(err);
    }else{
      req.flash('success','Book Returned');
      res.redirect('/adminpage/returned');
    }
  });
  }
  
  initial2(isbn,return_date);
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login first ');
    res.redirect('/adminpage/login');
  }
}

module.exports = router;