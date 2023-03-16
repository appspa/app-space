/**
 * Created by darren on 2018/4/2.
 */
import { postHttp, getHttp, deleteHttp } from '../basehttp'

// 修改用户信息
export function updateUserInfo(body) {
    let url = `api/user/modify`
    return postHttp(url, body)
}

// 修改用户密码
export function updateUserPassword(body) {
    let url = `api/user/password/modify`
    return postHttp(url, body)
}

// 获取用户消息列表
export function getUserMessage(page) {
    let params = {
        'page': page,
        'size': 10
    }
    let url = `api/messages`
    return getHttp(url, params)
}

// 获取消息总数和未读消息总数
export function getMessageCount() {
    let url = 'api/messages/count'
    return getHttp(url)
}

// 清空用户消息列表
export function clearMessage() {
    let url = `api/messages`
    return deleteHttp(url)
}

// 消息全部标记为已读
export function allRead() {
    let url = `api/messages/markread`
    return getHttp(url)
}



// 获取用户信息
export function getUserInfo() {
    let url = `api/user/info`
    return getHttp(url)
}


export function apiTokenActive() {
    let url = `api/user/apitoken`
    return postHttp(url)
}

// 获取全部账号 root 账号
export function getAccounts() {
  let url = `api/user/accounts`
  return getHttp(url)
}

// 重置密码 root 账号
export function resetPassword(userId,newPassword) {
  let url = `api/user/resetPassword`
  return postHttp(url,{userId,newPassword})
}
// 删除账号 root 账号
export function deleteUser(userId) {
  let url = `api/user/${userId}`
  return deleteHttp(url)
}
