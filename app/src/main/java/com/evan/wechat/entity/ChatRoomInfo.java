/*
 * ************************************************************
 * 文件：ChatRoomInfo.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2020年04月11日 12:07:47
 * 上次修改时间：2020年04月11日 12:07:47
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.evan.wechat.entity;

import java.io.Serializable;

public class ChatRoomInfo implements Serializable {

    public String roomId;//@chatroom//群ID
    public String nickname;//  群名昵称
    public String memberlist;//;; 群成员
    public String displayname;
    public String roomowner;////群主
    public String userId;////登录用户id
    public String userPhone;////登录用户手机
    public String userNickname;//登录用户昵称
}
