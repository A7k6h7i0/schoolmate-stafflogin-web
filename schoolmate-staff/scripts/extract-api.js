const fs = require('fs')
const content = fs.readFileSync('../swagger-init.js', 'utf8')
const start = content.indexOf('"swaggerDoc":')
const end = content.indexOf('"customOptions"')
const doc = JSON.parse(content.slice(start + '"swaggerDoc":'.length, end).trim().replace(/,\s*$/, ''))

const modules = {}
for (const [path, methods] of Object.entries(doc.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    const tag = op.tags?.[0] || 'Other'
    if (!modules[tag]) modules[tag] = []
    modules[tag].push({
      method: method.toUpperCase(),
      path,
      summary: op.summary,
      params: op.parameters?.map((p) => p.name || p.$ref),
      body: op.requestBody?.content?.['application/json']?.schema,
    })
  }
}
console.log(JSON.stringify(modules, null, 2))
