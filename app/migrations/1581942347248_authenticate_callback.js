'use strict'

const up = `
  ALTER TABLE authenticate_tokens ADD COLUMN callback VARCHAR(30)
`

const down = `
  ALTER TABLE authenticate_tokens DROP COLUMN callback
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
