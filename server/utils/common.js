'use strict';
import formidable from "formidable";

import Promise from'bluebird'
import fs from "fs"
import fsextra from "fs-extra"
import extract from 'extract-zip'
import config from '../config'
import _ from 'lodash'
import validator from 'validator'
import qiniu from "qiniu"
import upyun from 'upyun'
import AppError from '../utils/app-error'
import jschardet from "jschardet"
import log4js from 'log4js'
import path from 'path'
import AppInfoParser from "app-info-parser";
const log = log4js.getLogger("cps:utils:common");

let localStorageDir = path.join(__dirname,"../../", config.storageDir);

export default class common {

    static initStorageDir() {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(localStorageDir)) {
                fs.mkdirSync(localStorageDir, (err) => {});
                try {
                    log.debug('checking storageDir fs.W_OK | fs.R_OK');
                    fs.accessSync(localStorageDir, fs.W_OK | fs.R_OK);
                    log.debug('storageDir fs.W_OK | fs.R_OK is ok');
                    resolve(localStorageDir);
                } catch (e) {
                    log.error(e);
                    throw e;
                    reject(e)
                }
            }else {
                resolve(localStorageDir);
            }
        })
    }

    static getStorageDir(){
        return localStorageDir
    }

    static parseIpaApk(platform,filePath) {
        if (platform == 'android') {
            return this.parseApk(filePath)
        }else if (platform == 'ios') {
            return this.parseIpa(filePath)
        }else {
            throw new AppError.AppError('上传文件格式正确')
        }
    }
    static parseIpa(filePath) {
        console.log('parseIpa = ',filePath)
        const parser = new AppInfoParser(filePath);
        return new Promise((resolve, reject) => {
            parser.parse().then(result => {
                console.log('app info ----> ', result);
                console.log('icon base64 ----> ', result.icon);
                let info = {};
                info.platform = 'ios';
                info.icon = result.icon;
                info.bundleId = result.CFBundleIdentifier;
                info.bundleName = result.CFBundleName;
                info.appName = result.CFBundleDisplayName;
                info.versionName = result.CFBundleShortVersionString;
                info.versionCode = result.CFBundleVersion;
                info.iconName = result.CFBundleIcons ? result.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconName : '';
                try {
                    const environment = result.mobileProvision.Entitlements['aps-environment'];
                    const active = result.mobileProvision.Entitlements['beta-reports-active'];
                    if (environment === 'production') {
                        info.appLevel = active ? 'appstore' : 'enterprise';
                    } else {
                        info.appLevel = 'develop';
                    }
                } catch (err) {
                    info.appLevel = 'develop';
                    // reject("应用未签名,暂不支持")
                }
                resolve(info);
            }).catch(err => {
                console.log('err ----> ', err)
                reject(err);
            });
        });
    }

    static parseApk(filePath) {
        const parser = new AppInfoParser(filePath);
        return new Promise((resolve, reject) => {
            parser.parse().then(result => {
                // console.log('app info ----> ', result)
                // console.log('icon base64 ----> ', result.icon)
                // console.log('====================================', JSON.stringify(result));
                let label = undefined;

                if (result.application && result.application.label && result.application.label.length > 0) {
                    label = result.application.label[0];
                }

                if (label) {
                    label = label.replace(/'/g, '');
                }
                let appName = (result['application-label'] || result['application-label-zh-CN'] || result['application-label-es-US'] ||
                    result['application-label-zh_CN'] || result['application-label-es_US'] || label || 'unknown');

                let info = {
                    'appName': appName.replace(/'/g, ''),
                    'versionCode': Number(result.versionCode),
                    'bundleId': result.package,
                    'versionName': result.versionName,
                    'platform': 'android',
                    'icon' : result.icon
                };
                resolve(info);
            }).catch(err => {
                console.log('err ----> ', err);
                reject(err);
            });
        });
    }



    static mapInstallUrl(appId, versionId) {
        return `itms-services://?action=download-manifest&url=${config.baseUrl}/api/plist/${appId}/${versionId}`;
    }

    static createEmptyFile (filePath) {
        return new Promise((resolve, reject) => {
            log.debug(`createEmptyFile Create file ${filePath}`);
            return common.deleteFolder(filePath)
                .then((data) => {
                    fsextra.mkdir(filePath, (err) => {
                        if (err) {
                            log.error(err);
                            reject(new AppError.AppError(err.message));
                        } else {
                            resolve(filePath);
                        }
                    });
                });
        });
    };

    static createEmptyFolder (folderPath) {
        return new Promise((resolve, reject) => {
            log.debug(`createEmptyFolder Create dir ${folderPath}`);
            return common.deleteFolder(folderPath)
                .then((data) => {
                    fsextra.mkdirs(folderPath, (err) => {
                        if (err) {
                            log.error(err);
                            reject(new AppError.AppError(err.message));
                        } else {
                            resolve(folderPath);
                        }
                    });
                });
        });
    };

    static detectIsTextFile (filePath) {
        let fd = fs.openSync(filePath, 'r');
        let buffer = new Buffer(4096);
        fs.readSync(fd, buffer, 0, 4096, 0);
        fs.closeSync(fd);
        let rs = jschardet.detect(buffer);
        log.debug('detectIsTextFile:', filePath, rs);
        if (rs.confidence == 1) {
            return true;
        }
        return false;
    };

    static parseFormData  (req) {
        return new Promise((resolve, reject) => {
            let form = new formidable.IncomingForm();
            form.maxFieldsSize = 200 * 1024 * 1024;
            form.parse(req, (err, fields, files) => {
                if (err) {
                    log.error('parseFormData error:', err);
                    reject({});
                } else {
                    // log.debug('parseReqFile files :', files);
                    resolve({fields, files});
                }
            });
        });
    };

 static parseVersion  (versionNo) {
    let version = '0';
    let data = null;
    if (data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/)) {
      // "1.2.3"
      version = data[1] + _.padStart(data[2], 5, '0') + _.padStart(data[3], 10, '0');
    } else if (data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5})$/)) {
      // "1.2"
      version = data[1] + _.padStart(data[2], 5, '0') + _.padStart('0', 10, '0');
    }
    return version;
  };

 static validatorVersion  (versionNo) {
    log.debug("versionNo", versionNo)
    let flag = false;
    let min = '0';
    let max = '9999999999999999999';
    let data = null;
    if (versionNo == "*") {
      // "*"
      flag = true;
    } else if (data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/)) {
      // "1.2.3"
      flag = true;
      min = data[1] + _.padStart(data[2], 5, '0') + _.padStart(data[3], 10, '0');
      max = data[1] + _.padStart(data[2], 5, '0') + _.padStart((parseInt(data[3]) + 1), 10, '0');
    } else if (data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5})(\.\*){0,1}$/)) {
      // "1.2" "1.2.*"
      flag = true;
      min = data[1] + _.padStart(data[2], 5, '0') + _.padStart('0', 10, '0');
      max = data[1] + _.padStart((parseInt(data[2]) + 1), 5, '0') + _.padStart('0', 10, '0');
    } else if (data = versionNo.match(/^\~([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/)) {
      //"~1.2.3"
      flag = true;
      min = data[1] + _.padStart(data[2], 5, '0') + _.padStart(data[3], 10, '0');
      max = data[1] + _.padStart((parseInt(data[2]) + 1), 5, '0') + _.padStart('0', 10, '0');
    } else if (data = versionNo.match(/^\^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/)) {
      //"^1.2.3"
      flag = true;
      min = data[1] + _.padStart(data[2], 5, '0') + _.padStart(data[3], 10, '0');
      max = _.toString((parseInt(data[1]) + 1)) + _.padStart(0, 5, '0') + _.padStart('0', 10, '0');
    } else if (data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})\s?-\s?([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/)) {
      // "1.2.3 - 1.2.7"
      flag = true;
      min = data[1] + _.padStart(data[2], 5, '0') + _.padStart(data[3], 10, '0');
      max = data[4] + _.padStart(data[5], 5, '0') + _.padStart((parseInt(data[6]) + 1), 10, '0');
    } else if (data = versionNo.match(/^>=([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})\s?<([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/)) {
      // ">=1.2.3 <1.2.7"
      flag = true;
      min = data[1] + _.padStart(data[2], 5, '0') + _.padStart(data[3], 10, '0');
      max = data[4] + _.padStart(data[5], 5, '0') + _.padStart(data[6], 10, '0');
    }
    return [flag, min, max];
  };

  static createFileByImageData  (filePath, imgData) {
      return new Promise(async (resolve, reject) => {
          let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
          let dataBuffer = new Buffer(base64Data, 'base64');
          await fs.writeFileSync(filePath, dataBuffer)
          resolve(filePath)
      })
  }

  static createFileByString  (filePath, string) {
        return new Promise(async (resolve, reject) => {
            await fs.writeFileSync(filePath, string)
            resolve(filePath)
        })
    }
  static createFileFromRequest  (url, filePath) {
    return new Promise((resolve, reject) => {
      fs.exists(filePath, function (exists) {
        if (!exists) {
          let request = require('request');
          log.debug(`createFileFromRequest url:${url}`)
          request(url).on('error', function (error) {
            reject(error);
          })
              .on('response', function (response) {
                if (response.statusCode == 200) {
                  let stream = fs.createWriteStream(filePath);
                  response.pipe(stream);
                  stream.on('close', function () {
                    resolve(filePath);
                  });
                  stream.on('error', function (error) {
                    reject(error)
                  })
                } else {
                  reject({message: 'request fail'})
                }
              });
        } else {
          resolve(null);
        }
      });
    });
  };

 static copySync  (sourceDst, targetDst) {
    return fsextra.copySync(sourceDst, targetDst, {overwrite: true});
  };

 static copy  (sourceDst, targetDst) {
    return new Promise((resolve, reject) => {
      fsextra.copy(sourceDst, targetDst, {overwrite: true}, function (err) {
        if (err) {
          log.error(err);
          reject(err);
        } else {
          log.debug(`copy success sourceDst:${sourceDst} targetDst:${targetDst}`);
          resolve();
        }
      });
    });
  };

 static move  (sourceDst, targetDst) {
    return new Promise((resolve, reject) => {
      fsextra.move(sourceDst, targetDst, {overwrite: true}, function (err) {
        if (err) {
          log.error(err);
          reject(err);
        } else {
          log.debug(`move success sourceDst:${sourceDst} targetDst:${targetDst}`);
          resolve();
        }
      });
    });
  };

 static deleteFolder  (folderPath) {
    return new Promise((resolve, reject) => {
      fsextra.remove(folderPath, function (err) {
        if (err) {
          log.error(err);
          reject(err);
        } else {
          log.debug(`deleteFolder delete ${folderPath} success.`);
          resolve(null);
        }
      });
    });
  };

 static deleteFolderSync  (folderPath) {
    return fsextra.removeSync(folderPath);
  };



 static createEmptyFolderSync  (folderPath) {
    common.deleteFolderSync(folderPath);
    return fsextra.mkdirsSync(folderPath);
  };

 static unzipFile  (zipFile, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        log.debug(`unzipFile check zipFile ${zipFile} fs.R_OK`);
        fs.accessSync(zipFile, fs.R_OK);
        log.debug(`Pass unzipFile file ${zipFile}`);
      } catch (e) {
        log.error(e);
        return reject(new AppError.AppError(e.message))
      }
      extract(zipFile, {dir: outputPath}, function (err) {
        if (err) {
          log.error(err);
          reject(new AppError.AppError(`it's not a zipFile`))
        } else {
          log.debug(`unzipFile success`);
          resolve(outputPath);
        }
      });
    });
  };

 static getUploadTokenQiniu  (mac, bucket, key) {
    let options = {
      scope: bucket + ":" + key
    }
    let putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
  };

    static uploadFileToStorage(key, filePath) {
        // console.log('config.common',config)
        let storageType = config.storageType
        if (storageType === 'local') {
            return common.uploadFileToLocal(key, filePath);
        } else if (storageType === 's3') {
            return common.uploadFileToS3(key, filePath);
        } else if (storageType === 'oss') {
            return common.uploadFileToOSS(key, filePath);
        } else if (storageType === 'qiniu') {
            return common.uploadFileToQiniu(key, filePath);
        } else if (storageType === 'upyun') {
            return common.uploadFileToUpyun(key, filePath);
        } else if (storageType === 'tencentcloud') {
            return common.uploadFileToTencentCloud(key, filePath);
        }
        throw new AppError.AppError(`${storageType} storageType does not support.`);
    };

 static uploadFileToLocal(key, filePath) {
    return new Promise((resolve, reject) => {
      log.debug(`uploadFileToLocal ==`, key, filePath);
      let storageDir = this.getStorageDir()
      if (!storageDir) {
        throw new AppError.AppError('please set config local storageDir');
      }
      if (key.length < 3) {
        log.debug(`generate key is too short, key value:${key}`);
        throw new AppError.AppError('generate key is too short.');
      }
      try {
        log.debug(`uploadFileToLocal check directory ${storageDir} fs.R_OK`);
        fs.accessSync(storageDir, fs.W_OK);
        log.debug(`uploadFileToLocal directory ${storageDir} fs.R_OK is ok`);
      } catch (e) {
        log.error(e);
        throw new AppError.AppError(e.message);
      }
      // let subDir = key.substr(0, 2).toLowerCase();
      let finalDir = storageDir
      let fileName = path.join(storageDir, key);
      if (fs.existsSync(fileName)) {
        return resolve(key);
      }
      let stats = fs.statSync(storageDir);
      if (!stats.isDirectory()) {
        let e = new AppError.AppError(`${storageDir} must be directory`);
        log.error(e);
        throw e;
      }
      if (!fs.existsSync(`${finalDir}`)) {
        fs.mkdirSync(`${finalDir}`);
        log.debug(`uploadFileToLocal mkdir:${finalDir}`);
      }
      try {
        fs.accessSync(filePath, fs.R_OK);
      } catch (e) {
        log.error(e);
        throw new AppError.AppError(e.message);
      }
      stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        let e = new AppError.AppError(`${filePath} must be file`);
        log.error(e);
        throw e;
      }
      fsextra.copy(filePath, fileName, (err) => {
        if (err) {
          log.error(new AppError.AppError(err.message));
          return reject(new AppError.AppError(err.message));
        }
        log.debug(`uploadFileToLocal copy file ${key} success.`);
        resolve(key);
      });
    });
  };

    static getBlobDownloadUrl(blobUrl) {
        let fileName = blobUrl;
        let storageType = config.storageType
        let downloadUrl = _.get(config, `${storageType}.downloadUrl`);
        if (!validator.isURL(downloadUrl)) {
            let e = new AppError.AppError(`Please config ${storageType} in config.js`);
            log.error(e);
            throw e;
        }
        return `${downloadUrl}/${fileName}`
    };

    // static getBlobDownloadUrl1(blobUrl) {
    //     let fileName = blobUrl;
    //     let storageType = config.storageType
    //     let downloadUrl = config.baseUrl
    //     if (storageType === 'local') {
    //         fileName = blobUrl.substr(0, 2).toLowerCase() + '/' + blobUrl;
    //     }
    //     if (!validator.isURL(downloadUrl)) {
    //         let e = new AppError.AppError(`Please config ${storageType} in config.js`);
    //         log.error(e);
    //         throw e;
    //     }
    //     return `${downloadUrl}/${fileName}`
    // };


 static uploadFileToQiniu  (key, filePath) {
    return new Promise((resolve, reject) => {
      let accessKey = _.get(config, "qiniu.accessKey");
      let secretKey = _.get(config, "qiniu.secretKey");
      let bucket = _.get(config, "qiniu.bucketName", "");
      let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
      let conf = new qiniu.conf.Config();
      let bucketManager = new qiniu.rs.BucketManager(mac, conf);
      bucketManager.stat(bucket, key, (respErr, respBody, respInfo) => {
        if (respErr) {
          log.debug('uploadFileToQiniu file stat:', respErr);
          return reject(new AppError.AppError(respErr.message));
        }
        log.debug('uploadFileToQiniu file stat respBody:', respBody);
        log.debug('uploadFileToQiniu file stat respInfo:', respInfo);
        if (respInfo.statusCode == 200) {
          resolve(respBody.hash);
        } else {
          try {
            let uploadToken = common.getUploadTokenQiniu(mac, bucket, key);
          } catch (e) {
            return reject(new AppError.AppError(e.message));
          }
          let formUploader = new qiniu.form_up.FormUploader(conf);
          let putExtra = new qiniu.form_up.PutExtra();
          formUploader.putFile(uploadToken, key, filePath, putExtra, (respErr, respBody, respInfo) => {
            if (respErr) {
              log.error('uploadFileToQiniu putFile:', respErr);
              // 上传失败， 处理返回代码
              return reject(new AppError.AppError(JSON.stringify(respErr)));
            } else {
              log.debug('uploadFileToQiniu putFile respBody:', respBody);
              log.debug('uploadFileToQiniu putFile respInfo:', respInfo);
              // 上传成功， 处理返回值
              if (respInfo.statusCode == 200) {
                return resolve(respBody.hash);
              } else {
                return reject(new AppError.AppError(respBody.error));
              }
            }
          });
        }
      });
    });
  };

 static uploadFileToUpyun  (key, filePath) {
    let serviceName = _.get(config, "upyun.serviceName");
    let operatorName = _.get(config, "upyun.operatorName");
    let operatorPass = _.get(config, "upyun.operatorPass", "");
    let storageDir = _.get(config, "upyun.storageDir", "");
    let service = new upyun.Service(serviceName, operatorName, operatorPass);
    let client = new upyun.Client(service);
    return (
        new Promise((resolve, reject) => {
          client.makeDir(storageDir).then(result => {
            if (!storageDir) {
              reject(new AppError.AppError('Please config the upyun remoteDir!'));
              return;
            }
            let remotePath = storageDir + '/' + key;
            log.debug('uploadFileToUpyun remotePath:', remotePath);
            log.debug('uploadFileToUpyun mkDir result:', result);
            client.putFile(remotePath, fs.createReadStream(filePath)).then(data => {
              log.debug('uploadFileToUpyun putFile response:', data);
              if (data) {
                resolve(key)
              } else {
                log.debug('uploadFileToUpyun putFile failed!', data);
                reject(new AppError.AppError('Upload file to upyun failed!'));
              }
            }).catch(e1 => {
              log.debug('uploadFileToUpyun putFile exception e1:', e1);
              reject(new AppError.AppError(JSON.stringify(e1)));
            })
          }).catch(e => {
            log.debug('uploadFileToUpyun putFile exception e:', e);
            reject(new AppError.AppError(JSON.stringify(e)));
          });
        })
    );
  };

 static uploadFileToS3  (key, filePath) {
    let AWS = require('aws-sdk');
     log.debug('uploadFileToS3:', key, filePath);
    return (
        new Promise((resolve, reject) => {
          AWS.config.update({
            accessKeyId: _.get(config, 's3.accessKeyId'),
            secretAccessKey: _.get(config, 's3.secretAccessKey'),
            // sessionToken: _.get(config, 's3.sessionToken'),
            region: _.get(config, 's3.region')
          });
          let s3 = new AWS.S3({
            params: {Bucket: _.get(config, 's3.bucketName')}
          });
          fs.readFile(filePath, (err, data) => {
              log.debug('uploadFileToS3: err:', err);
              s3.upload({
                  Key: key,
                  Body: data,
                  ACL: 'public-read',
              }, (err, response) => {
                  log.debug('response.err',err);
                  if (err) {
                      reject(new AppError.AppError(JSON.stringify(err)));
                  } else {
                      resolve("response.ETag");
                  }

              });
          });
        })
    );
  };

 static uploadFileToOSS  (key, filePath) {
    let ALY = require('aliyun-sdk');
    let ossStream = require('aliyun-oss-upload-stream')(new ALY.OSS({
      accessKeyId: _.get(config, 'oss.accessKeyId'),
      secretAccessKey: _.get(config, 'oss.secretAccessKey'),
      endpoint: _.get(config, 'oss.endpoint'),
      apiVersion: '2013-10-15',
    }));
    if (!_.isEmpty(_.get(config, 'oss.prefix', ""))) {
      key = `${_.get(config, 'oss.prefix')}/${key}`;
    }
    let upload = ossStream.upload({
      Bucket: _.get(config, 'oss.bucketName'),
      Key: key,
    });

    return new Promise((resolve, reject) => {
      upload.on('error', (error) => {
        log.debug("uploadFileToOSS", error);
        reject(error);
      });

      upload.on('uploaded', (details) => {
        log.debug("uploadFileToOSS", details);
        resolve(details.ETag);
      });
      fs.createReadStream(filePath).pipe(upload);
    });
  };

 static uploadFileToTencentCloud  (key, filePath) {
    return new Promise((resolve, reject) => {
      let COS = require('cos-nodejs-sdk-v5');
      let cosIn = new COS({
        SecretId: _.get(config, 'tencentcloud.accessKeyId'),
        SecretKey: _.get(config, 'tencentcloud.secretAccessKey')
      });
        // cosIn.sliceUploadFile({
        //     Bucket: _.get(config, 'tencentcloud.bucketName'),
        //     Region: _.get(config, 'tencentcloud.region'),
        //     Key: key,
        //     FilePath: filePath
        // }, function (err, data) {
        //     log.debug("uploadFileToTencentCloud", err, data);
        //     if (err) {
        //         reject(new AppError.AppError(JSON.stringify(err)));
        //     } else {
        //         resolve(data.Key);
        //     }
        // });
        cosIn.putObject({
            Bucket: _.get(config, 'tencentcloud.bucketName'),
            Region: _.get(config, 'tencentcloud.region'),
            Key: key,
            Body: fs.createReadStream(filePath),
            ContentLength: fs.statSync(filePath).size,
            onProgress: function(progressData) {
                console.log(JSON.stringify(progressData));
            }
        }, function (err, data) {
            log.debug("uploadFileToTencentCloud", err, data);
            if (err) {
                reject(new AppError.AppError(JSON.stringify(err)));
            } else {
                resolve(data.Key);
            }
        });
    });
  }


    static diffCollectionsSync  (collection1, collection2) {
        let diffFiles = [];
        let collection1Only = [];
        let newCollection2 = Object.assign({}, collection2);
        if (collection1 instanceof Object) {
            for (let key of Object.keys(collection1)) {
                if (_.isEmpty(newCollection2[key])) {
                    collection1Only.push(key);
                } else {
                    if (!_.eq(collection1[key], newCollection2[key])) {
                        diffFiles.push(key);
                    }
                    delete newCollection2[key];
                }
            }
        }
        return {diff: diffFiles, collection1Only: collection1Only, collection2Only: Object.keys(newCollection2)}
    };
}
