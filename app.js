if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const session = require('express-session');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const { dir } = require('console');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const mongoStore = require('connect-mongo')(session);

const dbUrl = process.env.DB_CON || 'mongodb://localhost:27017/yelpCamp';

// 'mongodb://localhost:27017/yelpCamp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=> {
  console.log("Database connected")  
})

//reqiured for routes

const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');
const e = require('connect-flash');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))) //serving static assets
app.use(mongoSanitize()); // prevents mongo injection

const secret = process.env.SECRET || 'useabettersecret';

const store = new mongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
});
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7 ,// cookies expires after a week 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dfchh7tem/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dfchh7tem/",
];
const connectSrcUrls = [
    // "https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.js",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/dfchh7tem/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfchh7tem/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dfchh7tem/"],
            childSrc:["blod:"]
        },
        // crossOriginEmbedderPolicy:false
    })
);

//passport middlewares 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//storing user and unstoring in session using passpport sessions 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for flash notifications without having to call on every route
app.use((req, res, next) => {
    console.log (req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.del = req.flash('del');
    res.locals.err = req.flash('err');
    res.locals.error = req.flash('error');
    next();
}
)

//routes for our models

app.use('/campgrounds', campgroundRoutes)
app.use('/campground/:id/reviews', reviewRoutes)
app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

// serverside error handling for routes not defined anyroute not defined falls here

// app.all('*', (req, res, next) => {
//     next(new ExpressError('Page Not Found', 404))
// })

//error handler for any and all errors

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message)err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', { err });
    console.log(err.stack)
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})
