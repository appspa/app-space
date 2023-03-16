import {
  request,
  summary,
  tags,
  formData,middlewares
} from '../swagger';
import {responseWrapper} from "../utils/util";
import verify from '../utils/verify'
import versionManager from  '../services/version-manager';
import log4js  from 'log4js'
import multer from "koa-multer";
import path from "path";
import common from "../utils/common";
const log = log4js.getLogger("cps:upload");

let storageDir = common.getStorageDir()
const tempDir = path.join(storageDir, 'tmp');
const storage = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });
const tag = tags(['上传']);

module.exports = class PublishRouter {

    @request('post', '/api/apps/upload')
    @summary("文件上传")
    @tag
    @formData({
        file: {type: 'file', required: true, description: '.apk、.ipa、.zip'},
        appId: {type: 'string', required: true, description: '项目ID'},
        platform: {type: 'string', required: true,enum:['ios','android','rn'],description: '平台'},
        appVersion: {type: 'string', required: false, description: '目标版本'},
        active: {type: 'bool', required: false, description: '是否启用'},
        grayScaleSize: {type: 'number', required: false, default: 0, description: '是否启用'},
        changeLog: {type: 'string', required: false, description: '发布说明'},
        updateMode: {
            type: 'string',
            required: false,
            default: 'silent',
            enum: ['silent', 'normal', 'force'],
            description: '更新方式'
        },
    })
    @middlewares([upload.single('file')])
    static async upload(ctx, next) {
        let file = ctx.req.file;
        console.log('file',file)
        let uid = ctx.state.user.data._id;
        let {
            appId,
            platform,
            appVersion,
            changeLog,
            grayScaleSize = 0,
            active = false,
            updateMode = 'normal'
        } = ctx.req.body;
        let appInfo = await verify.checkApp(appId)
        console.log('active',active)
        await verify.checkRole(uid, appId, 'manager')
        let version = await versionManager.releaseVersions(ctx.state.user.data, appInfo, {
                appId, platform, appVersion, changeLog, grayScaleSize, active, updateMode, file
            });
        log.debug(version)
        ctx.body = responseWrapper(version)
    }

}

