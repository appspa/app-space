import {
  request,
  summary,
  body,
  tags,
  middlewares,
  formData,
  responses,
  query,
  path
} from '../swagger';
import {responseWrapper} from "../utils/util";

import log4js from 'log4js'
const log = log4js.getLogger("cps:apps");
import models from "../model";
import common from "../utils/common";
import _ from "lodash";
const tag = tags(['CodePush']);

module.exports = class CodePushRouter {


  @request('get', '/api/v0.1/public/codepush/update_check')
  @summary("CodePush检查更新")
  @tag
  @query({
     deployment_key: {type: 'string', required: true},
     app_version: {type: 'string', required: true},
     label: {type: 'string', required: false},
     package_hash: {type: 'string', required: false},
     client_unique_id: {type: 'string', required: false},
    }
  )
  static async updateCheck(ctx, next) {
      let {deployment_key: appId, app_version, label, package_hash, client_unique_id} = ctx.validatedQuery;

      let versions = common.parseVersion(app_version);
      log.debug("versions",versions)
      let tempVersion = {};
      //正常
      let version = await models.Version.findOne({
          appId: appId,
          active: true,
          grayScaleLimit: false,
          minVersion: { "$lte": versions },
          maxVersion: { '$gt': versions }
      });

      //灰度版本
      let grayVersion = await models.Version.findOne({
              appId: appId,
              active: true,
              grayScaleLimit: true,
              minVersion: { "$lte": versions },
              maxVersion: { '$gt': versions },
              '$expr': {//大于等于
                  '$gte': ['$grayScaleSize', '$downloadCount']
              }
          }
      )

      if (grayVersion && version) {
          if (version.versionCode > version.grayVersion) {
              tempVersion = version;
          } else {
              tempVersion = grayVersion;
          }
      } else if (!grayVersion && version) {
          tempVersion = version;
      } else if (grayVersion && !version) {
          tempVersion = grayVersion;
      }
      //强制
      let forceVersion = await models.Version.findOne({
          appId: appId,
          active: true,
          updateMode: 'force',
          grayScaleLimit: true,
          minVersion: { "$lte": versions },
          maxVersion: { '$gt': versions },
      });

      if (tempVersion && forceVersion) {
          tempVersion.updateMode = 'force';
      }

      let rs = {
          packageId: 0,
          downloadURL: "",
          downloadUrl: "",
          description: "",
          isAvailable: false,
          isDisabled: true,
          isMandatory: false,
          appVersion: app_version,
          targetBinaryRange: "",
          packageHash: "",
          label: "",
          packageSize: 0,
          updateAppVersion: false,
          shouldRunBinaryVersion: false,
          rollout: 100
      };
      if (tempVersion && !_.eq(tempVersion.packageHash, package_hash)) {
          delete rs.packageId;
          delete rs.rollout;
          // rs.packageId = tempVersion._id;
          rs.targetBinaryRange = tempVersion.appVersion;
          rs.downloadUrl = rs.downloadURL = common.getBlobDownloadUrl(tempVersion.downloadPath);
          rs.description = tempVersion.changeLog;
          rs.isAvailable = tempVersion.active;
          rs.isDisabled = !tempVersion.active;
          rs.isMandatory = tempVersion.updateMode == 'force';
          rs.appVersion = tempVersion.appVersion;
          rs.packageHash = tempVersion.packageHash;
          rs.label = '';
          rs.packageSize = tempVersion.size;
          // rs.rollout = 100;
      }
      if (!tempVersion) {
          ctx.body = responseWrapper(false, "您已经是最新版本了");
      } else {
          ctx.body = responseWrapper( {"update_info": rs})
      }
  }

}

