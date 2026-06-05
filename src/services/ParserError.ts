export function ParserError(message: string) {
  return new Error(`[InputParser] ${message}`)
}
