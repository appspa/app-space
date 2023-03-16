/**
 * Created by darren on 2018/3/15.
 */
import {getHttp, deleteHttp, postHttp} from '../basehttp'
// 创建应用
export function createApp(data) {
  return postHttp(`api/apps/create`, data)
}
// 获取应用列表
export function getAppList() {
  let url = `api/apps`
  return getHttp(url)
}

// 获取应用详情
export function getAppDetail(appId) {
  let url = `api/apps/${appId}`;
  return getHttp(url)
}

// 获取应用的版本列表
export function getAppVersionList(id, page) {
  let params = {
    'page': page, 'size': 20
  }
  let url = `api/apps/${id}/versions`
  return getHttp(url, params)
}

// 获取某个应用的某个版本详情
export function getAppVersionDetail( id, versionId) {
  let url = `api/apps/${id}/versions/${versionId}`
  return getHttp(url)
}
// 删除应用
export function deleteApp( appId) {
  let url = `api/apps/${appId}`
  return deleteHttp(url)
}

// 通过短链接获取应用最新版本
export function getAppInfoByShortUrl(appShortUrl,password) {
  let body = {
    'appShortUrl': appShortUrl,
    'password': password,
  }
  let url = `api/app/shortUrl`
  return postHttp(url, body)
}

// 发布应用
export function releaseApp(id, versionId, active) {
  let body = {
    'versionId': versionId,
    'active': active,
  }
  let url = `api/apps/${id}/release`
  return postHttp(url, body)
}
// 删除某个版本
export function delectAppVersion( appId, versionId) {
  let url = `api/apps/${appId}/versions/${versionId}`
  return deleteHttp(url)
}

// 更新应用设置
export function updateAppSetting( appId, body) {
  let url = `api/apps/${appId}/profile`
  return postHttp(url, body)
}


// 更新日志
export function updateNote( id, versionId, body) {
  let url = `api/apps/${id}/${versionId}/profile`
  return postHttp(url, body)
}

// 统计下载次数
export function downloadedCount(versionId) {
  let url = `api/count/${versionId}`
  return getHttp(url)
}
