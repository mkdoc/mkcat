var cat = require('../index')
  , ast = require('mkast');
cat({files: ['README.md']})
  .pipe(ast.stringify({indent: 2}))
  .pipe(process.stdout);
