const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const session = require('express-session');
const messages = require('express-messages');
const passport = require('passport');

const app = express();

//connect to database
mongoose.connect("mongodb://localhost:27017/library_info");
let db= mongoose.connection;

// Check connection
db.once('open', function(){
    console.log('Connected to MongoDB');
  });
  
  // Check for DB errors
  db.on('error', function(err){
    console.log(err);
  });

//pug template
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//make public folder static
app.use(express.static(path.join(__dirname,'public')));


// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//configure passport
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

const Issue = require('./models/issued_books');
const Books = require('./models/books');
const async = require('async');
//cancel request automatically 

async function initial1(){
  Issue.find({},function(err,results){
    for(result of results){
      if(result.issue_date == null){
        let query = result.book_ref;
        let date1 = Date.parse(result.req_date);
        let date2 = new Date();
        date2 = Date.parse(date2);
        let timediff = date2 - date1;
        let days = Math.round(timediff/(1000*3600*24));
        if(days>2){
            init(query);
        }
      }
    }
  });
}

initial1();

async function init(query){
 await Books.update({reference_id:query},{$set:{status:"available"}});
 Issue.remove({book_ref:query},function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Request successfully deleted");
  }
});
}


//index Route
app.get('/',function(req,res){
  res.render('index');
});


//Route files
let register = require('./routes/register');
let login_pg = require('./routes/login');
let issue_book = require('./routes/issue');
let admin = require('./routes/adminpage');
app.use('/register',register);
app.use('/login',login_pg);
app.use('/issue',issue_book);
app.use('/adminpage',admin);

// Start Server
app.listen(3000, function(){
    console.log('Server started on port 3000...');
});

