import fs from 'node:fs'
import path from 'node:path'

const [sourceArgument, envArgument = '.env'] = process.argv.slice(2)
if (!sourceArgument) throw new Error('Usage: node scripts/configure-local-fcm.js <service-account.json> [env-file]')

const sourcePath = path.resolve(sourceArgument)
const envPath = path.resolve(envArgument)
const credential = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
if (credential.project_id !== 'ini-dating' || !credential.private_key || !credential.client_email) {
  throw new Error('Firebase service account is incomplete or belongs to the wrong project.')
}

const values = {
  FCM_PROJECT_ID: credential.project_id,
  FCM_SERVICE_ACCOUNT_JSON: JSON.stringify(credential),
}
const original = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8').split(/\r?\n/) : []
const found = new Set()
const updated = original.filter(line => {
  const key = Object.keys(values).find(candidate => line.startsWith(`${candidate}=`))
  if (!key) return true
  if (found.has(key)) return false
  found.add(key)
  return true
}).map(line => {
  const key = Object.keys(values).find(candidate => line.startsWith(`${candidate}=`))
  return key ? `${key}=${values[key]}` : line
})
for (const [key, value] of Object.entries(values)) {
  if (!found.has(key)) updated.push(`${key}=${value}`)
}
fs.writeFileSync(envPath, `${updated.filter((line, index, lines) => line || index < lines.length - 1).join('\n')}\n`, { mode: 0o600 })
console.log(`Firebase credentials configured in ${envPath} (secret value hidden).`)
