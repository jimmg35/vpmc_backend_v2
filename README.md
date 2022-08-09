docker cp D:\nginx-test\vpmc\default.conf nginx:/etc/nginx/conf.d
docker exec nginx nginx -t
docker exec nginx nginx -s reload