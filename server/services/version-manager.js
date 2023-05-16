'use strict';
import common from "../utils/common";
import Promise from "bluebird";
import os from "os";
import path from "path";
import security from "../utils/security";
import fs from "fs";
import log4js from 'log4js'
import Models from "../model";
import config from "../config";
import _ from "lodash";
import fpath from "path";
import mustache from "mustache";
import models from "../model";
import BSDiff from 'bsdiff-nodejs';
import {AppError} from "../utils/app-error";
const log = log4js.getLogger("cps:PackageManager");
let storageDir = common.getStorageDir()
export default class VersionManager{
    static async saveTempIcon(directoryPath, imageData) {
        let directoryPathParent = path.join(directoryPath, 'icon');
        let relPath = path.join(directoryPathParent, 'logo.png');
        return Promise.all(
            common.createEmptyFolder(directoryPathParent)
                .then((path) => {
                    return path
                })
        ).then((path) => {
            return common.createFileByImageData(relPath, imageData)
        });
    }

    static async saveTempPlist(directoryPath,manifest) {
        let result = fs.readFileSync(fpath.join(__dirname, "..", 'templates') + '/template.plist')
        let template = result.toString();
        let rendered = mustache.render(template, {
            appName: manifest.appName,
            bundleID: manifest.bundleId,
            versionName: manifest.versionName,
            downloadUrl: manifest.downloadUrl,
            fileSize: manifest.fileSize,
            iconUrl: manifest.iconUrl
        });
        let directoryPathParent = path.join(directoryPath, 'plist');
        let relPath = path.join(directoryPathParent, 'manifest.plist');
        return Promise.all(
            common.createEmptyFolder(directoryPathParent)
                .then((path) => {
                    return path
                })
        ).then((path) => {
            // console.log('rendered',rendered)
            return common.createFileByString(relPath, rendered)
        });
    }

    static async releaseVersions(userInfo, appInfo, versionInfo) {
        return versionInfo.platform == 'rn' ? this.releaseRnVersions(userInfo, appInfo, versionInfo)
            : this.releaseAppVersions(userInfo, appInfo, versionInfo);
    }

    static async releaseRnVersions(userInfo, appInfo, versionInfo) {
        let {appId, appVersion,active, grayScaleSize,grayScaleLimit, platform, changeLog, updateMode, file} = versionInfo;
        log.debug('file = ', file)
        // let versions = common.validatorVersion(appVersion);
        // log.debug("versions",versions)
        // if (!versions[0]) {
        //     log.debug(`releasePackage targetBinaryVersion ${appVersion} not support.`);
        //     throw new AppError.AppError(`targetBinaryVersion ${appVersion} not support.`)
        // }
        let filePath = file.path;
        let fileName = security.randToken(32);
        let versionPath = appId + '/' + platform + '/' + security.randToken(5) + '/';
        let versionFile = versionPath + fileName;
        return security.fileSha256(filePath).then((packageHash) => {
            log.debug('releaseVersions packageHash', packageHash);
            return Promise.all([
                common.uploadFileToStorage(versionFile, filePath),
            ]).then(() => {
                let stats = fs.statSync(filePath);
                let versionParam = {
                    label: '',
                    appId: appId,
                    bundleId: '',
                    appVersion: '',
                    versionName: '',
                    versionCode: '',
                    uploader: userInfo.username,
                    uploaderId: userInfo._id,
                    packageHash: packageHash,
                    size: stats.size,
                    active: active,
                    downloadPath: versionFile,
                    downloadUrl: common.getBlobDownloadUrl(versionFile),
                    downloadCount: 0,
                    appLevel: '',
                    grayScaleSize: grayScaleSize,
                    grayScaleLimit:grayScaleLimit,
                    changeLog: changeLog,
                    // minVersion: versions [0],
                    // maxVersion: versions[1],
                    hidden: false,
                    updateMode: updateMode,
                };
                let version = Models.Version(versionParam)
                return Promise.all(
                    [
                        version.save()
                    ]
                ).then(() => version);
            });
        }).finally(() => {
            common.deleteFolderSync(filePath)
        });
    };

    static async releaseAppVersions(userInfo, appInfo, versionInfo) {
        let {appId,active, grayScaleSize,grayScaleLimit, platform, changeLog, updateMode, file} = versionInfo;
        log.debug('file = ', file)
        let filePath = file.path;
        return Promise.all([
            common.parseIpaApk(platform, filePath).then((packageInfo) => {
                    return packageInfo;
                }
            )
        ]).spread((packageInfo) => {
            log.debug('releaseVersions packageInfo', packageInfo);
            let fileName = packageInfo.bundleId + '_' + packageInfo.versionName + '_' + packageInfo.versionCode
            let versionPath = appId + '/' + platform + '/' + security.randToken(5)+'/'
            let versionIconPath = appId + '/icon/'
            let versionFile = versionPath + fileName + path.extname(filePath);
            let versionIconFile = versionIconPath + fileName + '.png';
            let tempDir = path.join(storageDir, 'tmp')
            return security.fileSha256(filePath).then((packageHash) => {
                log.debug('releaseVersions packageHash', packageHash);
                return this.saveTempIcon(tempDir, packageInfo.icon).then((iconTempPath) => {
                    log.debug('releaseVersions iconTempPath', iconTempPath);
                    return Promise.all([
                        common.uploadFileToStorage(versionFile, filePath),
                        common.uploadFileToStorage(versionIconFile, iconTempPath),
                    ]).then(() => {
                        let downloadUrl = common.getBlobDownloadUrl(versionFile);
                        let iconUrl = common.getBlobDownloadUrl(versionIconFile);
                        if (platform == 'ios' && config.iosPlistSource == 'yun') {
                            let stats = fs.statSync(filePath);
                           return this.saveTempPlist(tempDir, {
                                appName: packageInfo.appName,
                                bundleId: packageInfo.bundleId,
                                versionName: packageInfo.versionName,
                                downloadUrl: downloadUrl,
                                fileSize: stats.size,
                                iconUrl: iconUrl
                            }).then(manifestTempPath => {
                                let versionPlistFile = versionPath + 'plist/' + packageInfo.versionName + '/manifest.plist';
                                return common.uploadFileToStorage(versionPlistFile, manifestTempPath).then(()=>{
                                    let iosInstallUrl = common.getBlobDownloadUrl(versionPlistFile);
                                    console.log('iosInstallUrl=', iosInstallUrl);
                                    return {downloadUrl, iconUrl, iosInstallUrl};
                                })
                            })
                        }else {
                            return {downloadUrl,iconUrl, iosInstallUrl: ''}
                        }
                    });
                }).then((urls)=>{
                    let stats = fs.statSync(filePath);
                    let versionParam = {
                        label: '',
                        appId: appId,
                        bundleId: packageInfo.bundleId,
                        appVersion: '',
                        versionName: packageInfo.versionName,
                        versionCode: packageInfo.versionCode,
                        uploader: userInfo.username,
                        uploaderId: userInfo._id,
                        packageHash: packageHash,
                        size: stats.size,
                        active: active,
                        downloadPath: versionFile,
                        downloadUrl: urls.downloadUrl,
                        downloadCount: 0,
                        appLevel: packageInfo.appLevel,
                        grayScaleSize: grayScaleSize,
                        grayScaleLimit: grayScaleLimit,
                        changeLog: changeLog,
                        minVersion: 0,
                        maxVersion: 0,
                        hidden: false,
                        updateMode: updateMode,
                    };
                    let version = Models.Version(versionParam)
                    if (platform == 'ios') {
                        if (config.iosPlistSource == 'yun' && urls.iosInstallUrl) {
                            version.installUrl = `itms-services://?action=download-manifest&url=${urls.iosInstallUrl}`;
                        } else if (config.iosInstallUrl) {
                            version.installUrl = `itms-services://?action=download-manifest&url=${config.iosInstallUrl}/api/plist/${appId}/${version.id}`;
                        } else {
                            version.installUrl = `itms-services://?action=download-manifest&url=${config.baseUrl}/api/plist/${appId}/${version.id}`;
                        }
                    } else {
                        version.installUrl = urls.downloadUrl
                    }
                    console.log('icon',urls.iconUrl);
                    console.log('installUrl',version.installUrl);
                    return Promise.all(
                        [
                            Models.App.updateOne({_id: appId}, {
                                icon: urls.iconUrl,
                                bundleId: packageInfo.bundleId,
                            }),
                            version.save()
                        ]
                    ).then(() => {
                        // console.log('createDiffVersionsByLastNums...',appInfo.diffNum);
                        // if (versionInfo.platform == 'android' && appInfo.diffNum > 0) {
                        //     console.log('createDiffVersionsByLastNums... diffNum start');
                        //     this.createDiffVersionsByLastNums(appId, version, appInfo.diffNum);
                        // }
                       return version
                    });
                })
            });
        }).finally(() => {
            common.deleteFolderSync(filePath)
        });
    };

    static createDiffVersionsByLastNums(appId, originalVersion, num) {
        return Promise.all([
            models.Version.find({
                appId: appId,
                versionCode: {'$lt': originalVersion.versionCode}
            }).limit(num)
        ]).spread((lastNumsVersions)=>{
            console.debug('createDiffVersionsByLastNums... lastNumsVersions=',lastNumsVersions);
            return this.createDiffVersions(originalVersion,lastNumsVersions)
        });
    }

    static createDiffVersions(originalVersion, destVersions) {
        if (!_.isArray(destVersions)) {
            return Promise.reject(new AppError('第二个参数必须是数组'));
        }

        if (destVersions.length <= 0) {
            return null;
        }
        let diffDir = path.join(storageDir, 'tmp/diff/' + security.randToken(4));
        log.debug('diffDir',diffDir)
        let originalName = originalVersion.downloadPath.substring(originalVersion.downloadPath.lastIndexOf('/'))
        return common.createEmptyFolder(diffDir)
            .then(() => this.downloadVersionAndExtract(diffDir, originalVersion.downloadUrl, originalName))
            .then(originalFile => Promise.map(destVersions,v =>{
                log.debug('destVersions',v)
                let filename = v.downloadPath.substring(v.downloadPath.lastIndexOf('/'))
                return this.downloadVersionAndExtract(diffDir, v.downloadUrl,filename)
                    .then(oldVersionFile =>
                        this.generateOneDiffVersion(diffDir, originalVersion, originalFile, v, oldVersionFile)
                    );
            }))
            // .finally(() => common.deleteFolderSync(diffDir));

    }

    static generateOneDiffVersion(workDirectoryPath, originalVersion, originalFile, oldVersion, oldVersionFile) {
        log.debug('generateOneDiffVersion originalFile= ', originalFile)
        log.debug('generateOneDiffVersion oldVersionFile= ', oldVersionFile)
        let diffTmpFile = path.join(workDirectoryPath, originalVersion.versionName + "_" + oldVersion.versionName + "_" + oldVersion._id + ".patch");
        let diffPathKey = originalVersion.downloadPath.substring(0, originalVersion.downloadPath.lastIndexOf('/') + 1) + path.basename(diffTmpFile);

        return BSDiff.diff(oldVersionFile, originalFile, diffTmpFile, (result => {
            // log.debug('diffFile result', result);
            if (result != 100) {

            } else {
                return security.fileSha256(diffTmpFile).then((diffHash) =>
                    common.uploadFileToStorage(diffPathKey, diffTmpFile).then(() => {
                        let stats = fs.statSync(diffTmpFile);
                        let downloadUrl = common.getBlobDownloadUrl(diffPathKey);
                        let label = originalVersion.versionCode + "_" + oldVersion.versionCode;
                        let patchInfo = {
                            patchId: label+"_" + oldVersion._id,
                            label: label,
                            md5: diffHash,
                            sMd5: oldVersion.packageHash,
                            tMd5: originalVersion.packageHash,
                            size: stats.size,
                            downloadPath: diffPathKey,
                            downloadUrl: downloadUrl,
                            tip: "本次更新大小" + stats.size + "byte",
                        };
                        return Models.Version.findById(originalVersion._id).then(
                            version => {
                                if (!version.patchList) {
                                    version.patchList = [];
                                }
                                version.patchList.push(patchInfo)
                                return Models.Version.updateOne({_id: originalVersion._id}, {
                                        patchList: version.patchList,
                                    }
                                );
                            }
                        )
                    })
                )
            }
        }))
    }

    static downloadVersionAndExtract(workDirectoryPath,blobUrl,fileName ) {
        return common.createFileFromRequest(blobUrl, path.join(workDirectoryPath, fileName));
    }
}

