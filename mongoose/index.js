const modelName = (model) => model.modelName

const getFields = (model) => Object.keys(model.schema.obj)

const getFieldAttribute = (model, fieldName) => model.schema.paths[fieldName]

const getFieldType = (model, fieldName) => {
  const attributes = getFieldAttribute(model, fieldName)
  return attributes && attributes.instance.toLowerCase()
}

const getReferenceFields = (model) => {
  return getFields(model).filter((field) => getFieldAttribute(model, field).options.ref)
}

const payloadFilter = (model, body) => {
  const fields = getFields(model)
  const record = {}
  const errors = {}

  fields.forEach((fieldName) => {
    if (body[fieldName] === undefined) { return }
    if ((typeof body[fieldName] === getFieldType(model, fieldName).toLowerCase()) ||
    (getFieldType(model, fieldName) === 'Array' &&
    body[fieldName] instanceof Array)) {
      record[fieldName] = body[fieldName]
    } else {
      errors[fieldName] = `Should be a ${getFieldType(model, fieldName)}`
      + ` instead of ${typeof body[fieldName]}.`
    }
  })

  if (Object.keys(errors).length === 0) {
    return { record }
  }
  return { record, errors }
}

const queryCreator = (model, searchValue) => {
  const orQuery = []

  getFields(model).forEach((field) => {
    const fieldQuery = {}
    const type = getFieldType(model, field)

    if (type === 'string') {
      fieldQuery[field] = searchValue
      orQuery.push(fieldQuery)
    } else if (type === 'number') {
      fieldQuery[field] = parseFloat(searchValue, 10) || null
      orQuery.push(fieldQuery)
    } else if (type === 'boolean') {
      if (searchValue === 'true') {
        fieldQuery[field] = searchValue
        orQuery.push(fieldQuery)
      } else if (searchValue === 'false') {
        fieldQuery[field] = searchValue
        orQuery.push(fieldQuery)
      }
    }
  })

  return orQuery
}

const getAll = (req, res, model) => {
  let page = parseInt(req.query.page) || 0
  let limit = parseInt(req.query.limit) || 10
  let orQuery =  {}

  if (req.query.search) {
    orQuery = queryCreator(model, req.query.search)
  }

  model
    .find().or(orQuery)
    .limit(limit)
    .skip(limit * page)
    .then((records) => res.json(records))
}

const getOne = (req, res, model) => {
  model.findById(req.params.recordId)
    .catch((err) => error404(err, res))
    .then((record) => {
      if (!record) { return error404(null, res) }
      res.json(record)
    })
}

const post = (req, res, model) => {
  const { record, errors } = payloadFilter(model, req.body)

  if (errors) {
    res.status(400).json(errors)
    return
  }
  model
    .create(req.body)
    .then((record) => res.status(201).json(record))
    .catch((err) => error404(err, res))
}

const put = (req, res, model) => {
  const { record, errors } = payloadFilter(model, req.body)

  if (errors) {
    res.status(400).json(errors)
    return
  }

  model
  .findOneAndUpdate(
    { _id: req.params.recordId },
    { $set: record },
    { new: true })
  .then((record) => res.status(200).json(record))
  .catch((err) => error404(err, res))
}

const remove = (req, res, model) => {
  model
    .remove({ _id: req.params.recordId })
    .then(() => { res.status(200).json({ message: `${model.modelName} deleted` }) })
    .catch((err) => error404(err, res))
}

const error404 = (err, res) =>
  res.status(400).json({ error: true, message: err ? err.toString() : '' })

module.exports = {
  modelName,
  getFields,
  getFieldAttribute,
  getFieldType,
  getReferenceFields,
  getAll,
  getOne,
  post,
  put,
  remove,
}
