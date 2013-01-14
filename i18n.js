/**
 * @author  John Resig <jeresig@gmail.com>
 * @author  Originally by Marcus Spiegel <marcus.spiegel@gmail.com>
 * @link    https://github.com/jeresig/i18n-node
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 *
 * @version 0.4
 */

// dependencies
var vsprintf = require("sprintf").vsprintf,
	fs = require("fs"),
	path = require("path");

var i18n = exports = function() {
	var self = this;

	// Put into dev or production mode
	this.devMode = process.env.NODE_ENV === "development";

	// Set the locale to the default locale
	this.setLocale(this.defaultLocale);

	// Copy over options
	for (var prop in opt) {
		this[prop] = opt[prop];
	}

	// you may register helpers in global scope, up to you
	if (typeof this.register === "object") {
		i18n.registerMethods.forEach(function(method) {
			self.register[method] = self[method].bind(self);
		});
	}

	// implicitly read all locales
	// if it's an array of locale names, read in the data
	if (this.locales && this.locales.forEach) {
		locales.forEach(this.readFile);
		this.defaultLocale = this.locales[0];
	}

	// Check the defaultLocale
	if (!this.locales[this.defaultLocale]) {
		console.error("Not a valid default locale.");
	}

	if (this.request) {
		if (this.host) {
			this.setLocaleFromHost(this.request);
		}

		if (this.query !== false) {
			this.setLocaleFromQuery(this.request);
		}

		this.prefLocale = this.preferredLocale();
	}
};

i18n.version = "0.4";

i18n.localeCache = {};
i18n.resMethods = ["__", "__n", "getLocale", "isPreferredLocale"];

i18n.expressBind = function(app, opt) {
	if (!app) {
		return;
	}

	app.use(function(req, res, next) {
		opt.request = request;
		req.i18n = new i18n(opt);

		// Express 3
		if (res.locals) {
			i18n.registerMethods(res.locals)
		}

		next();
	});

	// Express 2
	if (app.dynamicHelpers) {
		app.dynamicHelpers(i18n.registerMethods({}));
	}
};

i18n.registerMethods = function(helpers) {
	i18n.resMethods.forEach(function(method) {
		helpers[method] = function(req) {
			return req.i18n[method];
		};
	});

	return helpers;
};

i18n.prototype = {
	defaultLocale: "en",
	extension: ".js",
	directory: "./locales",

	__: function() {
		var msg = translate(this.locale, arguments[0]);

		if (arguments.length > 1) {
			msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
		}

		return msg;
	},

	__n: function(singular, plural, count) {
		var msg = translate(this.locale, singular, plural);

		msg = vsprintf(parseInt(count, 10) > 1 ? msg.other : msg.one, [count]);

		if (arguments.length > 3) {
			msg = vsprintf(msg, Array.prototype.slice.call(arguments, 3));
		}

		return msg;
	},

	setLocale: function(locale) {
		if (this.locales[locale]) {
			return (this.locale = locale);

		} else {
			console.error("Locale (" + locale + ") not found.");
		}
	},

	getLocale: function() {
		return this.locale;
	},

	isPreferredLocale: function() {
		return !this.prefLocale ||
			this.prefLocale === this.getLocale();
	},

	setLocaleFromQuery: function() {
		var req = this.request;

		if (!req || !req.query || !req.query.locale) {
			return;
		}

		var locale = req.query.locale.toLowerCase();

		if (this.locales[locale]) {
			if (this.devMode) {
				console.log("Overriding locale from query: " + locale);
			}

			this.setLocale(locale);
		}
	},

	setLocaleFromHost: function() {
		var req = this.request;

		if (!req || !req.headers || !req.headers.host) {
			return;
		}

		if (/^([^.]+)/.test(req.headers.host) && this.locales[RegExp.$1]) {
			if (this.devMode) {
				console.log("Overriding locale from host: " + RegExp.$1);
			}

			this.setLocale(RegExp.$1);
		}
	},

	preferredLocale: function() {
		var req = this.request;

		if (!req || !req.headers) {
			return;
		}

		var accept = req.headers["accept-language"],
			self = this,
			prefLocale;

		accept.match(/(^|,\s*)([a-z]+)/g).forEach(function(locale) {
			if (!prefLocale && self.locales[locale]) {
				prefLocale = locale;
			}
		});

		return prefLocale;
	},

	// read locale file, translate a msg and write to fs if new
	translate: function(locale, singular, plural) {
		if (!locale || !this.locales[locale]) {
			if (this.devMode) {
				console.warn("WARN: No locale found. Using the default (" +
					this.defaultLocale + ") as current locale");
			}

			locale = this.defaultLocale;

			this.initLocale(locale, {});
		}

		if (!this.locales[locale][singular]) {
			this.locales[locale][singular] = plural ?
				{ one: singular, other: plural } :
				singular;

			this.writeFile(locale);
		}

		return this.locales[locale][singular];
	},

	// try reading a file
	readFile: function(locale) {
		if (!this.devMode && i18n.localeCache[locale]) {
			return i18n.localeCache[locale];
		}

		var localeFile = "{}";
		var file = this.locateFile(locale);

		try {
			localeFile = fs.readFileSync(file);

			try {
				// parsing filecontents to locales[locale]
				this.initLocale(locale, JSON.parse(localeFile));

			} catch (e) {
				console.error('unable to parse locales from file (maybe ' + file +
					' is empty or invalid json?): ', e);
			}

		} catch (e) {
			// unable to read, so intialize that file
			// locales[locale] are already set in memory, so no extra read required
			// or locales[locale] are empty, which initializes an empty locale.json file
			this.writeFile(locale);
		}
	},

	// try writing a file in a created directory
	writeFile: function(locale) {
		// don't write new locale information to disk if we're not in dev mode
		if (!this.devMode) {
			return;
		}

		// creating directory if necessary
		try {
			var stats = fs.lstatSync(this.directory);

		} catch (e) {
			if (this.devMode) {
				console.log('creating locales dir in: ' + this.directory);
			}

			fs.mkdirSync(this.directory, 0755);
		}

		// Initialize the locale if didn't exist already
		this.initLocale(locale, {});

		// writing to tmp and rename on success
		try {
			var target = this.locateFile(locale),
				tmp = target + ".tmp";

			fs.writeFileSync(tmp, JSON.stringify(
				this.locales[locale], null, "\t"), "utf8");

			if (fs.statSync(tmp).isFile()) {
				fs.renameSync(tmp, target);

			} else {
				console.error('unable to write locales to file (either ' + tmp +
					' or ' + target + ' are not writeable?): ', e);
			}

		} catch (e) {
			console.error('unexpected error writing files (either ' + tmp +
				' or ' + target + ' are not writeable?): ', e);
		}
	},

	initLocale: function(locale, data) {
		if (!this.locales[locale]) {
			i18n.localeCache[locale] = this.locales[locale] = data;
		}
	},

	// basic normalization of filepath
	locateFile: function(locale) {
		return path.normalize(this.directory + '/' + locale + this.extension);
	}
};
