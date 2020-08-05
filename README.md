# Opentender Portal Site Frontend App

Rendering HTML on the Server and a HTML5 Web App in the Browser

written in Typescript and SCSS

## Installation

- install [NodeJS](https://nodejs.org/) 8.x and [NPM](https://www.npmjs.com/)

- run command `npm install` in the root folder of this repository

- prepare the data folder (see https://github.com/opentender-ke/opentender-data)

- copy file 'config.dist.js' to 'config.js' and make the changes to reflect your infrastructure

```javascript
module.exports = {
	server: {
		listen: {  // where the frontend should be listening
			host: '127.0.0.1',
			port: 3000
		},
		data: { // absolute paths to the data folders (see https://github.com/opentender-ke/opentender-data)
			path: '/var/www/opentender/data/shared'
		},
		cache: {
        		type: 'disabled', // disabled | internal | memcached
        		memcached: ['127.0.0.1:11211'] // if type == memcached, server address(es)
		},
		backendUrl: 'http://127.0.0.1:3001', // full url of the backend for the server
		fullUrl: 'https://portal.opentender.eu' // full url of the frontend for the server app (e.g. for absolute OpenGraph Share Image URLs)
	},
	client: {
		version: '0.0.2', // version of app (is e.g. used for display in footer & "uncaching" resources on app update)
		backendUrl: 'https://portal.opentender.eu' // full url of the backend for the client app
	},
    country: {
        id: 'ke',
        name: 'Jamaica'
    },
    currencySymbol: '$'
};
```

Note: The config file is baked into the js bundle, if you change anything you must rebuild the bundle.

## Commands

### Serve

`npm run server` to build the app and start the server

### Build

`npm run build` to build the apps (browser.app, server.app, server.ts) into a static bundles

### Build

`npm run lint` to check the project with tslint

### Analyse

`npm run bundle-report` to see sizes of javascript bundle file sizes for browser.app

### Watch files

`npm run watch` to watch for file changes and restart the server if needed

### Development

run `npm run develop` and `npm run watch` in two separate terminals to build your client app, start a web server, and allow file changes to update in realtime

### Update typescript definitions after changes on schema.json

`npm run schema` to convert schema.json into /src/app/model/tender.d.ts

### Update Language files for Translation

`npm run langs` to extract all translation strings into the language files in /src/i18n/ and updates the runtime files language.[lang].ts, also all languages according to /src/i18n/languages.json are created if not existing.

## Uses

* [NodeJS](https://nodejs.org/)
* [NPM](https://www.npmjs.com/)
* [Angular 5](https://angular.io/) Universal
* [Webpack](https://webpack.github.io)
* [Typescript](https://www.typescriptlang.org/)

and more - please see package.json
