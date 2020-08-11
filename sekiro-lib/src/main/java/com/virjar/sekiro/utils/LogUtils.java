/*
 * ************************************************************
 * 文件：LogUtils.java  模块：sekiro-lib  项目：WeChatGenius
 * 当前修改时间：2020年04月26日 10:24:31
 * 上次修改时间：2020年04月26日 10:24:31
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.virjar.sekiro.utils;

import android.util.Log;

import com.virjar.sekiro.BuildConfig;

import de.robv.android.xposed.XposedBridge;

public class LogUtils {

    public static final String TAG = LogUtils.class.getSimpleName();

    public static void log(String msg) {
        XposedBridge.log(msg);
        Log.d(TAG, msg);
    }

    public static void log(Exception e) {
        XposedBridge.log(e);
        Log.e(TAG, e.getMessage(), e);
    }
}
