test:
	mocha

cover:
	istanbul cover ./node_modules/mocha/bin/_mocha

examples:
	for example in examples/*/test.js ; do \
		mocha $$example; \
	done

all: test examples

.PHONY: test examples