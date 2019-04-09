var express=require("express");
var app= express();
var bodyparser= require("body-parser");
var mongoose= require("mongoose");
var passport=require('passport');
var localstrategy=require('passport-local');
var User=require('./models/user')
mongoose.connect("mongodb://localhost/startup");
app.use(bodyparser.urlencoded({extended:true}));



// set the view engine to ejs
app.set('view engine', 'ejs');

// passport configuration
app.use(require("express-session")({
    secret:"HEY ARE YOU THERE",
    resave:false,
    saveUninitialized:false

}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
})




//schema setup
var startupSchema= new mongoose.Schema({
    name:String,
    image:String,
    description:String
});




var startup= mongoose.model("startup", startupSchema);


app.get("/",function(req,res){
    res.render("landing");
});




// THIS IS THE INDEX ROUTE--SHOW ALL startupS
app.get("/startups",function(req,res){
    //get all camp from db
    console.log(req.user);
    startup.find({},function(err,allstartups){
        if(err){
            console.log(err);
        }else{
            res.render("index",{startups:allstartups,currentUser:req.user});
        }
    })


});



//CREATE NEW starups --ADD NEW CAMPG. TO DB
app.post("/startups",isLoggedIn,function(req,res){
    
    //get data from form and add to startups array
    var name=req.body.name;
    var image=req.body.image;
    var desc =req.body.description;
    var newstartup ={name:name, image:image, description:desc}
    startup.create(newstartup,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/startups")
        }
    })
    //redirect back to startups page
});

// show login form
app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
}),function(req,res){})




//NEW-SHOW FORUM TO CREATE NEW starup
app.get("/startups/new",function(req,res){
    res.render("new.ejs");
});




//shows more info about one startups
app.get("/startups/:id", function(req,res){
    res.render("show.ejs")
});


//================================================================
//auth routes
//=====================================

//show register form

app.get("/register",function(req,res){
    res.render("register");
})


//handel sign up form 

app.post("/register",function(req,res){
    var newUser=new User({username:req.body.username})
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register")
        }
        passport.authenticate("local")(req,res,function(){
            res.render("landing")
        })
    })
})
app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
}),function(req,res){})

// add logout route
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}



let port=3000;
app.listen(port,function(){
    console.log("the server is working");
})
