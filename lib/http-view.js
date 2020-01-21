'use strict'

const mustache = require('mustache')
const { promises: fs } = require('fs')

const views = `${__dirname}/../views`

module.exports = globalContext => async (name, localContext) => {
  const context = { ...globalContext, ...localContext }
  const template = await fs.readFile(`${views}/${name}.mustache`, 'utf8')
  const layout = await fs.readFile(`${views}/layout.mustache`, 'utf8')
  return mustache.render(template, {
    ...context,
    layout: () => (bodyTemplate, render) =>
      mustache.render(layout, { ...context, body: render(bodyTemplate) })
  })
}
