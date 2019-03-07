/* eslint-disable no-console */
const fs = require('fs');
const mkdirp = require('mkdirp');

const DSR_DIR = 'schemas/ScopeRequest';
const PUBLISH_DIR = 'schemas/public/';

if (!fs.existsSync(PUBLISH_DIR)) {
  mkdirp.sync(PUBLISH_DIR);
}

const indexContent = [];

const publishDsrSchemas = () => {
  fs.readdir(DSR_DIR, (err, versionFolders) => {
    versionFolders.forEach((folder) => {
      fs.readdir(`${DSR_DIR}/${folder}`, (err2, files) => {
        files.forEach((file) => {
          console.log(file);
          const schemaContent = fs.readFileSync(`${DSR_DIR}/${folder}/${file}`, 'UTF-8');
          const schema = JSON.parse(schemaContent);
          console.log(schema.title);
          const schemaTitleSplit = schema.title.split(':');
          const targetDir = schemaTitleSplit[1];
          const targetFile = schemaTitleSplit[2];
          if (!fs.existsSync(`${PUBLISH_DIR}/${targetDir}/${folder}/`)) {
            mkdirp.sync(`${PUBLISH_DIR}/${targetDir}/${folder}/`);
          }
          fs.copyFileSync(`${DSR_DIR}/${folder}/${file}`, `${PUBLISH_DIR}/${targetDir}/${folder}/${targetFile}.json`);
          indexContent.push({
            name: `${targetDir}/${folder}/${targetFile}`, link: `./${targetDir}/${folder}/${targetFile}.json`,
          });
        });
      });
    });
  });
};

const publish = () => {
  publishDsrSchemas();
};

publish();
