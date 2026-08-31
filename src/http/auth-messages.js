const messages={
 en:{ACCOUNT_EXISTS:'This phone number or Email is already registered',ACCOUNT_MISMATCH:'The account does not match the verified contact',INVALID_VERIFICATION_CODE:'The verification code is invalid or expired',INVALID_CREDENTIALS:'Incorrect account or password',ACCOUNT_DISABLED:'This account is disabled',USER_NOT_FOUND:'User not found',INTERNAL_ERROR:'The server encountered an error'},
 ja:{ACCOUNT_EXISTS:'この電話番号またはメールは登録済みです',ACCOUNT_MISMATCH:'アカウントと認証済みの連絡先が一致しません',INVALID_VERIFICATION_CODE:'認証コードが無効または期限切れです',INVALID_CREDENTIALS:'アカウントまたはパスワードが正しくありません',ACCOUNT_DISABLED:'このアカウントは停止されています',USER_NOT_FOUND:'ユーザーが見つかりません',INTERNAL_ERROR:'サーバーエラーが発生しました'},
}

export const localizedError=(req,error)=>{
 const language=(req.headers['accept-language']||'zh-TW').toLowerCase()
 const locale=language.startsWith('ja')?'ja':language.startsWith('en')?'en':'zh-TW'
 const code=error.code||'INTERNAL_ERROR'
 return locale==='zh-TW'?(error.statusCode?error.message:'伺服器發生錯誤'):(messages[locale][code]||messages[locale].INTERNAL_ERROR)
}
