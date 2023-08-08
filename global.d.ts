/// <reference types="vite/client" />
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

export { }
declare global {
  const definePackageJSON: typeof import('pkg-types')['definePackageJSON']
  const Deno: any
  // export type { definePackageJSON } from "pkg-types";

  export type PkgExtended  = PackageJson & {tsconfig?: TSConfig & {
    reflection?: boolean | string | string[]
  }}

  const Pkg = (a: PkgExtended) => PkgExtended

}
// for type re-export
declare global {
  export type { PackageJson, TSConfig } from "pkg-types";

}

