if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride = require('method-override');
const engine =require('ejs-mate');
const ExpressError=require("./utils/ExpressError.js");
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');
const multer  = require('multer')
const {storage}=require("./cloudConfig.js");
const upload = multer({ storage });

const listingRouter=require('./routes/listing.js');
const reviewRouter=require('./routes/review.js');
const userRouter=require('./routes/user.js');

const dbUrl=process.env.ATLASDB_URL;

app.use(methodOverride('_method'));
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.engine('ejs',engine);
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("ERROR IN MONGO STORE",err);
});
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.use("/listing",listingRouter);
app.use("/listing/:id/review",reviewRouter);
app.use("/",userRouter);

async function main(){
    await mongoose.connect(dbUrl);
}
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
});
app.listen(3000,()=>{
    console.log("listening to port 3000");
});


app.get("/",(req,res)=>{
    res.redirect("/listing");
});
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});
app.use((err,req,res,next)=>{
    let {status=500,message="Internal server error"}=err;
    res.status(status).render("error.ejs",{message});
});
