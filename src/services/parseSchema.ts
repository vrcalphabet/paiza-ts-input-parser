import { regex } from 'arkregex'
import type { Schema } from '../types/internal/schema'
import { ParserError } from './ParserError'

// prettier-ignore
const patterns = {
  arrayField: regex('^(?<mark>\\+)?(?<name>[\\w$]+)\\[(?<index>\\d+)?\\](?<twoD>\\[(?<lineCount>[\\w$]+)?\\])?$'),
  spreadField: regex('^\\.\\.\\.(?<mark>\\+)?(?<name>[\\w$]+)(?<twoD>\\[(?<lineCount>[\\w$]+)?\\])?$'),
  bracketArrayField: regex('^(?<name>[\\w$]+)\\[(?<fields>[^\\]]+)\\](?<twoD>\\[(?<lineCount>[\\w$]+)?\\])?$'),
  scalarField: regex('^(?<mark>\\+)?(?<name>[\\w$]+)$'),
  scalarFields: regex('^(?<fields>.+)$'),
}

// prettier-ignore
const parsers = [
  create('arrayField', ({ mark, name, index, twoD, lineCount }) => ({
    name,
    toNumber: !!mark,
    is2D: twoD !== undefined,
    index: index !== undefined ? Number(index) : undefined,
    lineCount
  } as const)),

  create('spreadField', ({ mark, name, twoD, lineCount }) => ({
    name,
    toNumber: !!mark,
    is2D: twoD !== undefined,
    lineCount
  } as const)),

  create('bracketArrayField', ({ name, fields, twoD, lineCount }) => ({
    name,
    fields: parseFields(fields),
    is2D: twoD !== undefined,
    lineCount
  } as const)),

  create('scalarFields', ({ fields }) => ({
    fields: parseFields(fields),
    is2D: false,
  } as const)),
]

type Groups<T extends keyof typeof patterns> =
  (typeof patterns)[T]['inferExecArray']['groups']

function create<T extends keyof typeof patterns, K>(
  type: T,
  callback: (g: Groups<T>) => K,
) {
  return (schemaLine: string) => {
    const g = patterns[type].exec(schemaLine)?.groups
    if (!g) return
    return { type, raw: schemaLine, ...callback(g) }
  }
}

function parseFields(fields: string) {
  return fields.split(/\s*,\s*/).map((field) => {
    const g = patterns.scalarField.exec(field)?.groups
    if (!g) throw ParserError(`'${fields}' は有効な構文ではありません。`)

    return {
      name: g.name,
      toNumber: !!g.mark,
    }
  })
}

function parseSchemaLine(schemaLine: string) {
  for (const parse of parsers) {
    const field = parse(schemaLine)
    if (field) return field
  }
  throw 0
}

export function parseSchema(rawSchema: string) {
  const schemaLines = rawSchema
    .split('\n')
    .map((line) => line.replace(/#.+/, '').trim())
    .filter(Boolean)

  return schemaLines.map<Schema>(parseSchemaLine)
}
