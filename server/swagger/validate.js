class InputError extends Error {
  /**
   * Constructor
   * @param {string} field the error field in request parameters.
   */
  constructor(field) {
    super(`incorrect field: '${field}', please check again!`);
    this.field = field;
    this.status = 400;
  }
}

/**
 * validate the input values
 * @param {Object} input the input object, like request.query, request.body and so on.
 * @param {Object} expect the expect value, Ex: { name: { required: true, type: String }}
 */
export default function (input, expect) {
  Object.keys(expect).forEach((key) => {
    if (expect[key] === undefined) {
      delete input[key];
      return;
    }
    // if this key is required but not in input.
    if (expect[key].required && input[key] === undefined) {
      throw new InputError(key);
    }
    // if this key is in input, but the type is wrong
    // first check the number type
    if (input[key] !== undefined && expect[key].type === 'number') {
      if (typeof input[key] === 'number') {
        return;
      }
      if (isNaN(Number(input[key]))) {
        throw new InputError(key);
      }
      input[key] = Number(input[key]);
      return;
    }
    // second check the boolean type
    if (input[key] !== undefined && expect[key].type === 'boolean') {
      if (typeof input[key] === 'boolean') {
        return;
      }
      if (input[key] === 'true') {
        input[key] = true;
        return;
      }
      if (input[key] === 'false') {
        input[key] = false;
        return;
      }
      throw new InputError(key);
    }
    // third check the string type
    if (input[key] !== undefined && expect[key].type === 'string') {
      if (typeof input[key] !== 'string') {
        input[key] = String(input[key]);
        return;
      }
    }
    // forth check the object type
    if (input[key] !== undefined && expect[key].type === 'object') {
      if (typeof input[key] === 'object') {
        return;
      }
      throw new InputError(key);
    }
    // last check the array type
    if (input[key] !== undefined && expect[key].type === 'array') {
      if (input[key] instanceof Array) {
        return;
      }
      throw new InputError(key);
    }
    // if this key is not in input and need a default value
    if (input[key] === undefined && expect[key].default !== undefined) {
      input[key] = expect[key].default;
    }
  });
  return input;
}
