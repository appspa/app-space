/*
 * ************************************************************
 * 文件：StringUtils.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2018年08月20日 11:56:57
 * 上次修改时间：2018年08月20日 11:56:56
 * 作者：大路
 * Copyright (c) 2018
 * ************************************************************
 */

package com.evan.wechat.util;

public final class StringUtils {
    public static boolean isEmpty(final CharSequence s) {
        return s == null || s.length() == 0;
    }
}
