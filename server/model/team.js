const mongoose = require('../utils/db')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId


const teamSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    icon: String,
    creatorId: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    members: [
        {
            _id: ObjectId,
            username: String,
            email: String,
            role: {
                type: String,
                enum: ["owner", "manager", "guest"]
            }
        }
    ]
});


function autoAddCreator(params) {

}

module.exports = mongoose.model('Team', teamSchema);
