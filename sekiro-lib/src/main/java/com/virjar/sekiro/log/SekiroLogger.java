package com.virjar.sekiro.log;

import android.util.Log;

import com.virjar.sekiro.utils.LogUtils;

public class SekiroLogger {
    public static String tag = "Sekiro";

    public static void info(String msg) {
        Log.i(tag, msg);
        LogUtils.log("Sekiro=" + msg);
    }

    public static void info(String msg, Throwable throwable) {
        Log.i(tag, msg, throwable);
        LogUtils.log("Sekiro=" + msg);
    }

    public static void warn(String msg) {
        Log.w(tag, msg);
        LogUtils.log("Sekiro=" + msg);
    }

    public static void warn(String msg, Throwable throwable) {
        LogUtils.log("Sekiro=" + msg);
        Log.w(tag, msg, throwable);
    }

    public static void error(String msg) {
        Log.e(tag, msg);
        LogUtils.log("Sekiro=" + msg);
    }

    public static void error(String msg, Throwable throwable) {
        Log.e(tag, msg, throwable);
        LogUtils.log("Sekiro=" + msg);
    }
}
