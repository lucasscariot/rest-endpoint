const mongooseController = require('./mongoose')
const sequelizeController = require('./sequelize')

module.exports = class Api {
  constructor(params) {
    const {
      app,
      express,
      sequelize,
      mongoose,
      namespace,
    } = params

    this.isMongoose = mongoose || null
    this.isSequelize = sequelize || null

    if (this.isMongoose) {
      this.orm = mongooseController
    } else if (this.isSequelize) {
      this.orm = sequelizeController
    }
    this.express = app || express
    this.namespace = this._namespaceFormater(namespace)
    this.schemas = []
  }

  _modelName(model) { return this.orm.modelName(model) }
  _getFields(model) { return this.orm.getFields(model) }
  _getFieldAttribute(model, fieldName) { return this.orm.getFieldAttribute(model, fieldName) }
  _getFieldType(model, fieldName) { return this.orm.getFieldType(model, fieldName) }
  _getReferenceFields(model) { return this.orm.getReferenceFields(model) }


    getAll(req, res, model) { return this.orm.getAll(req, res, model) }

    getOne(req, res, model) { return this.orm.getOne(req, res, model) }

    post(req, res, model) { return this.orm.post(req, res, model) }

    put(req, res, model) { return this.orm.put(req, res, model) }

    remove(req, res, model) { return this.orm.remove(req, res, model) }

  _namespaceFormater(n) {
    if (!n) { return '' }
    return n[n.length - 1] === '/' ? n : n + '/'
  }

  crud(model) {
    if (!model.db && !model.sequelize) { throw new Error('API | Wrong parameter') }
    const modelName = this._modelName(model)

    this.schemas.push(model)
    this.express.get(`/${this.namespace + modelName}`, (req, res) => this.getAll(req, res, model))
    this.express.get(`/${this.namespace + modelName}/:recordId`, (req, res) => this.getOne(req, res, model))
    this.express.put(`/${this.namespace + modelName}/:recordId`, (req, res) => this.put(req, res, model))
    this.express.post(`/${this.namespace + modelName}`, (req, res) => this.post(req, res, model))
    this.express.delete(`/${this.namespace + modelName}/:recordId`, (req, res) => this.remove(req, res, model))
  }
}
