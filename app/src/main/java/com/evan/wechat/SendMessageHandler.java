/*
 * ************************************************************
 * 文件：SendMessageHandler.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2020年04月11日 12:30:24
 * 上次修改时间：2020年04月11日 12:30:23
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.evan.wechat;

import android.text.TextUtils;

import com.virjar.sekiro.api.SekiroRequest;
import com.virjar.sekiro.api.SekiroRequestHandler;
import com.virjar.sekiro.api.SekiroResponse;

import de.robv.android.xposed.XposedBridge;
import external.com.alibaba.fastjson.JSONObject;

class SendMessageHandler implements SekiroRequestHandler {


    /**
     * {
     * roomId:"18607205883@chatroom"
     * content:"下发消息",
     * msgType:1
     * }
     *
     * @param sekiroRequest
     * @param sekiroResponse
     */
    @Override
    public void handleRequest(SekiroRequest sekiroRequest, SekiroResponse sekiroResponse) {
        JSONObject param = sekiroRequest.getParam();
        if (param != null) {
            try {
                String roomId = param.getString("roomId");
                int msgType = param.getInteger("msgType");
                String content = param.getString("content");
                XposedBridge.log("SendMessage=roomId=" + roomId + "content=" + content);
//                XposedBridge.log("SendMessage=" + JSON.toJSONString(sekiroRequest.getJsonModel()));
                if (TextUtils.isEmpty(roomId) || TextUtils.isEmpty(content)) {
                    sekiroResponse.failed("参数不对roomId=" + roomId + "content=" + content);
                    return;
                }
                boolean b = WXMessageUtils.sendMessage(msgType, roomId, content);
                if (b) {
                    sekiroResponse.success("发送成功");
                } else {
                    sekiroResponse.failed("参数不对roomId=" + roomId + "content=" + content);
                }

            } catch (Exception e) {
                sekiroResponse.failed("参数不对" + sekiroRequest.getJsonModel().toJSONString());
            }
        }
    }
}
