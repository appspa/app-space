import StorageMgr from './StorageMgr'
import Vue from 'vue'

let vue = new Vue()

/// 根据域名管理APP
class AppMgr {
  static StorageKey = 'App';
  static StorageAppsKey = 'Apps';

  constructor () {
  }
  setCurApp (app) {
    StorageMgr.setItem(AppMgr.StorageKey, app)
  }
  getCurApp () {
    return StorageMgr.getItem(AppMgr.StorageKey, {})
  }

  setApps(apps){
    StorageMgr.setItem(AppMgr.StorageAppsKey, apps)
  }

  getApps(){
    return StorageMgr.getItem(AppMgr.StorageAppsKey, [])
  }

  clearApps() {
    StorageMgr.setItem(AppMgr.StorageAppsKey, [])
  }

  clearCurApp() {
    StorageMgr.setItem(AppMgr.StorageKey, [])
  }
}

const instance = new AppMgr()
export default instance
