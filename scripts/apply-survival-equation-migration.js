// 建立 Survival Equation 獨立 Database 與帳號資料表。
// 用法：npm run migrate:survival-equation（只需設定 DATABASE_URL）
import fs from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import {
  baseDatabaseUrl,
  survivalEquationDatabaseName,
  survivalEquationDatabaseUrl,
} from '../src/database/database-urls.js'

const base = new PrismaClient({ datasources: { db: { url: baseDatabaseUrl } } })
try {
  await base.$executeRawUnsafe(`CREATE DATABASE IF NOT EXISTS \`${survivalEquationDatabaseName}\``)
} finally {
  await base.$disconnect()
}

const db = new PrismaClient({ datasources: { db: { url: survivalEquationDatabaseUrl } } })
try {
  const sql = await fs.readFile(new URL('../src/database/survival-equation/schema.sql', import.meta.url), 'utf8')
  const statements = sql
    .split(';')
    .map(s => s.replace(/^\s*--.*$/gm, '').trim())
    .filter(Boolean)
  for (const statement of statements) await db.$executeRawUnsafe(statement)
  console.log('Survival Equation database ready.')
} finally {
  await db.$disconnect()
}
