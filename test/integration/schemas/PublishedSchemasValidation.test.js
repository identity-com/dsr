const Ajv = require('ajv');
const fs = require('fs');
const fetch = require('node-fetch');

const s3BucketUrl = process.env.S3_PUBLIC_SCHEMA_URL;

// Enable this to test the schema publishing
describe.skip('Public Schemas Integration Test Suite', () => {
  it('Should succeed validation from the from the correct json file in DSR folder', async (done) => {
    const jsonFileContents = fs.readFileSync('test/fixtures/complexUnresolvedRequest.json', 'utf8');
    const json = JSON.parse(jsonFileContents);
    const identifier = 'civ:ScopeRequest:Unresolved';
    const titleSplit = identifier.split(':');
    const typeFolder = titleSplit[1];
    const jsonSchemaFile = titleSplit[2];
    const jsonFolderVersion = json.version;
    // fetch from the S3 url bucket, it's a public one
    fetch(`${s3BucketUrl}/${typeFolder}/${jsonFolderVersion}/${jsonSchemaFile}.json`).then((res => res.json())).then((jsonSchema) => {
      const ajv = new Ajv();
      const validate = ajv.compile(jsonSchema);
      const isValid = validate(json);
      expect(isValid).toBeTruthy();
      done();
    });
  });
});
