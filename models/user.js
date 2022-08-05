const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
// passport requires a unique username and password and passes to the userschema
// passes a hash , salt
UserSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', UserSchema);

module.exports = User;