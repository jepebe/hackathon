var mongoose = require("mongoose");


var user_schema = mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        required: '{PATH} is required!'
    },
    email: {
        type: String,
        lowercase: true,
        required: '{PATH} is required!'
    }
});

user_schema.path('username').validate(function (value, done) {
    this.model('User').count({username: value}, function (err, count) {
        if (err) {
            return done(err);
        }
        done(count == 0);
    });
}, 'Username already exists');

module.exports = mongoose.model('User', user_schema);
