const Review=require('../models/review');
const Listing=require('../models/listing');

module.exports.createReview=async (req,res)=>{
    let {id}=req.params;
    console.log(req.body);
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.review.push(newReview);
    console.log(newReview);
    let review=await newReview.save();
    console.log(review);
    await listing.save();
    req.flash("success","new review created successfully!");
    res.redirect(`/listing/${id}`);
};
module.exports.deleteReview=async (req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted successfully!");
    res.redirect(`/listing/${id}`);
};