import {
  Project,
  Structure,
} from 'ts-morph'
import * as tsm from 'ts-morph'

interface Classes {
  node: tsm.ClassDeclarationStructure
  index: number
}
function getScryptClasses(srcFile: tsm.SourceFileStructure) {
  const classesToRemove: Classes[] = []
  if (Array.isArray(srcFile.statements)) {
    srcFile.statements.forEach((sourceFiles, index) => {
      if (
        Structure.isClass(sourceFiles)
        && sourceFiles.decorators?.find(a => a.name === 'contract')
      ) {
        console.error('FOUND SCRYPT CONTRACT')

        sourceFiles.decorators = []

        classesToRemove.push({ node: sourceFiles, index })
      }
    })
  }

  return classesToRemove
}

function decorateClasses(classes: tsm.ClassDeclarationStructure[]) {
  classes.forEach((structure) => {
    structure.properties?.forEach((prop) => {
      prop.decorators ||= []
      if (prop.isReadonly) {
        prop.decorators.push({
          name: 'prop',
          kind: tsm.StructureKind.Decorator,
          arguments: [],
        })
      }
      else {
        prop.decorators.push({
          name: 'prop',
          kind: tsm.StructureKind.Decorator,
          arguments: ['true'],
        })
      }
    })

    structure.methods?.forEach((a) => {
      const stmts = a.statements

      if (!Array.isArray(stmts))
        return

      a.decorators ||= []
      a.decorators.push({
        name: 'method',
        kind: tsm.StructureKind.Decorator,
        arguments: [],
      })
      if (a.scope === tsm.Scope.Private) {
        a.scope = undefined
      }
      else if (a.name.startsWith('#')) {
        a.name = a.name.slice(1)
        a.scope = tsm.Scope.Private
      }
      else {
        a.scope = tsm.Scope.Public

        if (stmts.at(-1) === 'return this') {
          a.statements = [
            ...(stmts.slice(0, stmts.length - 1)
              || []),

            // make sure balance in the contract does not change
            'const amount: bigint = this.ctx.utxo.value',
            // outputs containing the latest state and an optional change output
            'const outputs: ByteString = this.buildStateOutput(amount) + this.buildChangeOutput()',
            // verify unlocking tx has the same outputs
            'assert(this.ctx.hashOutputs == hash256(outputs), \'hashOutputs mismatch\')',
          ]
        }
      }
    })
  })
}
function extendClasses(
  classes: tsm.ClassDeclarationStructure[],
) {
  function extendClass(
    a: tsm.ClassDeclarationStructure,
    b: tsm.ClassDeclarationStructure,
  ) {
    a.properties = [...a.properties, ...b.properties]
    a.methods = [...a.methods, ...b.methods]
  }

  classes.forEach((structure) => {
    if (typeof structure.extends === 'string') {
      const p = classes.find(a => a.name === structure.extends)
      extendClass(structure, p)
    }
    else if (
      !structure.extends
      && !(structure.name === 'SmartContract')
    ) {
      if (!structure.ctors || structure.ctors.length === 0) {
        structure.ctors = [
          {
            statements: [
              // 'super(...arguments)'
            ],
            parameters: [],
            returnType: undefined,
            typeParameters: [],
            docs: [],
            scope: undefined,
            kind: 5,
            overloads: [],
          },
        ]
      }
      else if (structure.ctors[0]) {
        structure.ctors[0].statements = [
          // 'super(...arguments)',
          // @ts-expect-error dirty stuff
          ...(structure.ctors[0].statements || []),
        ]
      }
    }
  })
}

function dirtyClean(a: string): string {
  a = a.replaceAll('this.#', 'this.')
  return a
}

export async function transform(code: string, _id?: string) {
  const project = new Project()
  const srcFile = project.createSourceFile('foo.ts', code, {
    overwrite: true,
  })

  const classesFileStructure = srcFile.getStructure()

  const classes = getScryptClasses(classesFileStructure)

  decorateClasses(classes.map(a => a.node))
  extendClasses(classes.map(a => a.node))

  const outFile = project.createSourceFile('out.ts', classesFileStructure)

  const str = outFile.print()

  return dirtyClean(str)
}
