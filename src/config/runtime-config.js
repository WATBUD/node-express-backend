const configuredMode = process.env.INI_APP_MODE

export const iniAppMode =
  configuredMode === 'private-test' || configuredMode === 'production'
    ? configuredMode
    : 'production'

export const showIniTestData = iniAppMode === 'private-test'
