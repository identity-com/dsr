# Dynamic Scope Request Javascript Library 

[![CircleCI](https://circleci.com/gh/identity-com/dsr.svg?style=svg)](https://circleci.com/gh/identity-com/dsr)
![npm (scoped)](https://img.shields.io/npm/v/@identity.com/dsr.svg)

## Summary

The Dynamic Scope Request (DSR) javascript library provides capability around securely requesting credential information between a ID Requester and an ID Holder.

DSR are part of the ecossystem of identity.com providing an standardized way for an Identity Requester to inquiry for PII on the form of Verifiable Credentials (W3C link for Verifiable Credentials). DSR resolution is the process which allow to check if an set of Verifiable Credentials matches the specified constraints on the DSR (the constraints can be reduced to claims instead of the whole credential).

## Contents

- [Usage](#usage)
  * [Config](#config)
  * [Create ScopeRequest](#create-scoperequest)
    + [ChannelsConfig](#channelsconfig)
    + [AppConfig](#appconfig)
  * [Build a signed ScopeRequest request body](#build-a-signed-scoperequest-request-body)
  * [Build a signed ScopeRequest request body](#build-a-signed-scoperequest-request-body-1)
- [Install](#install)
  * [Prerequisites](#prerequisites)
  * [Installation instructions](#installation-instructions)
- [Test](#test)
- [Publishing schemas](#publishing-schemas)
- [Examples](#examples)
  * [Simple Unresolved DSR Request with Global Identifiers](#simple-unresolved-dsr-request-with-global-identifiers)
  * [Complex Unresolved DSR Request](#complex-unresolved-dsr-request)
- [ES5 and ES6 definitions](#es5-and-es6-definitions)
- [Node vs React usage of this library](#node-vs-react-usage-of-this-library)
- [Releases](#releases)

## Usage

### Config

This library depends on some configuration settings to work properly. The configuration is made in four different ways that override each other - etc config file, user config file, environment's variables, in code - and consists of the following settings:
- PARTNER_ID: Partner Unique Identifier
- PARTNER_XPUB: Partner Signing Public Key
- PARTNER_XPRV: Partner Signing Public Key
- APP_ID: Partner Application Identifier
- APP_NAME: Application Name to show to the user
- APP_LOGO_URL: Application Logo to show to the user (https required)
- APP_DESCRIPTION: Application Logo to show to the user
- APP_PRIMARY_COLOR: Application main color to show to the user
- APP_SECONDARY_COLOR: Application text color to show to the user
- BASE_EVENT_URL: base endpoint to receive ScopeRequest events (https required)
- BASE_PAYLOAD_URL: base endpoint to receive ScopeRequest payload (https required)

### Create ScopeRequest

```Typescript
ScopeRequest(uniqueId: String, credentialItems: Array, channelsConfig: Object, appConfig: Object, partnerConfig: Object)
```

#### ChannelsConfig
```json
{
  "type": "object",
  "properties": {
    "eventsURL": {
      "type": "string",
      "examples": [
        "https://..."
      ]
    },
    "payloadURL": {
      "type": "string",
      "examples": [
        "https://..."
      ]
    }
  }
}
```

#### AppConfig
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "examples": [
        "12as-322222-22"
      ]
    },
    "name": {
      "type": "string",
      "examples": [
        "The App"
      ]
    },
    "logo": {
      "type": "string",
      "examples": [
        "https://"
      ]
    },
    "description": {
      "type": "string",
      "examples": [
        "Cool App"
      ]
    },
    "primaryColor": {
      "type": "string",
      "examples": [
        "AADFBC"
      ]
    },
    "secondaryColor": {
      "type": "string",
      "examples": [
        "AAEEFD"
      ]
    }
  }
}
```

### Build a signed ScopeRequest request body

Once you constructed a valid ScopeRequest object you can use the helper function `buildSignedRequestBody` to
create a signed request body using the requester in the config.

```javascript
buildSignedRequestBody(scopeRequest)
```

returns

```json
{
	"payload": "[Object]",
	"signature": "<valid signature>",
	"algorithm": "ES256",
	"xpub": "<public key pair that can be used to compare with a pinned one>"
}
```

### Build a signed ScopeRequest request body

To verify a signed request body you can use the helper function `verifySignedRequestBody` passing a parsed body object.

```javascript
verifySignedRequestBody(body, pinnedXpub)
```

pinnedXpub parameters is optional, but recomended to avoid man in the middle attacks.

return `true` is the body is valid

## Install

### Prerequisites

- [npm](https://www.npmjs.com/)
- [Node.js](https://nodejs.org/en/)


### Installation instructions

First run:

```bash
npm install
```

Then install airbnb eslint peer dependencies (npm 5+):
```bash
npx install-peerdeps --dev eslint-config-airbnb
```

## Test

This library has jest configured, run the command for testing:

```bash
npm run test
```

For watching tests while developing, open an terminal and run the command:

```bash
npm run test:watch
```

## Publishing schemas

The *dsr-js* library has a script, avaiable in the *package.json*, to publish the generate schemas to a bucket in AWS. The following command will publish the schemas:
```bash
S3_BUCKET_SCHEMA_URL=<s3://your-bucket-url> npm run publish-schemas
```

There is also a script to check the published schemas:
```bash
S3_PUBLIC_SCHEMA_URL=<http://your-schem-url> npm run check-schemas
```

To publish and check the schemas it is required to have the environment variables for AWS credentials defined (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY).


## Examples

### Simple Unresolved DSR Request with Global Identifiers

Running this DSR:

```json
{
  "version": "1",
  "timestamp": "2018-07-04T00:11:55.698Z",
  "requesterInfo": {
    "requesterId": "3735a5b4-8a1f-11e8-9a94-a6cf71072f73",
    "app": {
      "id": "3cc295aa-8a1f-11e8-9a94-a6cf71072f73",
      "name": "App Name",
      "logo": "https://server/path/logo.png",
      "description": "App Description",
      "primaryColor": "2345EE",
      "secondaryColor": "2345FF"
    }
  },
  "channels": {
    "eventsURL": "https://server/events/UUID",
    "payloadURL": "https://server/payload/UUID"
  },
  "credentialItems": [
    "credential-civ:Credential:Address-1"
  ],
  "authorization": {
    "jwt": "<EXPIRABLE-TOKEN-SIGNING-EXACT_REQUEST>"
  }
}
```

Against an VC (this is a partial VC json) that has:

```json
{
  "identifier": "credential-civ:Credential:Address-1",
  "claims": {
    "type": {
      "address": {
        "city": "j7e2uJWSvw",
        "country": "4l63DP8E4l",
        "county": "PKve4XPrkn",
        "state": "f1hdWTntvk",
        "street": "vDOqAOSz69",
        "unit": "ZvosZqh3Nd",
        "zipCode": "TVouidgvJb"
      }
    }
  }
}
```

Should return that VC, since it's identifier is of the type of the global Identifier.

### Complex Unresolved DSR Request

Running this DSR:

```json
{
  "version": "1",
  "timestamp": "2018-07-04T00:11:55.698Z",
  "requesterInfo": {
    "requesterId": "3735a5b4-8a1f-11e8-9a94-a6cf71072f73",
    "app": {
      "id": "3cc295aa-8a1f-11e8-9a94-a6cf71072f73",
      "name": "App Name",
      "logo": "https://server/path/logo.png",
      "description": "App Description",
      "primaryColor": "2345EE",
      "secondaryColor": "2345FF"
    }
  },
  "channels": {
    "eventsURL": "https://server/events/UUID",
    "payloadURL": "https://server/payload/UUID"
  },
  "credentialItems": [
    {
      "identifier": "claim-cvc:Identity:name-1",
      "constraints": {
        "claims": [
          { "path": "name.first", "is": {"$eq": "pgbXa8A3QI"} }
        ]
      }
    }
  ],
  "authorization": {
    "jwt": "<EXPIRABLE-TOKEN-SIGNING-EXACT_REQUEST>"
  }
}

```
Against an VC like this:

```json
{
  "identifier": "credential-civ:Credential:Address-1",
  "claims": {
    "type": {
      "address": {
        "city": "j7e2uJWSvw",
        "country": "4l63DP8E4l",
        "county": "PKve4XPrkn",
        "state": "f1hdWTntvk",
        "street": "vDOqAOSz69",
        "unit": "ZvosZqh3Nd",
        "zipCode": "TVouidgvJb"
      }
    }
  }
}
```

Should return an empty array, since we are asking for Identity:name, and this is of the type Address

But if we run against this:

```json
{
"id": null,
  "issuer": "did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74",
  "issued": "2018-07-17T23:39:28.937Z",
  "identifier": "credential-cvc:GenericDocumentId-v1",
  "expiry": null,
  "version": 1,
  "type": [
    "Credential",
    "credential-cvc:GenericDocumentId-v1"
  ],
  "claims": {
    "type": {
      "address": {
        "city": "7q32QO6QyC",
        "country": "DMWNjI2H6z",
        "county": "ClqmGgB9Gz",
        "state": "54fwzeph9R",
        "street": "1nU8mrOXDn",
        "unit": "xSBuKa0wah",
        "zipCode": "XU5w1tilyt"
      },
      "documentType": "QTeD2VzUVc",
      "image": {
        "image": "END9Z7RDtC",
        "md5": "zh9Lwz1Dsx"
      }
    },
    "identity": {
      "dateOfBirth": {
        "day": 29,
        "month": 2,
        "year": 1960
      },
      "name": {
        "first": "pgbXa8A3QI",
        "last": "aWJVXwRA27",
        "middle": "VKBbKo0KE3",
        "nickname": "HpoKF41SeI"
      },
     }
  }
}
```

It has to return, since one of the UCA types of Generic Id is Identity:name

We can also run an DSR of claim, against the previous example:

```json
{
  "version": "1",
  "timestamp": "2018-07-04T00:11:55.698Z",
  "requesterInfo": {
    "requesterId": "3735a5b4-8a1f-11e8-9a94-a6cf71072f73",
    "app": {
      "id": "3cc295aa-8a1f-11e8-9a94-a6cf71072f73",
      "name": "App Name",
      "logo": "https://server/path/logo.png",
      "description": "App Description",
      "primaryColor": "2345EE",
      "secondaryColor": "2345FF"
    }
  },
  "channels": {
    "eventsURL": "https://server/events/UUID",
    "payloadURL": "https://server/payload/UUID"
  },
  "credentialItems": [
    "claim-cvc:Identity:name-1"
  ],
  "authorization": {
    "jwt": "<EXPIRABLE-TOKEN-SIGNING-EXACT_REQUEST>"
  }
}

```

It has to return the VC, since we want any VC that has a claim of Identity:name

## ES5 and ES6 definitions

The project structure is made like this:

|_ test
|__ unit
|__ integration
|_ src
|_ dist
|__ cjs
|__ es
|__ browser
|_ reports
|__ coverage

* Tests and Integration folder contains jest tests
* src contains all ES6 non-transpiled source
* dist contains all transpiled code in CJS, ES, BROWSER presets of Babel
* also the package.json has the three fields main, module, browser, that allow packers to change the file of the entry point
* reports and coverage are all related to JEST tests

The released browser version is minified.

The main entry point targets CJS, all legacy code should work with this.

Sip-hosted-api is tested with this and it works right out of the box, without any other configuration.

Browser projects should bundle the dependencies, so we are not bundling it here.

The browser transpiled version only guarantees the profile we want to target and not leave this task to the user, since any other different transpilation, could result in bugs.

But as pointed out before, if the target project is ES6 compliant, the pkg.module will point out to the ES version.

## Node vs React usage of this library

Put this in your webpack config under plugins if you are running an Webpack Node App
```js
new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: 'production',
        APP_ENV: false
    }
})
```

If you are on a React app add this:

```js
new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: false,
        APP_ENV: 'browser'
    }
})
```

With that you can check if you're running in a browser or not this way:

```js

if (process.env.APP_ENV === 'browser') {
    const doSomething = require('./browser-only-js');
    doSomething();
} else {
    const somethingServer = require('./server-only-js');
    somethingServer();
}

if (process.env.APP_ENV !== 'browser') {
    const somethingServer = require('./server-only-js');
    somethingServer();
}
```

Because these environment variables get replaced during the build, Webpack will not include resources that are server-only. You should always do these kinds of things in an easy way, with a simple, direct compare. Uglify will remove all dead code.

Since you used a function before and the function is not evaluated during build, Webpack wasn't able to know what requires it could skip.

(The NODE_ENV-variable should always be set to production in production mode, since many libraries including React use it for optimisations.)

This is used on this library on src/services/config.js

## Releases

The release process is fully automated and started by Civic members when it's created a tag on Github following the pattern ^release\\..*$. E.g.: `release.1`.

After the creation of the tag, Circle Ci will trigger a job to:
- build source files
- run unit tests
- increase version number on package.json
- create the stable version and tag it. E.g: v0.2.29
- remove the release.N tag
- deploy the binary file to NPM
