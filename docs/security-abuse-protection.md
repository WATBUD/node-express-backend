# 伺服器防濫用與帳號建立限制規格

## 目的

降低自動化腳本大量寄送驗證信、批次建立帳號、暴力嘗試密碼及以超大請求消耗伺服器資源的風險。本規格涵蓋目前 Node Express 單一實例的防護設定。

## 現行限制

| 範圍 | 識別方式 | 時間窗 | 上限 | 超過時行為 |
| --- | --- | ---: | ---: | --- |
| 全站 API | IP | 15 分鐘 | 500 次 | HTTP 429 |
| 寄送驗證信 | IP | 15 分鐘 | 8 次 | HTTP 429 |
| 寄送驗證信 | Email | 1 小時 | 5 次 | HTTP 429 |
| 建立帳號 | IP | 1 小時 | 5 次 | HTTP 429 |
| 登入失敗 | IP＋帳號 | 15 分鐘 | 10 次 | HTTP 429；成功登入不計入 |
| 驗證碼重寄 | Email | 60 秒 | 1 次 | HTTP 429 |
| 驗證碼有效期 | Email | 10 分鐘 | — | 過期後拒絕 |
| 驗證碼錯誤 | Email | 單組驗證碼 | 5 次 | 後續驗證拒絕 |
| JSON／表單大小 | 單一請求 | — | 32 KB | HTTP 413 |

## HTTP 回應

限流回應使用穩定錯誤代號及英文 fallback。後端不負責使用者介面翻譯；前端以錯誤代號查詢語系 JSON：

```json
{
  "success": false,
  "error": {
    "code": "VERIFICATION_DESTINATION_RATE_LIMITED",
    "message": "Too many verification emails were sent to this address. Please try again later."
  }
}
```

不同情境使用不同代號：`GLOBAL_RATE_LIMITED`、`VERIFICATION_IP_RATE_LIMITED`、`VERIFICATION_DESTINATION_RATE_LIMITED`、`REGISTRATION_RATE_LIMITED`、`LOGIN_RATE_LIMITED`。回應包含標準 Rate Limit 標頭及 `Retry-After`，前端應避免在限制解除前自動重試。

## 其他安全設定

- 使用 Helmet 加入常用 HTTP 安全標頭並移除 `X-Powered-By`。
- Swagger UI 需要行內資源，目前未啟用 Helmet 預設 CSP；正式公開文件前應另行設計 CSP。
- JWT 僅接受 `HS256`，未登入路由採明確白名單。
- 驗證碼只儲存 SHA-256 摘要，不儲存明碼。
- 正式環境不會把開發測試驗證碼回傳前端或寫入記錄。
- Gmail 憑證只由後端環境變數讀取，不得提交 Git。

## 反向代理設定

部署於 Render 等具有一層反向代理的平台時設定：

```env
TRUST_PROXY_HOPS=1
```

此值必須符合實際代理層數。設定錯誤會造成用戶 IP 判斷不準，進而使限流失效或讓多名使用者共用同一限制。

## 儲存與部署限制

目前 Rate Limit 與驗證碼狀態儲存在單一 Node.js 程序記憶體中：

- 伺服器重啟後計數會歸零。
- 多實例部署時，各實例不會共用計數。

正式擴充至多實例前，應改用 Redis 等集中式儲存，並確保所有實例使用相同的限制規則。

## 後續強化條件

發生下列情況時應加入 CAPTCHA／裝置風險評分：

- 攻擊者大量輪替 IP。
- 驗證信成本或退信率異常上升。
- 同一裝置批次使用不同 Email 建立帳號。
- 正常使用者因共用網路而頻繁誤觸 IP 限制。

另外應建立 Email 退信與濫用監控、封鎖拋棄式信箱策略、帳號建立稽核事件及每日寄信預算警示。

## 驗證方式

執行：

```bash
npm test
npm audit --omit=dev
```

測試需確認第六次對同一 Email 寄送驗證信時回傳 HTTP 429，並確認正式依賴安全掃描為零已知漏洞。
