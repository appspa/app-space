class Utils {
  // 验证邮箱
  valideEmail(email) {
    var re = /\S+@\S+\.\S+/
    return re.test(email)
  }
  // 验证手机
  validePhone(phone) {
    var re = /^1[0-9]{10}$/
    return re.test(phone)
  }
}

const instance = new Utils()
export default instance
