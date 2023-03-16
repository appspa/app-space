import StorageMgr from './StorageMgr'

const USERINFO_KEY = '__userInfo__'
const CURRENT_USERTRAM_KEY = '__userTeam__'


// 存储用户信息（登录）
export function saveUserInfo(user) {
  StorageMgr.setItem(USERINFO_KEY, user)
}

// 获取用户信息
export function getUserInfo() {
  let user = StorageMgr.getItem(USERINFO_KEY)
  return user
}

// 删除用户信息
export function removeUserInfo() {
  StorageMgr.setItem(USERINFO_KEY, '')
  StorageMgr.setItem(CURRENT_USERTRAM_KEY, '')
}

// 获取用户id
export function getUserId() {
  let user = StorageMgr.getItem(USERINFO_KEY)
  return user.userId
}


