module.exports = {
  extends: "google",
  parserOptions: {
    sourceType: "script" // remove if using ES6 modules
  },
  env: {
    browser: false,
    node: true,
    es6: true,
    worker: false,
    mocha: true,
    jasmine: true,
    phantomjs: true,
    protractor: true,
    jquery: false,
    mongo: false,
    serviceworker: false
  },
  rules: {
    strict: ["error", "global"],
    quotes: [
      1, "double"
    ],
    "max-len": [
      1, 90
    ],
    "one-var": [0],
    "brace-style": [1],
    curly: [0],
    "object-curly-spacing": [
      1, "always"
    ],
    "space-before-function-paren": [
      1, {
        anonymous: "always",
        named: "never"
      }
    ],
    "key-spacing": [
      1, {
        align: "colon"
      }
    ],
    "no-multi-spaces": [
      1, {
        "exceptions": {
          "VariableDeclarator": true
        }
      }
    ],
    "no-warning-comments": [0],
    "operator-linebreak": [1, "before"],
    "comma-dangle": ["error", "never"],
    "arrow-parens": ["warn", "as-needed"],
    "require-jsdoc": [0],
    "no-var": [1]
  },
  globals: {
    fetch: false,
    window: false,
    document: false
  }
};