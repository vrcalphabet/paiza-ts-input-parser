import fs from 'node:fs'
import { regex } from 'arkregex'
import type { InputSchema } from './types/inputSchema'

type FieldType = {
  mark: '' | '+'
  name: string
}

type FieldArgsType = {
  name: string
  args: string
}

/*!
  using paiza-ts-input-parser
  stdinの入力データを型安全に取り出すためのライブラリです。
  
  https://github.com/vrcalphabet/paiza-ts-input-parser
  https://www.npmjs.com/package/@vrcalphabet/paiza-ts-input-parser
*/
export class InputParser {
  private static _isFirstTime = true
  private static _stdin: string[]
  // prettier-ignore
  private static _patterns = {
    field: regex('^(?<mark>\\+?)(?<name>[\\w$]+)$'),
    arrayField: regex('^(?<mark>\\+?)(?<name>[\\w$]+)\\[\\]$'),
    array2DField: regex('^(?<mark>\\+?)(?<name>[\\w$]+)\\[\\]\\[\\]$'),
    bracketArrayField: regex('^(?<name>[\\w$]+)\\[(?<args>\\+?[\\w$]+( *, *\\+?[\\w$]+)*)\\]$'),
    bracketArray2DField: regex('^(?<name>[\\w$]+)\\[(?<args>\\+?[\\w$]+( *, *\\+?[\\w$]+)*)\\]\\[\\]$'),
    spreadField: regex('^\\.\\.\\.(?<mark>\\+?)(?<name>[\\w$]+)$'),
    spreadArrayField: regex('^\\.\\.\\.(?<mark>\\+?)(?<name>[\\w$]+)\\[\\]$'),
  }

  private constructor() {}

  static parse<T extends string>(schema: T): InputSchema<T> {
    const stdin = fs.readFileSync(0, 'utf-8')

    if (stdin === '') {
      if (this._isFirstTime) {
        throw new Error(
          '[InputParser] InputParser より前に stdin を取得する処理を入れてはいけません。',
        )
      } else {
        throw new Error(
          '[InputParser] InputParser.parse を2回実行することはできません。',
        )
      }
    }

    // 最後の改行文字を削除
    this._stdin = stdin.split('\n').slice(0, -1)

    const schemaLines = schema
      .split('\n')
      .map((line) => line.replace(/#.+/, '').trim())
      .filter(Boolean)

    this._isFirstTime = false
    return this._parseLines(schemaLines)
  }

  private static _parseLines(lines: string[]) {
    const result: Record<string, unknown>[] = []

    type SchemaNames = keyof typeof this._patterns
    type Rule = {
      name: SchemaNames
      method: Function
      multi?: true
    }

    // prettier-ignore
    const rules: Rule[] = [
      { name: "arrayField", method: this._parseArrayField },
      { name: "bracketArrayField", method: this._parseBracketArrayField },
      { name: "spreadField", method: this._parseSpreadField },
      { name: "array2DField", method: this._parseArray2DField, multi: true },
      { name: "spreadArrayField", method: this._parseSpreadArrayField, multi: true },
      { name: "bracketArray2DField", method: this._parseBracketArray2DField, multi: true },
    ]

    linesLoop: for (const [lineIndex, schemaLine] of lines.entries()) {
      if (lineIndex >= this._stdin.length) {
        throw new Error(
          `[InputParser] ${lineIndex + 1}行目 '${schemaLine}' を期待しましたが、対応する行がありませんでした。`,
        )
      }

      for (const rule of rules) {
        const g = this._match(schemaLine, rule.name)
        if (g) {
          result.push(rule.method.bind(this)(g, lineIndex))

          if (rule.multi) break linesLoop
          else continue linesLoop
        }
      }

      result.push(this._parseScalarFields(schemaLine, lineIndex))
    }

    return Object.assign({}, ...result)
  }

  private static _parseScalarFields(schemaLine: string, lineIndex: number) {
    const split = (str: string, sep: string) => {
      return str.split(sep).map((token) => token.trim())
    }

    const stdinLine = this._stdin[lineIndex]!

    const schemaFields = split(schemaLine, ',')
    const stdinTokens = split(stdinLine, ' ')

    const result: Record<string, string | number> = {}

    for (const [tokenIndex, schemaField] of schemaFields.entries()) {
      const stdinToken = stdinTokens[tokenIndex]
      if (stdinToken === undefined) {
        throw new Error(
          `[InputParser] ${lineIndex + 1}行目${tokenIndex + 1}列目 '${schemaField}' を期待しましたが、対応する列がありませんでした。`,
        )
      }

      const fieldType = this._getFieldType(schemaField)
      if (fieldType.ignoreVar) continue
      result[fieldType.name] = fieldType.type === 'number' ? +stdinToken : stdinToken
    }

    return result
  }

  private static _parseSpreadField(field: FieldType, lineIndex: number) {
    if (this._getFieldType(field.name).ignoreVar) return {}
    const stdinLine = this._stdin[lineIndex]!

    return {
      [field.name]: this._processTokens(field.mark, [...stdinLine]),
    }
  }

  private static _parseArrayField(field: FieldType, lineIndex: number) {
    if (this._getFieldType(field.name).ignoreVar) return {}
    const stdinLine = this._stdin[lineIndex]!

    return {
      [field.name]: this._processTokens(field.mark, stdinLine.split(' ')),
    }
  }

  private static _parseArray2DField(field: FieldType, lineIndex: number) {
    if (this._getFieldType(field.name).ignoreVar) return {}

    return {
      [field.name]: this._stdin
        .slice(lineIndex)
        .map((_, i) => this._parseArrayField(field, lineIndex + i)),
    }
  }

  private static _parseSpreadArrayField(field: FieldType, lineIndex: number) {
    if (this._getFieldType(field.name).ignoreVar) return {}

    return {
      [field.name]: this._stdin
        .slice(lineIndex)
        .map((_, i) => this._parseSpreadField(field, lineIndex + i)),
    }
  }

  private static _parseBracketArrayField(field: FieldArgsType, lineIndex: number) {
    return {
      [field.name]: this._parseScalarFields(field.args, lineIndex),
    }
  }

  private static _parseBracketArray2DField(field: FieldArgsType, lineIndex: number) {
    return {
      [field.name]: this._stdin
        .slice(lineIndex)
        .map((_, i) => this._parseScalarFields(field.args, lineIndex + i)),
    }
  }

  private static _match<K extends keyof typeof this._patterns>(
    str: string,
    patternName: K,
  ): (typeof this._patterns)[K]['inferExecArray']['groups'] | undefined {
    return this._patterns[patternName].exec(str)?.groups
  }

  private static _getFieldType(fieldName: string) {
    const ignoreVar = fieldName.startsWith('_') || fieldName.startsWith('+_')

    if (fieldName.startsWith('+')) {
      return { name: fieldName.slice(1), ignoreVar, type: 'number' } as const
    } else {
      return { name: fieldName, ignoreVar, type: 'string' } as const
    }
  }

  private static _processTokens(mark: '+' | '', token: string[]) {
    return mark === '+' ? token.map(Number) : token
  }
}
