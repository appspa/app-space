const mongoose = require('../utils/db')
const Schema = mongoose.Schema

const packagesMetrics = new Schema({
    package_id: String,
    active: {type: Number, default: 0},
    downloaded: {type: Number, default: 0},
    failed: {type: Number, default: 0},
    installed:{type: Number, default: 0},
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('PackagesMetrics', packagesMetrics)
