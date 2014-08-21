var packageAttributeBuilder = require('livefyre-package-attribute');
var packageJson = require('json!subscription-hub/../package.json');

module.exports = packageAttributeBuilder(packageJson);
