# 從 Microsoft Container Registry 提取 SQL Server 2022 (16.x) Linux 容器映像：
docker build -t mai_today .

# 運行 Docker 容器：
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=StrongPassw0rd!" \
   -p 1433:1433 --name sql1 --hostname sql1 \
   -d \
   mcr.microsoft.com/mssql/server:2022-latest



