'use strict'

const up = `
  ALTER TABLE modules ALTER COLUMN url TYPE varchar(255)
`

const down = `
  ALTER TABLE modules ALTER COLUMN url TYPE varchar(70)
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
