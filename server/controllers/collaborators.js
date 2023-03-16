'use strict';

import {
    request,
    summary,
    tags,
    body,
    query,
    path,
    description
} from '../swagger';
import User  from "../model/user";
import Message from "../model/message";
import Collaborator from "../model/collaborator";
import App from "../model/app_model";
import { responseWrapper } from "../utils/util";
import Fawn from "fawn";
import mongoose from "mongoose";
import validator from "../utils/validator";
import Mail from "../utils/mail"
import config from "../config"
import _ from 'lodash';


const tag = tags(['团队成员']);


module.exports = class CollaboratorRouter {

    @request('post', '/api/collaborator/{appId}/role')
    @summary('修改用户角色')
    @tag
    @path({
        appId: {
            type: 'string',
            required: true
        }
    })
    @body({ memberId: { type: 'string', required: true }, role: { type: 'string', required: true, description: "传入manager或者guest" } })
    static async changeMemberRole(ctx, next) {
        let { appId } = ctx.validatedParams;
        let user = ctx.state.user.data;
        let body = ctx.request.body
        let team = validator.userInTeamIsManager(user._id, appId)
        if (!team) {
            throw new Error("没有权限修改该用户角色")
        }
        if (body.role != 'manager' && body.role != 'guest') {
            throw new Error("请传入正确的角色参数")
        }
        await Collaborator.updateOne({ uid: body.memberId,appId:appId}, {
            role:body.role
        })
        ctx.body = responseWrapper(true, "用户角色已更新")
    }

    @request('post', '/api/collaborator/{appId}/invite')
    @summary('邀请某成员加入项目')
    @tag
    @body({
        emailList: {
            type: 'array',
            items: {
                type: 'string'
            },
            description: "邮箱列表",
            required: true
        },
        role: { type: 'string', required: true, description: "成员角色manager/guest" }
    })
    @path({
        appId: {
            type: 'string',
            required: true
        },
    })
    static async addMember(ctx, next) {
        let { appId} = ctx.validatedParams;
        let user = ctx.state.user.data;
        let {emailList,role} = ctx.request.body;
        let collaborator = validator.userInTeamIsManager(user._id, appId)
        if (!collaborator) {
            throw new Error("您没有权限邀请用户加入")
        }
        console.log('role',role)
        if (!(role === 'manager' || role === 'guest')) {
            throw new Error("请传入正确的用户角色")
        }

        let app =  await App.findOne({_id:appId})
        console.log("app",app)
        let userList = await User.find({
            email: { $in: emailList }
        })

        // 如果用户不存在则发送邮件邀请
        let dif = _.difference(emailList, _.map(userList, 'email'))
        if (dif.length != 0) {
            Mail.send(dif, `${user.username}邀请您加入${app.appName}`, `${user.username}邀请您加入${app.appName}".如果您还没有注册发布平台，请点击${config.baseUrl}注册`)
        }

        let addedMembers = await Collaborator.find({appId:appId,uid:{'$in':userList.map((v)=>v._id)}},"uid")
        let unAddMembers = []
        for (let member of userList){
            if(!_.find(addedMembers,(o)=>{
                return o == member._id;
            })){
                unAddMembers.push({
                    appId:appId,
                    uid:member._id,
                    role: role
                })
            }
        }
        console.log("unAddMembers",unAddMembers)
        await Collaborator.insertMany(unAddMembers)

        for (let u of unAddMembers) {
            let message = new Message();
            message.category = "INVITE";
            message.content = user.username + "邀请您加入" + app.appName + "项目."
            message.sender = user._id;
            message.receiver = u.uid;
            await message.save();
        }
        ctx.body = responseWrapper(true, "已发送邀请")
    }

    @request('delete', '/api/collaborator/{appId}/member/{userId}')
    @summary('移除某个成员,或者自己离开团队')
    @tag
    @path({
        appId: {
            type: 'string',
            required: true
        },
        userId: {
            type: 'string',
            required: true
        }
    })
    static async removeMember(ctx, next) {
        let { appId, userId } = ctx.validatedParams;
        let user = ctx.state.user.data;
        //如果传入的id和当前登录用户的id相等 表示是自己离开团队
        let collaborator = validator.userInTeamIsManager(user._id, appId)

        if (!collaborator) {
            throw new Error("该用户没有权限删除用户")
        }
        let collaboratorOne = await Collaborator.findOne({appId: appId,uid:userId})
        if (collaboratorOne.role == 'owner'){
            throw new Error("管理员用户无法删除用户")
        }
        await Collaborator.deleteMany({appId: appId,uid:userId})

        ctx.body = responseWrapper(true, "删除成功")
    }


    @request('get', '/api/collaborator/{appId}/members')
    @summary('获取团队成员列表')
    @tag
    @path({
        appId: {
            type: 'string',
            required: true
        }
    })
    static async getMembers(ctx, next) {
        let { appId } = ctx.validatedParams;
        let user = ctx.state.user.data;
        //如果传入的id和当前登录用户的id相等 表示是自己离开团队
        let collaborators = await Collaborator.find({
            appId: appId})
        if (!collaborators) {
            throw new Error("成员不存在")
        }
        console.log("collaborators",collaborators)
        let users = await User.find({_id:{$in:collaborators.map(i=>i.uid)}})
        let members = []
        for (let member of collaborators){
            for (let u of users){
                if (member.uid == u._id){
                    members.push({
                        username:u.username,
                        email:u.email,
                        _id:member._id,
                        uid:member.uid,
                        appId:member.appId,
                        role:member.role,
                        createAt:member.createAt,
                        updateAt:member.updateAt,
                    })
                }
            }
        }
        ctx.body = responseWrapper(members)
    }



}
