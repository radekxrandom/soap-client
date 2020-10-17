# soap-client [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]

A minimalistic soap messaging protocol client created for node.js

- [Description:](#description)
- [Install](#install)
- [Client's instance generation](#why-cant-i-file-an-issue)
- [Where can I find help?](#where-can-i-find-help)
- [Methods](#methods)
  - [await client.generateClient() - Function responsible for parsing service's WSDL configuration file](#function-responsible-for---parsing-service's-WSDL-configuration-file)
  - [await client.\_performRequest(method, [...\_args])](#await-clientperformReguest-method----args)
  - [client.\_getServiceEndpoint(wsdl)](#clientgetServiceEndpoinrwsds)
  - [Options](#options)
