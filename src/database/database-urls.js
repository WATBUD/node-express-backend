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
