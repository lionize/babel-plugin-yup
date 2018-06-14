import { object, mixed, number } from 'yup';


const schema = object();
const otherSchema = mixed();

function test() {
  return number();
}

export default object;