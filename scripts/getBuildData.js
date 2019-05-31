/* eslint-disable import/no-extraneous-dependencies */
const { types } = require('node-sass')
const git = require('git-rev-sync')
/* eslint-enable */

module.exports = (isCompiled = false) => {
  let buildData = ''

  if (isCompiled) {
    buildData += `
      Build Date: ${(new Date()).toISOString()}
      Node Version: ${process.version}`
  }

  buildData += `
    Branch: ${git.branch()}
    Commit: ${git.long()}`

  if (process.env.CIRCLECI) {
    buildData += `
      Build Number (CircleCI): ${process.env.CIRCLE_BUILD_NUM}`
  }

  return types.String(buildData.replace(/^  +/gm, '  '))
}
