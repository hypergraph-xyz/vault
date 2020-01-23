'use strict'

const up = `
  ALTER TABLE modules ADD COLUMN url VARCHAR(70);
  UPDATE modules
    SET url = 'dat://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    WHERE title = 'An abstract';
  UPDATE modules
    SET url = 'dat://bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    WHERE title = 'My theory';
  UPDATE modules
    SET url = 'dat://cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
    WHERE title = 'Patch';
  ALTER TABLE modules ALTER COLUMN url SET NOT NULL;
`

const down = `
  ALTER TABLE modules DROP COLUMN url
`

exports.up = ({ sql }) => sql(up)
exports.down = ({ sql }) => sql(down)
