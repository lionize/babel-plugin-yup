import * as yup from 'yup'

const schema = yup.object()
const otherSchema = yup.mixed()

function test() {
  return yup.number()
}

export default yup.object
