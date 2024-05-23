const express =require("express");
const router=express.Router({mergeParams:true});
const {reviewSchema}=require("../schema.js");
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require("../utils/ExpressError.js");
const Review=require('../models/review.js');
const Listing=require("../models/listing.js");
const { validateReview, isLoggedIn, isAuthor } = require("../middleware.js");
const reviewController=require('../controllers/review.js');

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
    
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewController.deleteReview));
    
module.exports=router;