#!/usr/bin/env node

const fs = require('fs')

const name = process.argv.slice(2).join('_')
if (!name) {
  console.error('Usage: create-migration NAME')
  console.error('Example: create-migration my first migration')
  process.exit(1)
}

const content = `'use strict'

const up = \`

\`

const down = \`

\`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
`

const migrationPath = `${__dirname}/../migrations/${Date.now()}_${name}.js`
fs.writeFileSync(migrationPath, content)
console.log(`Edit ${migrationPath}`)
