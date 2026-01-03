import Ajv from 'ajv';
import { ValidationError } from '@errors/validation-error';
import addFormats from 'ajv-formats';
import addKeywords from 'ajv-keywords';

export function schemaValidator(
  schema: Record<string, any>,
  body: Record<string, any>,
) {
  const ajv = new Ajv({
    allErrors: true,
  });

  addFormats(ajv);
  addKeywords(ajv);
  ajv.addSchema(schema);

  const valid = ajv.validate(schema, body);

  if (!valid) {
    const errorMessage = JSON.stringify(ajv.errors);
    throw new ValidationError(errorMessage);
  }
}
