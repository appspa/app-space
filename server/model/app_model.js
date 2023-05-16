

const mongoose = require('../utils/db')
const Schema = mongoose.Schema

const appSchema = new Schema({
    platform: {
        type: String
    },
    os: {
        type: String
    },
    bundleId: {
        type: String,
        index: true
    },
    bundleName: {
        type: String
    },
    appName: String,
    currentVersion: {
        type: String
    },
    creatorId: String,
    creator: String,
    createAt: {
        type: Date,
        default: Date.now
    },
    icon: {
        type: String
    },
    describe: {
        type: String
    },
    updateAt: {
        type: Date
    },
    shortUrl: {
        type: String,
        unique: true
    },
    mergeAppId: {
        type: String,
    },
    autoPublish: { //是否自动发布
        type: Boolean,
        default: false
    },
    installWithPwd: {
        Boolean,
        default: false
    },
    installPwd: {
        type: String
    },
    appLevel: String,
    ownerId: String,
    changeLog: String,
    releaseVersionCode: String, //当前对外发布的code号
    releaseVersionId: String, //当前对外发布的最新版本号
    grayReleaseVersionId: String,
    totalDownloadCount: {type: Number, default: 0},
    todayDownloadCount: {
        date: {type: Date, default: Date.now},
        count: {type: Number, default: 0}
    },
    label_id: Number,
    diffNum: {type: Number, default: 0},
    last_app_version_id: String,
    showHistory: { //是否展示历史版本
        type: Boolean,
        default: true
    },
});



// appSchema.virtual('versions').get(function () {     return Version.find })

module.exports = mongoose.model('App', appSchema)
