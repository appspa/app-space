
/usr/local/Homebrew/etc/nginx/nginx.conf

sudo nginx -s reload
nginx -t
nginx -s reload
service nginx restart

brew services start nginx    # 启动
nginx -c /usr/local/Homebrew/etc/nginx/nginx.conf    # 首先利用配置文件启动nginx
brew services stop nginx     # 停止
service nginx restart        # 重启
nginx -h                     # 查看帮助信息
nginx -v                     # 查看nginx版本(小写字母v)
nginx -V                     # 除版本信息外还显示配置参数信息(大写字母V)
start nginx                  # 启动nginx
start nginx -c filename      # 指定配置文件启动nginx
nginx -s quit                # 关闭nginx，完整有序的停止nginx，保存相关信息
nginx -s stop                # 关闭nginx，快速停止nginx，可能并不保存相关信息
nginx -s reload              # 重新载入nginx，当配置信息修改需要重新加载配置是使用
nginx -s reopen              # 重新打开日志文件
nginx -t -c filename         # 测试nginx配置文件是否正确
systemctl stop nginx.service       # linux停止
systemctl start nginx.service      # linux启动
ps aux | grep nginx                # 查看服务
systemctl restart nginx.service    # 重启
netstat -tlnp                      # 端口号
