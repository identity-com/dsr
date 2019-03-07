const Ajv = require('ajv');
const fs = require('fs');

describe('DSR Schema Generation Tests', () => {
  it('Should read an complex DSR json and generate an valid json schema', async (done) => {
    const jsonFileContents = fs.readFileSync('test/fixtures/complexUnresolvedRequest.json', 'utf8');
    const json = JSON.parse(jsonFileContents);
    const jsonName = 'civ:ScopeRequest:Unresolved';
    const jsonSchemaContents = fs.readFileSync(`schemas/ScopeRequest/v${json.version}/Unresolved.json`, 'utf8');
    const jsonSchema = JSON.parse(jsonSchemaContents);
    expect(jsonSchema.title).toEqual(jsonName);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(json);
    expect(isValid).toBeTruthy();
    done();
  });

  it('Should read an complex DSR json and validate against an simpler but valid json sample', async (done) => {
    const jsonFileContents = fs.readFileSync('test/fixtures/simpleUnresolvedRequest.json', 'utf8');
    const json = JSON.parse(jsonFileContents);
    const jsonName = 'civ:ScopeRequest:Unresolved';
    const jsonSchemaContents = fs.readFileSync(`schemas/ScopeRequest/v${json.version}/Unresolved.json`, 'utf8');
    const jsonSchema = JSON.parse(jsonSchemaContents);
    expect(jsonSchema.title).toEqual(jsonName);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(JSON.parse(jsonFileContents));
    expect(isValid).toBeTruthy();
    done();
  });

  it('Should read an complex DSR json and fail validation of json schema regarding the issuer not being an DID', async (done) => {
    const jsonFileContents = fs.readFileSync('test/fixtures/dsrMetaIssuerInvalidDid.json', 'utf8');
    const json = JSON.parse(jsonFileContents);
    const jsonName = 'civ:ScopeRequest:Unresolved';
    const jsonSchemaContents = fs.readFileSync(`schemas/ScopeRequest/v${json.version}/Unresolved.json`, 'utf8');
    const jsonSchema = JSON.parse(jsonSchemaContents);
    expect(jsonSchema.title).toEqual(jsonName);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(JSON.parse(jsonFileContents));
    expect(isValid).toBeFalsy();
    done();
  });
});
