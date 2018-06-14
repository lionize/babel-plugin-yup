const pluginTester = require('babel-plugin-tester')
const plugin = require('./')
const path = require('path')

pluginTester({
  plugin,
  pluginName: 'babel-plugin-yup',
  snapshot: true,
  fixtures: path.join(__dirname, '__fixtures__'),
})
