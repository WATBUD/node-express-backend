# INI Dating 與 WatchLab 資料庫分離

後端在同一個 MySQL／TiDB 叢集內使用兩個獨立 Database：

- `ini_dating`：INI Dating 帳號、驗證、性別與未來交友資料。
- `watchlab`：WatchLab 使用者、股票主檔、日價、自選清單與服務紀錄。

## 環境變數

```dotenv
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/test"
```

`DATABASE_URL` 是同一個 MySQL／TiDB 叢集的共用基礎連線。後端會保留其帳密、Host、Port 與 TLS 參數，並依服務自動將 Database 名稱切換成 `ini_dating` 或 `watchlab`。因此 Render 後台只需設定這一個環境變數。

原 `test` Database 的資料已完成切割，舊切割工具已退役。`test` 保留為空 Database，供未來整合測試使用，不是正式 API 的資料來源。

## Repository 路由

- `AuthService` 由 `DATABASE_URL` 自動衍生並連線至 `ini_dating`。
- WatchLab 的 `UserService`、股票 repository 與 request log 由同一連線自動切換至 `watchlab`。

部署平台只需設定 `DATABASE_URL`。變更後需重新啟動 Node 程序。
