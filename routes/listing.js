const express =require("express");
const router=express.Router();
const wrapAsync=require('../utils/wrapAsync.js');
const {listingSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const Review=require('../models/review.js');


const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError("400",error);
    }else{
        next();
    }
};
router.get("/",wrapAsync(async (req,res)=>{
    let allListing=await Listing.find({});
    // Listing.findByIdAndDelete('663cbc041d2f0118819e1abe');
    res.render("index.ejs",{allListing});
}));
router.get("/new",wrapAsync((req,res)=>{
    res.render("new.ejs");
}));
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id).populate('review');
    if(!listing){
        req.flash("error","listing you requested for does not exist!");
        res.redirect('/listing');
    };
    res.render("show.ejs",{listing});
}));
router.post("/",validateListing,wrapAsync(async(req,res,next)=>{
    let {title,description,image,country,location,price}=req.body;
    const listing=await new Listing({
        title:title,
        description:description,
        price:price,
        location:location,
        country:country,
    })
    await listing.save();
    req.flash("success","new listing created successfully!");
    res.redirect("/listing");
})
);
router.delete("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let del=await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted successfully!");
    res.redirect("/listing");
}));
router.get("/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested for does not exist!");
        res.redirect('/listing');
    };
    res.render("edit.ejs",{listing});
}));
router.put("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body);
    req.flash("success","listing updated successfully!");
    if(!req.body){
        req.flash("error","listing you requested for does not exist!");
        res.redirect('/listing');
    }
    res.redirect("/listing");
}));
module.exports=router;