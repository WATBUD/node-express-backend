const publicMessages = {
  ACCOUNT_EXISTS: 'This account is already registered.',
  ACCOUNT_MISMATCH: 'The account does not match the verified contact.',
  INVALID_VERIFICATION_CODE: 'The verification code is invalid or expired.',
  INVALID_CREDENTIALS: 'The account or password is incorrect.',
  ACCOUNT_DISABLED: 'This account is disabled.',
  USER_NOT_FOUND: 'User not found.',
  VERIFICATION_RATE_LIMITED: 'Please wait before requesting another verification code.',
  VERIFICATION_DELIVERY_FAILED: 'The verification email could not be sent. Please try again later.',
  INTERNAL_ERROR: 'The server encountered an error.',
}

export const publicErrorMessage = error =>
  publicMessages[error.code || 'INTERNAL_ERROR'] || publicMessages.INTERNAL_ERROR
