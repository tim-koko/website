// Collects all class, id, attribute and element names used in our own
// stylesheets so PurgeCSS keeps them. Only unused framework (Bootstrap)
// selectors get purged.
//
// Replaces the unmaintained `purgecss-whitelister` package with the same
// parsing logic, using Node's built-in fs.globSync instead of `glob-all`.

const { globSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { parse } = require('scss-parser');
const { parse: parseFallback } = require('gonzales-pe');

const recurseTypes = ['rule', 'selector', 'block'];
const keepTypes = ['id', 'class', 'attribute'];
const keepTypesFallback = ['id', 'class', 'attribute', 'typeSelector'];
const styleExtensions = ['css', 'sass', 'scss', 'less'];

function collectSelectors(nodes) {
  return nodes.flatMap(({ type, value }) => {
    if (recurseTypes.includes(type)) {
      return collectSelectors(value);
    }
    if (keepTypes.includes(type)) {
      return value
        .filter((child) => child.type === 'identifier' && child.value)
        .map((child) => child.value);
    }
    if (type === 'identifier' && value) {
      return [value];
    }
    return [];
  });
}

function selectorsFromFile(filename) {
  const ext = path.extname(filename).slice(1);
  if (!styleExtensions.includes(ext)) return [];

  const contents = readFileSync(filename, 'utf-8');

  try {
    return collectSelectors(parse(contents).value);
  } catch (error) { // eslint-disable-line no-unused-vars
    // Fall back to gonzales-pe for syntax scss-parser can't handle.
    const names = [];
    parseFallback(contents, { syntax: ext }).traverse((node) => {
      if (keepTypesFallback.includes(node.type)) {
        const ident = node.content.find(({ type }) => type === 'ident');
        if (ident) names.push(ident.content);
      }
    });
    return names;
  }
}

module.exports = function scssSafelist(patterns) {
  const files = globSync(patterns).map((file) => path.resolve(file));
  return [...new Set(files.flatMap(selectorsFromFile))].sort();
};
