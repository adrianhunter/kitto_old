// deno-lint-ignore-file no-this-alias
import fss from 'node:fs'
import process from 'node:process'
import type { ClassDeclaration, CustomTransformers } from 'npm:typescript'
import ts from 'npm:typescript'
import { Transpiler } from 'npm:scrypt-ts-transpiler/dist/transpiler.js'
import { IndexerWriter } from 'npm:scrypt-ts-transpiler/dist/indexerWriter.js'
import { tsquery } from 'npm:@phenomnomnominal/tsquery'
import type { TSConfig } from 'pkg-types'

import { getOutputPath } from '@kitto/plugins/pluginUtils.ts'

export default class ScryptProgram {
  options: ts.CompilerOptions = {}
  protected program!: ts.Program
  protected printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  protected knownFiles: { [path: string]: string } = {}
  protected files: ts.MapLike<{ version: number; code?: string }> = {}
  cache = new Map<string, { version: number; code?: string }>()
  debug = false
  protected services: ts.LanguageService
  // config: ResolvedConfig
  constructor(opts: TSConfig) {
    const rootFileNames: string[] = [
    ]

    const cwd = Deno.cwd()

    // this.config = c

    const options: ts.CompilerOptions = {

      strict: true,
      esModuleInterop: true,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Node16,
      skipLibCheck: true,

      sourceMap: true,
      // "noEmit": true
    }

    this.options = options
    rootFileNames.forEach((fileName) => {
      this.files[fileName] = { version: 0 }
    })
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this
    const fileCache = new Map()

    const indexer = new IndexerWriter({ tsconfigDir: cwd, scryptOutDir: opts.compilerOptions?.outDir })

    const servicesHost: ts.LanguageServiceHost = {
      getScriptFileNames: () => {
        return Object.keys(this.files)
      },
      getScriptVersion: (fileName) => {
        return (
          this.files[fileName]
                    && this.files[fileName].version.toString()
        )
      },
      getScriptSnapshot: (fileName) => {
        const cache = this.files[fileName]?.code
        if (cache)
          return ts.ScriptSnapshot.fromString(cache)

        return ts.ScriptSnapshot.fromString(
          fss.readFileSync(fileName, 'utf8'),
        )
      },
      // @ts-expect-error asd
      getSourceFile(fileName: string) {
        if (fileCache.has(fileName)) {
          const file = fileCache.get(fileName)
          fileCache.delete(fileName) // patch for making `tsc --watch` to work
          return file
        }
      },
      getCanonicalFileName(filename: string) {
        return filename
      },
      getSourceFileByPath(fileName: string) {
        if (fileCache.has(fileName)) {
          const file = fileCache.get(fileName)
          fileCache.delete(fileName) // patch for making `tsc --watch` to work
          return file
        }
      },
      useCaseSensitiveFileNames() {
        return true
      },
      getCustomTransformers(): CustomTransformers {
        return {
          before: [ctx => new ScryptTranspiler(ctx, me.services, this, indexer, opts)],
        }
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => options,
      getDefaultLibFileName: ts.getDefaultLibFilePath,
      fileExists: (path) => {
        return ts.sys.fileExists(path)
      },
      readFile: (path, encoding) => {
        return ts.sys.readFile(path, encoding)
      },
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    }
    this.services = ts.createLanguageService(
      servicesHost,
      ts.createDocumentRegistry(),
    )
    rootFileNames.forEach((fileName) => {
      this.emitFile(fileName)
    })
  }

  compile(code: string, id: string) {
    if (!this.files[id]) {
      this.files[id] = { version: 0, code }
    }
    else {
      this.files[id].version++
      this.files[id].code = code
    }
    return this.emitFile(id)
  }

  emitFile(fileName: string) {
    const output = this.services.getEmitOutput(fileName)
    if (!output.emitSkipped) {
      if (this.debug)
        console.error(`Emitting ${fileName}`)
    }
    return output
  }
}

// @ts-expect-error todo..
class CustomTranspiler extends Transpiler {
  declare scComponents: ClassDeclaration[]

  constructor(...args: unknown[]) {
    // @ts-expect-error xxx
    super(...args)
  }

  private searchSmartContractComponents() {
    const scComponentDefs = tsquery(this._srcFile, 'ClassDeclaration:has(HeritageClause)')
    // @ts-expect-error xxx
    const scComponents = scComponentDefs.filter(cDef => this.isExtendsSCComponent(cDef))
    // @ts-expect-error asd
    this.scComponents = scComponents
  }
}

class ScryptTranspiler implements ts.CustomTransformer {
  allMissImportedLocalSymbols = new Map()

  constructor(
    public ctx: ts.TransformationContext,
    public service: ts.LanguageService,
    public serviceHost: ts.LanguageServiceHost,
    public indexer: IndexerWriter,
    public config: TSConfig,
    public scryptCache = new Map(),

  ) {

  }

  transformBundle(node: ts.Bundle): ts.Bundle {
    return node
  }

  transformSourceFile(node: ts.SourceFile): ts.SourceFile {
    const tsOutDir = this.config.compilerOptions?.outDir

    const tsRoutDir = this.config.compilerOptions?.rootDir

    const program = this.service.getProgram()
    if (!program)
      throw new Error('could not find program')

    const checker = program.getTypeChecker()
    const transpiler = new CustomTranspiler(
      node,
      checker,
      tsRoutDir,
      tsOutDir,
      this.indexer,
    )

    const factory = this.ctx.factory

    if (transpiler.scComponents.length) {
      // @ts-expect-error xxx
      const contractAndLibs = transpiler.scComponents.map(cDef => transpiler.transformClassDeclaration(cDef).getCode()).join('\n')
      // @ts-expect-error xxx
      const imports = transpiler.transformImports(this.scryptCache)
      // @ts-expect-error xxx
      const structs = transpiler.transformTypeLiteralAndInterfaces()
      const result = imports.getCode() + structs.getCode() + contractAndLibs

      const outFileName = getOutputPath(node.fileName.replace('.ts', '.scrypt'), this.config)

      Deno.writeTextFileSync(outFileName, result)

      node = ts.visitEachChild(node, (node) => {
        if (ts.isClassDeclaration(node)) {
          const members = node.members.map((a) => {
            if (ts.isMethodDeclaration(a)) {
              // @ts-expect-error asd
              a.modifiers = a.modifiers?.filter((a) => {
                return a.kind !== ts.SyntaxKind.Decorator
              })
            }
            else if (ts.isPropertyDeclaration(a)) {
              // @ts-expect-error asd
              a.modifiers = a.modifiers?.filter((a) => {
                return a.kind !== ts.SyntaxKind.Decorator
              })
            }
            else if (ts.isConstructorDeclaration(a)) {
              if (!a.body)
                return a
              const body = this.ctx.factory.updateBlock(a.body, a.body.statements.slice(1))
              return this.ctx.factory.updateConstructorDeclaration(a, a.modifiers, a.parameters, body)
            }
            return a
          })

          const newClass = this.ctx.factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, undefined, [
            ...members,

            factory.createPropertyDeclaration(
              [factory.createToken(ts.SyntaxKind.StaticKeyword)],
              factory.createIdentifier('__artifact'),
              undefined,
              undefined,
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('JSON'),
                  factory.createIdentifier('parse'),
                ),
                undefined,
                [
                  factory.createNoSubstitutionTemplateLiteral(
                    '___ARTIFACT___',
                  ),
                ],
              ),
            ),
            // factory.createClassStaticBlockDeclaration(factory.createBlock(
            //   [
            //     factory.createExpressionStatement(factory.createBinaryExpression(
            //       factory.createPropertyAccessExpression(
            //         factory.createThis(),
            //         factory.createIdentifier('__artifact'),
            //       ),
            //       factory.createToken(ts.SyntaxKind.EqualsToken),
            //       factory.createCallExpression(
            //         factory.createPropertyAccessExpression(
            //           factory.createIdentifier('JSON'),
            //           factory.createIdentifier('parse'),
            //         ),
            //         undefined,
            //         [factory.createNoSubstitutionTemplateLiteral(
            //           // JSON.stringify(r.artifact),
            //           "___ARTIFACT___"

            //         )],
            //       ),
            //     )),
            //     // factory.createExpressionStatement(factory.createCallExpression(
            //     //   factory.createPropertyAccessExpression(
            //     //     factory.createThis(),
            //     //     factory.createIdentifier('loadArtifact'),
            //     //   ),
            //     //   undefined,
            //     //   [factory.createPropertyAccessExpression(
            //     //     factory.createThis(),
            //     //     factory.createIdentifier('__artifact'),
            //     //   )],
            //     // )),
            //   ],
            //   true,
            // )),

          ])

          const name = newClass.name?.getText() || 'xxx'

          const modifiers = newClass.modifiers?.filter((a) => {
            return a.kind !== ts.SyntaxKind.Decorator && a.kind !== ts.SyntaxKind.ExportKeyword
          })

          node = factory.createVariableStatement(
            [factory.createToken(ts.SyntaxKind.ExportKeyword)],
            factory.createVariableDeclarationList(
              [factory.createVariableDeclaration(
                factory.createIdentifier(name),
                undefined,
                undefined,
                factory.createCallExpression(
                  factory.createIdentifier('contract'),
                  undefined,
                  [
                    factory.createClassExpression(modifiers, newClass.name, newClass.typeParameters, newClass.heritageClauses, newClass.members),
                  ],
                ),
              )],
              ts.NodeFlags.Const,
            ),
          )
        }
        return node
      }, this.ctx)
    }

    return node
  }
}
