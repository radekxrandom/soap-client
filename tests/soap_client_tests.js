const test = require("ava");
const SoapRequestHelper = require("../soap_request_helper");
const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ trim: true });
const MockAdapter = require("axios-mock-adapter");
const fs = require("fs");

const mock = new MockAdapter(axios);

const mockedAxiosResponses = {
  "http://tempuri.org/ITestNamespace/CzyZalogowany":
    "tests/xml_files/CzyZalogowanyResponse.xml",
  "http://tempuri.org/ITestNamespace/MultipleFields":
    "tests/xml_files/MultipleFieldsResponse.xml"
};

mock.onGet().reply(() => {
  return new Promise((resolve, reject) => {
    const wsdl = fs.readFileSync("tests/xml_files/dummy_wsdl.xml", "utf-8");
    resolve([200, wsdl]);
  });
});

mock.onPost().reply(config => {
  const responsePath = mockedAxiosResponses[config.headers["SOAPAction"]];
  return new Promise((resolve, reject) => {
    const resXml = fs.readFileSync(responsePath, "utf-8");
    resolve([200, resXml]);
  });
});

test("Parsing responses with one field", async t => {
  const client = new SoapRequestHelper("https://testwsdlurl.pl/wsdl/test.wsdl");
  const xml = fs.readFileSync(
    "tests/xml_files/CzyZalogowanyResponse.xml",
    "utf-8"
  );
  const processedResponse = await client._parseResponse(xml, "CzyZalogowany");
  console.log(processedResponse);
  t.is(processedResponse, "true");
});

test("Parsing responses with multiple fields", async t => {
  t.plan(3);
  const client = new SoapRequestHelper("https://testwsdlurl.pl/wsdl/test.wsdl");
  const xml = fs.readFileSync(
    "tests/xml_files/MultipleFieldsResponse.xml",
    "utf-8"
  );
  const processedResponse = await client._parseResponse(xml, "MultipleFields");
  t.is(processedResponse["b:FirstField"], "First field");
  t.is(processedResponse["b:SecondField"], "Second field");
  t.is(processedResponse["b:ThirdField"], "Third field");
});

test.before(async t => {
  t.context.client = new SoapRequestHelper(
    "https://testwsdlurl.pl/wsdl/test.wsdl"
  );
  await t.context.client.generateClient();
});

test.serial("Test client generation and wsdl config file parsing", async t => {
  t.plan(5);
  const client = t.context.client;
  t.is(client["endpoint"], "https://test.pl/TestWs1.svc");
  t.is(client["ns"], "wsdl:");
  t.is(client["methodsMeta"].length, 2);
  t.is(client["methodsMeta"][0]["name"], "CzyZalogowany");
  t.is(typeof client["CzyZalogowany"], "function");
});

test.serial("Performing a request", async t => {
  t.context.client.addUsernameToken("Login", "pwd");
  const response = await t.context.client["CzyZalogowany"]({});
  t.is(response, "true");
});
