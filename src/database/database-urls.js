import 'dotenv/config'

const baseDatabaseUrl = process.env.DATABASE_URL
if (!baseDatabaseUrl) throw new Error('DATABASE_URL is required.')

const deriveDatabaseUrl = databaseName => {
  const url = new URL(baseDatabaseUrl)
  url.pathname = `/${databaseName}`
  return url.toString()
}

export const iniDatabaseUrl = deriveDatabaseUrl('ini_dating')
export const watchlabDatabaseUrl = deriveDatabaseUrl('watchlab')
// Survival Equation（生存方程）遊戲帳號：獨立 Database，不與 INI Dating／WatchLab 共用資料表
export const survivalEquationDatabaseName = 'survival_equation'
export const survivalEquationDatabaseUrl = deriveDatabaseUrl(survivalEquationDatabaseName)
// 建立新 Database 時需先連到共用基礎連線
export { baseDatabaseUrl }
