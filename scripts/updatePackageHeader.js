#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const nextVersion = process.argv[2]

if (!nextVersion) {
  console.error('[ERROR] This script requires a version number to be provided')
  process.exit(1)
}

// Update the CSS Package Header
const CSSFilePath = path.resolve('css', 'nes-icons.css')
let CSSFile = fs.readFileSync(CSSFilePath, 'utf8')

CSSFile = CSSFile.replace(/^ {2}Version: development/m, `  Version: ${nextVersion}`)

fs.writeFileSync(CSSFilePath, CSSFile, 'utf8')
