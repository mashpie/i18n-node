'use strict';



const fs = require('fs');

const path = require('path');

const os = require('os');

const t = require('tap');

const i18n = require('..');



function tmpDir() {

  return fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-node-'));

}



function readJSON(file) {

  return JSON.parse(fs.readFileSync(file, 'utf8'));

}



t.test('defaultValue is returned when key is missing', (t) => {

  const dir = tmpDir();

  i18n.configure({

    locales: ['en'],

    directory: dir,

    updateFiles: false,

    objectNotation: false

  });



  const res = i18n.__('missing_key', { defaultValue: 'default_value' });

  t.equal(res, 'default_value', 'returns provided defaultValue');

  t.end();

});



t.test('defaultValue is persisted when updateFiles is true', (t) => {

  const dir = tmpDir();

  i18n.configure({

    locales: ['en'],

    directory: dir,

    updateFiles: true,

    objectNotation: false

  });



  const file = path.join(dir, 'en.json');

  const key = 'hello';

  const def = 'default_value';

  const res = i18n.__(key, { defaultValue: def });

  t.equal(res, def, 'returns defaultValue');



  t.equal(fs.existsSync(file), true, 'en.json is written');

  const data = readJSON(file);

  t.same(data[key], def, 'defaultValue persisted to file for missing key');

  t.end();

});



t.test('existing keys ignore defaultValue and return stored translation', (t) => {

  const dir = tmpDir();

  i18n.configure({ locales: ['en'], directory: dir, updateFiles: true });



  const file = path.join(dir, 'en.json');

  fs.writeFileSync(file, JSON.stringify({ greeting: 'Hola' }, null, 2));

  // reload to pick up the file

  i18n.configure({ locales: ['en'], directory: dir, updateFiles: true });



  const res = i18n.__('greeting', { defaultValue: 'Hello' });

  t.equal(res, 'Hola', 'uses stored translation, not defaultValue');

  t.end();

});



t.test('without defaultValue, missingKeyFn/key continues to be used', (t) => {

  const dir = tmpDir();

  i18n.configure({ locales: ['en'], directory: dir, updateFiles: true });



  const res = i18n.__('missing_key_2');

  t.equal(res, 'missing_key_2', 'falls back to key by default');

  t.end();

});



t.test('sprintf args and defaultValue work together', (t) => {

  const dir = tmpDir();

  i18n.configure({ locales: ['en'], directory: dir, updateFiles: true });



  const res = i18n.__('welcome %s', 'Ada', { defaultValue: 'Welcome!' });

  t.equal(res, 'Welcome!', 'uses defaultValue when key is missing despite sprintf args being provided');

  t.end();

});
