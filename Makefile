test:
	mocha

cover:
	nyc report --reporter=lcov

hint:
	./node_modules/.bin/eslint .

examples:
	for example in examples/*/test.js ; do \
		mocha $$example; \
	done

all: test examples hint

.PHONY: test examples