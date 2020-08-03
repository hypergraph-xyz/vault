'use strict'

const up = `
  ALTER TABLE modules ADD CONSTRAINT url_unique UNIQUE (url)
`

const down = `
  ALTER TABLE modules DROP CONSTRAIN url_unique
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
