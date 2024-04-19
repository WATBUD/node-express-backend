@echo off
echo Pulling database changes...
npx prisma db pull

echo Generating Prisma client...
npx prisma generate

echo Done.
