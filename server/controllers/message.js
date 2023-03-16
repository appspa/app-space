"use strict";

import { request, summary, tags, body, description, query } from "../swagger";
import Message from "../model/message";

import { responseWrapper } from "../utils/util";
import bcrypt from "bcrypt";
import Fawn from "fawn";

const tag = tags(["消息"]);

module.exports = class MessageRouter {
  @request("get", "/api/messages")
  @summary("获取该用户未读消息列表")
  @query({
    page: { type: "number", default: 0, description: "分页页码(可选)" },
    size: { type: "number", default: 10, description: "每页条数(可选)" }
  })
  @tag
  static async getMessages(ctx, next) {
    let page = ctx.query.page || 0;
    let size = ctx.query.size || 10;
    let user = ctx.state.user.data;

    let result = await Message.find({ receiver: user._id })
      .limit(size)
      .skip(page * size);
    ctx.body = responseWrapper(result);
  }

  @request("get", "/api/messages/count")
  @summary("获取消息总条数和未读条数")
  @tag
  static async getMessageCount(ctx, next) {
    let user = ctx.state.user.data;
    let count = await Message.count({ receiver: user._id });
    let unread = await Message.count({ receiver: user._id, status: "unread" });
    ctx.body = responseWrapper({ total: count, unread: unread });
  }

  @request("get", "/api/messages/markread")
  @summary("把消息全部标记为已读")
  @tag
  static async markMessageRead(ctx, next) {
    let user = ctx.state.user.data;
    let result = await Message.update({ receiver: user._id ,status:'unread'},{
        status: "hasread"
    });
    ctx.body = responseWrapper(true,'所有消息已标记已读');
  }

  @request("delete", "/api/messages")
  @summary("清空消息列表")
  @query({
    page: { type: "number", default: 0, description: "分页页码(可选)" },
    size: { type: "number", default: 10, description: "每页条数(可选)" }
  })
  @tag
  static async clearMessages(ctx, next) {
    let page = ctx.query.page || 0;
    let size = ctx.query.size || 10;
    let user = ctx.state.user.data;
    await Message.deleteMany({ receiver: user._id });
    ctx.body = responseWrapper(true, "消息已清空");
  }
};
