import { parseLines } from './services/parseInput'
import { parseSchema } from './services/parseSchema'
import type { InputSchema } from './types/inputSchema'

export function parseInput<T extends string>(rawSchema: T) {
  const schemas = parseSchema(rawSchema)
  return parseLines(schemas) as InputSchema<T>
}
