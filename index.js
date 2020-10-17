const SoapRequestHelper = require("./soap_request_helper");

class SoapClientsFactory {
  async generateClient(wsdlUrl) {
    const client = new SoapRequestHelper();
    await client.generateClient(wsdlUrl);
    return client;
  }
}

const soapClient = new SoapClientsFactory();

module.exports = soapClient;
