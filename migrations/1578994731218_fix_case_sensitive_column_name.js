'use strict'

const up = `
  ALTER TABLE modules RENAME COLUMN createdAt TO created_at
`

const down = `
  ALTER TABLE modules RENAME COLUMN created_at TO createdAt
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
