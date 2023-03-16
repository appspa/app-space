import req from 'request'
import constants from 'constants'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// const appinfo = {"appName": "mi发布", 
//                  "packageName": 
//                  "com.evozi.injector", 
//                  "publisherNaaame": "",
//                  "versionName": "", 
//                  "category": 1, 
//                  "keyWords":"mi", 
//                  "desc": "mi", 
//                  "updateDesc": "mi"}
// const param = ['dzq1993@qq.com', 
//                '2fpfgpgcmrxhm12taietf2z71sokwqgxmpiya5xm169f3ks2kd', 
//                0, 
//                '../uploaded/apk/com.evozi.injector.apk', 
//                "../uploaded/icon/icon.png", 
//                 appinfo, 
//                 ["../uploaded/icon/screenshot1.png",
//                 "../uploaded/icon/screenshot2.png",
//                 "../uploaded/icon/screenshot3.png"]]
// mipusher.push(...param)

// mipusher.queryPackage("me.ddzq.finaly.app", "dzq1993@qq.com", "4eu8n1183i2kmhdiejbfvf5sdfhgemr8pnqr7w0ui9h80vh722")


// var request = req.defaults({'proxy':'http://localhost:8888'})
var request = req

// const KEY_ALGORITHM = 'RSA/NONE/PKCS1Padding'

// RSA最大加密明文大小 
var MAX_ENCRYPT_BLOCK = 117;

const miapiURL = 'http://api.developer.xiaomi.com/devupload'

// // RSA最大解密密文大小 
// var MAX_DECRYPT_BLOCK = 128;

export default class XMPublish {

  /// 小米查询分类接口
  static async queryCatetories() {
    return new Promise ((resolve, reject) => {
      request.post((miapiURL+'/dev/category'), (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          resolve(body)
          console.log(response)
        }
      })
    })
  }

  // 小米应用包查询接口
  static async queryPackage(packageName, userName, password) {
    let json = {'packageName': packageName, 'userName': userName}
    var formParams = {'RequestData': JSON.stringify(json)}
    let item = {'name': 'RequestData', 'hash': this.md5(JSON.stringify(json))}
    let sigs = []
    sigs.push(item)
    let sig = {'password': password, 'sig': sigs}
    formParams.SIG = this.encyptByPublicKey(JSON.stringify(sig), this.getPublicKey())
    let param = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'request'
      },
      url: (miapiURL+'/dev/query'),
      form: formParams
    }
  
    return new Promise ((resolve, reject) => {
      request(param, (error, response, body) => {
        if (error) {
          reject(error)
          console.log(error)
        } else {
          resolve(body)
          console.log(response)
        }
      })
    })
  }

  /**
   * 
   * @param {String} email 开发者email
   * @param {String} password 访问密码
   * @param {Number} synchroType 0：新增;1：更新;2：信息修改
   * @param {String} apkFile apk 路径
   * @param {String} iconFile icon 路径
   * @param appInfo 应该信息 
   *                {"appName": "mi发布",   // 应用名称  必选
                     "packageName": "com.evozi.injector"，// 包名      必选
                     "publisherName": "",  // 开发者名称  可选 默认使用开发者站注册的名称
                     "versionName": "",    // 版本名     可选
                     "category": 1,        // 分类       必选
                     "keyWords":"mi",      // 搜索关键字  空格分隔，新增时必选
                     "desc": "mi",         // 应用介绍，新增时必选
                     "updateDesc": "mi"}   // 更新说明，当为更新应用时必选
   * @param {Array} screenshots 应用截图
   */
  static async push(email, password, synchroType, apkFile, iconFile, appInfo, screenshots) {
    let body = {
      "userName": email,
      "appInfo": appInfo,
      "synchroType": synchroType
    }
    let item = {
      'name': 'RequestData',
      'hash': this.md5(JSON.stringify(body))
    }
    var items = []
    var form = {}
    items.push(item)

    if (apkFile) {
      var apk = {'name': 'apk', 'hash': this.md5file(path.resolve(__dirname, apkFile))}
      items.push(apk)
      form.apk = {
        value: fs.createReadStream(path.resolve(__dirname, apkFile)),
        options: {
          'filename': 'app.apk',
        }
      }
    }

    if (iconFile) {
      var icon = {'name': 'icon', 'hash': this.md5file(path.resolve(__dirname, iconFile))}
      items.push(icon)
      form.icon = {
        'value': fs.createReadStream(path.resolve(__dirname, iconFile)),
        'options': {
          'filename': 'icon.png',
        }
      }
    }

    if (screenshots && screenshots.length > 0) {
      for (var i = 0; i < screenshots.length; i++) {
        let screenshotName = 'screenshot_' + (i + 1)
        let screenshot = {
          'name': screenshotName,
          'hash': this.md5file(path.resolve(__dirname, screenshots[i]))
        }
        items.push(screenshot)
        form['screenshot_' + (i + 1)] = fs.createReadStream(path.resolve(__dirname, screenshots[i]))
      }
    }

    let sigJSON = {
      'password': password,
      'sig': items
    }

    form.RequestData = {
      value: JSON.stringify(body),
      options: {
        'Content-Type': 'text/plain; charset=UTF-8',
      }
    }
    let publickey = await this.getPublicKey()
    form.SIG = this.encyptByPublicKey(JSON.stringify(sigJSON), publickey)

    return new Promise ((resolve, reject) => {
      request.post({url: (miapiURL+'/dev/push'), formData: form}, (error, response, body) => {
        if (error) {
          reject(error)
          console.log(error)
        } else {
          resolve(body)
          console.log(response)
        }
      })
    })
  }

  /**
   * 
   * @param {String} value 需要MD5的字符串
   */
  static md5(value) {
    return crypto.createHash('md5').update(value).digest('hex')
  }

  /**
   * 
   * @param {String} file 需要md5的文件
   */
  static md5file(file) {
    var buffer = fs.readFileSync(file)
    var hash = crypto.createHash('md5')
    hash.update(buffer)
    var md5 = hash.digest('hex')
    console.log("文件的MD5是：%s", md5)
    return md5
  }

  /**
   * 
   * @param {String} cerFile 公钥路径
   */
  static getPublicKey() {
    var publicKey = fs.readFileSync(path.resolve(__dirname, './dev.api.public.cer')).toString();
    return publicKey
  }

  /**
   * 
   * @param str 需要别加密的字符串
   * @param publicKey 公钥
   */
  static encyptByPublicKey(str, publicKey) {
    // 加密信息用 Buffer 封装
    var buffer = new Buffer(str, 'utf-8')
    var inputLen = buffer.length
    var buffers = []
    var offset = 0
    var endOffset = MAX_ENCRYPT_BLOCK
    while (inputLen - offset > 0) {
      if (inputLen - offset > MAX_ENCRYPT_BLOCK) {
        var bufferTmp = buffer.slice(offset, endOffset)
        var result = crypto.publicEncrypt({key: publicKey, padding: constants.RSA_PKCS1_PADDING}, bufferTmp)
        buffers.push(result)
      } else {
        var bufferTmp = buffer.slice(offset, inputLen)
        var result = crypto.publicEncrypt({key: publicKey, padding: constants.RSA_PKCS1_PADDING}, bufferTmp)
        buffers.push(result)
      }
      //分段加密
      offset += MAX_ENCRYPT_BLOCK
      endOffset += MAX_ENCRYPT_BLOCK
    }
    // var result = Buffer.concat(buffers)
    var hexStr = Buffer.concat(buffers).toString('hex')
    console.log(hexStr)
    return hexStr
  }

}