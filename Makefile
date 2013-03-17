REPORTER = spec

test:
	@NODE_ENV=test mocha --reporter $(REPORTER)

coverage: lib-cov
	@EXPRESS_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage i18n.js i18n-cov.js

examples:
	@NODE_ENV=test mocha --reporter $(REPORTER) examples/*.test.js

all: test examples

.PHONY: test examples