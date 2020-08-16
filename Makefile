test.examples:
	mocha --exit examples/express4-cookie/test.js
	mocha --exit examples/express4-setLocale/test.js
	mocha --exit examples/node-http/test.js
	mocha --exit examples/node-http-autoreload/test.js

test:
	npm run test

cover:
	npm run test-ci

.PHONY: test examples
