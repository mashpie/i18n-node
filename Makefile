test:
	mocha

cover:
	istanbul cover mocha

examples:
	for example in examples/*/test.js ; do \
		mocha $$example; \
	done

all: test examples

.PHONY: test examples