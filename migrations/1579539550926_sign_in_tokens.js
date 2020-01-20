'use strict'

const up = `
  CREATE TABLE sign_in_tokens (
    id SERIAL PRIMARY KEY,
    value VARCHAR(96) NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp NOT NULL
  )
`

const down = `
  DROP TABLE sign_in_tokens
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
