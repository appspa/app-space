export default class StorageMgr {

  static getItem (key, defaultValue) {
    let value = localStorage.getItem(key)
    if (value) {
      return JSON.parse(value)
    } else if (defaultValue) {
      return defaultValue
    }
    return null
  }

  static setItem (key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

}
