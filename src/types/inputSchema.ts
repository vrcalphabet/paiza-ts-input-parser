/* eslint-disable @typescript-eslint/no-empty-object-type */

// #region Utils

type Trim<T extends string> =
  T extends ` ${infer R}` ? Trim<R>
  : T extends `${infer L} ` ? Trim<L>
  : T

type RemoveComment<T extends string> =
  T extends `${infer L}#${string}` ? Trim<L> : Trim<T>

type O<Name extends string, T> = { [K in Name]: T }

type Prettify<T> = { [K in keyof T]: T[K] } & {}

type CheckIgnoreVar<Name extends string, T> = Name extends `_${string}` ? {} : T

// #endregion
// #region Errors

type Error<T extends string> = Prettify<O<'__ERROR__', T>>

type Err_InvalidIdentWithNumeric =
  Error<'無効な識別子です。識別子の先頭に数字は入れられません。'>
type Err_InvalidSyntax = Error<'無効な構文です。'>
type Err_InvalidSyntaxForgetComma =
  Error<'無効な構文です。カンマを忘れていませんか？'>
type Err_InvalidSyntaxWithExtraSymbol =
  Error<'無効な構文です。末尾や途中に余計な記号が含まれています。'>
type Err_HasSyntaxError =
  '構文エラーがあります。下記のエラー内容をよく確認してください。'

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

type IfIdent<T extends string, Raw extends string, Then> =
  T extends `${string} ${string}` ? O<Raw, Err_InvalidSyntaxForgetComma>
  : T extends `${infer Head}${infer Tail}` ?
    Head extends AlphaChar ?
      IsIdentBody<Tail> extends true ?
        Then
      : O<Raw, Err_InvalidSyntax>
    : Head extends NumericChar ? O<Raw, Err_InvalidIdentWithNumeric>
    : O<Raw, Err_InvalidSyntax>
  : O<Raw, Err_InvalidSyntaxWithExtraSymbol>

// #endregion
// #region Schema

type HasError<T> =
  T extends unknown[] ? HasError<T[number]>
  : T extends object ?
    { [K in keyof T]: K extends '__ERROR__' ? true : HasError<T[K]> }[keyof T]
  : false

type CheckHasError<T> =
  HasError<T> extends false ? T
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

type ParseArrayFieldSchema<
  Name extends string,
  Index extends number | '',
  TwoD extends boolean,
> =
  Index extends '' ? ParseField<Name, TwoD, number[], string[]>
  : ParseField<Name, TwoD, number, string>

type ParseSpreadField<Name extends string, TwoD extends boolean> = ParseField<
  Name,
  TwoD,
  number[],
  string[]
>

type ParseBracketArrayField<
  Name extends string,
  Args extends string,
  TwoD extends boolean,
> = O<Name, TwoDimension<Prettify<ParseScalar<Args>>, TwoD>>

type TwoDimension<T, TwoD extends boolean> = TwoD extends false ? T : T[]

type ParseField<
  T extends string,
  TwoD extends boolean = false,
  Num = number,
  Str = string,
> =
  T extends `${string},` ? O<T, Err_InvalidSyntaxWithExtraSymbol>
  : T extends '' ? O<',', Err_InvalidSyntaxWithExtraSymbol>
  : T extends `+~${infer Name}` ?
    CheckIgnoreVar<Name, IfIdent<Name, T, O<Name, TwoDimension<Num, TwoD>>>>
  : T extends `+${infer Name}` ?
    CheckIgnoreVar<Name, IfIdent<Name, T, O<Name, TwoDimension<Num, TwoD>>>>
  : ParseIdent<T, Str, TwoD>

type ParseIdent<T extends string, V, TwoD extends boolean> =
  T extends `${infer Name}={${infer Union}}` ?
    CheckIgnoreVar<
      Name,
      IfIdent<Name, T, O<Name, TwoDimension<keyof ParseUnion<Union>, TwoD>>>
    >
  : CheckIgnoreVar<T, IfIdent<T, T, O<T, TwoDimension<V, TwoD>>>>

type ParseScalar<T extends string> =
  T extends `${infer L},${infer Rest}` ? ParseField<Trim<L>> & ParseScalar<Rest>
  : ParseField<Trim<T>>

type ParseUnion<T extends string> =
  T extends `${infer L}|${infer Rest}` ? O<L, never> & ParseUnion<Rest> : O<T, never>

type CheckLineCount<LineCount extends string, Raw extends string, T> =
  LineCount extends '' ? T
  : LineCount extends `${number}` ? T
  : IfIdent<LineCount, Raw, T>

type ParseLine<T extends string> =
  T extends `...${infer Name}[${infer LineCount}]` ?
    CheckLineCount<LineCount, T, ParseSpreadField<Name, true>>
  : T extends `...${infer Name}` ? ParseSpreadField<Name, false>
  : T extends (
    `${infer Name}[${infer Index extends number | ''}][${infer LineCount}]`
  ) ?
    CheckLineCount<LineCount, T, ParseArrayFieldSchema<Name, Index, true>>
  : T extends `${infer Name}[${infer Args}][${infer LineCount}]` ?
    CheckLineCount<LineCount, T, ParseBracketArrayField<Name, Args, true>>
  : T extends `${infer Name}[${infer Args}]` ?
    Args extends '' ?
      ParseArrayFieldSchema<Name, '', false>
    : ParseBracketArrayField<Name, Args, false>
  : ParseScalar<T>

export type InputSchema<T extends string> =
  string extends T ? never : Prettify<CheckHasError<ParseLines<SplitLines<T>>>>

// #endregion
