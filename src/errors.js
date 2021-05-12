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

module.exports = {
	SoapClientInitializationError,
	SoapRequestError,
	WsdlUrlParserError,
};
