/*
 * ************************************************************
 * 文件：FileUtils.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2020年04月15日 14:26:45
 * 上次修改时间：2019年07月12日 10:12:12
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.evan.wechat.util;

import android.content.Context;
import android.content.res.AssetManager;
import android.os.Environment;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * external storage
 * 外部存储	Environment.getExternalStorageDirectory()	SD根目录:/mnt/sdcard/ (6.0后写入需要用户授权)
 * context.getExternalFilesDir(dir)	路径为:/mnt/sdcard/Android/data/< package name >/files/…
 * context.getExternalCacheDir()	路径为:/mnt/sdcard/Android/data/< package name >/cach/…
 * internal storage
 * 内部存储	context.getFilesDir()	路径是:/data/data/< package name >/files/…
 * context.getCacheDir()	路径是:/data/data/< package name >/cach/…
 */
public class FileUtils {
    private static final int WRITE_BUFFER_SIZE = 1024 * 8;

    /**
     * @param fileName
     * @param content
     * @throws Exception
     * @desc 保存内容到文件中
     */
    public static void save(Context context, String fileName, String content, int module) {
        try {
            FileOutputStream os = context.openFileOutput(fileName, module);
            os.write(content.getBytes());
            os.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * @param fileName
     * @return
     * @desc 读取文件内容
     */
    public static String read(Context context, String fileName) {

        try {
            FileInputStream fis = context.openFileInput(fileName);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] b = new byte[1024];
            int len = 0;
            while ((len = fis.read(b)) != -1) {
                bos.write(b, 0, len);
            }
            byte[] data = bos.toByteArray();
            fis.close();
            bos.close();
            return new String(data);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


    /**
     * @param context
     * @param fileName
     * @param content
     * @throws IOException
     * @desc 将文本内容保存到sd卡的文件中
     */
    public static void saveToSDCard(Context context, String fileName, String content) throws IOException {

        File file = new File(Environment.getExternalStorageDirectory(), fileName);
        FileOutputStream fos = new FileOutputStream(file);
        fos.write(content.getBytes());
        fos.close();
    }

    /**
     * @param fileName
     * @return
     * @throws IOException
     * @desc 读取sd卡文件内容
     */
    public static String readSDCard(String fileName) throws IOException {

        File file = new File(Environment.getExternalStorageDirectory(), fileName);
        FileInputStream fis = new FileInputStream(file);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int len = 0;
        while ((len = fis.read(buffer)) != -1) {
            bos.write(buffer, 0, len);
        }
        byte[] data = bos.toByteArray();
        fis.close();
        bos.close();

        return new String(data);
    }

    /*获取缓存路径，存储临时文件，可被一键清理和卸载清理*/
    /*
     * 可以看到，当SD卡存在或者SD卡不可被移除的时候，
     * 就调用getExternalCacheDir()方法来获取缓存路径，
     * 否则就调用getCacheDir()方法来获取缓存路径。
     * 前者获取到的就是/sdcard/Android/data/<application package>/cache 这个路径，
     * 而后者获取到的是 /data/data/<application package>/cache 这个路径。*/
    public static File getDiskCacheDir(Context context, String uniqueName) {
        String cachePath;
        if (Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState())
                || !Environment.isExternalStorageRemovable()) {
            cachePath = context.getExternalCacheDir().getPath();
        } else {
            cachePath = context.getCacheDir().getPath();
        }
        return new File(cachePath + File.separator + uniqueName);
    }


    public static File getDiskDir(Context context, String dir) {
        String diskPath;
        if (Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState())
                || !Environment.isExternalStorageRemovable()) {
            return context.getExternalFilesDir(dir);
        } else {
            diskPath = context.getFilesDir().getPath();
            File file = new File(diskPath + File.separator + dir);
            if (!file.exists()) {//判断文件目录是否存在  
                file.mkdirs();
            }
            return file;
        }
    }


    /*返回缓存路径*/
    public static File getDiskCacheDir(Context context) {
        String cachePath;
        if (Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState())
                || !Environment.isExternalStorageRemovable()) {
            cachePath = context.getExternalCacheDir().getPath();
        } else {
            cachePath = context.getCacheDir().getPath();
        }
        return new File(cachePath);
    }

    public static File getFilesDir(Context context, String uniqueName) {
        return new File(context.getFilesDir().getPath() + File.separator + uniqueName);
    }

    public static File getCacheDir(Context context, String uniqueName) {
        return new File(context.getCacheDir().getPath() + File.separator + uniqueName);
    }

    /*判断sd卡可用*/
    public static boolean hasSDCardMounted() {
        String state = Environment.getExternalStorageState();
        if (state != null && state.equals(Environment.MEDIA_MOUNTED)) {
            return true;
        } else {
            return false;
        }
    }

    public static String getFromAssets(Context context, String fileName) {
        //将json数据变成字符串
        StringBuilder stringBuilder = new StringBuilder();
        try {
            //获取assets资源管理器
            AssetManager assetManager = context.getAssets();
            //通过管理器打开文件并读取
            BufferedReader bf = new BufferedReader(new InputStreamReader(
                    assetManager.open(fileName)));
            String line;
            while ((line = bf.readLine()) != null) {
                stringBuilder.append(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return stringBuilder.toString();
    }

    public static String appendPathComponent(String basePath, String appendPathComponent) {
        return new File(basePath, appendPathComponent).getAbsolutePath();
    }

    public static void copyDirectoryContents(String sourceDirectoryPath, String destinationDirectoryPath) throws IOException {
        File sourceDir = new File(sourceDirectoryPath);
        File destDir = new File(destinationDirectoryPath);
        if (!destDir.exists()) {
            destDir.mkdir();
        }

        for (File sourceFile : sourceDir.listFiles()) {
            if (sourceFile.isDirectory()) {
                copyDirectoryContents(
                        appendPathComponent(sourceDirectoryPath, sourceFile.getName()),
                        appendPathComponent(destinationDirectoryPath, sourceFile.getName()));
            } else {
                File destFile = new File(destDir, sourceFile.getName());
                FileInputStream fromFileStream = null;
                BufferedInputStream fromBufferedStream = null;
                FileOutputStream destStream = null;
                byte[] buffer = new byte[WRITE_BUFFER_SIZE];
                try {
                    fromFileStream = new FileInputStream(sourceFile);
                    fromBufferedStream = new BufferedInputStream(fromFileStream);
                    destStream = new FileOutputStream(destFile);
                    int bytesRead;
                    while ((bytesRead = fromBufferedStream.read(buffer)) > 0) {
                        destStream.write(buffer, 0, bytesRead);
                    }
                } finally {
                    try {
                        if (fromFileStream != null) fromFileStream.close();
                        if (fromBufferedStream != null) fromBufferedStream.close();
                        if (destStream != null) destStream.close();
                    } catch (IOException e) {
                        throw new IllegalArgumentException("Error closing IO resources.", e);
                    }
                }
            }
        }
    }

    public static void deleteDirectoryAtPath(String directoryPath) {
        if (directoryPath == null) {
            return;
        }
        File file = new File(directoryPath);
        if (file.exists()) {
            deleteFileOrFolderSilently(file);
        }
    }

    public static void deleteFileAtPathSilently(String path) {
        deleteFileOrFolderSilently(new File(path));
    }

    public static void deleteFileOrFolderSilently(File file) {
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            for (File fileEntry : files) {
                if (fileEntry.isDirectory()) {
                    deleteFileOrFolderSilently(fileEntry);
                } else {
                    fileEntry.delete();
                }
            }
        }

        if (!file.delete()) {
        }
    }

    public static boolean fileAtPathExists(String filePath) {
        return new File(filePath).exists();
    }

    public static void moveFile(File fileToMove, String newFolderPath, String newFileName) {
        File newFolder = new File(newFolderPath);
        if (!newFolder.exists()) {
            newFolder.mkdirs();
        }

        File newFilePath = new File(newFolderPath, newFileName);
        if (!fileToMove.renameTo(newFilePath)) {
            throw new IllegalArgumentException("Unable to move file from " +
                    fileToMove.getAbsolutePath() + " to " + newFilePath.getAbsolutePath() + ".");
        }
    }

    public static String readFileToString(String filePath) throws IOException {
        FileInputStream fin = null;
        BufferedReader reader = null;
        try {
            File fl = new File(filePath);
            fin = new FileInputStream(fl);
            reader = new BufferedReader(new InputStreamReader(fin));
            StringBuilder sb = new StringBuilder();
            String line = null;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }

            return sb.toString();
        } finally {
            if (reader != null) reader.close();
            if (fin != null) fin.close();
        }
    }

    public static void unzipFile(File zipFile, String destination) throws IOException {
        FileInputStream fileStream = null;
        BufferedInputStream bufferedStream = null;
        ZipInputStream zipStream = null;
        try {
            fileStream = new FileInputStream(zipFile);
            bufferedStream = new BufferedInputStream(fileStream);
            zipStream = new ZipInputStream(bufferedStream);
            ZipEntry entry;

            File destinationFolder = new File(destination);
            if (destinationFolder.exists()) {
                deleteFileOrFolderSilently(destinationFolder);
            }

            destinationFolder.mkdirs();

            byte[] buffer = new byte[WRITE_BUFFER_SIZE];
            while ((entry = zipStream.getNextEntry()) != null) {
                String fileName = entry.getName();
                File file = new File(destinationFolder, fileName);
                if (entry.isDirectory()) {
                    file.mkdirs();
                } else {
                    File parent = file.getParentFile();
                    if (!parent.exists()) {
                        parent.mkdirs();
                    }

                    FileOutputStream fout = new FileOutputStream(file);
                    try {
                        int numBytesRead;
                        while ((numBytesRead = zipStream.read(buffer)) != -1) {
                            fout.write(buffer, 0, numBytesRead);
                        }
                    } finally {
                        fout.close();
                    }
                }
                long time = entry.getTime();
                if (time > 0) {
                    file.setLastModified(time);
                }
            }
        } finally {
            try {
                if (zipStream != null) zipStream.close();
                if (bufferedStream != null) bufferedStream.close();
                if (fileStream != null) fileStream.close();
            } catch (IOException e) {
                throw new IllegalArgumentException("Error closing IO resources.", e);
            }
        }
    }

    public static void writeStringToFile(String content, String filePath) throws IOException {
        PrintWriter out = null;
        try {
            out = new PrintWriter(filePath);
            out.print(content);
        } finally {
            if (out != null) out.close();
        }
    }
}
