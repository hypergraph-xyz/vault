'use strict'

const up = `
  UPDATE modules SET title = 'no title' WHERE title IS NULL;
  ALTER TABLE modules ALTER COLUMN title SET NOT NULL
`

const down = `
  ALTER TABLE modules ALTER COLUMN title DROP NOT NULL
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
