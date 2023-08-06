// // export type OpCode = any
// // export type ABIEntity = any
// // export type ParamEntity = any
// // export type StructEntity = any

// // export type LibraryEntity = any
// // export type AliasEntity = any

// // export type ContractEntity = any
// // export type StaticEntity = any
// // export type AutoTypedVar = any
// export enum SymbolType {
//   ScryptType = 'ScryptType',
//   Contract = 'Contract',
//   Library = 'Library',
//   Struct = 'Struct',
//   Unknown = 'Unknown',
// }

// export interface TypeInfo {
//   info?: unknown
//   generic: boolean
//   finalType: string
//   symbolType: SymbolType
// }

// export type TypeResolver = (type: string) => TypeInfo

// export enum DebugModeTag {
//   FuncStart = 'F0',
//   FuncEnd = 'F1',
//   LoopStart = 'L0',
// }
// export interface DebugInfo {
//   tag: DebugModeTag
//   contract: string
//   func: string
//   context: string
// }

// export interface Pos {
//   file: string
//   line: number
//   endLine: number
//   column: number
//   endColumn: number
// }

// export interface OpCode {
//   opcode: string
//   stack?: string[]
//   topVars?: string[]
//   pos?: Pos
//   debugInfo?: DebugInfo
// }

// export interface AutoTypedVar {
//   name: string
//   pos: Pos
//   type: string
// }

// export interface ABI {
//   contract: string
//   abi: Array<ABIEntity>
// }

// export enum ABIEntityType {
//   FUNCTION = 'function',
//   CONSTRUCTOR = 'constructor',
// }
// export interface ParamEntity {
//   name: string
//   type: string
// }
// export interface ABIEntity {
//   type: string
//   name?: string
//   params: Array<ParamEntity>
//   index?: number
// }

// export interface StructEntity {
//   name: string
//   params: Array<ParamEntity>
//   genericTypes: Array<string>
// }
// export interface LibraryEntity extends StructEntity {
//   properties: Array<ParamEntity>
// }
// export interface AliasEntity {
//   name: string
//   type: string
// }

// export type ContractEntity = LibraryEntity

// export interface StaticEntity {
//   name: string
//   type: string
//   const: boolean
//   value?: any
// }

// export const CURRENT_CONTRACT_ARTIFACT_VERSION = 9

// export const SUPPORTED_MINIMUM_VERSION = 8
// export interface Artifact {
//   /** version of artifact file */
//   version: number
//   /** version of compiler used to produce this file */
//   compilerVersion: string
//   /** build type, can be debug or release */
//   buildType: string
//   /** name of the contract */
//   contract: string
//   /** md5 of the contract source code */
//   md5: string
//   /** all stateful properties defined in the contracts */
//   stateProps: Array<ParamEntity>
//   /** all structures defined in the contracts, including dependent contracts */
//   structs: Array<StructEntity>
//   /** all library defined in the contracts, including dependent contracts */
//   library: Array<LibraryEntity>
//   /** all typealias defined in the contracts, including dependent contracts */
//   alias: Array<AliasEntity>
//   /** ABI of the contract: interfaces of its public functions and constructor */
//   abi: Array<ABIEntity>
//   /** @deprecated locking script of the contract in ASM format, including placeholders for constructor parameters */
//   asm?: string
//   /** locking script of the contract in hex format, including placeholders for constructor parameters */
//   hex: string
//   /** file uri of the main contract source code file */
//   file: string
//   /** @deprecated **/
//   sources?: Array<string>
//   /** @deprecated **/
//   sourceMap?: Array<string>
//   /** file uri of source map file **/
//   sourceMapFile: string
// }

// export interface RelatedInformation {
//   filePath: string
//   position: [{
//     line: number
//     column: number
//   }, {
//     line: number
//     column: number
//   }?]
//   message: string
// }

// export enum CompileErrorType {
//   SyntaxError = 'SyntaxError',
//   SemanticError = 'SemanticError',
//   InternalError = 'InternalError',
//   Warning = 'Warning',
// }

// export interface CompileErrorBase {
//   type: string
//   filePath: string
//   position: [{
//     line: number
//     column: number
//   }, {
//     line: number
//     column: number
//   }?]
//   message: string
//   relatedInformation: RelatedInformation[]
// }

// export interface SyntaxError extends CompileErrorBase {
//   type: CompileErrorType.SyntaxError
//   unexpected: string
//   expecting: string
// }

// export interface SemanticError extends CompileErrorBase {
//   type: CompileErrorType.SemanticError
// }

// export interface InternalError extends CompileErrorBase {
//   type: CompileErrorType.InternalError
// }

// export interface Warning extends CompileErrorBase {
//   type: CompileErrorType.Warning
// }

// export type CompileError = SyntaxError | SemanticError | InternalError | Warning
