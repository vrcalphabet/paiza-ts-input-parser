/*!
  using paiza-ts-input-parser
  stdinの入力データを型安全に取り出すためのライブラリです。

  https://github.com/vrcalphabet/paiza-ts-input-parser
  https://www.npmjs.com/package/@vrcalphabet/paiza-ts-input-parser
*/
import { parseLines } from './services/parseInput'
import { parseSchema } from './services/parseSchema'
import type { InputSchema } from './types/inputSchema'

export function parseInput<T extends string>(rawSchema: T) {
  const schemas = parseSchema(rawSchema)
  console.log(JSON.stringify(schemas, null, 2))
  return parseLines(schemas) as InputSchema<T>
}
