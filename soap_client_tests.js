onst test = require("ava");
const SoapRequestHelper = require("../soap_request_helper/soap_request_helper");
const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ trim: true });
const AdmZip = require("adm-zip");
const { writeFile } = require("../utils/asyncFs");
const { catalogsDownloader } = require("../utils/catalogsDownloader");
const unzipBase64 = require("../utils/unzip");
const MockAdapter = require("axios-mock-adapter");
var SequelizeMock = require("sequelize-mock");
//require('factory-girl-sequelize')(['Voivodeship', 'County', 'Community']);
const fs = require("fs");

const mock = new MockAdapter(axios);

const mockedAxiosResponses = {
  "http://tempuri.org/ITerytWs1/PobierzKatalogNTS":
    "tests/xml_files/PobierzKatalogNTSResponse.xml",
  "http://tempuri.org/ITerytWs1/CzyZalogowany":
    "tests/xml_files/CzyZalogowanyResponse.xml",
  "http://tempuri.org/ITerytWs1/MultipleFields":
    "tests/xml_files/MultipleFieldsResponse.xml",
  "http://tempuri.org/ITerytWs1/PobierzDateAktualnegoKatNTS":
    "tests/xml_files/PobierzDateAktualnegoKatNTSResponse.xml"
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
  t.is(
    client["endpoint"],
    "https://uslugaterytws1test.stat.gov.pl/TerytWs1.svc"
  );
  t.is(client["ns"], "wsdl:");
  t.is(client["methodsMeta"].length, 4);
  t.is(client["methodsMeta"][0]["name"], "CzyZalogowany");
  t.is(typeof client["CzyZalogowany"], "function");
});

test.serial("Performing a request", async t => {
  t.context.client.addUsernameToken("TestPubliczny", "1234abcd");

  const response = await t.context.client.CzyZalogowany({});
  t.is(response, "true");
});

test.serial("Downloading and unzping catalog", async t => {
  const tercCatalogXml = fs.readFileSync("tests/xml_files/terc.xml", "utf-8");
  const xmlFromTestedFunction = await catalogsDownloader("NTS");
  t.is(xmlFromTestedFunction, tercCatalogXml);
});
