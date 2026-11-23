# INI Dating、WatchLab 與 Survival Equation 資料庫分離

後端在同一個 MySQL／TiDB 叢集內使用三個獨立 Database：

- `ini_dating`：INI Dating 帳號、驗證、性別與未來交友資料。
- `watchlab`：WatchLab 使用者、股票主檔、日價、自選清單與服務紀錄。
- `survival_equation`：Survival Equation（生存方程）遊戲帳號（`se_users`）。

## 環境變數

```dotenv
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/test"
```

`DATABASE_URL` 是同一個 MySQL／TiDB 叢集的共用基礎連線。後端會保留其帳密、Host、Port 與 TLS 參數，並依服務自動將 Database 名稱切換成 `ini_dating`、`watchlab` 或 `survival_equation`。因此 Render 後台只需設定這一個環境變數。

原 `test` Database 的資料已完成切割，舊切割工具已退役。`test` 保留為空 Database，供未來整合測試使用，不是正式 API 的資料來源。

## Repository 路由

- `AuthService` 由 `DATABASE_URL` 自動衍生並連線至 `ini_dating`。
- WatchLab 的 `UserService`、股票 repository 與 request log 由同一連線自動切換至 `watchlab`。
- Survival Equation 的 `SurvivalAuthService` 使用 `SurvivalUserRepository`，連線至 `survival_equation`。

## Survival Equation 帳號 API

| 方法 | 路徑 | 說明 |
|---|---|---|
| POST | `/api/survival-equation/auth/register` | 註冊（`account` 3～32 英數底線、`password` 8 字以上含英文與數字、`nickname` 選填） |
| POST | `/api/survival-equation/auth/login` | 登入，回傳 JWT（7 天） |
| GET | `/api/survival-equation/auth/me` | 以 Bearer 權杖取得目前玩家 |

- 權杖 `aud` 為 `survival-equation`，`/me` 只接受此 audience；INI Dating／WatchLab 的權杖無法使用，反之亦然（INI 路由由 session guard 檢查 `user_id`）。
- 註冊與登入沿用既有的 `registrationLimiter`、`loginLimiter` 頻率限制；帳號不存在與密碼錯誤回傳相同錯誤，避免帳號列舉。
- 文件：`/api/survival-equation/docs`。

### 首次部署

```bash
npm run migrate:survival-equation
```

此指令會在同一叢集建立 `survival_equation` Database 與 `se_users` 資料表（`src/database/survival-equation/schema.sql`），可重複執行。

部署平台只需設定 `DATABASE_URL`。變更後需重新啟動 Node 程序。

### 正式版驗證

`Development` 通過測試後合併至 `Production`，正式 Render Blueprint 追蹤 `Production`。遊戲正式網域 `https://survival-equation-web.vercel.app` 已列入 CORS 白名單；其他網域可透過 `CORS_ORIGINS` 擴充。

執行 `npm run verify:survival-auth` 可使用真實資料庫驗證註冊、重複帳號、錯誤密碼、登入及 `/me`。工具只建立隨機命名的測試帳號，結束後刪除本次建立的帳號，不修改既有玩家。需要 `DATABASE_URL`、`JWT_SECRET`。

選填 `SURVIVAL_GODOT` 與 `SURVIVAL_GAME_PATH` 可同時驗證遊戲客戶端登入並進入營地；設定 `SURVIVAL_AUTH_VERIFY_URL` 則驗證指定部署的 API。部署的 API 必須使用同一個資料庫，才能驗證與清理測試帳號。工具不輸出密碼或 JWT。
