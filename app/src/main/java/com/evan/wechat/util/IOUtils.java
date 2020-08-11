/*
 * ************************************************************
 * 文件：IOUtils.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2020年04月14日 16:42:21
 * 上次修改时间：2020年03月16日 10:50:54
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.evan.wechat.util;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class IOUtils {


    private static final String TAG = "IOUtils";

    public static void copy(String filename, byte[] bytes) {
        try {
            //如果手机已插入sd卡,且app具有读写sd卡的权限
            if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
                FileOutputStream output = null;
                output = new FileOutputStream(filename);
                output.write(bytes);
                Log.i(TAG, "copy:" + filename);
                output.close();
            } else {
                Log.i(TAG, "copy:fail, " + filename);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void changeFile(String inputPath) throws Exception {
        File inFile = new File(inputPath);
        File outFile = new File(inputPath.split(".amr")[0]);
        DataInputStream dis = new DataInputStream(new BufferedInputStream(new FileInputStream(inFile)));
        DataOutputStream dos = new DataOutputStream(new FileOutputStream(outFile));
        dis.skipBytes(1);

        byte[] bytes = new byte[dis.available()];
        while (dis.available() > 0) {
            dis.read(bytes);
            dos.write(bytes);
        }
        dos.flush();
        dis.close();
        dos.close();
    }

    public static String getAssetsContent(Context context, String path) {
        try {
            InputStream is = context.getAssets().open(path);
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            String text = new String(buffer, "utf-8");
            return text;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "读取错误，请检查文件名";
    }

    public static String readTxtFile(String filePath) {
        String nr = null;
        AppUtils.doCmd("chmod 777 " + filePath);
        InputStreamReader inputReader = null;
        BufferedReader bufferReader = null;
        InputStream inputStream = null;
        File file = new File(filePath);
        try {
            inputStream = new FileInputStream(file);
            inputReader = new InputStreamReader(inputStream);
            bufferReader = new BufferedReader(inputReader);
            // 读取一行
            String line = null;
            StringBuffer strBuffer = new StringBuffer();
            while ((line = bufferReader.readLine()) != null) {
                strBuffer.append(line + "\n");
            }
            nr = strBuffer.toString();
            nr = nr.substring(0, nr.length() - 1);
            return nr;
        } catch (Exception e) {
            return "";
        } finally {
            try {
                inputReader.close();
            } catch (Exception e) {
//                e.printStackTrace();
                try {
                    bufferReader.close();
                } catch (Exception e1) {
//                    e1.printStackTrace();
                }
            }

        }
    }

    public static void saveFile(String path, String content) {
        File file = new File(path);
        FileWriter fileWritter;
        try {
            fileWritter = new FileWriter(file.getAbsolutePath(), false);
            BufferedWriter bufferWritter = new BufferedWriter(fileWritter);
            bufferWritter.write(content);
            bufferWritter.close();
            fileWritter.close();
            AppUtils.doCmd("chmod 777 " + path);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void saveFile(String path, String content, boolean append) {
        File file = new File(path);
        FileWriter fileWritter;
        try {
            fileWritter = new FileWriter(file.getAbsolutePath(), append);
            BufferedWriter bufferWritter = new BufferedWriter(fileWritter);
            bufferWritter.write(content);
            bufferWritter.close();
            fileWritter.close();
            AppUtils.doCmd("chmod 777 " + path);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


}