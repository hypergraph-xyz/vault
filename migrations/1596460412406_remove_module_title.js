'use strict'

const up = `
  ALTER TABLE modules DROP COLUMN title;
`

const down = `
  ALTER TABLE modules ADD COLUMN title VARCHAR(1000);
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
