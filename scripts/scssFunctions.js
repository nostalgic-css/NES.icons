const getBuildData = require('./getBuildData')

module.exports = {
  'build-data()': () => getBuildData(true),
}
