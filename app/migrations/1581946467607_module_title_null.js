'use strict'

const up = `
  ALTER TABLE modules ALTER COLUMN title DROP NOT NULL
`

const down = `
  ALTER TABLE modules ALTER COLUMN title SET NOT NULL
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
