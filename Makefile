test:
	mocha

cover:
	istanbul cover ./node_modules/mocha/bin/_mocha

hint:
	jshint --verbose .

examples:
	for example in examples/*/test.js ; do \
		mocha $$example; \
	done

all: test examples hint

.PHONY: test examples