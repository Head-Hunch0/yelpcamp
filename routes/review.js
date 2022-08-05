// review routes
const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/review')
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');
const {isLoggedIn , validateReview , isReviewAuthor} = require('../middleware');


router.post('/', isLoggedIn , validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;

