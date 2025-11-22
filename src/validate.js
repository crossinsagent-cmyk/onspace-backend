import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });

const schema = {
  type: 'object',
  required: ['projectId', 'meta', 'screens', 'dataModel', 'flows'],
  properties: {
    projectId: { type: 'string' },
    meta: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        theme: { type: 'string' },
        primaryColor: { type: 'string' }
      },
      required: ['title']
    },
    screens: { type: 'array' },
    dataModel: { type: 'object' },
    flows: { type: 'array' }
  }
};

const validate = ajv.compile(schema);

export function validateProject(obj) {
  const valid = validate(obj);
  return { valid, errors: validate.errors };
}
