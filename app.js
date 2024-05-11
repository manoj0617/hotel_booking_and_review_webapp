const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const methodOverride = require('method-override');
const { title } = require("process");
const engine =require('ejs-mate');
const wrapAsync=require('./utils/wrapAsync.js');
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const Review=require('./models/review.js');
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError("400",error);
    }else{
        next();
    }
}
// const bodyParser = require('body-parser');

app.use(methodOverride('_method'));
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
// app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.engine('ejs',engine);

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
app.get("/",wrapAsync((req,res)=>{
    res.send("success");
}));
app.get("/listing",wrapAsync(async (req,res)=>{
    let allListing=await Listing.find({});
    // Listing.findByIdAndDelete('663cbc041d2f0118819e1abe');
    res.render("index.ejs",{allListing});
}));
app.get("/listing/new",wrapAsync((req,res)=>{
    res.render("new.ejs");
}));
app.get("/listing/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    res.render("show.ejs",{listing});
}));
app.post("/listing",validateListing,wrapAsync(async(req,res,next)=>{
    
    let {title,description,image,country,location,price}=req.body;
    const listing=await new Listing({
        title:title,
        description:description,
        price:price,
        location:location,
        country:country,
    })
    await listing.save();
    res.redirect("/listing");
})
);
app.delete("/listing/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let del=await Listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));
app.get("/listing/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    res.render("edit.ejs",{listing});
}));
app.put("/listing/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body);
    res.redirect("/listing");
}));
app.post("/listing/:id/review",async (req,res)=>{
    let {id}=req.params;
    console.log(req.body);
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    listing.review.push(newReview);
    let data=await newReview.save();
    await listing.save();
    console.log(data);
    res.redirect(`/listing/${id}`);
});
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});
app.use((err,req,res,next)=>{
    let {status=500,message="Internal server error"}=err;
    res.render("error.ejs",{message});
});