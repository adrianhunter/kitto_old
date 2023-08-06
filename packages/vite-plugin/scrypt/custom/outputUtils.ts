// import { fileURLToPath, pathToFileURL } from 'node:url'
// import path, { join } from 'node:path'
// import { Buffer } from 'node:buffer'
// import fs, { existsSync, unlinkSync } from 'node:fs'
// import { execSync } from 'node:child_process'
// import * as crypto from 'node:crypto'
// import JSONbig from 'npm:json-bigint'
// import type { ABIEntity, AliasEntity, Artifact, CompileError, ContractEntity, LibraryEntity, ParamEntity, RelatedInformation, StaticEntity, StructEntity, TypeInfo, TypeResolver } from './types.ts'
// import { ABIEntityType, CompileErrorType, SymbolType } from './types.ts'
// import type { CompilingSettings } from './compiler.ts'
// import { CompileResult } from './compiler.ts'

// const SYNTAX_ERR_REG = /(?<filePath>[^\s]+):(?<line>\d+):(?<column>\d+):\n([^\n]+\n){3}(unexpected (?<unexpected>[^\n]+)\nexpecting (?<expecting>[^\n]+)|(?<message>[^\n]+))/g
// const SEMANTIC_ERR_REG = /Error:(\s|\n)*(?<filePath>[^\s]+):(?<line>\d+):(?<column>\d+):(?<line1>\d+):(?<column1>\d+):*\n(?<message>[^\n]+)\n/g
// const INTERNAL_ERR_REG = /Internal error:(?<message>.+)/
// const WARNING_REG = /Warning:(\s|\n)*(?<filePath>[^\s]+):(?<line>\d+):(?<column>\d+):(?<line1>\d+):(?<column1>\d+):*\n(?<message>[^\n]+)\n/g
// const JSONbigAlways = JSONbig({ alwaysParseAsBig: true, constructorAction: 'preserve' })

// // SOURCE_REG parser src eg: [0:6:3:8:4#Bar.constructor:0]
// export const SOURCE_REG = /^(?<fileIndex>-?\d+):(?<line>\d+):(?<col>\d+):(?<endLine>\d+):(?<endCol>\d+)(#(?<tagStr>.+))?/
// const RELATED_INFORMATION_REG = /(?<filePath>[^\s]+):(?<line>\d+):(?<column>\d+):(?<line1>\d+):(?<column1>\d+)/gi

// export function md5(s: string): string {
//   const md5 = crypto.createHash('md5')

//   return md5.update(s).digest('hex')
// }
// function _addSourceLocationProperty(astObj: any, uri: string | null) {
//   if (!(typeof astObj === 'object'))
//     return astObj
//   for (const field in astObj) {
//     const value = astObj[field]
//     if (field === 'src') {
//       const matches = /:(\d+):(\d+):(\d+):(\d+)/.exec(value)
//       if (!matches) {
//         astObj.loc = null
//       }
//       else {
//         astObj.loc = {
//           source: uri,
//           start: { line: Number.parseInt(matches[1]), column: Number.parseInt(matches[2]) },
//           end: { line: Number.parseInt(matches[3]), column: Number.parseInt(matches[4]) },
//         }
//       }
//       delete astObj.src
//     }
//     else if (typeof value === 'object') {
//       _addSourceLocationProperty(value, uri)
//     }
//   }

//   return astObj
// }

// function addSourceLocation(astRoot: any, basePath: string, curFileName: string) {
//   for (const fileName in astRoot) {
//     if (fileName === 'std') {
//       astRoot.std = _addSourceLocationProperty(astRoot.std, 'std')
//     }
//     else {
//       const realFileName = fileName === 'stdin' ? curFileName : fileName
//       const uri = path2uri(path.join(basePath, realFileName))
//       astRoot[uri] = _addSourceLocationProperty(astRoot[fileName], uri)
//       delete astRoot[fileName]
//     }
//   }
//   return astRoot
// }
// export function isNode(): boolean {
//   return typeof window === 'undefined' && typeof globalThis.process === 'object'
// }

// export function path2uri(path: string): string {
//   if (isNode())
//     return pathToFileURL(path).toString()

//   else
//     return path
// }

// export function uri2path(uri: string): string {
//   if (isNode())
//     return fileURLToPath(uri)

//   else
//     return uri
// }

// export function getContractName(astRoot: any): string {
//   const mainContract = astRoot.contracts[astRoot.contracts.length - 1]
//   if (!mainContract)
//     return ''

//   return mainContract.name || ''
// }
// function shortGenericType(genericType: string): string {
//   const m = genericType.match(/__SCRYPT_(\w+)__/)
//   if (m)
//     return m[1]

//   return genericType
// }

// function getConstructorDeclaration(mainContract: any): ABIEntity {
//   // explict constructor
//   if (mainContract.constructor) {
//     return {
//       type: ABIEntityType.CONSTRUCTOR,
//       params: mainContract.constructor.params.map((p) => { return { name: p.name, type: p.type } }),
//     }
//   }
//   else {
//     // implicit constructor
//     if (mainContract.properties) {
//       return {
//         type: ABIEntityType.CONSTRUCTOR,
//         params: mainContract.properties.map((p) => { return { name: p.name.replace('this.', ''), type: p.type } }),
//       }
//     }
//     else {
//       throw new Error('todo...')
//     }
//   }
// }

// /**
//  *
//  * @param astRoot AST root node after main contract compilation
//  * @param typeResolver a Type Resolver
//  * @returns All function ABIs defined by the main contract, including constructors
//  */
// export function getABIDeclaration(astRoot: any, typeResolver: TypeResolver): ABI {
//   const mainContract = astRoot.contracts[astRoot.contracts.length - 1]
//   if (!mainContract) {
//     return {
//       contract: '',
//       abi: [],
//     }
//   }

//   const interfaces: ABIEntity[] = getPublicFunctionDeclaration(mainContract)
//   const constructorABI = getConstructorDeclaration(mainContract)

//   interfaces.push(constructorABI)

//   interfaces.forEach((abi) => {
//     abi.params = abi.params.map((param) => {
//       return Object.assign(param, {
//         type: typeResolver(param.type).finalType,
//       })
//     })
//   })

//   return {
//     contract: getContractName(astRoot),
//     abi: interfaces,
//   }
// }

// function getPublicFunctionDeclaration(mainContract: any): ABIEntity[] {
//   let pubIndex = 0
//   const interfaces: ABIEntity[]
//       = mainContract.functions
//         .filter(f => f.visibility === 'Public')
//         .map((f) => {
//           const entity: ABIEntity = {
//             type: ABIEntityType.FUNCTION,
//             name: f.name,
//             index: f.nodeType === 'Constructor' ? undefined : pubIndex++,
//             params: f.params.map((p) => { return { name: p.name, type: p.type } }),
//           }
//           return entity
//         })
//   return interfaces
// }

// function getStateProps(astRoot: any): Array<ParamEntity> {
//   const mainContract = astRoot.contracts[astRoot.contracts.length - 1]
//   if (mainContract && mainContract.properties)
//     return mainContract.properties.filter(p => p.state).map((p) => { return { name: p.name.replace('this.', ''), type: p.type } })

//   return []
// }

// function parserAst(result: CompileResult, ast: any, srcDir: string, sourceFileName: string, sourcePath: string) {
//   const allAst = addSourceLocation(ast, srcDir, sourceFileName)

//   const sourceUri = path2uri(sourcePath)
//   result.file = sourceUri
//   result.ast = allAst[sourceUri]
//   delete allAst[sourceUri]
//   result.dependencyAsts = allAst

//   const alias = getAliasDeclaration(result.ast, allAst)
//   const structs = getStructDeclaration(result.ast, allAst)
//   const library = getLibraryDeclaration(result.ast, allAst)

//   const statics = getStaticDeclaration(result.ast, allAst)

//   result.contracts = getContractDeclaration(result.ast, allAst)

//   const typeResolver = buildTypeResolver(getContractName(result.ast), alias, structs, library, result.contracts, statics)

//   result.alias = alias.map(a => ({
//     name: a.name,
//     type: typeResolver(a.type).finalType,
//   }))

//   result.structs = structs.map(a => ({
//     name: a.name,
//     params: a.params.map(p => ({ name: p.name, type: typeResolver(p.type).finalType })),
//     genericTypes: a.genericTypes.map(t => shortGenericType(t)),
//   }))

//   result.library = library.map(a => ({
//     name: a.name,
//     params: a.params.map(p => ({ name: p.name, type: typeResolver(p.type).finalType })),
//     properties: a.properties.map(p => ({ name: p.name, type: typeResolver(p.type).finalType })),
//     genericTypes: a.genericTypes.map(t => shortGenericType(t)),
//   }))

//   result.statics = statics.map(s => (Object.assign({ ...s }, {
//     type: typeResolver(s.type).finalType,
//   })))

//   const { contract: name, abi } = getABIDeclaration(result.ast, typeResolver)

//   result.stateProps = getStateProps(result.ast).map(p => ({ name: p.name, type: typeResolver(p.type).finalType }))

//   result.abi = abi
//   result.contract = name
// }

// /**
//  *
//  * @param astRoot AST root node after main contract compilation
//  * @param dependencyAsts AST root node after all dependency contract compilation
//  * @returns all defined type aliaes of the main contract and dependent contracts
//  */
// export function getAliasDeclaration(astRoot: any, dependencyAsts: any): Array<AliasEntity> {
//   const allAst = [astRoot]

//   Object.keys(dependencyAsts).forEach((key) => {
//     allAst.push(dependencyAsts[key])
//   })

//   return allAst.map((ast) => {
//     return (ast.alias || []).map(s => ({
//       name: s.alias,
//       type: s.type,
//     }))
//   }).flat(1)
// }

// /**
//    *
//    * @param astRoot AST root node after main contract compilation
//    * @param dependencyAsts AST root node after all dependency contract compilation
//    * @returns all defined static const int literal of the main contract and dependent contracts
//    */
// export function getStaticDeclaration(astRoot: any, dependencyAsts: any): Array<StaticEntity> {
//   const allAst = [astRoot]
//   Object.keys(dependencyAsts).forEach((key) => {
//     allAst.push(dependencyAsts[key])
//   })

//   return allAst.map((ast) => {
//     return (ast.contracts || []).map((contract) => {
//       return (contract.statics || []).map((node) => {
//         return {
//           const: node.const,
//           name: `${contract.name}.${node.name}`,
//           type: node.type,
//           value: resolveConstValue(node),
//         }
//       })
//     })
//   }).flat(Number.POSITIVE_INFINITY).flat(1)
// }

// /**
//  *
//  * @param astRoot AST root node after main contract compilation
//  * @param dependencyAsts AST root node after all dependency contract compilation
//  * @returns all defined structures of the main contract and dependent contracts
//  */
// export function getStructDeclaration(astRoot: any, dependencyAsts: any): Array<StructEntity> {
//   const allAst = [astRoot]

//   Object.keys(dependencyAsts).forEach((key) => {
//     allAst.push(dependencyAsts[key])
//   })

//   return allAst.map((ast) => {
//     return (ast.structs || []).map(s => ({
//       name: s.name,
//       params: s.fields.map((p) => { return { name: p.name, type: p.type } }),
//       genericTypes: s.genericTypes || [],
//     }))
//   }).flat(1)
// }

// /**
//  *
//  * @param astRoot AST root node after main contract compilation
//  * @param dependencyAsts AST root node after all dependency contract compilation
//  * @returns all defined Library of the main contract and dependent contracts
//  */
// export function getLibraryDeclaration(astRoot: any, dependencyAsts: any): Array<LibraryEntity> {
//   const allAst = [astRoot]

//   Object.keys(dependencyAsts).forEach((key) => {
//     if (key !== 'std')
//       allAst.push(dependencyAsts[key])
//   })

//   return allAst.map((ast) => {
//     return (ast.contracts || []).filter(c => c.nodeType === 'Library').map((c) => {
//       if (c.constructor) {
//         return {
//           name: c.name,
//           params: c.constructor.params.map((p) => { return { name: `ctor.${p.name}`, type: p.type } }),
//           properties: c.properties.map((p) => { return { name: p.name, type: p.type } }),
//           genericTypes: c.genericTypes || [],
//         }
//       }
//       else {
//         // implicit constructor
//         if (c.properties) {
//           return {
//             name: c.name,
//             params: c.properties.map((p) => { return { name: p.name, type: p.type } }),
//             properties: c.properties.map((p) => { return { name: p.name, type: p.type } }),
//             genericTypes: c.genericTypes || [],
//           }
//         }
//       }
//     })
//   }).flat(1)
// }

// export function getContractDeclaration(astRoot: any, dependencyAsts: any): Array<ContractEntity> {
//   const allAst = [astRoot]

//   Object.keys(dependencyAsts).forEach((key) => {
//     if (key !== 'std')
//       allAst.push(dependencyAsts[key])
//   })

//   return allAst.map((ast) => {
//     return (ast.contracts || []).filter(c => c.nodeType === 'Contract').map((c) => {
//       if (c.constructor) {
//         return {
//           name: c.name,
//           params: c.constructor.params.map((p) => { return { name: `ctor.${p.name}`, type: p.type } }),
//           properties: c.properties.map((p) => { return { name: p.name, type: p.type } }),
//           genericTypes: c.genericTypes || [],
//         }
//       }
//       else {
//         // implicit constructor
//         if (c.properties) {
//           return {
//             name: c.name,
//             params: c.properties.map((p) => { return { name: p.name, type: p.type } }),
//             properties: c.properties.map((p) => { return { name: p.name, type: p.type } }),
//             genericTypes: c.genericTypes || [],
//           }
//         }
//       }
//     })
//   }).flat(1)
// }

// export function hasGeneric(entity: StructEntity | LibraryEntity): boolean {
//   return entity.genericTypes.length > 0
// }

// export function buildTypeResolverFromArtifact(artifact: Artifact): TypeResolver {
//   const alias: AliasEntity[] = artifact.alias || []
//   const library: LibraryEntity[] = artifact.library || []
//   const structs: StructEntity[] = artifact.structs || []
//   const contract = artifact.contract
//   return buildTypeResolver(contract, alias, structs, library)
// }

// // build a resolver witch can only resolve type
// export function buildTypeResolver(contract: string, alias: AliasEntity[], structs: StructEntity[],
//   library: LibraryEntity[], contracts: ContractEntity[] = [], statics: StaticEntity[] = []): TypeResolver {
//   const resolvedTypes: Record<string, TypeInfo> = {}
//   structs.forEach((element) => {
//     resolvedTypes[element.name] = {
//       info: element,
//       generic: hasGeneric(element),
//       finalType: element.name,
//       symbolType: SymbolType.Struct,
//     }
//   })

//   library.forEach((element) => {
//     resolvedTypes[element.name] = {
//       info: element,
//       generic: hasGeneric(element),
//       finalType: element.name,
//       symbolType: SymbolType.Library,
//     }
//   })

//   contracts.forEach((element) => {
//     resolvedTypes[element.name] = {
//       info: element,
//       generic: hasGeneric(element),
//       finalType: element.name,
//       symbolType: SymbolType.Contract,
//     }
//   })

//   // add std type

//   resolvedTypes.HashedMap = {
//     info: {
//       name: 'HashedMap',
//       params: [
//         {
//           name: '_data',
//           type: 'bytes',
//         },
//       ],
//       properties: [
//         {
//           name: '_data',
//           type: 'bytes',
//         },
//       ],
//       genericTypes: ['K', 'V'],
//     },
//     generic: true,
//     finalType: 'HashedMap',
//     symbolType: SymbolType.Library,
//   }
//   resolvedTypes.HashedSet = {
//     info: {
//       name: 'HashedSet',
//       params: [
//         {
//           name: '_data',
//           type: 'bytes',
//         },
//       ],
//       properties: [
//         {
//           name: '_data',
//           type: 'bytes',
//         },
//       ],
//       genericTypes: ['E'],
//     },
//     generic: true,
//     finalType: 'HashedSet',
//     symbolType: SymbolType.Library,
//   }

//   resolvedTypes.SortedItem = {
//     info: {
//       name: 'SortedItem',
//       params: [
//         {
//           name: 'item',
//           type: 'T',
//         },
//         {
//           name: 'idx',
//           type: 'int',
//         },
//       ],
//       genericTypes: ['T'],
//     },
//     generic: true,
//     finalType: 'SortedItem',
//     symbolType: SymbolType.Struct,
//   }

//   resolvedTypes.PubKeyHash = {
//     finalType: 'Ripemd160',
//     generic: false,
//     symbolType: SymbolType.ScryptType,
//   }

//   const resolver = (type: string): TypeInfo => {
//     if (resolvedTypes[type])
//       return resolvedTypes[type]

//     if (isScryptType(type)) {
//       return {
//         generic: false,
//         finalType: type,
//         symbolType: SymbolType.ScryptType,
//       }
//     }

//     return resolveType(type, resolvedTypes, contract, statics, alias, library)
//   }

//   return resolver
// }

// export enum ScryptType {
//   BOOL = 'bool',
//   INT = 'int',
//   BYTES = 'bytes',
//   PUBKEY = 'PubKey',
//   PRIVKEY = 'PrivKey',
//   SIG = 'Sig',
//   RIPEMD160 = 'Ripemd160',
//   SHA1 = 'Sha1',
//   SHA256 = 'Sha256',
//   SIGHASHTYPE = 'SigHashType',
//   SIGHASHPREIMAGE = 'SigHashPreimage',
//   OPCODETYPE = 'OpCodeType',
// }
// function resolveAlias(alias: AliasEntity[], type: string): string {
//   const a = alias.find((a) => {
//     return a.name === type
//   })

//   if (a)
//     return resolveAlias(alias, a.type)

//   return type
// }

// export function isScryptType(type: string): boolean {
//   // @ts-expect-error asd
//   return Object.keys(ScryptType).map(key => ScryptType[key]).includes(type)
// }

// /**
//  * return eg. int[N][N][4] => ['int', ["N","N","4"]]
//  * @param arrayTypeName
//  */
// export function arrayTypeAndSizeStr(arrayTypeName: string): [string, Array<string>] {
//   const arraySizes: Array<string> = []

//   if (arrayTypeName.includes('>')) {
//     const elemTypeName = arrayTypeName.substring(0, arrayTypeName.lastIndexOf('>') + 1)
//     const sizeParts = arrayTypeName.substring(arrayTypeName.lastIndexOf('>') + 1);

//     [...sizeParts.matchAll(/\[([\w.]+)\]+/g)].forEach((match) => {
//       arraySizes.push(match[1])
//     })

//     return [elemTypeName, arraySizes]
//   }
//   [...arrayTypeName.matchAll(/\[([\w.]+)\]+/g)].forEach((match) => {
//     arraySizes.push(match[1])
//   })

//   const group = arrayTypeName.split('[')
//   const elemTypeName = group[0]
//   return [elemTypeName, arraySizes]
// }

// export function findConstStatic(statics: StaticEntity[], name: string): StaticEntity | undefined {
//   return statics.find((s) => {
//     return s.const === true && s.name === name
//   })
// }
// export function findStatic(statics: StaticEntity[], name: string): StaticEntity | undefined {
//   return statics.find((s) => {
//     return s.name === name
//   })
// }

// // test Token[3], int[3], st.b.c[3]
// export function isArrayType(type: string): boolean {
//   return /^(.+)(\[[\w.]+\])+$/.test(type)
// }

// function resolveConstStatic(contract: string, type: string, statics: StaticEntity[]): string {
//   if (isArrayType(type)) {
//     const [elemTypeName, arraySizes] = arrayTypeAndSizeStr(type)

//     const sizes = arraySizes.map((size) => {
//       if (/^(\d)+$/.test(size)) {
//         return Number.parseInt(size)
//       }
//       else {
//         // size as a static const
//         const size_ = (size.indexOf('.') > 0) ? size : `${contract}.${size}`
//         const value = findConstStatic(statics, size_)
//         if (!value) {
//           // Unable to solve when the subscript of the array is a function parameter, [CTC](https://scryptdoc.readthedocs.io/en/latest/ctc.html)
//           return size
//         }
//         return value.value
//       }
//     })

//     return toLiteralArrayType(elemTypeName, sizes)
//   }
//   return type
// }

// export function resolveType(type: string, originTypes: Record<string, TypeInfo>, contract: string, statics: StaticEntity[], alias: AliasEntity[], librarys: LibraryEntity[]): TypeInfo {
//   type = resolveAlias(alias, type)

//   if (isArrayType(type)) {
//     const [elemTypeName, sizes] = arrayTypeAndSizeStr(type)
//     const elemTypeInfo = resolveType(elemTypeName, originTypes, contract, statics, alias, librarys)

//     if (isArrayType(elemTypeInfo.finalType)) {
//       const [elemTypeName_, sizes_] = arrayTypeAndSizeStr(elemTypeInfo.finalType)

//       const elemTypeInfo_ = resolveType(elemTypeName_, originTypes, contract, statics, alias, librarys)
//       return {
//         info: elemTypeInfo.info,
//         generic: elemTypeInfo.generic,
//         finalType: resolveConstStatic(contract, toLiteralArrayType(elemTypeInfo_.finalType, sizes.concat(sizes_)), statics),
//         symbolType: elemTypeInfo.symbolType,
//       }
//     }

//     return {
//       info: elemTypeInfo.info,
//       generic: elemTypeInfo.generic,
//       finalType: resolveConstStatic(contract, toLiteralArrayType(elemTypeInfo.finalType, sizes), statics),
//       symbolType: elemTypeInfo.symbolType,
//     }
//   }
//   else if (isGenericType(type)) {
//     const [name, genericTypes] = parseGenericType(type)
//     const typeInfo = resolveType(name, originTypes, contract, statics, alias, librarys)
//     const gts = genericTypes.map(t => resolveType(t, originTypes, contract, statics, alias, librarys).finalType)

//     return {
//       info: typeInfo.info,
//       generic: true,
//       finalType: toGenericType(typeInfo.finalType, gts),
//       symbolType: typeInfo.symbolType,
//     }
//   }

//   if (originTypes[type]) {
//     return originTypes[type]
//   }
//   else if (isScryptType(type)) {
//     return {
//       finalType: type,
//       generic: false,
//       symbolType: SymbolType.ScryptType,
//     }
//   }
//   else {
//     return {
//       finalType: type,
//       generic: false,
//       symbolType: SymbolType.Unknown,
//     }
//   }
// }

// /**
//  * check if a type is generic type
//  * @param type
//  * @returns
//  */
// export function isGenericType(type: string): boolean {
//   return /^([\w]+)<([\w,[\]\s<>]+)>$/.test(type)
// }

// export function toLiteralArrayType(elemTypeName: string, sizes: Array<number | string>): string {
//   return [elemTypeName, sizes.map(size => `[${size}]`).join('')].join('')
// }

// export function toGenericType(name: string, genericTypes: Array<string>): string {
//   return `${name}<${genericTypes.join(',')}>`
// }

// /**
//  *
//  * @param type eg. HashedMap<int,int>
//  * @param eg. ["HashedMap", ["int", "int"]}] An array generic types returned by @getGenericDeclaration
//  * @returns {"K": "int", "V": "int"}
//  */
// export function parseGenericType(type: string): [string, Array<string>] {
//   if (isGenericType(type)) {
//     const m = type.match(/([\w]+)<([\w,[\]<>\s]+)>$/)
//     if (m) {
//       const library = m[1]
//       const realTypes = []
//       const brackets = []
//       let tmpType = ''
//       for (let i = 0; i < m[2].length; i++) {
//         const ch = m[2].charAt(i)

//         if (ch === '<' || ch === '[') {
//           brackets.push(ch)
//         }
//         else if (ch === '>' || ch === ']') {
//           brackets.pop()
//         }
//         else if (ch === ',') {
//           if (brackets.length === 0) {
//             realTypes.push(tmpType.trim())
//             tmpType = ''
//             continue
//           }
//         }
//         tmpType += ch
//       }
//       realTypes.push(tmpType.trim())

//       return [library, realTypes]
//     }
//   }
//   throw new Error(`"${type}" is not generic type`)
// }

// export function resolveConstValue(node: any): string | undefined {
//   let value: string | undefined
//   if (node.expr.nodeType === 'IntLiteral')
//     value = node.expr.value.toString(10)

//   else if (node.expr.nodeType === 'BoolLiteral')
//     value = node.expr.value
//   if (node.expr.nodeType === 'BytesLiteral')
//     value = `b'${node.expr.value.map(a => uint82hex(a)).join('')}'`
//   if (node.expr.nodeType === 'FunctionCall') {
//     if ([ScryptType.PUBKEY, ScryptType.RIPEMD160, ScryptType.SIG, ScryptType.SIGHASHTYPE, ScryptType.OPCODETYPE, ScryptType.SIGHASHPREIMAGE, ScryptType.SHA1, ScryptType.SHA256].includes(node.expr.name))
//       value = `b'${node.expr.params[0].value.map(a => uint82hex(a)).join('')}'`

//     else if (node.expr.name === ScryptType.PRIVKEY)
//       value = node.expr.params[0].value.toString(10)
//   }
//   return value
// }

// export function uint82hex(val: number): string {
//   let hex = val.toString(16)
//   if (hex.length % 2 === 1)
//     hex = `0${hex}`

//   return hex
// }

// export function toHex(x: { toString(format: 'hex'): string }): string {
//   return x.toString('hex')
// }

// export function utf82Hex(val: string): string {
//   const encoder = new TextEncoder()
//   const uint8array = encoder.encode(val)
//   return toHex(Buffer.from(uint8array))
// }

// export function compilerVersion(cwd: string): string | undefined {
//   try {
//     const text = execSync(`"${cwd}" version`).toString()
//     return /Version:\s*([^\s]+)\s*/.exec(text)[1]
//   }
//   catch (e) {
//     throw new Error(`compilerVersion fail when run: ${cwd} version`)
//   }
// }

// function getOutputFilePath(baseDir: string, target: 'ast' | 'asm' | 'hex' | 'artifact' | 'map' | 'dbg'): string {
//   if (target === 'hex')
//     return path.join(baseDir, `stdin_${target}.txt`)

//   else if (target === 'map')
//     return path.join(baseDir, `stdin.${target}.json`)

//   else if (target === 'dbg')
//     return path.join(baseDir, `stdin.${target}.json`)

//   else if (target === 'artifact')
//     return path.join(baseDir, 'stdin.json')

//   return path.join(baseDir, `stdin_${target}.json`)
// }

// export function getFullFilePath(relativePath: string, baseDir: string, curFileName: string): string {
//   if (relativePath.endsWith('stdin'))
//     return join(baseDir, curFileName) // replace 'stdin' with real current compiling file name.

//   if (relativePath === 'std')
//     return 'std' //

//   return join(baseDir, relativePath)
// }

// function getErrorsAndWarnings(output: string, srcDir: string, sourceFileName: string): CompileResult {
//   const warnings: Warning[] = [...output.matchAll(WARNING_REG)].map((match) => {
//     const filePath = match.groups?.filePath || ''
//     const origin_message = match.groups?.message || ''
//     const { message, relatedInformation } = getRelatedInformation(origin_message, srcDir, sourceFileName)
//     return {
//       type: CompileErrorType.Warning,
//       filePath: getFullFilePath(filePath, srcDir, sourceFileName),
//       position: [{
//         line: Number.parseInt(match.groups?.line || '-1'),
//         column: Number.parseInt(match.groups?.column || '-1'),
//       }, {
//         line: Number.parseInt(match.groups?.line1 || '-1'),
//         column: Number.parseInt(match.groups?.column1 || '-1'),
//       }],
//       message,
//       relatedInformation,
//     }
//   })

//   if (output.match(INTERNAL_ERR_REG)) {
//     const errors: CompileError[] = [{
//       type: CompileErrorType.InternalError,
//       filePath: getFullFilePath('stdin', srcDir, sourceFileName),
//       message: `Compiler internal error: ${output.match(INTERNAL_ERR_REG).groups?.message || ''}`,
//       position: [{
//         line: 1,
//         column: 1,
//       }, {
//         line: 1,
//         column: 1,
//       }],
//       relatedInformation: [],
//     }]

//     return new CompileResult(errors, warnings)
//   }
//   else if (output.includes('Syntax error:')) {
//     const syntaxErrors: CompileError[] = [...output.matchAll(SYNTAX_ERR_REG)].map((match) => {
//       const filePath = match.groups?.filePath || ''
//       const unexpected = match.groups?.unexpected || ''
//       const expecting = match.groups?.expecting || ''
//       const origin_message = match.groups?.message || `unexpected ${unexpected}\nexpecting ${expecting}`
//       const { message, relatedInformation } = getRelatedInformation(origin_message, srcDir, sourceFileName)
//       return {
//         type: CompileErrorType.SyntaxError,
//         filePath: getFullFilePath(filePath, srcDir, sourceFileName),
//         position: [{
//           line: Number.parseInt(match.groups?.line || '-1'),
//           column: Number.parseInt(match.groups?.column || '-1'),
//         }],
//         message,
//         unexpected,
//         expecting,
//         relatedInformation,
//       }
//     })

//     return new CompileResult(syntaxErrors, warnings)
//   }
//   else {
//     const semanticErrors: CompileError[] = [...output.matchAll(SEMANTIC_ERR_REG)].map((match) => {
//       const origin_message = match.groups?.message || ''
//       const filePath = match.groups?.filePath || ''
//       const { message, relatedInformation } = getRelatedInformation(origin_message, srcDir, sourceFileName)

//       return {
//         type: CompileErrorType.SemanticError,
//         filePath: getFullFilePath(filePath, srcDir, sourceFileName),
//         position: [{
//           line: Number.parseInt(match.groups?.line || '-1'),
//           column: Number.parseInt(match.groups?.column || '-1'),
//         }, {
//           line: Number.parseInt(match.groups?.line1 || '-1'),
//           column: Number.parseInt(match.groups?.column1 || '-1'),
//         }],
//         message,
//         relatedInformation,
//       }
//     })

//     return new CompileResult(semanticErrors, warnings)
//   }
// }

// export function handleCompilerOutput(
//   sourcePath: string,
//   settings: CompilingSettings,
//   output: string,
//   md5: string,
// ): CompileResult {
//   const srcDir = path.dirname(sourcePath)
//   const sourceFileName = path.basename(sourcePath)
//   const artifactsDir = settings.outputDir || srcDir
//   const outputDir = '/Users/X/Documents/GitHub/kitto/packages/vite-plugin/scrypt/out'
//   const outputFiles = {}
//   try {
//     // Because the output of the compiler on the win32 platform uses crlf as a newline， here we change \r\n to \n. make SYNTAX_ERR_REG、SEMANTIC_ERR_REG、IMPORT_ERR_REG work.
//     output = output.split(/\r?\n/g).join('\n')
//     const result: CompileResult = new CompileResult([], [])
//     result.compilerVersion = compilerVersion(settings.cmdPrefix ? settings.cmdPrefix : findCompiler())
//     result.md5 = md5
//     result.buildType = settings.buildType || BuildType.Debug
//     if (output.startsWith('Error:') || output.startsWith('Warning:')) {
//       Object.assign(result, getErrorsAndWarnings(output, srcDir, sourceFileName))

//       if (result.errors.length > 0)
//         return result

//       if (settings.stdout && result.warnings.length > 0) { // stdout not allowed warnings
//         return result
//       }
//     }

//     if (settings.stdout) {
//       const stdout = JSONbigAlways.parse(output)

//       parserAst(result, stdout.ast, srcDir, sourceFileName, sourcePath)

//       parserASM(result, stdout.asm, settings, srcDir, sourceFileName)
//     }
//     else {
//       if (settings.ast || settings.artifact) {
//         const outputFilePath = getOutputFilePath(outputDir, 'ast')
//         const astFile = outputFilePath.replace('stdin', basename(sourcePath, '.scrypt'))
//         fs.renameSync(outputFilePath, astFile)
//         outputFiles.ast = astFile
//         const ast = JSONbigAlways.parse(readFileSync(astFile, 'utf8'))
//         parserAst(result, ast, srcDir, sourceFileName, sourcePath)
//       }

//       if (settings.hex || settings.artifact) {
//         const outputFilePath = getOutputFilePath(outputDir, 'hex')
//         const hexFile = outputFilePath.replace('stdin', basename(sourcePath, '.scrypt'))
//         fs.renameSync(outputFilePath, hexFile)
//         outputFiles.hex = hexFile
//         result.hex = readFileSync(hexFile, 'utf8')
//       }

//       if (settings.sourceMap) {
//         const outputFilePath = getOutputFilePath(outputDir, 'map')
//         if (settings.artifact) {
//           const dist = getOutputFilePath(artifactsDir, 'map')
//           const sourceMapFile = dist.replace('stdin', path.basename(sourcePath, '.scrypt'))
//           fs.renameSync(outputFilePath, sourceMapFile)
//           result.sourceMapFile = path2uri(sourceMapFile)
//         }
//         else {
//           const sourceMapFile = outputFilePath.replace('stdin', path.basename(sourcePath, '.scrypt'))
//           fs.renameSync(outputFilePath, sourceMapFile)
//           outputFiles.map = sourceMapFile
//           result.sourceMapFile = path2uri(sourceMapFile)
//         }
//       }

//       if (settings.debug) {
//         const outputFilePath = getOutputFilePath(outputDir, 'dbg')
//         const dbgFile = outputFilePath.replace('stdin', path.basename(sourcePath, '.scrypt'))
//         fs.renameSync(outputFilePath, dbgFile)
//         result.dbgFile = path2uri(dbgFile)
//       }

//       if (settings.artifact) {
//         const outputFilePath = getOutputFilePath(artifactsDir, 'artifact')
//         const artifactFile = outputFilePath.replace('stdin', path.basename(sourcePath, '.scrypt'))
//         const artifact = result.toArtifact()

//         fs.writeFileSync(artifactFile, JSON.stringify(artifact, (key, value) => {
//           // ignore deprecated fields
//           if (key === 'sources' || key === 'sourceMap' || key === 'asm')
//             return undefined
//           else
//             return value
//         }, 4))
//       }
//     }

//     return result
//   }
//   finally {
//     doClean(settings, outputFiles, outputDir)
//   }
// }

// function doClean(settings: CompilingSettings, outputFiles: Record<string, string>, outputDir: string) {
//   if (settings.stdout || settings.outputToFiles || settings.sourceMap)
//     return

//   try {
//     Object.keys(outputFiles).forEach((outputType) => {
//       const file = outputFiles[outputType]
//       if (existsSync(file))
//         unlinkSync(file)
//     })

//     // rimraf.sync(outputDir)
//   }
//   catch (error) {
//     console.error('clean compiler output files failed!')
//   }

//   // console.log('compile time spent: ', Date.now() - st)
// }
// function getRelatedInformation(message: string, srcDir: string, sourceFileName: string): {
//   relatedInformation: RelatedInformation[]
//   message: string
// } {
//   const relatedInformation: RelatedInformation[] = []
//   let result

//   while ((result = RELATED_INFORMATION_REG.exec(message))) {
//     const relatedFilePath = result.groups.filePath
//     if (relatedFilePath === 'null')
//       continue
//     const fullFilePath = getFullFilePath(relatedFilePath, srcDir, sourceFileName)
//     const line = Number.parseInt(result.groups?.line || '-1')
//     const column = Number.parseInt(result.groups?.column || '-1')
//     relatedInformation.push(
//       {
//         filePath: fullFilePath,
//         position: [{
//           line,
//           column,
//         }, {
//           line: Number.parseInt(result.groups?.line1 || '-1'),
//           column: Number.parseInt(result.groups?.column1 || '-1'),
//         }],
//         message: '',
//       },
//     )
//     message = message.replace(/([^\s]+):(\d+):(\d+):(\d+):(\d+)/, '')
//   }
//   return {
//     relatedInformation,
//     message,
//   }
// }
