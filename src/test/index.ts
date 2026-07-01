import { parseInput } from '../main'

const $scalar = parseInput(`
  scalar1_1
  +scalar1_2
  +~scalar1_3
  scalar1_4={N|E|S|W}
  scalar2_1, +scalar2_2, +~scalar2_3, scalar2_4={N|E|S|W}
`)

const $spread = parseInput(`
  ...spread1_1
  ...+spread1_2
  ...+~spread1_3
  ...spread1_4={N|E|S|W}
  ...spread2_1[]
  ...+spread2_2[]
  ...+~spread2_3[]
  ...spread2_4={N|E|S|W}[]
  ...spread3_1[N]
  ...+spread3_2[N]
  ...+~spread3_3[N]
  ...spread3_4={N|E|S|W}[N]
`)

const $arr = parseInput(`
  arr1_1[]
  +arr1_2[]
  +~arr1_3[]
  arr1_4={N|E|S|W}[]
  arr2_1[][]
  +arr2_2[][]
  +~arr2_3[][]
  arr2_4={N|E|S|W}[][]
  arr3_1[0][]
  +arr3_2[0][]
  +~arr3_3[0][]
  arr3_4={N|E|S|W}[0][]
  arr4_1[][N]
  +arr4_2[][N]
  +~arr4_3[][N]
  arr4_4={N|E|S|W}[][N]
  arr5_1[0][N]
  +arr5_2[0][N]
  +~arr5_3[0][N]
  arr5_4={N|E|S|W}[0][N]
`)

const $bracket = parseInput(`
  bracket1_1[arg1_1, +arg1_2, +~arg1_3, arg1_4={N|E|S|W}]
  bracket1_2[_arg1_1, +_arg1_2, +~_arg1_3, _arg1_4={N|E|S|W}]
  bracket2_1[arg1_1, +arg1_2, +~arg1_3, arg1_4={N|E|S|W}][]
  bracket2_2[_arg1_1, +_arg1_2, +~_arg1_3, _arg1_4={N|E|S|W}][]
  bracket3_1[arg1_1, +arg1_2, +~arg1_3, arg1_4={N|E|S|W}][N]
  bracket3_2[_arg1_1, +_arg1_2, +~_arg1_3, _arg1_4={N|E|S|W}][N]
`)

const $_scalar = parseInput(`
  _scalar1_1
  +_scalar1_2
  +~_scalar1_3
  _scalar1_4={N|E|S|W}
  _scalar2_1, +_scalar2_2, +~_scalar2_3, _scalar2_4={N|E|S|W}
`)

const $_spread = parseInput(`
  ..._spread1_1
  ...+_spread1_2
  ...+~_spread1_3
  ..._spread1_4={N|E|S|W}
  ..._spread2_1[]
  ...+_spread2_2[]
  ...+~_spread2_3[]
  ..._spread2_4={N|E|S|W}[]
  ..._spread3_1[N]
  ...+_spread3_2[N]
  ...+~_spread3_3[N]
  ..._spread3_4={N|E|S|W}[N]
`)

const $_arr = parseInput(`
  _arr1_1[]
  +_arr1_2[]
  +~_arr1_3[]
  _arr1_4={N|E|S|W}[]
  _arr2_1[][]
  +_arr2_2[][]
  +~_arr2_3[][]
  _arr2_4={N|E|S|W}[][]
  _arr3_1[0][]
  +_arr3_2[0][]
  +~_arr3_3[0][]
  _arr3_4={N|E|S|W}[0][]
  _arr4_1[][N]
  +_arr4_2[][N]
  +~_arr4_3[][N]
  _arr4_4={N|E|S|W}[][N]
  _arr5_1[0][N]
  +_arr5_2[0][N]
  +~_arr5_3[0][N]
  _arr5_4={N|E|S|W}[0][N]
`)

const $_bracket = parseInput(`
  _bracket1_1[arg1_1, +arg1_2, +~arg1_3, arg1_4={N|E|S|W}]
  _bracket1_2[_arg1_1, +_arg1_2, +~_arg1_3, _arg1_4={N|E|S|W}]
  _bracket2_1[arg1_1, +arg1_2, +~arg1_3, arg1_4={N|E|S|W}][]
  _bracket2_2[_arg1_1, +_arg1_2, +~_arg1_3, _arg1_4={N|E|S|W}][]
  _bracket3_1[arg1_1, +arg1_2, +~arg1_3, arg1_4={N|E|S|W}][N]
  _bracket3_2[_arg1_1, +_arg1_2, +~_arg1_3, _arg1_4={N|E|S|W}][N]
`)
