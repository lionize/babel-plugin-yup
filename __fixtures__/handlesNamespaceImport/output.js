import { object as _object, mixed as _mixed, number as _number } from 'yup';

const schema = _object();
const otherSchema = _mixed();

function test() {
  return _number();
}

export default _object;