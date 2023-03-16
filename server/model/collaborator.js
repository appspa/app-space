const mongoose = require('../utils/db')
const Schema = mongoose.Schema

const collaboratorSchema = new Schema({
    appId: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["owner", "manager", "guest"]
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Collaborator', collaboratorSchema);
