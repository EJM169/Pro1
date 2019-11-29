var express             = require("express"),
    router              = express.Router({mergeParams:true}),
    doctorUser          = require("../models/Doctor"),
    flash               = require("connect-flash"),
    passport            = require("passport")
    middleware          = require("../middleware");

router.get("/doctor/signup",function(req,res){
    res.render("./Doctor/Signup");
});

router.get("/test",function(req,res){
    res.render("./Doctor/Dash2");
});


router.post("/doctor/signup",passport.authenticate('signup', {
    successRedirect: "/doctor/dashboard",
    failureRedirect:"/doctor/signup",
    failureFlash : true 
  }));
  
  
  router.get("/doctor/login",function(req,res){
    res.render("./Doctor/Login",{username:null});
});
router.post("/doctor/login",passport.authenticate("login", 
    {successRedirect:"/doctor/dashboard", 
    failureRedirect:'/doctor/login',
    failureFlash: true}),
     function(req,res){
});
router.get("/doctor/dashboard",middleware.isLoggedIn,function(req,res){
    doctorUser.findById(req.params.id,function(err,doctor){
        if(err){
            console.log(err);
            req.flash('error','Error whil loading dashboard');
            res.redirect("/doctor/login");
        } else {
            console.log("DASHBOARD");
            res.render("./Doctor/Dash2",{currentUser:req.user});
        }

    });
});
router.get("/doctor/:id/profile",middleware.isLoggedIn,function(req,res){
    doctorUser.findById(req.params.id,function(err,doctor){
        if(err){
            console.log(err);
            req.flash('error','Error whil loading profile');
            res.redirect("/doctor/dashboard");
        } else {
            console.log("Profile");
            res.render("./Doctor/Profile",{currentUser:req.user});
        }

    });
})

router.get("/doctor/:id/edit",middleware.isLoggedIn,function(req,res){
    doctorUser.findById(req.params.id,function(err,doctor){
        if(err){
            console.log(err);
            req.flash('error','Error');
            res.redirect("/doctor/"+req.params.id+"/profile");
        }
        else{
            console.log("Edit page");
            res.render("./Doctor/editDoctor",{currentUser:req.user});
        }
    })
});

router.put("/doctor/:id/profile", middleware.isLoggedIn,function(req,res){
  
        doctorUser.findByIdAndUpdate(req.params.id,req.body.newDoctor,function(err,updatedDoctor){
            if(err){
                console.log(err);
                req.flash('error','Error while updating profile');
                res.redirect("/doctor/"+req.params.id+"/edit");
            }
            else{
                req.flash('success','Updated successfully');
                res.redirect("/doctor/"+req.params.id+"/profile");
            }
        });
        
    
});

router.delete("/doctor/:id",middleware.isLoggedIn,function(req,res){
    doctorUser.findByIdAndDelete(req.params.id,function(err){
        if(err){
            req.flash('error','Error while deleting');
            res.redirect("/doctor/"+req.params.id+"/profile");
        }
        else{
            req.flash('success','Account deleted succeessfully GoodBye');
            res.redirect("/");
        }
    })
});

router.get("/doctor/logout",function(req,res){
    req.logout();
    req.flash('success','Bye..');
    // req.session.destroy();
    res.redirect("/");
});

module.exports = router;