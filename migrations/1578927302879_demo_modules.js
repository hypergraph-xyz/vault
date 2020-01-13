'use strict'

const up = `
  INSERT INTO modules (title) VALUES
  ('An abstract'), ('My theory'), ('Patch')
`

const down = `

`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
