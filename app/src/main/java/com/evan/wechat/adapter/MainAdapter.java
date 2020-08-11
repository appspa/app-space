/*
 * ************************************************************
 * 文件：MainAdapter.java  模块：app  项目：WeChatGenius
 * 当前修改时间：2020年04月27日 10:41:09
 * 上次修改时间：2020年04月27日 10:41:09
 * 作者：大路
 * Copyright (c) 2020
 * ************************************************************
 */

package com.evan.wechat.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.evan.wechat.R;

import java.util.List;
import java.util.Map;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MainAdapter extends RecyclerView.Adapter<MainAdapter.ViewHolder> {
    private final Context mContent;
    private List<Map<String, String>> mData;
    private OnItemClickListener listener;

    public MainAdapter(Context context) {
        this.mContent = context;
    }

    public void setData(List<Map<String, String>> list) {
        this.mData = list;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View inflate = LayoutInflater.from(mContent).inflate(R.layout.item_main, null, false);
        return new ViewHolder(inflate);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Map<String, String> item = this.mData.get(position);
        for (String key : item.keySet()) {
            String value = item.get(key);
            holder.tvTitle.setText(key);
            holder.tvDes.setText(value);
            if (listener != null) {
                holder.itemView.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        listener.onItemClickListener(key);
                    }
                });
            }
        }
    }

    @Override
    public int getItemCount() {
        return mData == null ? 0 : mData.size();
    }

    public interface OnItemClickListener {
        void onItemClickListener(String key);

    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        @BindView(R.id.tv_title)
        TextView tvTitle;
        @BindView(R.id.tv_des)
        TextView tvDes;

        ViewHolder(View view) {
            super(view);
            ButterKnife.bind(this, view);
        }
    }
}
