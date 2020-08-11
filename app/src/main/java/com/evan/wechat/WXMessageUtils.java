/*
 * ************************************************************
 * 文件：WXMessageUtils.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2020年04月14日 15:40:12
 * 上次修改时间：2020年04月14日 15:39:53
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.evan.wechat;

import android.graphics.Bitmap;
import android.text.TextUtils;

import com.evan.wechat.constant.Constants;
import com.evan.wechat.entity.ImageEnityModel;
import com.evan.wechat.entity.MiniProgramPageModel;
import com.evan.wechat.entity.WebPageEnityModel;
import com.virjar.sekiro.utils.LogUtils;
import com.zhy.http.okhttp.OkHttpUtils;
import com.zhy.http.okhttp.callback.StringCallback;

import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.HashMap;

import de.robv.android.xposed.XposedBridge;
import de.robv.android.xposed.XposedHelpers;
import external.com.alibaba.fastjson.JSON;
import okhttp3.Call;

public class WXMessageUtils {

    /**
     * 发送文本信息
     *
     * @param strContent
     * @param wxId
     */
    public static void sendText1(final String wxId,
                                 String strContent) {
        LogUtils.log("发送消息内容：content:" + strContent + ",chatRoomId:" + wxId);
        if (TextUtils.isEmpty(wxId) || TextUtils.isEmpty(strContent)) {
            return;
        }
        //构造new里面的参数：l iVar = new i(aao, str, hQ, i2, mVar.cvb().fD(talkerUserName, str));
        Class<?> classiVar = XposedHelpers.findClassIfExists("com.tencent.mm.modelmulti.h", MainXposed.classLoader);
        Object objectiVar = XposedHelpers.newInstance(classiVar,
                new Class[]{String.class, String.class, int.class, int.class, Object.class},
                wxId, strContent, 1, 1, new HashMap<String, String>() {{
                    put(wxId, wxId);
                }});
        Object[] objectParamiVar = new Object[]{objectiVar, 0};

        //创建静态实例对象au.DF()，转换为com.tencent.mm.ab.o对象
        Class<?> classG = XposedHelpers.findClassIfExists("com.tencent.mm.kernel.g", MainXposed.classLoader);
        Object objectG = XposedHelpers.callStaticMethod(classG, "aaB");
        Object objectdpP = XposedHelpers.getObjectField(objectG, "fvA");

        //查找au.DF().a()方法
        Class<?> classDF = XposedHelpers.findClassIfExists("com.tencent.mm.aj.p", MainXposed.classLoader);
        Class<?> classI = XposedHelpers.findClassIfExists("com.tencent.mm.aj.m", MainXposed.classLoader);
        Method methodA = XposedHelpers.findMethodExactIfExists(classDF, "a", classI, int.class);

        //调用发消息方法
        try {
            XposedBridge.invokeOriginalMethod(methodA, objectdpP, objectParamiVar);
            LogUtils.log("invokeOriginalMethod()执行成功");
        } catch (Exception e) {
            LogUtils.log("调用微信消息回复方法异常");
            LogUtils.log(e);
        }
    }

    public static void sendText(final String wxId,
                                String strContent) {
        LogUtils.log("发送消息内容：content:" + strContent + ",chatRoomId:" + wxId);
        Class h_c = XposedHelpers.findClass("com.tencent.mm.modelmulti.h", MainXposed.classLoader);
        Object newInstance = XposedHelpers.newInstance(h_c, new Class[]{String.class, String.class, int.class}, wxId, strContent, 1);
        Class classP = XposedHelpers.findClass("com.tencent.mm.ah.p", MainXposed.classLoader);
        Class classM = XposedHelpers.findClass("com.tencent.mm.ah.m", MainXposed.classLoader);
        Object objectFej = XposedHelpers.getStaticObjectField(classP, "fej");
        try {
            XposedHelpers.callMethod(objectFej, "d", new Class[]{classM}, newInstance);
            LogUtils.log("发送执行成功");
        } catch (Exception e) {
            LogUtils.log("调用微信消息回复方法异常");
            LogUtils.log(e);
        }
    }

    /**
     * 名片
     */
    public static void sendCardInfo(final String wxId, String strContent) {

    }

    public static void sendImage(final String wxId, final String mediaPath, final String mediaCoverPath) {



    }

    /**
     * 网页
     * sendMiniMssage("x", "pages/productDetail/productDetail.html?id=175263&netflow=", "gh_ff83ede5a6111", "https://www.baidu.com", "title", "path");
     *
     * @param wxid
     * @param webpageUrl
     * @param title
     * @param thumbImageURL
     */
    public static void sendWebUrl(final String wxid, String title, String description, String webpageUrl, final String thumbImageURL) {


    }

    /**
     * 发送小程序
     * sendMiniMssage("x", "pages/productDetail/productDetail.html?id=175263&netflow=", "gh_ff83ede5a6123", "https://www.baidu.com", "title", "path");
     *
     * @param wxid
     * @param path
     * @param userName
     * @param webpageUrl
     * @param title
     * @param thumbImageURL
     */
    public static void sendMiniMssage(final String wxid, String path, String userName
            , String webpageUrl, String title, final String thumbImageURL) {


    }

    public static void sendFile(final String wxid, String title, final String thumbImageURL, String path) {

    }

    private static void sendMedia(String wxid, Object newInstance2, Bitmap decodeFile) {

    }


    public static boolean sendMessage(int msgType, String roomId, String content) {
        switch (msgType) {
            case 1:
                sendText(roomId, content);
                break;
            case 3:
                ImageEnityModel imageEnityModel = JSON.parseObject(content, ImageEnityModel.class);
                if (imageEnityModel != null && !TextUtils.isEmpty(imageEnityModel.imageURL)) {
                    WXMessageUtils.sendImage(roomId, imageEnityModel.imageURL, imageEnityModel.thumbImageURL);
                } else {
                    return false;
                }
                break;
            case 6:
                WebPageEnityModel webPageEnityModel = JSON.parseObject(content, WebPageEnityModel.class);
                if (webPageEnityModel != null && !TextUtils.isEmpty(webPageEnityModel.webpageUrl)) {
                    WXMessageUtils.sendWebUrl(roomId, webPageEnityModel.title, webPageEnityModel.description, webPageEnityModel.webpageUrl, webPageEnityModel.imageUrl);
                } else {
                    return false;
                }
                break;
            case 33:
                MiniProgramPageModel miniProgramPageModel = JSON.parseObject(content, MiniProgramPageModel.class);
                if (miniProgramPageModel != null && miniProgramPageModel.miniprogrampage != null) {
                    MiniProgramPageModel.MiniprogrampageBean miniMsg = miniProgramPageModel.miniprogrampage;
                    WXMessageUtils.sendMiniMssage(roomId, miniMsg.pagepath, miniMsg.appid, miniMsg.webpageUrl, miniMsg.title,
                            miniMsg.thumb_url
                    );
                } else {
                    return false;
                }
                break;
        }
        return true;
    }

    /**
     * @param paramsMap
     */
    public static void handleMessageChatInfo(final HashMap<String, String> paramsMap) {
        OkHttpUtils.post()
                .url(Constants.getBaseUrl() + "/api")
                .params(paramsMap)
                .build()
                .execute(new StringCallback() {
                    @Override
                    public void onError(Call call, Exception e, int id) {
                        LogUtils.log(e.getMessage());
                    }

                    @Override
                    public void onResponse(String response, int id) {
                        LogUtils.log("onResponse=" + response);
                    }
                });

    }

    public static void handleMessage(String userId, String userPhone, String nickName, String sendId, String roomId, int msgType, String msg, long createTime) {
        OkHttpUtils.get()
                .url(Constants.getBaseUrl() + "/api")
                .addParams("msg", msg)
                .addParams("userId", userId)
                .addParams("sendId", sendId)
                .addParams("roomId", roomId)
                .addParams("userPhone", userPhone)
                .addParams("nickName", nickName)
                .addParams("group", "group_wx")
                .addParams("msgType", msgType + "")
                .addParams("createTime", createTime + "")
                .build()
                .execute(new StringCallback() {
                    @Override
                    public void onError(Call call, Exception e, int id) {
                        LogUtils.log(e.getMessage());
                    }

                    @Override
                    public void onResponse(String response, int id) {
                        LogUtils.log("onResponse=" + response);
                        if (!TextUtils.isEmpty(response)) {
                            try {
                                JSONObject jsonObject = JSON.parseObject(response, JSONObject.class);
                                boolean ok = jsonObject.getBoolean("ok");
                                if (ok) {
//                                    sendText(roomId, "");
                                } else {
                                    LogUtils.log(response);
                                }
                            } catch (Exception e) {
                                LogUtils.log(e.getMessage());
                            }
                        }
                    }
                });

    }

}
