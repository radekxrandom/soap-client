# soap-client

#### A minimalistic soap messaging protocol client created for node.js

- [Install](#install)
- [Client initialization](#client-initialization)
- [Sending a soap message](#sending-a-soap-message)
- [Security](#security)

# Install

- #### Install with [yarn](https://classic.yarnpkg.com/en/package/@radekborandom/soap-client)

```sh
   $ yarn add @radekborandom/soap-client
```

- #### Install with [npm](https://www.npmjs.com/package/@radekborandom/soap-client)

```sh
   $ npm i @radekborandom/soap-client
```

### Client initialization

##### await soapClient.generateClient(wsdlUrl) - Generate a new soap client for the web service specified in the wsdl document.

Parse provided WSDL document. Generate methods from the operations defined in it.

```javascript
const soapClient = require("soap-client");
// your app code
const client = await soapClient.generateClient(
  "http://example.com/wsdl/service.wsdl"
);
```

### Sending a soap message

##### await client.operationName({...args}) - Perform one of the operations defined in the WSDL

Call a particular method to perform operation defined in the WSDL document. Name of the method is the same as the name of operation to be performed. Response is parsed and returned either as a primitive value (if soap response body has only one field) or as a object.

```javascript
const soapClient = require("soap-client");
// your app code
const client = await soapClient.generateClient(
  "http://example.com/wsdl/service.wsdl"
);
const response = await client.methodName({ ...args });
```

### Security

Currently only the UsernameToken method of authentication is supported.

##### client.addUsernameToken(username, password) - Adds the UsernameToken to client instance

Generate header with UsernameToken to be appended to each request/operation performed by this instance.

```javascript
const soapClient = require("soap-client");
// your app code
const client = await soapClient.generateClient(
  "http://example.com/wsdl/service.wsdl"
);
client.addUsernameToken("your_username", "your_password");
```
