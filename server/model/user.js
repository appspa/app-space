const mongoose = require('../utils/db')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const userSchema = {
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String,
        index: true
    },
    token: {
        type: String
    },
    apiToken: {
        type: String
    },
    // teams: [{
    //     _id: ObjectId,
    //     name: String,
    //     icon: String,
    //     role: {
    //         type: String,
    //         enum: ["owner", "manager", "guest"]
    //     }
    // }],
    mobile: String,
    qq: String,
    company: String,
    career: String,
    permission: {
        type: String,
        default: 'normal',
        enum: ["root", "normal"]
    },

};

module.exports = mongoose.model('User', new Schema(userSchema))
