var express             = require("express"),
    router              = express.Router(),
    doctorUser          = require("../models/Doctor"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    flash               = require("connect-flash"),
    bCrypt              = require('bcrypt')    ;

    //passport configuration

    
// passport login logic
var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
  }

passport.use("login",new LocalStrategy(
    {    
        passReqToCallback : true
    }, function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    doctorUser.findOne({$or:[{ 'username' :  username},{'userid':username }]}, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('error', 'User Not found.')
                );                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('error', 'Invalid Password')
              );
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        req.flash('success','Welcome '+user.username);
        return done(null, user);
      }
    );}));

//Passport sign up logic

passport.use("signup", new LocalStrategy({
    usernameField:'userid',
    passReqToCallback : true
  },
  function(req, userid,password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      doctorUser.findOne({'userid':userid},function(err, user) {
         
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          req.flash('error','Error while signup');
          return done(err);
        }
        // already exists
        if (user) {
            console.log('User already exists');
            return done(null, false, 
                 req.flash('error','User Already Exists')
                );
        }
        
        else {
          // if there is no user with that email
          // create the user
          var newUser = new doctorUser();
          // set the user's local credentials
          newUser.username  =    req.param('username');
          newUser.password  =    createHash(password);
          newUser.email     =       req.param('email');
          newUser.userid    =      userid;
          newUser.mobile    =     req.param('mobile');

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              req.flash('error','Error in creating a user');
              throw err;  
            }
            console.log('User Registration succesful');    
            req.flash('success','Registration Successful Welcome')
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
   }




//The index or the default path
router.get("/",function(req,res){
    res.render("index");
});

//The logout path logic
router.get("/doctor/logout",function(req,res){
    req.logout();
    req.flash('success','Bye..');
    // req.session.destroy();
    res.redirect("/");
});

module.exports = router;    //Exporting the index route to be used elsewhere
