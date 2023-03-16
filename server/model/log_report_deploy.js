const mongoose = require('../utils/db')
const Schema = mongoose.Schema

const logReportDeploy = new Schema({

    status: Number,
    package_id: String,
    client_unique_id: String,
    previous_label: String,
    previous_app_id: String,
    created_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('LogReportDeploy', logReportDeploy)
