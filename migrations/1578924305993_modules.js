'use strict'

const up = `
  CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(1000) NOT NULL,
    createdAt TIMESTAMP DEFAULT current_timestamp NOT NULL
  )
`

const down = `
  DROP TABLE modules
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
