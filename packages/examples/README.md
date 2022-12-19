# Azure functions decorators examples

This package includes a sample azure function app with decorators.

## tests

`npm test` has been temporarily disabled because of a bug in the function core tools.
Use `npm run test:examples` instead. On linux the functions server will not properly shut down. To avoid this
run: `npm start` (or comparable) and `npm run test:only` separately