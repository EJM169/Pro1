var express             = require("express"),
    app                 = express(),
    bCrypt              = require('bcrypt'),
    bodyParser          = require("body-parser"),
    flash               = require("connect-flash"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    doctorUser              = require("./models/Doctor");
    
    
    mongoose.connect("mongodb://localhost:27017/InstaDoc");
    
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
//passport configuration
app.use(require("express-session")({
    secret:"This is a secret so Shush",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(doctorUser.serializeUser());
passport.deserializeUser(doctorUser.deserializeUser());
app.use(flash()); 
app.use(function(req,res,next){
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash("error");
    res.locals.success      = req.flash("success");
    next();
});
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
              throw err;  
            }
            console.log('User Registration succesful');    
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


   var uname,mobile; 



app.get("/",function(req,res){
    res.render("index");
});

app.post("/user",function(req,res){
    uname=req.body.name;
    mobile=req.body.mobile;
    res.redirect("/user/profile");
});
app.get("/user/profile",isUserLogged, function(req,res){
    console.log("user page");
    res.render("user");
});

app.get("/:id",isUserLogged,function(req,res){

    doctorUser.findOne({userid:req.params.id},function(err,doctor){
        if(err){
            console.log(err);
        }
        else{
            console.log("waiting room");
            res.render("wait",{doctordetail:doctor});
        }
    })
});

app.get("/doctor/signup",function(req,res){
    res.render("doctor-signup");
});
app.post("/doctor/signup",passport.authenticate('signup', {
    successRedirect: "/doctor/dash",
    failureRedirect:"/doctor/signup",
    failureFlash : true 
  }));
  
  
  app.get("/doctor/login",function(req,res){
    res.render("doctor-login",{username:null});
});
app.post("/doctor/login",passport.authenticate("login", 
    {successRedirect:"/doctor/dash", 
    failureRedirect:'/doctor/login',
    failureFlash: true}),
     function(req,res){
});
app.get("/doctor/dash",isLoggedIn,function(req,res){
    doctorUser.findById(req.params.id,function(err,doctor){
        if(err){
            console.log(err);
        } else {
            console.log("DASHBOARD");
            res.render("doctor-dash",{currentUser:req.user});
        }

    });
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Doctor Please Login First")
    res.redirect("/doctor/login");
}

function isUserLogged(req,res,next){
    if(uname!=null && mobile!=null){
        console.log("user middleware");
        return next();
    }
    else{
        req.flash("error","Please Create a user acount first")
        res.redirect("/");
    }
}

app.get("/doctor/logout",function(req,res){
    req.logout();
    req.flash('success','Bye..');
    // req.session.destroy();
    res.redirect("/");
});
app.listen(3000,function(){
    console.log("It's on 3000");
});


