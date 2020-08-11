package com.evan.wechat;

import android.app.Activity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.evan.wechat.adapter.MainAdapter;
import com.evan.wechat.entity.AppInfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import butterknife.BindView;
import butterknife.ButterKnife;


public class MainActivity extends Activity {
    private final String TAG = getClass().getSimpleName();
    @BindView(R.id.recyclerView)
    RecyclerView recyclerView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View root = LayoutInflater.from(this).inflate(R.layout.activity_main, null);
        ButterKnife.bind(this, root);
        setContentView(root);
        AppInfo.getInstance().ValidateEnvironment(this);
        init();
    }

    private void init() {
        AppInfo appInfo = AppInfo.getInstance();
        List<Map<String, String>> data = new ArrayList<>();
        Map<String, String> item = new HashMap<>();
        data.add(item);
        item.put("系统版本", appInfo.getAndroidVersionName());
        item = new HashMap<>();
        data.add(item);
        item.put("是否ROOT", appInfo.isDeviceRooted() ? "已ROOT" : "未ROOT");
        item = new HashMap<>();
        data.add(item);
        item.put("插件是否激活", appInfo.isDeviceRooted() ? "已激活" : "未激活");
        item = new HashMap<>();
        data.add(item);
        item.put("检查插件更新", "");
        MainAdapter mainAdapter = new MainAdapter(this);
        recyclerView.setAdapter(mainAdapter);
        LinearLayoutManager manager = new LinearLayoutManager(this);
        manager.setOrientation(LinearLayoutManager.VERTICAL);
        recyclerView.setLayoutManager(manager);
        mainAdapter.setData(data);
        mainAdapter.setOnItemClickListener(new MainAdapter.OnItemClickListener() {
            @Override
            public void onItemClickListener(String key) {
                switch (key) {
                    case "检查插件更新":
                        break;
                }
            }
        });
    }


}
