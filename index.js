const mongooseController = require('./mongoose')
const sequelizeController = require('./sequelize')

class Api {
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


    getAll(req, res, model, params) { return this.orm.getAll(req, res, model, params) }

    getOne(req, res, model, params) { return this.orm.getOne(req, res, model, params) }

    post(req, res, model, params) { return this.orm.post(req, res, model, params) }

    put(req, res, model, params) { return this.orm.put(req, res, model, params) }

    remove(req, res, model, params) { return this.orm.remove(req, res, model, params) }

  _namespaceFormater(n) {
    if (!n) { return '' }
    return n[n.length - 1] === '/' ? n : n + '/'
  }

  getMiddleware(fn) {
    if (fn) { return fn }
    if (fn === false) {
      return (req, res, next) => { res.sendStatus(404) }
    }
    return (req, res, next) => { next() }
  }

  crud(model, params = { auth: {} }) {
    let { auth } = params

    if (!auth) { auth = {} }
    if (!model.db && !model.sequelize) { throw new Error('API | Wrong parameter') }
    const modelName = this._modelName(model)


    this.schemas.push(model)
    this.express.get(`/${this.namespace + modelName}`,
      this.getMiddleware(auth.get), (req, res) => this.getAll(req, res, model, params))
    this.express.get(`/${this.namespace + modelName}/:recordId`,
      this.getMiddleware(auth.get), (req, res) => this.getOne(req, res, model, params))
    this.express.put(`/${this.namespace + modelName}/:recordId`,
      this.getMiddleware(auth.put), (req, res) => this.put(req, res, model, params))
    this.express.post(`/${this.namespace + modelName}`,
      this.getMiddleware(auth.post) , (req, res) => this.post(req, res, model, params))
    this.express.delete(`/${this.namespace + modelName}/:recordId`,
      this.getMiddleware(auth.delete), (req, res) => this.remove(req, res, model, params))
    this.express.options(`/${this.namespace + modelName}`, (req, res) => {
      var headers = {};
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400';
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
      res.writeHead(200, headers);
      res.end();
    })
  }
}

module.exports = Api
