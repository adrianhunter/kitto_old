/// <reference types="vite/client" />

const modASD = import.meta.glob('./*.civet', {
  // eager: true,
})
// export * as mod from

// export const asd = 123

log(modASD)
export {}
// export * as BufferReader from './BufferReader.civet'
