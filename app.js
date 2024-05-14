const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride = require('method-override');
const engine =require('ejs-mate');
const ExpressError=require("./utils/ExpressError.js");
const session=require('express-session');
const flash=require('connect-flash');

const listing=require('./routes/listing.js');
const review=require('./routes/review.js');

app.use(methodOverride('_method'));
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
// app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.engine('ejs',engine);
// const bodyParser = require('body-parser');
const sessionOptions={
    secret:"mysupersecretcode",
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

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});

app.use("/listing",listing);
app.use("/listing/:id/review",review);

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
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
    res.send("success");
});
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});
app.use((err,req,res,next)=>{
    let {status=500,message="Internal server error"}=err;
    res.status(status).render("error.ejs",{message});
});