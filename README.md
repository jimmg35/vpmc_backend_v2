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


# 管理員API 權限設置
+ UserController | DONE
    + ['admin:ccis', 'admin:root'] : UserController/assignRole
+ RoleController | DONE
    + ['admin:ccis', 'admin:root'] : RoleController/list
    + ['admin:ccis', 'admin:root'] : RoleController/new
    + ['admin:ccis', 'admin:root'] : RoleController/edit
    + ['admin:ccis', 'admin:root'] : RoleController/assignApp
    + ['admin:ccis', 'admin:root'] : RoleController/listAppByRole
+ AppController
    + ['admin:ccis', 'admin:root'] : AppController/list
    + ['admin:ccis', 'admin:root'] : AppController/new
    + ['admin:ccis', 'admin:root'] : AppController/edit


# API APP 權限對照
+ AnalysisController | DONE
    + function:marketCompare : AnalysisController/marketCompare
    + function:marketCompare : AnalysisController/marketCompareStatistic
+ CommiteeController | DONE
    + function:aprMap : CommiteeController/listTownAvg
    + function:aprMap : CommiteeController/listCommiteeByExtent
    + function:aprMap : CommiteeController/getSimpleInfo
    + function:aprMap : CommiteeController/getAprInfo
    + function:aprMap : CommiteeController/getCommiteeInfoById


# 尚未綁APP權限的API
+ AprController
+ FileController

