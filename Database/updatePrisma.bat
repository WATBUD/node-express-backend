@echo off

echo Pulling database changes...
cmd /c npx prisma db pull 
REM 使用 "cmd /c" 執行 "npx prisma db pull" 命令，並在完成後結束命令提示符窗口

echo Generating Prisma client...
cmd /k npx prisma generate
REM 使用 "cmd /k" 執行 "npx prisma generate" 命令，但保留命令提示符窗口打開以便查看輸出

echo Done.
pause
REM 顯示 "Done."，然後等待用戶按下任意鍵以結束腳本
