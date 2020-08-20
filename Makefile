test.examples:
	mocha --exit examples/express4-cookie/test.js
	mocha --exit examples/express4-setLocale/test.js
	mocha --exit examples/node-http/test.js
	mocha --exit examples/node-http-autoreload/test.js

clean:
	rm -rf ./localestowrite
	rm -rf ./localesmakeplural
	rm -rf ./coverage

test: clean
	npm run test

cover:
	npm run test-ci

lint:
	npm run lint -- --fix

.PHONY: test examples
