module.exports = class Api {
  constructor(params) {
    const {
      app,
      express,
      namespace,
    } = params
    this.express = app || express
    this.namespace = this._namespaceFormater(namespace)
    this.schemas = []
  }

  _getFields(model) {
    return Object.keys(model.schema.obj)
  }

  _getFieldAttribute(model, fieldName) {
    return model.schema.paths[fieldName]
  }

  _getReferenceFields(model) {
    return this._getFields(model).filter((field) =>
      this._getFieldAttribute(model, field).options.ref)
  }

  _getFieldInstance(model, fieldName) {
    const attributes = this._getFieldAttribute(model, fieldName)
    return attributes && attributes.instance
  }

  _namespaceFormater(n) {
    if (!n) { return '' }
    return n[n.length - 1] === '/' ? n : n + '/'
  }

  _payloadFilter(model, body) {
    const fields = this._getFields(model)
    const record = {}
    const errors = {}

    fields.forEach((fieldName) => {
      if (body[fieldName] === undefined) { return }
      if ((typeof body[fieldName] === this._getFieldInstance(model, fieldName).toLowerCase()) ||
      (this._getFieldInstance(model, fieldName) === 'Array' &&
      body[fieldName] instanceof Array)) {
        record[fieldName] = body[fieldName]
      } else {
        errors[fieldName] = `Should be a ${this._getFieldInstance(model, fieldName)}`
        + ` instead of ${typeof body[fieldName]}.`
      }
    })

    if (Object.keys(errors).length === 0) {
      return { record };
    }
    return { record, errors }
  }

  getAll(req, res, model) {
    let page = parseInt(req.query.page) || 0
    let limit = parseInt(req.query.limit) || 10

    model
      .find()
      .limit(limit)
      .skip(limit * page)
      .then((records) => res.json(records))
  }

  getOne(req, res, model) {
    model.findById(req.params.recordId).then((records) => res.json(records))
  }

  post(req, res, model) {
    const { record, errors } = this._payloadFilter(model, req.body)

    if (errors) {
      res.status(400).json(errors)
      return
    }
    model
      .create(req.body)
      .then((record) => res.status(201).json(record))
      .catch((err) => this._catch(err, res))
  }

  put(req, res, model) {
    const { record, errors } = this._payloadFilter(model, req.body)

    if (errors) {
      res.status(400).json(errors)
      return
    }

    console.log();
    console.log();
    console.log(record);
    console.log();
    console.log();

    model
    .findOneAndUpdate(
      { _id: req.params.recordId },
      { $set: record },
      { new: true })
    .then((record) => res.status(200).json(record))
    .catch((err) => this._catch(err, res))
  }

  delete(req, res, model) {
    model
      .remove({ _id: req.params.recordId })
      .then(() => { res.status(200).json({ message: `${model.modelName} deleted` }) })
      .catch((err) => this._catch(err, res))
  }

  _catch(err, res) {
    res.status(400).json({ error: true, message: err.toString() })
  }

  crud(model) {
    if (!model.db) { throw new Error('API | Wrong parameter') }
    this.schemas.push(model)
    this.express.get(`/${this.namespace + model.modelName}`, (req, res) => this.getAll(req, res, model))
    this.express.get(`/${this.namespace + model.modelName}/:recordId`, (req, res) => this.getOne(req, res, model))
    this.express.put(`/${this.namespace + model.modelName}/:recordId`, (req, res) => this.put(req, res, model))
    this.express.post(`/${this.namespace + model.modelName}`, (req, res) => this.post(req, res, model))
    this.express.delete(`/${this.namespace + model.modelName}/:recordId`, (req, res) => this.delete(req, res, model))
  }
}
