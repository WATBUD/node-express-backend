# INI 語音交友與聊天後端規格

## 核心規則

- 語音邀請只接受 10 至 60 秒、最大 3 MB 的音訊；後端會解析檔案實際長度，不信任前端回報。
- 聲音探索只顯示已有 10 至 60 秒公開自介語音的使用者；聽取自介語音與私密邀請使用不同資料表，不會誤公開邀請內容。
- 聲音與文字探索共用時間、年齡、城市距離及最後上線時間篩選，不再以內容類別篩選。
- `user_profiles.birthdate` 用來計算年齡；`city`、`latitude`、`longitude` 用來計算城市與近似距離；`users.last_active_at` 記錄最後上線時間。API 僅回傳城市、距離及最後上線時間，不公開精確座標。
- App 僅在使用者進入探索功能時要求前景定位權限，透過 `PATCH /api/auth/location` 更新 GPS 座標、定位精確度及 `location_updated_at`。拒絕權限不影響其他功能，且不進行背景定位。
- 同一寄件人不可同時對同一收件人建立多筆待審邀請。
- 收件人通過後，雙方建立唯一好友連線，邀請從待審收件匣移除，並可進入私密聊天室。
- 寄件人可在審核前撤回；收件人可拒絕。這兩種操作都會刪除邀請與音訊資料。
- 只有邀請雙方可以讀取該語音；只有已建立好友連線的雙方可以讀取或傳送聊天室訊息。
- 帳號刪除時，資料庫外鍵會連帶移除個人檔案、語音邀請、好友連線及聊天訊息。

## API

所有端點都需要 `Authorization: Bearer <accessToken>`。

| 方法     | 路徑                                 | 功能                                           |
| -------- | ------------------------------------ | ---------------------------------------------- |
| `GET`    | `/api/voice/discovery`               | 取得可送出語音邀請的使用者                     |
| `PUT`    | `/api/voice/profile`                 | 新增或更換自己的公開自介語音                   |
| `GET`    | `/api/voice/profiles/:userId/audio`  | 播放指定使用者的公開自介語音                   |
| `GET`    | `/api/voice/invites?box=inbox\|sent` | 取得收件匣或待審寄件紀錄                       |
| `POST`   | `/api/voice/invites`                 | 以 multipart 上傳 `recipientUserId` 與 `audio` |
| `GET`    | `/api/voice/invites/:id/audio`       | 由邀請雙方驗證後讀取音訊                       |
| `DELETE` | `/api/voice/invites/:id`             | 寄件人撤回待審邀請                             |
| `POST`   | `/api/voice/invites/:id/review`      | 收件人以 `approved` 或 `rejected` 審核         |
| `GET`    | `/api/chat/threads`                  | 取得已通過審核的好友清單                       |
| `GET`    | `/api/chat/users/:userId/messages`   | 取得與指定好友的訊息                           |
| `POST`   | `/api/chat/users/:userId/messages`   | 傳送 1 至 1000 字的文字訊息                    |

完整欄位與回應可在 INI Swagger 頁面查看。

## 儲存設計

- `voice_invites` 保存邀請參與者、狀態、長度及時間。
- `voice_profile_assets` 依使用者保存公開自介語音，與私密邀請音訊完全分離。
- `voice_recording_assets` 獨立保存 MIME、大小、SHA-256 與音訊二進位資料；以邀請 ID 一對一連結。
- `connections` 以排序後的兩個使用者 ID 建立唯一好友關係，避免方向不同造成重複。
- `chat_messages` 保存好友連線、寄件人、訊息本文與建立時間。

音訊放在資料庫可支援換手機後讀取；若容量成長，應改存私有物件儲存，資料庫只保存受保護物件鍵及中繼資料。

## 防護限制

- 每個帳號每小時最多上傳 20 次語音邀請。
- 單一音訊最大 3 MB，multipart 最多一個檔案。
- 每個帳號每分鐘最多送出 60 則聊天訊息。
- 音訊與聊天室端點仍套用全站 IP 限流。

目前限流使用單一 Node 程序記憶體。多實例部署前須改用 Redis 等共享儲存，詳細限制見 `docs/security-abuse-protection.md`。

## 驗證

```bash
npm test
node scripts/check-voice-chat-e2e.js <audio-file>
```

端到端腳本會建立隔離邀請、驗證音訊上傳與審核、建立好友、傳送及讀取訊息，最後清除該次產生的測試關聯。
