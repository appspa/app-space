import StorageMgr from './StorageMgr'
import Vue from 'vue'

let vue = new Vue()

/// 根据域名管理token
class TokenMgr {
  static StorageKey = 'Token';

  constructor () {
    this.tokens = this.read()
  }

  read () {
    return StorageMgr.getItem(TokenMgr.StorageKey, [])
  }

  write (value) {
    StorageMgr.setItem(TokenMgr.StorageKey, value)
  }

  get (url) {
    let host = this.urlHost(url)
    for (let item of this.tokens) {
      if (item.url === host) {
        return item.token
      }
    }
    return null
  }

  add (url, token) {
    for (let item of this.tokens) {
      if (item.url === this.urlHost(url)) {
        this.tokens.splice(this.tokens.indexOf(item), 1)
        break
      }
    }
    this.tokens.push({
      url: this.urlHost(url),
      token: token
    })
    this.write(this.tokens)
    console.log(this.tokens)
  }

  clearTokens() {
    StorageMgr.setItem(TokenMgr.StorageKey, [])
  }

  /// 获得url对应的域名
  urlHost (url) {
    // let link = document.createElement('a')
    // link.href = url
    // return link.host
    return vue.axios.defaults.baseURL
  }

}

const instance = new TokenMgr()
export default instance
