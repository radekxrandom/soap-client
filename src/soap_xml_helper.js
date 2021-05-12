// pad and getDate written by @vpulim

const padWithZero = n => (n < 10 ? `0${n}` : n);

const formatDate = date => `${date.getUTCFullYear()}-${padWithZero(
  date.getUTCMonth() + 1,
)}-${padWithZero(date.getUTCDate())}T${padWithZero(
  date.getUTCHours(),
)}:${padWithZero(date.getUTCMinutes())}:${padWithZero(
  date.getUTCSeconds(),
)}Z`;

class SoapXmlHelper {
  genUsernameToken(username, pwd) {
    const currentDate = new Date();
    const created = formatDate(currentDate);
    this.token = {
      "wsse:Security": {
        $: {
          "xmlns:wsse":
            "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
          "xmlns:wsu":
            "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
        },
        "wsse:UsernameToken": {
          $: {
            "wsu:Id": `UsernameToken-${created}`
          },
          "wsse:Username": {
            _: username
          },
          "wsse:Password": {
            $: {
              Type:
                "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText"
            },
            _: pwd
          },
          "wsu:Created": {
            _: created
          }
        }
      }
    };
  }
  createSoapRequest(method, args) {
    const token = this.token || "";
    const reqBody = this._createRequestBody(method.name, args);
    const request = {
      "soapenv:Envelope": {
        $: {
          "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
          "xmlns:rns": "http://tempuri.org/"
        },
        "soapenv:Header": {
          $: {
            "xmlns:wsa": "http://www.w3.org/2005/08/addressing"
          },
          ...token,
          "wsa:Action": {
            _: method.action
          }
        },
        "soapenv:Body": reqBody
      }
    };
    return request;
  }
	_createRequestBody(methodName, args) {
		/*	const argsObj = {};
	 for (const key in args) {
			argsObj[`rns:${key}`] = {
				_: args[key],
			};
		} */
		const argsObj = {};
		Object.entries(args).map(([key, value]) => {
			argsObj[`rns:${key}`] = { _: value };
		});
		const reqBody = {
			[`rns:${methodName}`]: argsObj,
		};
		return reqBody;
	}
}

module.exports = SoapXmlHelper;
