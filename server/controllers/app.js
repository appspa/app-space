import {
    request,
    summary,
    body,
    tags,
    middlewares,
    path,
    query,
    description
} from '../swagger';
import fs from 'fs';
import config from '../config'
import { APIError } from "../utils/rest";
import { getIp, responseWrapper } from "../utils/util";
import fpath from 'path';
import mustache from 'mustache';
import _ from 'lodash'

import models from  '../model'
import verify from "../utils/verify";
import common from "../utils/common";
import {md5} from "request/lib/helpers";

const tag = tags(['AppsResource']);

module.exports = class AppRouter {
    @request('post', '/api/apps/create')
    @summary("创建应用")
    @tag
    @body({
        appName: {type: 'string', required: true, description: '应用名称'},
        platform: {type: 'string', required: true,enum:['ios','android','rn'], description:  '平台 ios/android/rn'},
        describe: {type: 'string', required: false, description: '应用描述'},
        icon: {type: 'string',description:'应用图标'},
    })
    static async createApp(ctx, next) {
        let user = ctx.state.user.data;
        let body = ctx.request.body;
        let app = new models.App({
            appName: body.appName,
            platform: body.platform,
            describe: body.describe,
            icon:body.icon,
            shortUrl :Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5),
            creator:user.username,
            ownerId:user._id
        });
        await app.save();
        let collaborator =  new models.Collaborator({
            appId:app._id,
            uid:user._id,
            role:'owner'
        })
        await collaborator.save()
        ctx.body = responseWrapper(true, "创建应用成功")
    }
    @request('get', '/api/apps')
    @summary("获取App列表")
    @query(
        {
        page:{type:'number',default:0,description:'分页页码(可选)'},
        size:{type:'number',default:10,description:'每页条数(可选)'}
    })
    @tag
    static async getApps(ctx, next) {
        let page = ctx.query.page || 0
        let size = ctx.query.size || 10
        const user = ctx.state.user.data;
        let collaborators = await models.Collaborator.find({uid:user._id})
        if (!_.isEmpty(collaborators)) {
            let appIds = _.map(collaborators, (v) => {
                return v.appId
            });
            // console.log('appIds',appIds)
            let result = await models.App.find({_id :{'$in':appIds}});//.limit(size).skip(page * size);
            ctx.body = responseWrapper(result);
        }else {
            ctx.body = responseWrapper([])
        }
    }

    @request('get', '/api/apps/{appId}')
    @summary("获取某个应用详情")
    @tag
    @path({
        appId: { type: 'string', description: '应用id' }
    })
    static async getAppDetail(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId} = ctx.validatedParams;
        let appInfo = await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')
        ctx.body = responseWrapper(appInfo)
    }

    @request('delete', '/api/apps/{appId}')
    @summary("删除某个应用")
    @tag
    @path({
        appId: { type: 'string', description: '应用id' }
    })
    static async deleteApp(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId} = ctx.validatedParams;
        let appInfo = await verify.checkApp(appId)
        if (appInfo.mergeAppId) {
            await models.App.updateOne({_id: appInfo.mergeAppId}, {mergeAppId: ''});
        }
        await verify.checkRole(uid, appId, 'manager');
        await models.Version.deleteMany({ appId:appId})
        await models.App.deleteOne({ _id: appId })
        ctx.body = responseWrapper(true, "应用已删除")
    }

    @request('get', '/api/apps/{appId}/versions')
    @summary("获取某个应用的版本列表(分页)")
    @path({
        appId: { type: 'string', description: '应用id' }
    })
    @query({
        page: { type: 'number', default: 0, description: '分页页码(可选)' },
        size: { type: 'number', default: 10, description: '每页条数(可选)' }
    })
    @tag
    static async getAppVersions(ctx, next) {
        let { page, size } = ctx.query
        let uid = ctx.state.user.data._id;
        let {appId} = ctx.validatedParams;
        await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')
        let versions = await models.Version.find({ appId: appId }).sort({createdAt:-1})
            .limit(size).skip(page * size)
        // let metrics = await models.PackagesMetrics.find({package_id:{'$in':versions.map((v)=>v._id)}})
        // if (versions && metrics) {
        //     versions = versions.map(item => {
        //         for (const p of metrics) {
        //             if (item._id == p.package_id) {
        //                 item.downloadCount = p.downloaded
        //                 break
        //             }
        //         }
        //         return item
        //     });
        //     // console.log('metrics',metrics)
        //     // console.log('packages',versions)
        // }
        ctx.body = responseWrapper(versions);
    }

    @request('get', '/api/apps/{appId}/versions/{versionId}')
    @summary("获取某个应用的某个版本详情")
    @tag
    @path({
        appId: { type: 'string', description: '应用id' },
        versionId: { type: 'string', description: '版本id' }
    })
    static async getAppVersionDetail(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId,versionId} = ctx.validatedParams;
        await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')
        let version = await models.Version.findById({_id: versionId});
        if (!version) {
            throw new Error("应用不存在")
        }
        ctx.body = responseWrapper(version)
    }

    @request('delete', '/api/apps/{appId}/versions/{versionId}')
    @summary("删除某个版本")
    @tag
    @path({
        appId: { type: 'string', description: '应用id' },
        versionId: { type: 'string', description: '版本id' }
    })
    static async deleteAppVersion(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId,versionId} = ctx.validatedParams;
        await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')

        // todo
        // try {
        //     let findOne = await models.Version.findById({_id:versionId})
        //     // 删除对应版本的文件
        //     fs.unlinkSync(fpath.join(config.fileDir, findOne.downloadUrl))
        // } catch(err) {
        //     console.error(err)
        // }

        await models.Version.deleteOne({ _id: versionId })
        ctx.body = responseWrapper(true, "版本已删除")
    }

    @request('post', '/api/apps/{appId}/updateMode')
    @summary("设置应用或版发布更新方式/静默/强制/普通")
    @tag
    @body({
        updateMode: { type: 'string', require: true },
        versionId: { type: 'string', description: "如果传入了versionId则表示设置某个版本的更新方式" }
    })
    @path({ appId: { type: 'string', require: true } })
    static async setUpdateMode(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId} = ctx.validatedParams;
        await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')
        let { versionId ,updateMode } = ctx.request.body
        await models.Version.findByIdAndUpdate(versionId, {
            updateMode: updateMode
        })
        ctx.body = responseWrapper(true, "版本发布策略设置成功")
    }

    @request('post', '/api/apps/{appId}/profile')
    @summary("更新应用设置")
    @tag
    @body({
        'appName': 'string', //应用短连接
        'shortUrl': 'string', //应用短连接
        'installWithPwd': 'boolean', //应用安装是否需要密码
        'installPwd': 'string', //应用安装的密码
        'autoPublish': 'boolean', //新版本自动发布
        'showHistory': 'boolean',//显示历史版本
        'mergeAppId': 'string', //关联应用
        'diffNum': Number //关联应用
    })
    @path({ appId: { type: 'string', required: true } })
    static async setAppProfile(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId} = ctx.validatedParams;
        let appInfo =  await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')
        let {shortUrl,diffNum, installWithPwd, appName,installPwd, autoPublish,showHistory,mergeAppId} = ctx.request.body;
        console.log('mergeAppId=', mergeAppId);
        await models.App.findByIdAndUpdate(appId, { diffNum,shortUrl,appName,installWithPwd,installPwd ,autoPublish,showHistory,mergeAppId})
        if (mergeAppId) {
            await models.App.findByIdAndUpdate(mergeAppId, { mergeAppId:appId})
        }else if(appInfo.mergeAppId){
            await models.App.findByIdAndUpdate(appInfo.mergeAppId, { mergeAppId:''})
        }
        ctx.body = responseWrapper(true, "应用设置已更新");
    }

    @request('post', '/api/apps/{appId}/{versionId}/profile')
    @summary("更新版本设置设置")
    @tag
    @body({
        // 'installUrl':  { type: 'string', require: false,description:'更新文件的安装地址' },
        'changeLog': { type: 'string', require: false,description:'更新描述' },
        'appVersion': { type: 'string', require: false, description: 'RN支持版本' },
        'active':{ type: 'bool', require: false,default:false, description: '是否激活'},
        'patchEnable':{ type: 'bool', require: false,default:false, description: '增量是否激活'},
        'isIgnorable':{ type: 'bool', require: false,default:false, description: '是否可忽略'},
        'grayScaleLimit':{ type: 'bool', require: false, description: '是否灰度' },
        'grayScaleSize':{ type: 'number', default: 0, require: false, description: '灰度上限'},
        'updateMode': { type: 'string', default: 'normal', enum: ['silent', 'normal', 'force'],description:'更新模式' }
    })
    @path({ appId: { type: 'string', required: true }, versionId: { type: 'string', required: true } })
    static async setVersionProfile(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId, versionId} = ctx.validatedParams;
        await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')
        console.log('setVersionProfile',ctx.request.body)
        ctx.request.body.uploadAt = Date.now()
        let update = ctx.request.body;
        if (ctx.request.body.appVersion) {
            let versionInfo = common.validatorVersion(ctx.request.body.appVersion);
            if (!versionInfo[0]) {
                throw new Error(`--targetBinaryVersion ${ctx.request.body.appVersion} not support.`);
            }
            update.minVersion = versionInfo[1];
            update.maxVersion = versionInfo[2];
        }
        await models.Version.findByIdAndUpdate(versionId, update)
        ctx.body = responseWrapper(true, "版本设置已更新")
    }

    @request('post', '/api/apps/{appId}/release')
    @summary("发布或者取消发布某个版本")
    @tag
    @path({ appId: { type: 'string', require: true } })
    @body({
        versionId: { type: 'string', require: true },
        active: { type: 'bool', require: true }
    })
    static async releaseVersion(ctx, next) {
        let uid = ctx.state.user.data._id;
        let {appId} = ctx.validatedParams;
        await verify.checkApp(appId)
        await verify.checkRole(uid, appId, 'manager')
        let version = await models.Version.findById(ctx.request.body.versionId)
        if (!version) {
            throw new Error("版本不存在")
        }
        await models.Version.updateOne({_id: ctx.request.body.versionId},{active:ctx.request.body.active})
        ctx.body = responseWrapper(true, ctx.request.body.active ? "版本已发布" : "版本已关闭")
    }

    @request('get', '/api/app/checkupdate/{appId}/{currentVersionCode}')
    @summary("检查版本更新")
    @tag
    @path({
        appId: String,
        currentVersionCode: String,
    })
    @query(
        {
            appId: {type: 'string', default: '', require: true,description: 'appId'},
            currentVersionCode: {type: 'number', require: true,default: 0, description: '当前版本'},
            currentMd5: {type: 'string', default: '',require: false, description: '当前md5(差量更新使用)'},
        })
    static async checkUpdate(ctx, next) {
        let appId = ctx.query.appId
        await verify.checkApp(appId)
        let currentVersionCode = ctx.query.currentVersionCode
        let currentMd5 = ctx.query.currentMd5
        let tempVersion = {};
        //正常
        let version = await models.Version.findOne({
            appId: appId,
            active: true,
            grayScaleLimit: false,
            versionCode: {'$gt': currentVersionCode}
        }).sort({'versionCode': -1});

        //灰度版本
        let grayVersion = await models.Version.findOne({
                appId: appId,
                active: true,
                grayScaleLimit: true,
                versionCode: {'$gt': currentVersionCode},
                '$expr': {//大于等于
                    '$gte': ['$grayScaleSize', '$downloadCount']
                }
            }
        ).sort({'versionCode': -1});

        if (grayVersion && version) {
            if (version.versionCode > grayVersion.versionCode) {
                tempVersion = version;
            } else {
                tempVersion = grayVersion;
            }
        } else if (!grayVersion && version) {
            tempVersion = version;
        } else if (grayVersion && !version) {
            tempVersion = grayVersion;
        } else {
            ctx.body = responseWrapper(false, "您已经是最新版本了");
            return
        }

        //强制
        let forceVersion = await models.Version.findOne({
            appId: appId,
            active: true,
            updateMode: 'force',
            grayScaleLimit: false,
            versionCode: {'$gt': currentVersionCode}
        });
        if (!forceVersion) {
            forceVersion = await models.Version.findOne({
                    appId: appId,
                    active: true,
                    grayScaleLimit: true,
                    updateMode: 'force',
                    versionCode: {'$gt': currentVersionCode},
                    '$expr': {//大于等于
                        '$gte': ['$grayScaleSize', '$downloadCount']
                    }
                }
            )
        }

        if (tempVersion && forceVersion) {
            tempVersion.updateMode = 'force';
        }

        let patchInfo;
        if (tempVersion.patchEnable && tempVersion.patchList && tempVersion.patchList.length > 0) {
            patchInfo = tempVersion.patchList.find(v => {
                return (v.patchId.indexOf("_" + currentVersionCode + "_") > -1) && v.sMd5 == currentMd5;
            })
        }

        if (!tempVersion) {
            ctx.body = responseWrapper(false, "您已经是最新版本了");
        } else {
            ctx.body = responseWrapper({
                hasUpdate: true,
                isForce: tempVersion.updateMode == 'force',
                isIgnorable: tempVersion.isIgnorable,
                isSilent: tempVersion.updateMode == 'silent',
                md5: tempVersion.packageHash,
                versionCode: tempVersion.versionCode,
                versionName: tempVersion.versionName,
                changeLog: tempVersion.changeLog,
                downloadUrl: tempVersion.downloadUrl,
                installUrl: tempVersion.installUrl,
                size: tempVersion.size,
                patchInfo: patchInfo,
            });
        }

    }

    @request('post', '/api/app/shortUrl')
    @summary("通过短链接获取应用最新版本")
    @tag
    @path({ appShortUrl: { type: 'string', require: true } })
    @body({
        appShortUrl: { type: 'string', require: true },
        password: { type: 'string', require: false }
    })
    static async getAppByShort(ctx, next) {
        let { appShortUrl,password} =  ctx.request.body
        console.log('password', password);
        let appInfo = await models.App.findOne({ shortUrl: appShortUrl })
        if (!appInfo) {
            throw new Error("应用不存在")
        }
        if (password && appInfo.installWithPwd == 1 && appInfo.installPwd !== password) {
            throw new Error("密码不正确");
        }
        let mergeApp;
        let mergeHistory
        if (appInfo.mergeAppId) {
            mergeApp = await models.App.findOne({ _id: appInfo.mergeAppId })
            mergeHistory = await models.Version.find({
                    '$and': [{
                        appId: appInfo.mergeAppId,
                        active: true,
                    }, {
                        '$or': [{//激活没限制
                            grayScaleLimit: false
                        }, {//激活没到限制
                            grayScaleLimit: true,
                            '$expr': {//大于等于
                                '$gte': ['$grayScaleSize', '$downloadCount']
                            }
                        }
                        ]
                    }]
                }
            ).sort({'createdAt':-1}).limit(10);
        }
        let history = await models.Version.find({
                '$and': [{
                    appId: appInfo._id,
                    active: true,
                }, {
                    '$or': [{//激活没限制
                        grayScaleLimit: false
                    }, {//激活没到限制
                        grayScaleLimit: true,
                        '$expr': {//大于等于
                            '$gte': ['$grayScaleSize', '$downloadCount']
                        }
                    }
                    ]
                }]
            }
        ).sort({'createdAt': -1}).limit(10) || [];
        if (appInfo.installWithPwd == 1 && !password) {
            history.map(item=>{
                item.downloadPath = ''
                item.downloadUrl = '';
                item.installUrl = ''
                return item
            })
        }

        let tempResult = [{
            'appInfo': appInfo,
            'versionInfo': history && history.length > 0 ? history[0] : [],
            'history': appInfo.showHistory == true  ? history : [],
        }]
        if (mergeApp) {
            if (appInfo.installWithPwd == 1 && !password) {
                mergeHistory.map(item=>{
                     item.downloadPath = ''
                     item.downloadUrl = ''
                     item.installUrl = ''
                    return item
                })
            }
            mergeApp.installPwd = ''
            tempResult.push({
                'appInfo': mergeApp,
                'versionInfo': mergeHistory && mergeHistory.length > 0 ? mergeHistory[0] : [],
                'history': mergeApp.showHistory == true ? mergeHistory : [],
            })
        }
        let needAuth = appInfo.installWithPwd == 1 && appInfo.installPwd != password
        console.log('installPwd',appInfo.installPwd)
        appInfo.installPwd = ''
        console.log('installPwd',appInfo.installPwd)
        console.log('needAuth',needAuth)
        ctx.body = responseWrapper({'needAuth': needAuth, 'list': tempResult});
    }


    @request('get', '/api/plist/{appId}/{versionId}')
    @summary("获取应用的plist文件")
    @tag
    @path({ appId: { type: 'string', require: true }, versionId: { type: 'string', require: true } })
    static async getAppPlist(ctx, next) {
        let {appId,versionId} = ctx.validatedParams;
        let app = await verify.checkApp(appId)
        let version = await models.Version.findOne({ _id: versionId })
        if (!version) {
            throw new Error("版本不存在")
        }
        // let url = common.getBlobDownloadUrl(version.downloadPath)
        let result = fs.readFileSync(fpath.join(__dirname, "..", 'templates') + '/template.plist')
        let template = result.toString();
        let rendered = mustache.render(template, {
            appName: app.appName,
            bundleID: version.bundleId,
            versionName: version.versionName,
            downloadUrl: version.downloadUrl,
            fileSize: version.size,
            iconUrl: common.getBlobDownloadUrl(app.icon)
        });
        ctx.set('Content-Type', 'text/xml; charset=utf-8');
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.body = rendered
    }

    @request('get', '/api/count/{versionId}')
    @summary("增加一次下载次数")
    @tag
    @path({  versionId: { type: 'string', require: true } })
    static async addDownloadCount(ctx, next) {
        let {versionId} = ctx.validatedParams;

        let version = await models.Version.findById(versionId)
        if (version) {
            await models.Version.updateOne({_id:versionId},{'downloadCount': version.downloadCount + 1})
        }

        let metric = await models.PackagesMetrics.findOne({package_id: versionId});
        console.log('addDownloadCount downloaded...',metric)
        if (!metric) {
            console.log('addDownloadCount create...')
            await models.PackagesMetrics.create({package_id: versionId, downloaded: 1})
            await models.Version.create({package_id: versionId, downloaded: 1})
        }else {
            let downloaded = metric.downloaded || 0;
            console.log('addDownloadCount downloaded...',downloaded)
            await models.PackagesMetrics.updateOne({package_id: versionId},{downloaded: downloaded + 1,
                updated_at: Date.now(),
            })
        }
        ctx.body = responseWrapper(true, '下载次数已更新')
    }

    //兼容 code push
    @request('post', '/api/v0.1/public/codepush/report_status/download')
    @summary("增加一次下载次数 兼容code_push")
    @tag
    @body({
        label: { type: 'string', require: true ,description:'versionId'},
    })
    static async reportStatusDownload(ctx, next) {
        let {label} = ctx.request.body;

        let version = await models.Version.findById(label)
        if (version) {
            await models.Version.updateOne({_id:label},{'downloadCount': version.downloadCount + 1})
        }

        let metric = await models.PackagesMetrics.findById({package_id: label});
        if (!metric) {
            await models.PackagesMetrics.create({package_id: label, downloaded: 1})
        }else {
            await models.PackagesMetrics.updateOne({package_id: label},{downloaded: metric.downloaded + 1})
        }
        ctx.body = responseWrapper(true, '下载次数已更新')
    }

    //兼容 code push
    @request('post', '/api/v0.1/public/codepush/report_status/deploy')
    @summary("版本激活状态更新 兼容code_push")
    @tag
    @body({
        label: { type: 'string', require: true ,description:'versionId'},
        status: { type: 'string', require: true, description:'DeploymentSucceeded/DeploymentFailed'},
    })
    static async reportStatusDeploy(ctx, next) {
        let {label,status} = ctx.request.body;
        let statusInt = 0
        if (status == 'DeploymentSucceeded') {
            statusInt = 1
        }else if (status == 'DeploymentFailed') {
            statusInt = 2
        }
        if (statusInt > 0) {

        }
        let metric = await models.PackagesMetrics.findById({package_id: label});
        if (!metric) {
            if (statusInt == 1) {
                await models.PackagesMetrics.updateOne({package_id: label,
                    downloaded:1,installed: 1, active: 1});
            }else {
                await models.PackagesMetrics.updateOne({package_id: label,
                    downloaded:1,installed: 1, failed: 1});
            }
        }else {
            if (statusInt == 1) {
                await models.PackagesMetrics.updateOne({package_id: label},
                    {installed: metric.installed + 1, active: metric.active+1});
            }else {
                await models.PackagesMetrics.updateOne({package_id: label},
                    {installed: metric.installed + 1, failed: metric.failed+1});
            }
        }
        ctx.body = responseWrapper(true, 'ok')
    }
}


