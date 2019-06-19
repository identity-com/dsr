# Channels

The channels object on the DSR specify enpoints to receive the scopeRequest result

## Properties

### eventsURL
Type: String

This is a mandatory and default channel.
If only this is set the result will be a single object posted to this URL.
If others channels are present than only the status if posted here. 
*Note: evidence binary content is never sent in this channel*

### payloadUrl

Type: String

This is an optional channel that if set changes the contents of the eventsURL channels and is used to receive only the plain verifiable credentials.

### evidences

type: Object

This is an optional channel that if set will receive the evidence binary data used at identity validation.

#### evidences scheme
````json
{
  "type": "object",
  "properties": {
    "idDocumentFront": {
      "type": "EvidenceChannelDetails"
    },
    "idDocumentBack": {
      "type": "EvidenceChannelDetails"
    },
    "selfie": {
      "type": "EvidenceChannelDetails"
    },
  }
}
````

#### EvidenceChannelDetails

The EvidenceChannelDetails specify how the binary content should be transferred for each evidence.

#### accepts
specify the request body.

"application/json" - A JSON object with metadata and an embed base64 encoded file will be sent.

"image/*" - A RAW binary object will be sent

"multipart-from" - A RAW binary object will be sent using a form upload file protocol

#### method
specify which HTTP should be used on te request

"put" - recommended if the url is unique for the content

"post" - recommended if the url handles more than one content

#### url
specify the URL endpoint **HTTPS is required, if not localhost**

#### authorization
specify an authorization header if required

#### EvidenceChannelDetails schema
```json
{
  "type": "object",
  "properties": {
    "accepts": {
      "enum": [
        "application/json",
        "image/*",
        "multipart-form"
      ]
    },
    "method": {
      "enum": [
        "post",
        "put"
      ]
    },
    "url": {
      "type": "string"
    },
    "authorization": {
      "type": "string"
    },
  },
  "required": [
    "accepts",
    "method",
    "url"
  ]
}
````

#### EvidenceResponse schema

````json
{
  "type": "object",
  "properties": {
    "content-type": {
      "type": "string"
    },
    "content": {
       "enum": [
        "idDocumentFront",
        "idDocumentBack",
        "selfie",
       ],
     },
     "sha256": {
      "type": "string"
     },
     "base64encoded": {
      "type": "string"
     }
  }
}
````
