 
# 使用 Node.js 的官方基礎映像作為基礎
FROM node:latest

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 以安裝依賴
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用程式代碼到容器中
COPY . .

# 暴露應用程式運行的端口
EXPOSE 9421

# 定義啟動命令 ,"--","--legacy-watch"]
CMD ["npm","run","start"]
