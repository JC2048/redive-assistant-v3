declare namespace NodeJS {
  interface ProcessEnv {
    readonly TOKEN: string
    readonly CLIENT_ID: string
    readonly DB_ADDRESS: string
    readonly DB_LOGIN_NAME: string
    readonly DB_LOGIN_PASSWORD: string
  }
}