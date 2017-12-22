# Rest Endpoint
> Generate REST CRUD endpoints based on your ORM.

### Installation
`npm install --save rest-endpoint`

`yarn add rest-endpoint`


### Configuration
```
import mongoose from 'mongoose'
import RestEndpoint from 'rest-endpoint'
import { app } from './app'
import channels from './schemas/channels'
import users from './schemas/users'
import conversations from './schemas/conversations'
import messages from './schemas/messages'

mongoose.connect(...)
const api = new RestEndpoint({
  app,
  mongoose,
  namespace: 'api',
})

api.crud(channels)
api.crud(users)
api.crud(conversations)
api.crud(messages)

app.set('port', process.env.PORT || 3000)
app.listen(app.get('port'))
```

### Endpoints
- **GET** -> /model
- **GET** -> /model/*:recordId*
- **PUT** -> /model/*:recordId*
- **POST** -> /model
- **DELETE** -> /model/*:recordId*
