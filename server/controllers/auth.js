'use strict';

import {request, summary, tags, body, description, path} from '../swagger';
import User  from "../model/user";
import { responseWrapper } from "../utils/util";
import bcrypt from "bcrypt"
import Fawn from "fawn"
import Mail from '../utils/mail'
import config from '../config'
import Ldap from '../utils/ldap'
import crypto from 'crypto'
import verify from "../utils/verify";
import models from "../model";

const jwt = require('jsonwebtoken');

const tag = tags(['认证']);

let loginSchema = {
    username: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    }
}

let registerSchema = {
    username: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    },
    email: {
        type: 'string',
        required: true
    }
}

module.exports = class AuthRouter {

    @request('post', '/api/user/apitoken')
    @summary('生成apitoken')
    @tag
    static async apiToken(ctx, next) {
        let _user = ctx.state.user.data
        let user = await User.findOne({ _id: _user._id })
        if (user) {
            // var key = await bcrypt.hash(user.email, 10)
            let md5 = crypto.createHash('md5')
            let salt = user.email + Date()
            let key = md5.update(user.email + salt).digest('hex')
            await User.findByIdAndUpdate(user._id, { apiToken: key })
            ctx.body = responseWrapper(key)
        } else {
            throw new Error('授权失败，请重新登录后重试')
        }
    }

    @request('post', '/api/user/login')
    @summary('登录')
    @tag
    @body(loginSchema)
    static async login(ctx, next) {
        const { body } = ctx.request
        console.log(body)
            // 判断是否开放 ldap，如果开放ldap,
            // 根据ldap的用户信息生成新用户
        if (config.openLdap) {
            // let auth = await Ldap.auth(body.username, body.password)
            let ldapUser = await Ldap.auth(body.username, body.password).catch((error) => {
                console.log(error)
            })
            let user = await User.findOne({ username: body.username });
            if (ldapUser && ((!user) || user.username !== ldapUser.name)) {
                console.log('user' + ldapUser)
                let password = await bcrypt.hash(body.password, 10)
                let newUser = new User({ username: ldapUser.name, password: password, email: ldapUser.mail });

                let task = Fawn.Task();
                let result = await task
                    .save(newUser)
                    .run({ useMongoose: true });
            }
        }

        const user = await User.findOne({ username: body.username });
        if (user) {
            let valide = await bcrypt.compare(body.password, user.password)
            if (!valide) {
                throw new Error('用户名或密码错误')
            }
        } else {
            throw new Error('用户名或密码错误')
        }
        user.token = jwt.sign({
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                permission: user.permission
            },
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        }, config.secret)
        ctx.body = responseWrapper(user)
    }

    @request('post', '/api/user/register')
    @summary('注册用户')
    @body(registerSchema)
    @tag
    static async register(ctx, next) {
        let { body } = ctx.request;
        if (!config.allowRegister ) {
            if (ctx.state.user && ctx.state.user.data && ctx.state.user.data.permission == 'root') {
                //管理员可以注册
            }else {
                throw new Error("不允许注册用户,联系管理员.");
            }
        }
        body.password = await bcrypt.hash(body.password, 10) // 10是 hash加密的级别, 默认是10，数字越大加密级别越高
        let user = await User.find({ username: body.username });
        if (!user.length) {
            let newUser = new User(body);

            let task = Fawn.Task();
            let result = await task
                .save(newUser)
                .run({ useMongoose: true });
            ctx.body = responseWrapper(newUser)
        } else {
            throw new Error("用户已存在")
        }
    }

    static async initAdminAccount() {
        let username = config.adminAccount;
        let adminPassword = config.adminPassword;
        if (!username || !adminPassword) {
            console.error('init admin',"未设置初始化账号")
        }
        let password = await bcrypt.hash(config.adminPassword, 10); // 10是 hash加密的级别, 默认是10，数字越大加密级别越高
        let user = await User.find({ username: username });
        if (!user.length) {
            let newUser = new User({
                username:username,
                password:password,
                permission: 'root',
            });
            let task = Fawn.Task();
            await task.save(newUser)
                .run({ useMongoose: true });
            console.log('init admin',"成功...")
        } else {
            console.log('init admin',"用户已存在")
        }
    }

    @request('post', '/api/user/password/modify')
    @summary('修改用户密码')
    @body({
        oldpwd: {
            type: 'string',
            require: true
        },
        newpwd: {
            type: 'string',
            require: true
        }
    })
    @tag
    static async modifyPassword(ctx, next) {
        let user = ctx.state.user.data;
        let body = ctx.request.body;
        let userData = await User.findById(user._id, "password")
        if (!userData) {
            throw new Error("用户不存在");
        }
        let valide = await bcrypt.compare(body.oldpwd, userData.password);
        if (!valide) {
            throw new Error("密码错误");
        }
        body.password = await bcrypt.hash(body.newpwd, 10); // 10是 hash加密的级别, 默认是10，数字越大加密级别越高
        await User.findByIdAndUpdate(user._id, { password: body.password })
        ctx.body = responseWrapper(true, "密码修改成功")
    }

    @request('post', '/api/user/modify')
    @summary('修改用户资料')
    @body({
        mobile: {
            type: 'string'
        },
        qq: {
            type: 'string'
        },
        company: {
            type: 'string'
        },
        career: {
            type: 'string'
        }
    })
    @tag
    static async changeUserInfo(ctx, next) {
        let user = ctx.state.user.data
        let body = ctx.request.body
        let userData = await User.findById(user._id, "username");
        if (!userData) {
            throw new Error("用户不存在");
        }
        await User.updateOne({
            username: user.username
        }, {
            mobile: body.mobile,
            qq: body.qq,
            company: body.company,
            career: body.career
        })
        ctx.body = responseWrapper(true, "用户资料修改成功")
    }

    @request('get', '/api/user/info')
    @summary('获取用户资料')
    @tag
    static async getUserInfo(ctx, next) {
        let user = ctx.state.user.data
        let userInfo = await User.findById(user._id, "-password");
        if (!userInfo) {
            throw new Error("用户不存在");
        }
        ctx.body = responseWrapper(userInfo)
    }

    // @request('get', '/api/user/collaborators')
    // @summary('获取用户团队成员列表')
    // @tag
    // static async getUserCollaborators(ctx, next) {
    //     let user = ctx.state.user.data
    //     let collaborators = await Collaborator.findById(user._id, "teams");
    //     if (!user) {
    //         throw new Error("用户不存在");
    //     }
    //     ctx.body = responseWrapper(user)
    // }
    //
    // @request('post', '/api/user/resetPassword')
    // @summary('通过邮箱重置密码')
    // @tag
    // @body({
    //     email: {
    //         type: 'string',
    //         required: true
    //     }
    // })
    // static async resetPassword(ctx, next) {
    //     let body = ctx.request.body
    //
    //     let user = await User.findOne({
    //         email: body.email
    //     }, "-password");
    //     if (!user) {
    //         throw new Error("邮箱有误,没有该用户");
    //     }
    //
    //     let newPassword = Math
    //         .random()
    //         .toString(36)
    //         .substring(2, 5) + Math
    //         .random()
    //         .toString(36)
    //         .substring(2, 5);
    //     let hashPassword = await bcrypt.hash(newPassword, 10); // 10是 hash加密的级别, 默认是10，数字越大加密级别越高
    //     await User.findByIdAndUpdate(user._id, { password: hashPassword })
    //     Mail.send([body.email], "AppSpace密码重置邮件", `您的密码已重置${newPassword}`)
    //     ctx.body = responseWrapper("密码已重置,并通过邮件发送到您的邮箱")
    // }

    @request('get', '/api/user/accounts')
    @summary('获取全部账号')
    @tag
    static async geAccounts(ctx, next) {
        let user = ctx.state.user.data;
        let users = [];
        console.log('user', user);
        if (user.permission == 'root') {
            users = await User.find()
            // console.log('geAccounts', users);
        }
        ctx.body = responseWrapper(users)
    }

    @request('delete', '/api/user/{userId}')
    @summary("删除账号")
    @tag
    @path({
        userId: { type: 'string', description: '用户id',required: true}
    })
    static async deleteUser(ctx, next) {
        let user = ctx.state.user.data;
        if (user.permission != 'root') {
            throw new Error(`权限不足`);
        }
        let {userId} = ctx.validatedParams;
        await models.User.deleteMany({_id: userId})
        await models.Collaborator.deleteMany({_id: userId})
        ctx.body = responseWrapper(true, "成功")
    }

    @request('post', '/api/user/resetPassword')
    @summary('管理员重置密码')
    @tag
    @body({
        userId: {
            type: 'string',
            description: '用户id',
            required: true
        },
        newPassword:{
            type: 'string',
            description: '新密码',
            required: true
        }
    })
    static async resetPassword(ctx, next) {
        let body = ctx.request.body
        let user = await User.findOne({
            _id: body.userId
        }, "-password");
        if (!user) {
            throw new Error("邮箱有误,没有该用户");
        }
        let hashPassword = await bcrypt.hash(body.newPassword, 10); // 10是 hash加密的级别, 默认是10，数字越大加密级别越高
        await User.findByIdAndUpdate(user._id, { password: hashPassword })
        ctx.body = responseWrapper("密码已重置")
    }


}
