test:
	mocha

cover:
	istanbul cover _mocha -- --recursive

hint:
	jshint --verbose .

examples:
	for example in examples/*/test.js ; do \
		mocha $$example; \
	done

all: test examples hint

.PHONY: test examples