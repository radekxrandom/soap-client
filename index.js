const SoapRequestHelper = require("./src/soap_request_helper");

class SoapClientsFactory {
  static async generateClient(wsdlUrl) {
    const client = new SoapRequestHelper();
    await client.generateClient(wsdlUrl);
    return client;
  }
}

const soapClient = SoapClientsFactory;

module.exports = soapClient;
