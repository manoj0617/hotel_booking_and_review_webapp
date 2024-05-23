const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const Review = require('../models/review');
const { isLoggedIn, isOwner, validateListing } = require('../middleware');
const listingController = require('../controllers/listing');
const multer = require('multer');
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('image'), validateListing, wrapAsync(listingController.addListing));

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))
    .put(isLoggedIn, isOwner,  upload.single('image'),validateListing, wrapAsync(listingController.updateListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
