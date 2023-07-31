import ts from "typescript";
import { CustomTransformers } from "typescript";
import { ResolvedConfig } from "vite";
import fss from "node:fs";
import process from "node:process"
import { Transpiler } from "scrypt-ts-transpiler/dist/transpiler";
import { IndexerWriter } from "scrypt-ts-transpiler/dist/indexerWriter";
import { compileContract } from "scryptlib"
import { tsquery } from '@phenomnomnominal/tsquery';
import os from "node:os"
import path from "node:path"
import fs from "node:fs"

export class ScryptProgram {
    options: ts.CompilerOptions = {};
    protected program: any;
    protected printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    protected knownFiles: { [path: string]: string } = {};
    protected files: ts.MapLike<{ version: number; code?: string }> = {};
    cache = new Map<string, { version: number; code?: string }>()
    debug: boolean = false;
    protected services: ts.LanguageService;
    config: ResolvedConfig;
    constructor(opts: {}, c: any) {
        const rootFileNames: string[] = [
        ];

        this.config = c;

        const options: ts.CompilerOptions = {
            outDir: c.build.outDir,
            declaration: true,
            allowImportingTsExtensions: true,
            experimentalDecorators: true,
            strict: true,
            esModuleInterop: true,
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            skipLibCheck: true,
        };

        this.options = options;
        rootFileNames.forEach((fileName) => {
            this.files[fileName] = { version: 0 };
        });
        const me = this;
        const fileCache = new Map();

        const tsconfigDir = process.cwd()
        const scryptOutDir = c.build.outDir
        const indexer = new IndexerWriter({ tsconfigDir, scryptOutDir });

        const servicesHost: ts.LanguageServiceHost = {
            getScriptFileNames: () => {
                return Object.keys(this.files);
            },
            getScriptVersion: (fileName) => {
                return (
                    this.files[fileName] &&
                    this.files[fileName].version.toString()
                );
            },
            getScriptSnapshot: (fileName) => {
                const cache = this.files[fileName]?.code;
                if (cache) {
                    return ts.ScriptSnapshot.fromString(cache);
                }
                return ts.ScriptSnapshot.fromString(
                    fss.readFileSync(fileName, "utf8")
                );
            },
            //@ts-ignore
            getSourceFile(fileName: string) {
                if (fileCache.has(fileName)) {
                    const file = fileCache.get(fileName);
                    fileCache.delete(fileName); // patch for making `tsc --watch` to work
                    return file;
                }
            },
            getCanonicalFileName(filename: string) {
                return filename;
            },
            getSourceFileByPath(fileName: string) {
                if (fileCache.has(fileName)) {
                    const file = fileCache.get(fileName);
                    fileCache.delete(fileName); // patch for making `tsc --watch` to work
                    return file;
                }
            },
            useCaseSensitiveFileNames() {
                return true;
            },
            getCustomTransformers(): CustomTransformers {
                return {
                    before: [(ctx) => new ScryptTranspiler(ctx, me.services, this, indexer, c, opts)],
                };
            },
            getCurrentDirectory: () => process.cwd(),
            getCompilationSettings: () => options,
            getDefaultLibFileName: ts.getDefaultLibFilePath,
            fileExists: (path) => {
                return ts.sys.fileExists(path);
            },
            readFile: (path, encoding) => {
                return ts.sys.readFile(path, encoding);
            },
            readDirectory: ts.sys.readDirectory,
            directoryExists: ts.sys.directoryExists,
            getDirectories: ts.sys.getDirectories,
        };
        this.services = ts.createLanguageService(
            servicesHost,
            ts.createDocumentRegistry()
        );
        rootFileNames.forEach((fileName) => {
            this.emitFile(fileName);
        });
    }

    async compile(code: string, id: string, pluginCtx: any) {
        if (!this.files[id]) {
            this.files[id] = { version: 0, code };
        } else {
            this.files[id].version++;
            this.files[id].code = code;
        }
        return this.emitFile(id);
    }
    emitFile(fileName: string) {
        let output = this.services.getEmitOutput(fileName);
        if (!output.emitSkipped) {
            if (this.debug) {
                console.log(`Emitting ${fileName}`);
            }
        }
        return output;
    }
}


//@ts-ignore
class CustomTranspiler extends Transpiler {

    declare scComponents: any[]

    constructor(...args: any[]) {
        //@ts-ignore
        super(...args)
    }

    private searchSmartContractComponents() {
        //@ts-ignore
        const scComponentDefs = tsquery(this._srcFile, "ClassDeclaration:has(HeritageClause)")
        // const scComponentDefs = (0, tsquery_1.tsquery)(this._srcFile, "ClassDeclaration:has(HeritageClause)");
        //@ts-ignore
        let scComponents = scComponentDefs.filter((cDef) => this.isExtendsSCComponent(cDef));
        // scComponents.forEach(cDef => (0, console_1.assert)(typescript_1.default.isClassDeclaration(cDef)));
        //@ts-ignore
        this.scComponents = scComponents;
    }
}


class ScryptTranspiler implements ts.CustomTransformer {
    allMissImportedLocalSymbols = new Map();

    constructor(
        public ctx: ts.TransformationContext,
        public service: ts.LanguageService,
        public serviceHost: ts.LanguageServiceHost,
        public indexer: IndexerWriter,
        public config: ResolvedConfig,
        public opts: {},
        public scryptCache = new Map(),

    ) {

    }
    transformBundle(node: ts.Bundle): ts.Bundle {
        return node;
    }
    transformSourceFile(node: ts.SourceFile): ts.SourceFile {
        const tsOutDir = this.config.build.outDir
        const tsRoutDir = process.cwd()

        const program = this.service.getProgram();
        if (!program) {
            throw new Error("could not find program");
        }
        const checker = program.getTypeChecker();
        const transpiler = new CustomTranspiler(
            node,
            checker,
            tsRoutDir,
            tsOutDir,
            this.indexer
        );

        const factory = this.ctx.factory


        if (transpiler.scComponents.length) {


            //@ts-ignore
            let contractAndLibs = transpiler.scComponents.map((cDef) => transpiler.transformClassDeclaration(cDef).getCode()).join("\n");
            //@ts-ignore
            let imports = transpiler.transformImports(this.scryptCache);
            //@ts-ignore
            let structs = transpiler.transformTypeLiteralAndInterfaces();
            const result = imports.getCode() + structs.getCode() + contractAndLibs
            const tmpFile = createTemporaryFile(result)
            const r = compileContract(tmpFile, { "artifact": true, })

            node = ts.visitEachChild(node, (node) => {
                if (ts.isClassDeclaration(node)) {
                    node = this.ctx.factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, [
                        ...node.members,
                        factory.createClassStaticBlockDeclaration(factory.createBlock(
                            [
                                factory.createExpressionStatement(factory.createBinaryExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createThis(),
                                        factory.createIdentifier("__artifact")
                                    ),
                                    factory.createToken(ts.SyntaxKind.EqualsToken),
                                    factory.createCallExpression(
                                        factory.createPropertyAccessExpression(
                                            factory.createIdentifier("JSON"),
                                            factory.createIdentifier("parse")
                                        ),
                                        undefined,
                                        [factory.createNoSubstitutionTemplateLiteral(
                                            JSON.stringify(r.toArtifact())

                                        )]
                                    )
                                )),
                                factory.createExpressionStatement(factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createThis(),
                                        factory.createIdentifier("loadArtifact")
                                    ),
                                    undefined,
                                    [factory.createPropertyAccessExpression(
                                        factory.createThis(),
                                        factory.createIdentifier("__artifact")
                                    )]
                                ))
                            ],
                            true
                        ))

                    ])
                }
                return node
            }, this.ctx)


        }

        return node;
    }
}

function createTemporaryFile(content: string) {
    const tempDir = os.tmpdir();
    const tempFilename = 'tmp.scrypt';
    const tempFilePath = path.join(tempDir, tempFilename);

    try {
        fs.writeFileSync(tempFilePath, content);
        return tempFilePath
    } catch (err) {
        console.error('Error creating temporary file:', err);
        throw err
    }
}