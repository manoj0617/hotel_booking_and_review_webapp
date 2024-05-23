const mongoose=require("mongoose");
const {Schema}=mongoose;
const reviewSchema=mongoose.Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5,
    },
    createdate:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:"john dou",
    },
});
const Review=mongoose.model("Review",reviewSchema);
module.exports=Review;