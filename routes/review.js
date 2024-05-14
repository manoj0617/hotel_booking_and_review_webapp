const express =require("express");
const router=express.Router({mergeParams:true});
const {reviewSchema}=require("../schema.js");
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require("../utils/ExpressError.js");
const Review=require('../models/review.js');
const Listing=require("../models/listing.js");

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        console.log(error);
        throw new ExpressError("400",error);
        next(err);
    }else{
        next();
    }
};

    router.post("/",validateReview,wrapAsync(async (req,res)=>{
        let {id}=req.params;
        console.log(req.body);
        let listing = await Listing.findById(id);
        let newReview = new Review(req.body.review);
        listing.review.push(newReview);
        let review=await newReview.save();
        await listing.save();
        req.flash("success","new review created successfully!");
        res.redirect(`/listing/${id}`);
    }));
    router.delete("/:reviewId",async (req,res)=>{
        let{id,reviewId}=req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","review deleted successfully!");
        res.redirect(`/listing/${id}`);
    });
    module.exports=router;