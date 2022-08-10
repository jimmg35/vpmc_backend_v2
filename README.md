# nginx config設定
docker cp D:\nginx-test\vpmc\default.conf nginx:/etc/nginx/conf.d
docker exec nginx nginx -t
docker exec nginx nginx -s reload

# 資料庫備份
pg_dump -U postgres -p 5432 vpmcnode > E:\vpmcnode.sql
createdb -U postgres -p 5432 vpmcnode | psql -U postgres -p 5432 vpmcnode < E:\vpmcnode.sql

# 用port殺掉程序(windows)
netstat -ano | findstr :9085
taskkill /PID 14592 /F