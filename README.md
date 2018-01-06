# Rest Endpoint
> Generate REST CRUD endpoints based on your ORM.

## Installation
`npm install rest-endpoint --save`

`yarn add rest-endpoint --save`

## Configuration
```
const express = require('express')
const RestEndpoint = require('rest-endpoint')
const app = express()
const models = require('./models')


// Sequelize
const api = new RestEndpoint({
  app,
  sequelize: true,
  namespace: 'api',
})


// Mongoose
const api = new RestEndpoint({
  app,
  mongoose: true,
  namespace: 'api',
})

api.crud(models.channels)
api.crud(models.users)
api.crud(models.conversations)
api.crud(models.messages)
```

## Endpoints
Action     | Http Method  | Endpoint          | Description
-----------|--------------|-------------------|------------
List       | GET          | /model            | Get a listing of records
Read       | GET          | /model/:id        | Get details about a record
Create     | POST         | /model            | Create a record
Update     | PUT          | /model/:id        | Update a record
Delete     | DELETE       | /model/:id        | Delete a record
