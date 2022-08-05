const mongoose = require('mongoose');
const { campgroundSchema } = require('../schema');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});
const opts = {toJSON :{virtuals:true}}
const CampgroundsSchema = new Schema({
    title: String,
    price: Number,
    geometry: { // mapbox geoJson response for forwardeocoding
        type: {
            type: String,
            enum: ['Point'], // must be point
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Review'
        }
    ]
},opts);

CampgroundsSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <a href="/campgrounds/${this._id}">${this.title}</a>
    <p>${this.location}</p>`
});

//midlleware to delete associated reviews after deleting the campground where the reviews belonged

CampgroundsSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground',CampgroundsSchema)