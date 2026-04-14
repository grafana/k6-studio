/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'https://gist.githubusercontent.com/allansson/5cd3942fd9f028b274769adbdfc44250/raw/9879811e4238a1a70b6adf7a3ddaca4b3982fe73/index.js' {
  interface Expect {
    (...args: any[]): any

    use(plugin: any): void
  }

  export const expect: Expect
}

export {}
