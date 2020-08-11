
package com.evan.wechat;

import android.app.Application;

import com.zhy.http.okhttp.OkHttpUtils;
import com.zhy.http.okhttp.https.HttpsUtils;
import com.zhy.http.okhttp.log.LoggerInterceptor;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;

public class BaseApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        HttpsUtils.SSLParams sslParams = HttpsUtils.getSslSocketFactory(null, null, null);
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .connectTimeout(10000L, TimeUnit.MILLISECONDS) // 连接超时时间
                .readTimeout(10000L, TimeUnit.MILLISECONDS) // 读取超时时间
                .addInterceptor(new LoggerInterceptor("OkHttp"))
                .sslSocketFactory(sslParams.sSLSocketFactory, sslParams.trustManager)
//                .sslSocketFactory(createSSLSocketFactory())
//                .hostnameVerifier(new TrustAllHostnameVerifier())
                .build();
        OkHttpUtils.initClient(okHttpClient);
    }
}
