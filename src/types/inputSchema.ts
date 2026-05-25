// #region Utils

type Err_InvalidIdentWithNumeric =
  '無効な識別子です。識別子の先頭に数字は入れられません。'
type Err_InvalidSyntax = '無効な構文です。'
type Err_InvalidSyntaxForgetComma = '無効な構文です。カンマを忘れていませんか？'
type Err_InvalidSyntaxWithExtraComma =
  '無効な構文です。末尾や途中に余計なカンマが含まれています。'
type Err_InvalidSyntaxSpread2D<Name extends string> =
  `無効な構文です。代わりに '...${Name}[]' を使用してください。`
type Err_InvalidSyntaxCantConvertToNumber<Name extends string> =
  `無効な構文です。 '${Name}' は数値に変換できません。`
type Err_HasSyntaxError =
  '構文エラーがあります。下記のエラー内容をよく確認してください。'

type Trim<T extends string> =
  T extends ` ${infer R}` ? Trim<R>
  : T extends `${infer L} ` ? Trim<L>
  : T

type RemoveComment<T extends string> =
  T extends `${infer L}#${string}` ? Trim<L> : Trim<T>

type O<Name extends string, T> = { [K in Name]: T }

type Prettify<T> = { [K in keyof T]: T[K] } & {}

type IsLiteralString<T> =
  T extends string ?
    string extends T ?
      false
    : true
  : false

type ExtractLiteral<T> =
  T extends any[] ? ExtractLiteral<T[number]>
  : IsLiteralString<T> extends true ? T
  : T extends object ? { [K in keyof T]: ExtractLiteral<T[K]> }[keyof T]
  : never

type CheckIgnoreVar<Name extends string, T> = Name extends `_${string}` ? {} : T

// #endregion
// #region Identifier

// prettier-ignore
type AlphaChar =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'
  | '_' | '$'

// prettier-ignore
type NumericChar =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type IdentBodyChar = AlphaChar | NumericChar

type IsIdentBody<T extends string> =
  T extends `${infer Head}${infer Tail}` ?
    Head extends IdentBodyChar ?
      Tail extends '' ?
        true
      : IsIdentBody<Tail>
    : false
  : true

type IfIdent<T extends string, Then> =
  T extends `${infer Head}${infer Tail}` ?
    Head extends AlphaChar ?
      IsIdentBody<Tail> extends true ? Then
      : T extends `${string} ${string}` ? Err_InvalidSyntaxForgetComma
      : Err_InvalidSyntax
    : Head extends NumericChar ? Err_InvalidIdentWithNumeric
    : Err_InvalidSyntax
  : Err_InvalidSyntaxWithExtraComma

// #endregion
// #region DSL

type CheckHasError<T> =
  [ExtractLiteral<T>] extends [never] ? T
  : {
      __ERROR__: {
        reason: Err_HasSyntaxError
        source: Prettify<T>
      }
    }

type SplitLines<T extends string> =
  T extends `${infer L}\n${infer R}` ? [L, ...SplitLines<R>] : [T]

type ParseLines<T extends string[]> =
  T extends [infer L extends string, ...infer Rest extends string[]] ?
    (RemoveComment<L> extends '' ? {} : ParseLine<RemoveComment<L>>) &
      ParseLines<Rest>
  : {}

type ParseLine<T extends string> =
  T extends `...${infer L}[][]` ? O<T, Err_InvalidSyntaxSpread2D<L>>
  : T extends `${infer Name}[][]` ? ParseField<Name, number[][], string[][]>
  : T extends `...${infer Name}[]` ? ParseField<Name, number[][], string[][]>
  : T extends `${infer Name}[${infer Args}][]` ?
    Name extends `+${infer Name}` ?
      O<`+${Name}[${Args}][]`, Err_InvalidSyntaxCantConvertToNumber<Name>>
    : O<Name, Prettify<ParseScalar<Args>>[]>
  : T extends `${infer Name}[${infer Args}]` ?
    Args extends '' ? ParseField<Name, number[], string[]>
    : Name extends `+${infer Name}` ?
      O<`+${Name}[${Args}][]`, Err_InvalidSyntaxCantConvertToNumber<Name>>
    : O<Name, Prettify<ParseScalar<Args>>>
  : T extends `...${infer Name}` ? ParseField<Name, number[], string[]>
  : ParseScalar<T>

type ParseScalar<T extends string> =
  T extends `${infer L},${infer Rest}` ? ParseField<Trim<L>> & ParseScalar<Rest>
  : ParseField<Trim<T>>

type ParseField<T extends string, Num = number, Str = string> =
  T extends `${string},` ? O<T, Err_InvalidSyntaxWithExtraComma>
  : T extends '' ? O<',', Err_InvalidSyntaxWithExtraComma>
  : T extends `+${infer Name}` ? CheckIgnoreVar<Name, O<Name, IfIdent<Name, Num>>>
  : CheckIgnoreVar<T, O<T, IfIdent<T, Str>>>

export type InputSchema<T extends string> =
  string extends T ? never : Prettify<CheckHasError<ParseLines<SplitLines<T>>>>

// #endregion
