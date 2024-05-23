const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const {listingSchema,reviewSchema}=require('./schema');

module.exports.isLoggedIn=((req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create a listing!");
        return res.redirect('/login');
    }
    next();
});


module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    };
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!(req.user._id.equals(listing.owner._id))){
        req.flash("error","only owner can edit");
        return res.redirect("/listing");
    };
    next();
};

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError("400",error);
    }else{
        next();
    }
};

module.exports.validateReview=(req,res,next)=>{
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
module.exports.isAuthor=async (req,res,next)=>{
    let {reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!(res.locals.currUser._id.equals(review.author._id))){
        req.flash("error","only owner can edit");
        return res.redirect("/listing");
    };
    next();
};