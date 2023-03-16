/**
 * Created by darren on 2019/2/14.
 */
import {postHttp, getHttp, deleteHttp} from '../basehttp'

// 创建一个小程序
export function create(body) {
  let url = 'api/miniapps/create'
  return postHttp(url, body)
}

// 获取团队下小程序列表
export function getAppList(teamId) {
  let url = `api/miniapps/${teamId}`
  return getHttp(url)
}

// 小程序详情
export function getAppDetail(teamId, id) {
  let url = `api/miniapps/${teamId}/${id}`
  return getHttp(url)
}

// 删除应用
export function delectApp(teamId, id) {
  let url = `api/miniapps/${teamId}/${id}`
  return deleteHttp(url)
}

// 根据授权码或租户id添加一个下载二维码
export function getQrCode(body) {
  let url = 'api/miniapps/adddownloadcode'
  return postHttp(url, body)
}

// 删除一个下载二维码
export function deleteQrCode(body) {
  let url = 'api/miniapps/removedownloadcode'
  return postHttp(url, body)
}
