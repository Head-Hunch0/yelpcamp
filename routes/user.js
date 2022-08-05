const User = require('../models/user');
const express = require('express');
const router = express.Router();
const users = require('../controllers/user');
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.createUser))

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.userLogin)

router.get('/logout',users.userLogout);

module.exports = router;

