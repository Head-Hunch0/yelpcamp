const ExpressError = require('./utilities/ExpressError');
const { campgroundSchema , reviewSchema} = require('./schema');
const Campground = require('./models/campground');
const catchAsync = require('./utilities/catchAsync');
const Review = require('./models/review')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // redirecting user to their requested url bfr loginning in
        //stored in req.originalUrl
        req.session.returnTo = req.originalUrl;
        req.flash('err', 'Please Log in to proceed');
        return res.redirect('/login')
    }
    next();
} 

// middleware for serverside validation of user input for campgrounds

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
    // middleware to ensure campgrounds can only be updated by campground owners 

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground =await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to access');
        res.redirect(`/campgrounds/${id}`)
    }
    next();
}

 // middleware for serverside validations for reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//middleware to ensure reviews can only be updated by the review owner
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to access');
        res.redirect(`/campgrounds/${id}`)
    }
    next();
}