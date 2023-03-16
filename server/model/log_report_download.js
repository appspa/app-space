const mongoose = require('../utils/db')
const Schema = mongoose.Schema

const logReportDownload = new Schema({
    package_id: String,
    client_unique_id: String,
    created_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('LogReportDownload', logReportDownload)
