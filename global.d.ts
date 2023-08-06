/// <reference types="vite/client" />
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

export { }
declare global {
  const definePackageJSON: typeof import('pkg-types')['definePackageJSON']
  const Deno: any
}
// for type re-export
declare global {
  export type { PackageJson } from "pkg-types";

}

