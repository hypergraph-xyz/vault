'use strict'

const up = `
  ALTER TABLE sign_in_tokens RENAME TO authenticate_tokens
`

const down = `
  ALTER TABLE authenticate_tokens RENAME TO sign_in_tokens
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
