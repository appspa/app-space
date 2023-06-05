const mongoose = require('../utils/db');
const Schema = mongoose.Schema;

const versionSchema = new Schema({
    label: String,
    appId: String, //该版本的应用的id
    bundleId: String,
    iconHash: String,
    appVersion: String,
    versionName: String,
    versionCode: String,
    uploader: String,
    uploaderId: String,
    packageHash:String,
    size: Number,
    active: {type: Boolean, default: false},
    downloadPath: String,
    downloadUrl: String,
    installUrl: String,//ios 签名Url
    downloadCount: {type: Number, default: 0},
    appLevel: String,
    changeLog: String,
    grayScaleLimit: {type: Boolean, default: false},
    grayScaleSize:Number,
    minVersion:String,
    maxVersion:String,
    hidden: {type: Boolean, default: false},
    updateMode: {type: String, default: 'normal', enum: ['silent', 'normal', 'force']},
    isIgnorable: {type: Boolean, default: false},
    patchEnable: {type: Boolean, default: false},
    createdAt: {
        type: Date,
        default: Date.now
    },
    patchList:{
        type: Array,
        default: []
    },
    uploadAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Version', versionSchema);
