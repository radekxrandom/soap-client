const axios = require("axios");
const xml2js = require("xml2js");
const SoapXmlHelper = require("./soap_xml_helper");
const {
	SoapClientInitializationError,
	SoapRequestError,
	WsdlUrlParserError,
} = require("./errors");

class SoapRequestHelper {
	constructor() {
		this.xmlHelper = new SoapXmlHelper();
	}

	async generateClient(wsdlUrl) {
		try {
			const wsdl = await this._getWsdl(wsdlUrl);
			this.endpoint = this._getServiceEndpoint(wsdl);
			const methodsMeta = this._getMethodNames(wsdl);
			for (let i = 0; i < methodsMeta.length; i++) {
				this[methodsMeta[i].name] = args => this._performRequest(methodsMeta[i], args);
			}
		} catch (err) {
			throw new SoapClientInitializationError("Client initialization failed");
		}
	}

	async _performRequest(method, args) {
		const reqBodyObj = this.xmlHelper.createSoapRequest(method, args);
		const builder = new xml2js.Builder();
		const reqBodyXml = builder.buildObject(reqBodyObj);
		try {
			const responseMsg = await this._sendRequest(reqBodyXml, method.action);
			const responseData = await this._parseResponse(
				responseMsg.data,
				method.name,
			);
			return responseData;
		} catch (err) {
			console.error(
				"Error occured while sending a request or while parsing the response",
			);
			console.debug(err);
			throw new SoapRequestError(err.message);
		}
	}

	async _sendRequest(body, action) {
		const testHeaders = {
			"Content-Type": "text/xml;charset=UTF-8",
			SOAPAction: action,
		};
		try {
			const response = await axios({
				url: this.endpoint,
				method: "post",
				headers: testHeaders,
				data: body,
				timeout: 10000,
				proxy: false,
			});
			return response;
		} catch (err) {
			throw new SoapRequestError(err.message);
		}
	}

	async _getWsdl(wsdlUrl) {
		try {
			const res = await axios.get(wsdlUrl);
			const wsdlFile = res.data;
			const parser = new xml2js.Parser({ normalize: true });
			const wsdlObject = await xml2js.parseStringPromise(wsdlFile);
			const key = Object.keys(wsdlObject)[0];
			this.ns = key.slice(0, key.indexOf("definitions"));
			return wsdlObject;
		} catch (err) {
			throw new WsdlUrlParserError(err.message);
		}
	}

	_getServiceEndpoint(wsdl) {
		const serviceEndpoint = wsdl[`${this.ns}definitions`][`${this.ns}service`][0][
      	`${this.ns}port`
		][0]["soap:address"][0].$.location;
		if (!serviceEndpoint.length) {
			return Promise.reject(
				new WsdlUrlParserError("Problem getting service endpoint"),
			);
		}
		return serviceEndpoint;
		// this.endpoint = serviceEndpoint;
	}

	_getMethodNames(wsdl) {
		const wsdlOperations = wsdl[`${this.ns}definitions`][`${this.ns}binding`][0][
      	`${this.ns}operation`
		];
		if (!wsdlOperations.length) {
			return Promise.reject(
				new WsdlUrlParserError("Problem getting service endpoint"),
			);
		}
		return wsdlOperations.map(el => {
			const { name } = el.$;
			const action = el["soap:operation"][0].$.soapAction;
			const method = {
				name,
				action,
			};
			return method;
		});
	}

	addUsernameToken(username, pwd) {
		this.xmlHelper.genUsernameToken(username, pwd);
	}

	async _parseResponse(response, methodName) {
		console.debug(methodName);
		const responseString = await xml2js.parseStringPromise(response);
		const responseBody = responseString["s:Envelope"]["s:Body"][0];
		const retrievedResult = responseBody[`${methodName}Response`][0][`${methodName}Result`][0];
		const resultTemp = {};

		Object.entries(retrievedResult).map(([key, value]) => {
			[resultTemp[key]] = value;
		});
		const result = retrievedResult.length > 1 ? retrievedResult : resultTemp;
		console.debug(result);
		return result;
	}
}

module.exports = SoapRequestHelper;
