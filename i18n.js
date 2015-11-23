/**
 * @author  John Resig <jeresig@gmail.com>
 * @author  Originally by Marcus Spiegel <marcus.spiegel@gmail.com>
 * @link    https://github.com/jeresig/i18n-node
 * @license http://opensource.org/licenses/MIT
 *
 * @version 0.4.7
 */

// dependencies
var vsprintf = require("sprintf").vsprintf,
		fs = require("fs"),
		path = require("path");


function dotNotation (obj, is, value) {
	if (obj.hasOwnProperty(is)) {
		return obj[is];
	}

	if (typeof is === 'string') {
		return dotNotation(obj, is.split('.'), value);
	} else if (is.length === 1 && value !== undefined) {
		return obj[is[0]] = value;
	} else if (is.length === 0) {
		return obj;
	} else {
		if (obj.hasOwnProperty(is[0])) {
			return dotNotation(obj[is[0]], is.slice(1), value);
		} else {
			return obj[is.join('.')] = is.join('.');
		}
	}
}

var i18n = module.exports = function (opt) {
	var self = this;

	// Put into dev or production mode
	this.devMode = process.env.NODE_ENV !== "production";

	// Copy over options
	for (var prop in opt) {
		this[prop] = opt[prop];
	}

	// you may register helpers in global scope, up to you
	if (typeof this.register === "object") {
		i18n.resMethods.forEach(function (method) {
			self.register[method] = self[method].bind(self);
		});
	}

	// implicitly read all locales
	// if it's an array of locale names, read in the data
	if (opt.locales && opt.locales.forEach) {
		this.locales = {};

		opt.locales.forEach(function (locale) {
			self.readFile(locale);
		});

		this.defaultLocale = opt.locales[0];
	}

	// Set the locale to the default locale
	this.setLocale(this.defaultLocale);

	// Check the defaultLocale
	if (!this.locales[this.defaultLocale]) {
		console.error("Not a valid default locale.");
	}

	if (this.request) {
		if (this.subdomain) {
			this.setLocaleFromSubdomain(this.request);
		}

		if (this.query !== false) {
			this.setLocaleFromQuery(this.request);
		}

		if (this.session !== false) {
			this.setLocaleFromSessionVar(this.request);
		}

		this.prefLocale = this.preferredLocale();

		if (this.prefLocale !== false && this.prefLocale !== this.locale) {
			this.setLocale(this.prefLocale);
		}
	}
};

i18n.version = "0.4.7";

i18n.localeCache = {};
i18n.resMethods = ["__", "__n", "getLocale", "isPreferredLocale"];

i18n.expressBind = function (app, opt) {
	if (!app) {
		return;
	}

	app.use(function (req, res, next) {
		opt.request = req;
		req.i18n = new i18n(opt);

		// Express 3
		if (res.locals) {
			i18n.registerMethods(res.locals, req)
		}

		next();
	});

	// Express 2
	if (app.dynamicHelpers) {
		app.dynamicHelpers(i18n.registerMethods({}));
	}
};

i18n.registerMethods = function (helpers, req) {
	i18n.resMethods.forEach(function (method) {
		if (req) {
			helpers[method] = req.i18n[method].bind(req.i18n);
		} else {
			helpers[method] = function (req) {
				return req.i18n[method].bind(req.i18n);
			};
		}

	});

	return helpers;
};

i18n.prototype = {
	defaultLocale: "en",
	extension: ".js",
	directory: "./locales",
	cookieName: "lang",
	sessionVarName: "locale",
	indent: "\t",

	parse: JSON.parse,

	dump: function (data, indent) {
	  return JSON.stringify(data, null, indent);
	},

	__: function () {
		var msg = this.translate(this.locale, arguments[0]);

		if (arguments.length > 1) {
			msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
		}

		return msg;
	},

	__n: function (pathOrSingular, countOrPlural, additionalOrCount) {
		var msg;
		if (typeof countOrPlural === 'number') {
			var path = pathOrSingular;
			var count = countOrPlural;
			msg = this.translate(this.locale, path);

			msg = vsprintf(parseInt(count, 10) > 1 ? msg.other : msg.one, Array.prototype.slice.call(arguments, 1));
		} else {
			var singular = pathOrSingular;
			var plural = countOrPlural;
			var count = additionalOrCount;
			msg = this.translate(this.locale, singular, plural);

			msg = vsprintf(parseInt(count, 10) > 1 ? msg.other : msg.one, [count]);

			if (arguments.length > 3) {
				msg = vsprintf(msg, Array.prototype.slice.call(arguments, 3));
			}
		}

		return msg;
	},

	setLocale: function (locale) {

		if (!locale) return;

		if (!this.locales[locale]) {
			if (this.devMode) {
				console.warn("Locale (" + locale + ") not found.");
			}

			locale = this.defaultLocale;
		}

		return (this.locale = locale);
	},

	getLocale: function () {
		return this.locale;
	},

	isPreferredLocale: function () {
		return !this.prefLocale ||
				this.prefLocale === this.getLocale();
	},

	setLocaleFromSessionVar: function (req) {
		req = req || this.request;

		if (!req || !req.session || !req.session[this.sessionVarName]) {		
			return;
		}

		var locale = req.session[this.sessionVarName];

		if (this.locales[locale]) {
			if (this.devMode) {
				console.log("Overriding locale from query: " + locale);
			}
			this.setLocale(locale);
		}

	},

	setLocaleFromQuery: function (req) {
		req = req || this.request;

		if (!req || !req.query || !req.query.lang) {
			return;
		}

		var locale = (req.query.lang+'').toLowerCase();

		if (this.locales[locale]) {
			if (this.devMode) {
				console.log("Overriding locale from query: " + locale);
			}

			this.setLocale(locale);
		}
	},

	setLocaleFromSubdomain: function (req) {
		req = req || this.request;

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

	setLocaleFromCookie: function (req) {
		req = req || this.request;

		if (!req || !req.cookies || !this.cookieName || !req.cookies[this.cookieName]) {
			return;
		}

		var locale = req.cookies[this.cookieName].toLowerCase();

		if (this.locales[locale]) {
			if (this.devMode) {
				console.log("Overriding locale from cookie: " + locale);
			}

			this.setLocale(locale);
		}
	},

	setLocaleFromEnvironmentVariable: function () {
		if (!process.env.LANG) {
			return;
		}
		var locale = process.env.LANG.split("_")[0];
		if (this.locales[locale]) {
			if (this.devMode) {
				console.log("Overriding locale from environment variable: " + locale);
			}

			this.setLocale(locale);
		}
	},

	preferredLocale: function (req) {
		req = req || this.request;

		if (!req || !req.headers) {
			return;
		}

		var accept = req.headers["accept-language"] || "",
				regExp = /(^|,\s*)([a-z0-9-]+)/gi,
				self = this,
				prefLocale;

		while (!prefLocale && (match = regExp.exec(accept))) {
			var locale = match[2].toLowerCase();
			var parts = locale.split("-");

			if (self.locales[locale]) {
				prefLocale = locale;
			} else if (parts.length > 1 && self.locales[parts[0]]) {
				prefLocale = parts[0];
			}
		}

		return prefLocale || this.defaultLocale;
	},

	// read locale file, translate a msg and write to fs if new
	translate: function (locale, singular, plural) {
		if (!locale || !this.locales[locale]) {
			if (this.devMode) {
				console.warn("WARN: No locale found. Using the default (" +
						this.defaultLocale + ") as current locale");
			}

			locale = this.defaultLocale;

			this.initLocale(locale, {});
		}

		if (!this.locales[locale][singular]) {
			if (this.devMode) {
				dotNotation(this.locales[locale], singular, plural ? { one: singular, other: plural } : undefined);
				this.writeFile(locale);
			}
		}

		return dotNotation(this.locales[locale], singular, plural ? { one: singular, other: plural } : undefined);
	},

	// try reading a file
	readFile: function (locale) {
		var file = this.locateFile(locale);

		if (!this.devMode && i18n.localeCache[file]) {
			this.initLocale(locale, i18n.localeCache[file]);
			return;
		}

		try {
			var localeFile = fs.readFileSync(file);
			var base;

			// reading base file if 'base' provided
			if (typeof this.base === "function") {
				var baseFilename;

				try {
					baseFilename = this.base(locale);
				} catch (e) {
					console.error('base function threw exception for locale %s', locale, e);
				}

				if (typeof baseFilename === "string") {
					try {
						base = this.parse(fs.readFileSync(this.locateFile(baseFilename)));
					} catch (e) {
						console.error('unable to read or parse base file %s for locale %s', baseFilename, locale, e);
					}
				}
			}

			try {
				// parsing file content
				var content = this.parse(localeFile);

				if (base) {
					// writing content to the base and swapping
					for (var prop in content) {
						base[prop] = content[prop];
					}
					content = base;
				}

				// putting content to locales[locale]
				this.initLocale(locale, content);
			} catch (e) {
				console.error('unable to parse locales from file (maybe ' + file +
						' is empty or invalid ' + this.extension + '?): ', e);
			}

		} catch (e) {
			// unable to read, so intialize that file
			// locales[locale] are already set in memory, so no extra read required
			// or locales[locale] are empty, which initializes an empty locale.json file
			if (!fs.existsSync(file)) {
				this.writeFile(locale);
			}
		}
	},

	// try writing a file in a created directory
	writeFile: function (locale) {
		// don't write new locale information to disk if we're not in dev mode
		if (!this.devMode) {
			// Initialize the locale if didn't exist already
			this.initLocale(locale, {});
			return;
		}

		// creating directory if necessary
		try {
			fs.lstatSync(this.directory);

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

			fs.writeFileSync(tmp,
							 this.dump(this.locales[locale], this.indent),
							 "utf8");

			if (fs.statSync(tmp).isFile()) {
				fs.renameSync(tmp, target);

			} else {
				console.error('unable to write locales to file (either ' + tmp +
						' or ' + target + ' are not writeable?): ');
			}

		} catch (e) {
			console.error('unexpected error writing files (either ' + tmp +
					' or ' + target + ' are not writeable?): ', e);
		}
	},

	// basic normalization of filepath
	locateFile: function (locale) {
		return path.normalize(this.directory + '/' + locale + this.extension);
	},

	initLocale: function (locale, data) {
		if (!this.locales[locale]) {
			this.locales[locale] = data;

			// Only cache the files when we're not in dev mode
			if (!this.devMode) {
				var file = this.locateFile(locale);
				if (!i18n.localeCache[file]) {
					i18n.localeCache[file] = data;
				}
			}
		}
	}
};
