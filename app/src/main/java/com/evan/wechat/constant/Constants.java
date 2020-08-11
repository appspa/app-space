/*
 * ************************************************************
 * 文件：Constants.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2020年04月15日 14:28:48
 * 上次修改时间：2020年04月15日 14:28:48
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.evan.wechat.constant;

import com.evan.wechat.BuildConfig;

import java.io.File;

public class Constants {
    public static final String ACA_CACHE_ROOT = "robot";//本地缓存Apk
    public static final String APP_CACHE_APK = ACA_CACHE_ROOT + File.separator + "apk";//本地缓存App
    public static final int PORT = 5600;

    public static String getHost() {
        return "172.0.0.1";
    }

    public static String getBaseUrl() {
        return "http://....";
    }

}
