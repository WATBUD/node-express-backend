# INI Dating 測試模式

INI Dating 以環境變數區分私人測試資料與正式服務資料。正式環境不能只靠前端隱藏內容；後端也會拒絕測試帳號登入，並從探索、收件匣、公開個人檔案及聊天室查詢中排除測試帳號。

## 模式設定

前端：

```env
EXPO_PUBLIC_APP_MODE=private-test
```

後端：

```env
INI_APP_MODE=private-test
```

私人測試時，前後端必須同時設為 `private-test`。正式部署則必須同時明確設為 `production`：

```env
EXPO_PUBLIC_APP_MODE=production
INI_APP_MODE=production
```

未設定時，前端與後端一律預設為 `production`。私人測試必須明確設定兩個環境變數，避免開發設定意外出現在正式版本。正式建置仍建議明確設定，以便直接辨識部署用途。

## 測試帳號標記

`ini_dating.users.is_test_account` 是資料庫端的正式判斷來源。建立新的測試帳號後，需將該欄位設為 `TRUE`；一般註冊帳號預設為 `FALSE`。

```sql
UPDATE users SET is_test_account = TRUE WHERE user_id = 你的測試帳號ID;
```

初次部署或既有資料庫升級時執行：

```bash
npm run migrate:ini:test-accounts
```

## 發布檢查

- 前端建置環境為 `EXPO_PUBLIC_APP_MODE=production`
- Render 後端為 `INI_APP_MODE=production`
- 所有示範或自動化測試帳號均標記 `is_test_account=TRUE`
- 使用正式版測試：測試帳號不能登入，探索與收件匣不出現測試資料
