/*
 * ************************************************************
 * 文件：AppInfo.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2018年08月20日 11:38:43
 * 上次修改时间：2018年08月20日 11:38:42
 * 作者：大路
 * Copyright (c) 2018
 * ************************************************************
 */

package com.evan.wechat.entity;

import android.content.Context;
import android.os.Build;

import com.evan.wechat.constant.SupportVersion;
import com.evan.wechat.util.AppUtils;
import com.evan.wechat.util.ShellUtil;
import com.evan.wechat.util.StringUtils;

public final class AppInfo {
    //Android系统版本
    private String mAndroidVersionName;
    private boolean mIsDeviceRooted;   //设备是否ROOT
    private boolean mIsSupportAndroid;  //是否支持该版本Android
    //微信精灵版本号
    private String mVersionName;
    private int mVersionCode;
    //Xposed是否安装
    private boolean mIsXposedInstall;
    private String mXposedVersionName;
    //微信是否安装、版本号
    private boolean mIsWechatInstall;
    private String mWechatVersionName;
    private boolean mIsSupportWechat;

    //region 单例
    //单例
    private static volatile AppInfo mInstance = null;

    private AppInfo() {
    }

    public static AppInfo getInstance() {
        if (mInstance == null) {
            synchronized (AppInfo.class) {
                if (mInstance == null) {
                    mInstance = new AppInfo();
                }
            }
        }
        return mInstance;
    }

    //endregion

    //检测设备环境
    public void ValidateEnvironment(Context context) {
        //判断root
        mIsDeviceRooted = ShellUtil.checkRootPermission();
        //Android系统版本
        mAndroidVersionName = Build.VERSION.RELEASE;

        //获取微信精灵版本号
        mVersionName = AppUtils.getVersionName(context);
        mVersionCode = AppUtils.getVersionCode(context);
        //判断微信
        mWechatVersionName = AppUtils.getAppVersionName(context, AppUtils.PACKAGE_NAME_WECHAT);
        mIsWechatInstall = !StringUtils.isEmpty(getWechatVersionName());
        //判断Xposed是否安装
        mXposedVersionName = AppUtils.getAppVersionName(context, AppUtils.PACKAGE_NAME_XPOSED);
        mIsXposedInstall = !StringUtils.isEmpty(getXposedVersionName());

        //检测安卓版本是否符合要求
        mIsSupportAndroid = isContainAndroidVersion();
        //判断微信版本是否符合要求
        mIsSupportWechat = mIsWechatInstall && isContainWechatVersion();
    }

    //获取微信版本是否包含在支持列表中
    private boolean isContainWechatVersion() {
        if (mWechatVersionName == null) {
            return false;
        }
        for (int i = 0; i < SupportVersion.wechatSupport.length; i++) {
            if (mWechatVersionName.equals(SupportVersion.wechatSupport[i])) {
                return true;
            }
        }
        return false;
    }

    //获取Android版本是否包含在支持列表中
    private boolean isContainAndroidVersion() {
        if (mAndroidVersionName == null) {
            return false;
        }
        for (int i = 0; i < SupportVersion.androidSupport.length; i++) {
            if (mAndroidVersionName.equals(SupportVersion.androidSupport[i])) {
                return true;
            }
        }
        return false;
    }

    //获取Xposed模块是否激活
    public boolean isXposedActive() {
        return AppUtils.isModuleActive();
    }

    public boolean isXposedInstall() {
        return mIsXposedInstall;
    }

    public void setXposedInstall(boolean xposedInstall) {
        mIsXposedInstall = xposedInstall;
    }

    public String getXposedVersionName() {
        return mXposedVersionName;
    }

    public void setXposedVersionName(String xposedVersionName) {
        mXposedVersionName = xposedVersionName;
    }

    public String getAndroidVersionName() {
        return mAndroidVersionName;
    }

    public void setAndroidVersionName(String androidVersionName) {
        mAndroidVersionName = androidVersionName;
    }

    public boolean isDeviceRooted() {
        return mIsDeviceRooted;
    }

    public void setDeviceRooted(boolean deviceRooted) {
        mIsDeviceRooted = deviceRooted;
    }

    public boolean isSupportAndroid() {
        return mIsSupportAndroid;
    }

    public void setSupportAndroid(boolean supportAndroid) {
        mIsSupportAndroid = supportAndroid;
    }

    public boolean isWechatInstall() {
        return mIsWechatInstall;
    }

    public void setWechatInstall(boolean wechatInstall) {
        mIsWechatInstall = wechatInstall;
    }

    public String getWechatVersionName() {
        return mWechatVersionName;
    }

    public void setWechatVersionName(String wechatVersionName) {
        mWechatVersionName = wechatVersionName;
    }

    public boolean isSupportWechat() {
        return mIsSupportWechat;
    }

    public void setSupportWechat(boolean supportWechat) {
        mIsSupportWechat = supportWechat;
    }

    public String getVersionName() {
        return mVersionName;
    }

    public void setVersionName(String versionName) {
        mVersionName = versionName;
    }

    public int getVersionCode() {
        return mVersionCode;
    }

    public void setVersionCode(int versionCode) {
        mVersionCode = versionCode;
    }
}
