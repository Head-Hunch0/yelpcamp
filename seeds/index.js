const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');
const axios = require('axios').default;

mongoose.connect('mongodb+srv://BigF00t:uoSnPrS5V8brODof@cluster0.qqplhxe.mongodb.net/?retryWrites=true&w=majority')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})

// call unsplash and return small image
async function seedImg() {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'hefxpaTsHlizBOrKPFOG2hd7a9Mbgk5bzJaXBVMag_Y',
                collections: 3846912,
            },
        })
        return resp.data.urls.small
    } catch (err) {
        console.error(err)
    }
}

const sample = array => array[Math.floor(Math.random()*array.length)]
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 5000) + 1000;
        const camp = new Campground({
            author: '62ec854091acfe1842881187',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{ url:await seedImg() }],
            // images: [{
            //         url: 'https://res.cloudinary.com/dfchh7tem/image/upload/v1659208305/YelpCamp/huundz1b9ppkl5w9tbtm.jpg',
            //         filename: 'YelpCamp/huundz1b9ppkl5w9tbtm'
            // }],
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude]
            },
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit. At soluta alias provident, odit, quibusdam iure aspernatur ea, eveniet praesentium distinctio quo magni quia quos eius minima. Facere, aliquid. Quibusdam, quia.',
            price
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close()
})

