import type { Field, Schema } from '../types/internal/schema'
import { ParserError } from './ParserError'
import { readStdin } from './readStdin'

function parseLine(
  schema: Schema,
  stdin: string[],
  lineIndex: number,
  result: Record<string, unknown>,
) {
  if (schema.is2D) {
    const lineCount = schema.lineCount
    if (lineCount !== undefined && !(lineCount in result)) {
      throw ParserError(
        `${lineIndex + 1}行目 '${schema.lineCount}' を参照しようとしましたが、該当する変数は割り当てられていませんでした。`,
      )
    }

    const endIndex =
      lineCount !== undefined ? lineIndex + Number(result[lineCount]) : undefined
    const parsedLines = stdin
      .slice(lineIndex, endIndex)
      .map((_, i) => parseFieldSchema(schema, stdin, lineIndex + i))
    return { [schema.name]: parsedLines }
  } else {
    const parsed = parseFieldSchema(schema, stdin, lineIndex)
    return schema.type !== 'scalarFields' ? { [schema.name]: parsed } : parsed
  }
}

function parseFieldSchema(schema: Schema, stdin: string[], lineIndex: number) {
  const stdinLine = stdin[lineIndex]!

  switch (schema.type) {
    case 'arrayField': {
      const tokens = processTokens(schema.toNumber, stdinLine.split(' '))
      if (schema.index !== undefined) return tokens[schema.index]
      return tokens
    }
    case 'spreadField':
      return processTokens(schema.toNumber, [...stdinLine])
    case 'bracketArrayField':
    case 'scalarFields':
      return parseScalarFields(schema.fields, stdinLine, lineIndex)
  }
}

function processTokens(toNumber: boolean, values: string[]) {
  if (!toNumber) return values
  return values.map(Number)
}

function parseScalarFields(fields: Field[], stdinLine: string, lineIndex: number) {
  const tokens = stdinLine.split(' ')
  const result: Record<string, string | number> = {}

  for (const [fieldIndex, field] of fields.entries()) {
    const token = tokens[fieldIndex]
    if (token === undefined) {
      throw ParserError(
        `${lineIndex + 1}行${fieldIndex + 1}列目 '${field.name}' を期待しましたが、対応する列がありませんでした。`,
      )
    }

    result[field.name] = field.toNumber ? Number(token) : token
  }

  return result
}

function getConsumedLines(schema: Schema, result: Record<string, unknown>) {
  if (schema.is2D) {
    const lineCount = schema.lineCount
    return lineCount !== undefined ? Number(result[lineCount]) : undefined
  }

  return 1
}

export function parseLines(schemas: Schema[]) {
  const stdin = readStdin()
  const result: Record<string, unknown> = {}

  let lineIndex = 0
  for (const schema of schemas) {
    if (lineIndex >= stdin.length) {
      throw ParserError(
        `${lineIndex + 1}行目 '${schema.raw}' を期待しましたが、対応する行がありませんでした。`,
      )
    }

    Object.assign(result, parseLine(schema, stdin, lineIndex, result))

    const lineCount = getConsumedLines(schema, result)
    if (lineCount === undefined) break
    lineIndex += lineCount
  }

  return result
}
