import { parseInput } from '../main'

const input = parseInput(`
  scalar1
  +scalar2
  scalar3, +scalar4, +scalar5
  _scalar6
  +_scalar7
  +_scalar8, _scalar9, scalar10
  arr1[]
  +arr2[]
  arr3[][]
  +arr4[][]
  arr5[0][]
  +arr6[0][]
  arr7[][N]
  +arr8[][N]
  arr9[0][N]
  +arr10[0][N]
  ...spread1
  ...+spread2
  ...spread3[]
  ...+spread4[]
  ...spread5[N]
  ...+spread6[N]
  bracket1[arg1, +arg2]
  bracket2[arg3, +arg4][]
  bracket3[arg3, +arg4][N]
  bracket4[_arg1, arg2, +_arg3]
  bracket5[_arg1, arg2, +_arg3][]
  
  # comment1
`)
console.log(input)
