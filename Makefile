test:
	mocha test/i18n.*
	mocha test/multiDirectories.js

cover:
	istanbul cover ./node_modules/mocha/bin/_mocha

hint:
	jshint --verbose .

examples:
	for example in examples/*/test.js ; do \
		mocha $$example; \
	done

clean:
	rm -rf locales/custom* testlocales customlocales secondlocalestowrite testlocalesauto testlocalesautocustomextension testlocalesautoprefixed testlocalesautoprefixedext locales_temp

all: clean test examples hint clean

.PHONY: clean test examples clean
