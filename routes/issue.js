const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Books = require('../models/books');
const Issue = require('../models/issued_books');
const async = require('async');

router.get('/',ensureAuthenticated,function(req,res){
    res.render('stud_home');
});

router.get('/request',ensureAuthenticated,function(req,res){
    res.render('request_book');
});

router.post('/request',ensureAuthenticated,function(req,res){
    var key = new RegExp(req.body.search_key,'i');
    Books.find({bookname:key,status:'available'},function(err,foundbook) {
        res.render('request_book',{found : foundbook});
    });
});

//student requests a book
router.post('/:id',ensureAuthenticated,function(req,res){
    let bookid = req.params.id;
    Issue.count({libcard:req.user.libcard},function(err,c){
        let lib = req.user.libcard;
        if(c<3){
            initial(bookid,lib);
            let entry = new Issue({
                libcard : lib,
                book_ref : bookid,
                req_date : new Date(),
                issue_date : null,
                return_date : null,
                fine : 0 
            });
            entry.save(function(err){
                if(err){
                    console.log(err);
                }else{
                    req.flash('success','successfully requested');
                    res.redirect('/issue');
                }
            });

        }
        else{
            req.flash('danger','You cannot request more than 3 books');
            res.redirect('/issue');
        }
    });
});

async function initial(bookid,lib){
    await Books.update({reference_id:bookid},{$set:{status:"requested"}});

}

//show issued books by 
router.get('/issuedbook',ensureAuthenticated,function(req,res){
    
    Issue.find({libcard:req.user.libcard},function(err,issues){
        if(err){
           console.log(err);
        }else{
            initial2(issues);
        }
    });
    async function initial2(issues){
        let founds =[];
        for(var issue of issues){
            const found ={};
            found.bookref = issue.book_ref;
            found.req_date = issue.req_date;
            found.issue_date = issue.issue_date;
            found.return_date = issue.return_date;
            found.fine = issue.fine;
           
            let result= await Books.find({reference_id:issue.book_ref},function(error,book){
                if(error){
                    console.log(err);
                }else{
                    return book;
                } 
            });
            found.bookname = result[0].bookname;
            founds.push(found);
        } 
       res.render('show_issued',{founds: founds});  
    }
    
});


router.get('/delete/:id',function(req,res){
    let query = req.params.id;
    async function initial1(query){
        await Books.updateOne({reference_id:query},{$set:{status:"available"}});
        Issue.find({book_ref:query},function(err,result){
            if(result[0].issue_date == null){
                let date1 = Date.parse(result[0].req_date);
                let date2 = new Date();
                date2 = Date.parse(date2);
                let timediff = date2 - date1;
                let days = Math.round(timediff/(1000*3600*24));
                init(days,query);
            }else{
                req.flash('danger','Cannot delete request after book is issued');
                res.redirect('/issue');
            }
        });
    }
    initial1(query);
    async function init(days,query){
            if(days<=2){
                await Issue.remove({book_ref:query},function(err){
                    if(err){
                        console.log(err);
                    }else{
                        req.flash('success','Your request has been deleted');
                        res.redirect('/issue');
                    }
                    
                });
            }
            else{
                req.flash('danger','Cannot delete request. Your request is already deleted');
                res.redirect('/issue');
            }
    }
});


// Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
      return next();
    } else {
      req.flash('danger', 'Please login first ');
      res.redirect('/login');
    }
  }
  

module.exports = router;