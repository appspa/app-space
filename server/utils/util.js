const fs = require('fs')
const cp = require('child_process')

const readFile = (path, opts = 'utf8') => new Promise((res, rej) => {
    fs.readFile(path, opts, (err, data) => {
        if (err)
            rej(err)
        else
            res(data)
    })
})

const writeFile = (path, data, opts = 'utf8') => new Promise((res, rej) => {
    fs.writeFile(path, data, opts, (err) => {
        if (err)
            rej(err)
        else
            res()
    })
})

const responseWrapper = function wrapper(success, message, data) {
    if (arguments.length === 3) {
        return { 'success': success, 'message': message, 'data': data };
    }
    //只传2个参数,必须传是否成功 和 返回的提示信息
    if (arguments.length === 2) {
        return { 'success': success, 'message': message };
    };
    //如果只传一个参数 则默认当作请求成功 返回正常数据
    if (arguments.length === 1) {
        return { 'success': true, 'data': arguments[0] };
    }
    return {}
}

function exec(command, options = {
    log: false,
    cwd: process.cwd()
}) {
    if (options.log)
        console.log(command)

    return new Promise((done, failed) => {
        cp.exec(command, {
            options
        }, (err, stdout, stderr) => {
            if (err) {
                err.stdout = stdout
                err.stderr = stderr
                failed(err)
                return
            }
            done({ stdout, stderr })
        })
    })
}

const getIp = (req) => new Promise((resolve) => {
    var ip = req.headers['x-forwarded-for'] ||
        req.headers['Proxy-Client-IP'] ||
        req.headers['WL-Proxy-Client-IP'] ||
        req.headers['HTTP_CLIENT_IP'] ||
        req.headers['HTTP_X_FORWARDED_FOR'] ||
        req.remoteAddress ||
        req.ip.match(/\d+.\d+.\d+.\d+/)[0]
    resolve(ip)
})


module.exports = {
    responseWrapper,
    readFile,
    writeFile,
    exec,
    getIp
}