const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/student');
const bcrypt = require('bcryptjs');


module.exports = function(passport){
  // Local Strategy
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
    function(username, password, done) {
      User.findOne({ libcard: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
       // Match Password
      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err) { return done(err); }
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
      });
    }));
};

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(err, user) {
      done(err, user);
    });
  });

