const Listing=require('../models/listing');

module.exports.index=async (req,res)=>{
    let allListing=await Listing.find({});
    res.render("index.ejs",{allListing});
};
module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs");
};
module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id).populate({path:'review',
    populate:{
        path:'author',
    },}).populate('owner');
    console.log(listing);
    if(!listing){
        req.flash("error","listing you requested for does not exist!");
        res.redirect('/listing');
    };
    res.render("show.ejs",{listing});
}
module.exports.addListing = async (req, res, next) => {
    try {
        console.log("success");

        if (!req.file) {
            req.flash("error", "Image upload failed!");
            return res.redirect('/listing/new');
        }

        const { path, filename } = req.file;
        const { title, description, country, location, price } = req.body;
        console.log(req.user);

        const listing = new Listing({
            title,
            description,
            price,
            image: {
                url: path,
                filename: filename,
            },
            location,
            country,
            owner: req.user._id,
        });

        await listing.save();
        console.log(listing);

        req.flash("success", "New listing created successfully!");
        res.redirect(`/listing/${listing._id}`);
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect('/listing/new');
    }
};
module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    let del=await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted successfully!");
    res.redirect("/listing");
};
module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested for does not exist!");
        res.redirect('/listing');
    };
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("edit.ejs",{listing,originalImageUrl});
};
module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the listing to update
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect('/listing');
        }

        // Update listing with new data
        listing.title = req.body.title || listing.title;
        listing.description = req.body.description || listing.description;
        listing.price = req.body.price || listing.price;
        listing.country = req.body.country || listing.country;
        listing.location = req.body.location || listing.location;

        // If a new file is uploaded, update the image
        if (req.file) {
            const { path, filename } = req.file;
            listing.image = {
                url: path,
                filename: filename,
            };
        }
        await listing.save();

        req.flash("success", "Listing updated successfully!");
        res.redirect(`/listing/${id}`);
    } catch (error) {
        req.flash("error", "An error occurred while updating the listing.");
        res.redirect('/listing');
    }
};
