/*
 * ************************************************************
 * 文件：MainXposed.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2018年08月19日 17:06:09
 * 上次修改时间：2018年08月19日 17:06:09
 * 作者：大路
 * Copyright (c) 2018
 * ************************************************************
 */

package com.evan.wechat;

import android.app.Application;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;

import com.evan.wechat.constant.Constants;
import com.virjar.sekiro.api.SekiroClient;

import java.lang.reflect.Array;
import java.util.HashMap;
import java.util.List;

import de.robv.android.xposed.IXposedHookLoadPackage;
import de.robv.android.xposed.XC_MethodHook;
import de.robv.android.xposed.XC_MethodReplacement;
import de.robv.android.xposed.XposedBridge;
import de.robv.android.xposed.XposedHelpers;
import de.robv.android.xposed.callbacks.XC_LoadPackage;

public final class MainXposed implements IXposedHookLoadPackage {
    //微信数据库包名称
    private static final String WECHAT_DATABASE_PACKAGE_NAME = "com.tencent.wcdb.database.SQLiteDatabase";
    //聊天精灵客户端包名称
    private static final String WECHATGENIUS_PACKAGE_NAME = "com.evan.wechat";
    //微信主进程名
    private static final String WECHAT_PROCESS_NAME = "com.tencent.mm";
    public static XC_LoadPackage.LoadPackageParam lpparam;
    public static ClassLoader classLoader;
    public static Context mContext;
    private SharedPreferences sharedPreferences;
    private String userId;
    private String userPhone;
    private String nickName;

    public static XC_LoadPackage.LoadPackageParam getLpparam() {
        return lpparam;
    }

    @Override
    public void handleLoadPackage(XC_LoadPackage.LoadPackageParam lpparam) throws Throwable {
        //region hook模块是否激活
        if (lpparam.packageName.equals(WECHATGENIUS_PACKAGE_NAME)) {
            //hook客户端APP的是否激活返回值。替换为true。
            Class<?> classAppUtils = XposedHelpers.findClassIfExists(WECHATGENIUS_PACKAGE_NAME + ".util.AppUtils", lpparam.classLoader);
            if (classAppUtils != null) {
                XposedHelpers.findAndHookMethod(classAppUtils,
                        "isModuleActive",
                        XC_MethodReplacement.returnConstant(true));
                XposedBridge.log("成功hook住com.evan.wechat.util.AppUtils的isModuleActive方法。");
            }
            return;
        }
        //endregion

        if (!lpparam.processName.equals(WECHAT_PROCESS_NAME)) {
            return;
        }

        XposedBridge.log("进入微信进程：" + lpparam.processName);
        //调用 hook数据库插入。
        Class<?> classDb = XposedHelpers.findClassIfExists(WECHAT_DATABASE_PACKAGE_NAME, lpparam.classLoader);
        if (classDb == null) {
            XposedBridge.log("hook数据库insert操作：未找到类" + WECHAT_DATABASE_PACKAGE_NAME);
            return;
        }
        applicationAttach();
        MainXposed.lpparam = lpparam;
        MainXposed.classLoader = lpparam.classLoader;
        hookDatabaseInsert(classDb, lpparam);
//        hookDatabaseUpdate(classDb,lpparam);
    }

    private void startSocket() {
        if (sharedPreferences != null && !SekiroClient.getInstance().isConnecting()) {
            Boolean isLogin = sharedPreferences.getBoolean("isLogin", false);
            XposedBridge.log("isLogin=" + isLogin);
            if (!isLogin) {
                return;
            }
            userPhone = sharedPreferences.getString("login_user_name", "null");
            userId = sharedPreferences.getString("login_weixin_username", "null");
            nickName = sharedPreferences.getString("last_login_nick_name", "null");
            XposedBridge.log("userPhone=" + userPhone);
            XposedBridge.log("userId=" + userId);
            XposedBridge.log("nickName=" + nickName);
            if (userId != null) {
                SekiroClient.getInstance().connect(Constants.getHost(), Constants.PORT, userId, "group_wx");
                SekiroClient.getInstance().registerHandler("sendMessage", new SendMessageHandler());
            }
        }
    }

    private void applicationAttach() {
        XposedHelpers.findAndHookMethod(Application.class, "attach", new Object[]{Context.class, new XC_MethodHook() {
            protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                super.afterHookedMethod(param);
                mContext = ((Context) param.args[0]);
                sharedPreferences = mContext.getSharedPreferences("com.tencent.mm_preferences", Context.MODE_PRIVATE);
                XposedBridge.log("applicationAttach...." + mContext.getPackageName());
            }
        }});
    }

    private void hookDatabaseUpdate(Class<?> classDb, XC_LoadPackage.LoadPackageParam lpparam) {
        XposedHelpers.findAndHookMethod(classDb,
                "updateWithOnConflict",
                String.class, ContentValues.class, String.class, String[].class, int.class,
                new XC_MethodHook() {
                    @Override
                    protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                        String tableName = (String) param.args[0];
                        ContentValues contentValues = (ContentValues) param.args[1];
                        String whereClause = (String) param.args[2];
                        Object whereArgs = param.args[3];
                        StringBuffer strShereArgs = new StringBuffer();
                        if (whereArgs instanceof Array) {
                            List<String> ss = (List<String>) whereArgs;
                            if (ss != null) {
                                for (String s : ss) {
                                    strShereArgs.append(s);
                                    strShereArgs.append(";");
                                }
                            }
                        }
                        int conflictAlgorithm = (int) param.args[4];
                        printInsertLog(tableName + "whereArgs=" + strShereArgs.toString(),
                                whereClause, contentValues, conflictAlgorithm);
                    }
                });
    }

    //hook数据库插入操作
    private void hookDatabaseInsert(Class<?> classDb, final XC_LoadPackage.LoadPackageParam loadPackageParam) {
        XposedHelpers.findAndHookMethod(classDb,
                "insertWithOnConflict",
                String.class, String.class, ContentValues.class, int.class,
                new XC_MethodHook() {
                    @Override
                    protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                        startSocket();
                        String tableName = (String) param.args[0];
                        String columnHack = (String) param.args[1];
                        ContentValues contentValues = (ContentValues) param.args[2];
                        int conflictValue = (Integer) param.args[3];
                        if (tableName == null || tableName.length() == 0 || contentValues == null) {
                            return;
                        }
                        printInsertLog(tableName, columnHack, contentValues, conflictValue);
                        //过滤掉非聊天消息
                        if (TextUtils.isEmpty(tableName)) {
                            return;
                        }
                        switch (tableName) {
                            case "rcontact":
                                if (TextUtils.equals(columnHack, "username")) {
                                    String chatroomname = contentValues.getAsString("username");
                                    String nickname = contentValues.getAsString("nickname");
                                    if (TextUtils.isEmpty(chatroomname) || TextUtils.isEmpty(nickname)) {
                                        return;
                                    }

                                    HashMap<String, String> paramsMap = new HashMap<String, String>();
                                    paramsMap.put("clientGroup", "group_wx");
                                    paramsMap.put("roomId", chatroomname);
                                    paramsMap.put("nickname", nickname);
//                                    paramsMap.put("userId", userId);
//                                    paramsMap.put("userPhone", userPhone);
//                                    paramsMap.put("userNickname", nickName);
                                    WXMessageUtils.handleMessageChatInfo(paramsMap);
                                }
                                break;
                            case "chatroom":
                                if (TextUtils.equals(columnHack, "chatroomname")) {
                                    String chatroomname = contentValues.getAsString("chatroomname");
                                    if (TextUtils.isEmpty(chatroomname)) {
                                        return;
                                    }
                                    String memberlist = contentValues.getAsString("memberlist");
                                    String displayname = contentValues.getAsString("displayname");
                                    String roomowner = contentValues.getAsString("roomowner");
                                    HashMap<String, String> paramsMap = new HashMap<String, String>();
                                    paramsMap.put("clientGroup", "group_wx");
                                    paramsMap.put("roomId", chatroomname);
                                    paramsMap.put("owner", roomowner);
//                                    paramsMap.put("memberlist", memberlist);
//                                    paramsMap.put("displayname", displayname);
//                                    paramsMap.put("roomowner", roomowner);
//                                    paramsMap.put("userId", userId);
//                                    paramsMap.put("userPhone", userPhone);
//                                    paramsMap.put("userNickname", nickName);
                                    WXMessageUtils.handleMessageChatInfo(paramsMap);
                                }
                                break;
                            case "message":
                                handleMessageRecall(contentValues);
                                break;
                        }
                    }
                });


    }

    public void handleMessageRecall(ContentValues contentValues) {
        //提取消息内容
        //1：表示是自己发送的消息
        int isSend = contentValues.getAsInteger("isSend");
        //消息内容
        String strContent = contentValues.getAsString("content");
        //说话人ID
        String strTalker = contentValues.getAsString("talker");
        long createTime = contentValues.getAsLong("createTime");
//        long currentTimeMillis = System.currentTimeMillis();
//        long time = currentTimeMillis - createTime;
//        XposedBridge.log("createTime=" + createTime + "  currentTimeMillis=" + currentTimeMillis
//                + " time=" + time
//        );

//        if (currentTimeMillis - createTime > 1000 * 10) {
//            XposedBridge.log("超过time" + time);
//            return;
//        }
        int type = contentValues.getAsInteger("type");
        //收到消息，进行回复（要判断不是自己发送的、不是群消息、不是公众号消息，才回复）
        if (isSend != 1 && strTalker.endsWith("chatroom") && !strTalker.startsWith("gh_")) {
//        if (isSend != 1&&!strTalker.startsWith("gh_")) {
            String content = null;
            String sendId = null;
            if (strContent.contains("\n")) {
                sendId = strContent.substring(0, strContent.indexOf("\n"));
                content = strContent.substring(sendId.length() + 1);
            } else {
                content = strContent;
            }
            if (BuildConfig.DEBUG) {
                XposedBridge.log(content);
                if (TextUtils.equals(content, "1")) {
                    WXMessageUtils.sendText(strTalker, content);
                } else if (TextUtils.equals(content, "3")) {
                    WXMessageUtils.sendImage(strTalker, "http:??", "http:??");
                } else if (TextUtils.equals(content, "5")) {
                    WXMessageUtils.sendFile(strTalker, "标题", "http:??", "/sdcard/enhancement.apk");
                } else if (TextUtils.equals(content, "6")) {
                    WXMessageUtils.sendWebUrl(strTalker, "标题", "描述", "https://www.baidu.com", "http:??");
                } else if (TextUtils.equals(content, "33")) {
                    WXMessageUtils.sendMiniMssage(strTalker, "m/index.html",
                            "gh_1bce49d2c9c8", "https://www.baidu.com", "标题", "http:??");
                } else if (TextUtils.equals(content, "42")) {
                    WXMessageUtils.sendCardInfo(strTalker, "<msg username=\"mmm\" nickname=\"小哥\" alias=\"nnn\" fullpy=\"小哥\" shortpy=\"CG\" imagestatus=\"3\" scene=\"17\" province=\"中国大陆\" city=\"北京\" sign=\"流弊\" percard=\"1\" sex=\"1\" certflag=\"0\" certinfo=\"\" certinfoext=\"\" brandIconUrl=\"\" brandHomeUrl=\"\" brandSubscriptConfigUrl=\"\" brandFlags=\"\" regionCode=\"CN_Beijing\"/>");
                } else {
                    WXMessageUtils.handleMessage(userId, userPhone, nickName, sendId, strTalker, type, content, createTime);
                }
            } else {
                WXMessageUtils.handleMessage(userId, userPhone, nickName, sendId, strTalker, type, content, createTime);
            }
        } else {
            XposedBridge.log("单聊=" + strContent);
        }
    }

    //输出插入操作日志
    private void printInsertLog(String tableName, String nullColumnHack, ContentValues contentValues, int conflictValue) {
        String[] arrayConflicValues =
                {"", " OR ROLLBACK ", " OR ABORT ", " OR FAIL ", " OR IGNORE ", " OR REPLACE "};
        if (conflictValue < 0 || conflictValue > 5) {
            return;
        }
        StringBuffer csb = new StringBuffer();
        if (contentValues != null) {
            for (String key : contentValues.keySet()) {
                csb.append(key);
                csb.append("=");
                csb.append(contentValues.get(key));
                csb.append("&");
            }
        }
//        Hook数据库insert:table：message；
//        nullColumnHack：msgId；CONFLICT_VALUES：
//        ；contentValues:
//        bizClientMsgId=&msgId=8&msgSvrId=5902589209244767384&talker=17595315330@chatroom
//        &content=cuichenxi8895340:
//        经济&flag=0&status=3&msgSeq=712093520&createTime=1586485939000&lvbuffer=[B@12640be
//        &isSend=0&type=1&bizChatId=-1&talkerId=31&
        XposedBridge.log("Hook数据库insert:table：" + tableName
                + "；nullColumnHack：" + nullColumnHack
                + "；CONFLICT_VALUES：" + arrayConflicValues[conflictValue]
                + "；contentValues:" + csb.toString());
    }

}
