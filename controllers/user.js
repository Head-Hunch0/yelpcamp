const User = require('../models/user');

// route for rendering registration form
module.exports.renderRegister = (req, res) => {
    res.render('user/register')
}
// route for creating a new user
module.exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next()
            req.flash('success', `Welcome to YelpCamp ${req.body.username}`)
            res.redirect('/campgrounds')
        });
    } catch (e) {
        req.flash('err', e.message);
        res.redirect('/register')
    }
}
// route for rendering login form
module.exports.renderLoginForm = (req, res) => {
    res.render('user/login')
}
// route for logging in user and redirecting them to their original url bfr login is required
module.exports.userLogin = (req, res) => {
    req.flash('error',  req.session.message )
    req.flash('success', `Welcome back ${req.body.username}`)
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}
// route for loging out user
module.exports.userLogout = (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        else {
            req.flash('success', `Goodbye! See you soon`);
            res.redirect('/campgrounds');   
        }
    }); 
    
}