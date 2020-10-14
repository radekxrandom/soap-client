const SoapXmlHelper = require("./soap_xml_helper");
const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser();

class SoapClientInitializationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SoapClientInitializationError";
  }
}

class SoapRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "SoapRequestError";
  }
}

class WsdlUrlParserError extends Error {
  constructor(message) {
    super(message);
    this.name = "WsdlUrlParserError";
  }
}

class SoapRequestHelper {
  constructor(wsdlUrl) {
    this.xmlHelper = new SoapXmlHelper();
    this.wsdlUrl = wsdlUrl;
  }
  async generateClient() {
    try {
      const wsdl = await this._getWsdl();
      this._getServiceEndpoint(wsdl);
      this._getMethodNames(wsdl);
      this.methodsMeta.map(async method => {
        this[method.name] = async args => {
          const response = await this._performRequest(method, args);
          return response;
        };
      });
    } catch (err) {
      throw new SoapClientInitializationError("Client initialization failed");
    }
  }
  async _performRequest(method, args) {
    const reqBodyObj = this.xmlHelper.createSoapRequest(method, args);
    var builder = new xml2js.Builder();
    const reqBodyXml = builder.buildObject(reqBodyObj);
    try {
      const responseMsg = await this._sendRequest(reqBodyXml, method.action);
      const responseData = await this._parseResponse(
        responseMsg.data,
        method.name
      );
      return responseData;
    } catch (err) {
      console.error(
        "Error occured while sending a request or while parsing the response"
      );
      console.debug(err);
    }
  }
  async _sendRequest(body, action) {
    const testHeaders = {
      "Content-Type": "text/xml;charset=UTF-8",
      SOAPAction: action
    };
    try {
      const response = await axios({
        url: this.endpoint,
        method: "post",
        headers: testHeaders,
        data: body,
        timeout: 10000,
        proxy: false
      });
      return response;
    } catch (err) {
      throw new SoapRequestError(err);
    }
  }
  async _getWsdl() {
    try {
      const res = await axios.get(this.wsdlUrl);
      const wsdlFile = res.data;
      const parser = new xml2js.Parser({ normalize: true });
      const wsdlObject = await xml2js.parseStringPromise(wsdlFile);
      const key = Object.keys(wsdlObject)[0];
      this.ns = key.slice(0, key.indexOf("definitions"));
      return wsdlObject;
    } catch (err) {
      console.debug(err);
    }
  }
  _getServiceEndpoint(wsdl) {
    const serviceEndpoint =
      wsdl[`${this.ns}definitions`][`${this.ns}service`][0][
        `${this.ns}port`
      ][0]["soap:address"][0][`$`][`location`];
    this.endpoint = serviceEndpoint;
  }
  _getMethodNames(wsdl) {
    const wsdlOperations =
      wsdl[`${this.ns}definitions`][`${this.ns}binding`][0][
        `${this.ns}operation`
      ];
    this.methodsMeta = wsdlOperations.map(el => {
      const name = el["$"]["name"];
      const action = el["soap:operation"][0]["$"]["soapAction"];
      const method = {
        name,
        action
      };
      return method;
    });
  }
  addUsernameToken(username, pwd) {
    this.xmlHelper.genUsernameToken(username, pwd);
  }
  async _parseResponse(response, methodName) {
    const responseString = await xml2js.parseStringPromise(response);
    const responseBody = responseString["s:Envelope"]["s:Body"][0];

    const retrievedResult =
      responseBody[`${methodName}Response`][0][`${methodName}Result`][0];
    let resultTemp = {};
    for (let key in retrievedResult) {
      resultTemp[key] = retrievedResult[key][0];
    }
    const result = retrievedResult.length > 1 ? retrievedResult : resultTemp;
    return result;
  }
}

module.exports = SoapRequestHelper;
