# Node.js 後端（Express + Prisma）
# 固定 Node 版本，避免 latest 造成環境漂移
FROM node:22-slim

# Prisma 在 Debian slim 需要 openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先複製 package 檔以善用 layer cache
COPY package*.json ./

# 複製 Prisma schema，讓 npm install 的 postinstall (prisma generate) 找得到它
COPY src/database/prisma ./src/database/prisma

# 安裝依賴（postinstall 會自動執行 prisma generate）
RUN npm install

# 複製其餘應用程式碼
COPY . .

# 應用程式讀 PORT 環境變數（預設 3000）
EXPOSE 3000

# 正式環境用 node 啟動（非 nodemon）
CMD ["npm", "start"]
