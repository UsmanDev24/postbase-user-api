import '@dotenvx/dotenvx/config.js';
import express from "express";
import { default as DBG } from "debug";
import { default as bcrypt } from 'bcryptjs'
import { DBUsers, connectDB, findOneUser, createUser, sanitizedUser, userParams } from "./users-prisma.mjs";
import authorizationParser from "./middleware/authparser.mjs"

const log = DBG('users:service');
const error = DBG('users:error');

const server = express();

server.use(authorizationParser)
server.use(check)
server.use(express.json())
server.use(express.urlencoded())




var apiKeys = [
  { user: process.env.APIKEY_USER, key: process.env.APIKEY_PASSWORD }];
function check(req, res, next) {
  if (req.authorization && req.authorization.basic) {
    var found = false;
    for (let auth of apiKeys) {
      if (auth.key === req.authorization.basic.password
        && auth.user === req.authorization.basic.username) {
        found = true;
        break;
      }
    }
    if (found) next();
    else {
      res.status(401).send("Not authenticated");
    }
  } else if (req.authorization && req.authorization.bearer) {
    var found = false;
    for (let auth of apiKeys) {
      if (auth.key === req.authorization.bearer.password
        && auth.user === req.authorization.bearer.username) {
        found = true;
        break;
      }
    }
    if (found) next();
    else {
      res.status(401).send("Not authenticated");
    }

  }
  else {
    res.status(500).send('No Authorization Key');
  }
}

server.post('/create-user', async (req, res, next) => {
  await connectDB();
  let isAlreadyUser = await findOneUser(req.body.username)
  if (isAlreadyUser) {
    res.status(500).send("Already a User has username: " + req.body.username)
  }
  let result = await createUser(req);
  res.contentType('json');
  res.send(result);
});

server.post('/find-or-create', async (req, res, next) => {

  await connectDB();
  let user = await findOneUser(req.body.username);
  if (!user) {
    user = await createUser(req);
    if (!user) throw new Error('No user created');
  }
  res.contentType('json');
  res.send(user);

});

server.get('/find/:username', async (req, res, next) => {

  await connectDB()
  log(req.params.username)
  let user = await findOneUser(req.params.username)
  if (user) {
    res.contentType('json');
    res.send(user)
  } else {
    res.status(404).send('Did not find: ' + req.params.username)
  }

})

server.get('/list', async (req, res, next) => {
  await connectDB();
  let users = await DBUsers.findMany();
  users.map(user => sanitizedUser(user))
  res.contentType('json');
  res.send(users);
})

server.post('/update-user/:username', async (req, res, next) => {
  await connectDB();
  let isUser = await findOneUser(req.params.username)
  if (!isUser) {
    res.status(404).send("No Such User: " + req.params.username)
    return
  }
  let update = req.body
  await DBUsers.update({
    data: update, where: {
      username: req.params.username
    }
  })
  const updated = await findOneUser(req.params.username);
  res.contentType('json');
  res.send(updated);
})

server.delete("/destroy/:username", async (req, res, next) => {
  await connectDB()
  let user = await DBUsers.findUnique({ where: { username: req.params.username } })
  if (!user) {
    res.status(404).send("No Such User: " + req.params.username)
    return
  }
  await DBUsers.delete({where: {id: user.id}});
  res.contentType('json')
  res.send({})
})

server.post('/password-check', async (req, res, next) => {

  await connectDB();
  const user = await DBUsers.findUnique({
    where: { username: req.body.username }
  });
  let checked;
  if (!user) {
    checked = {
      check: false, username: req.body.username,
      message: "Could not find user"
    };
  } else if (user.provider != "Local") {
    checked = {
      check: false, username: req.body.username,
      message: "Could not find user"
    };
  } else if (user.username === req.body.username
    && await bcrypt.compare(req.body.password, user.password_hash)) {
    checked = { check: true, username: user.username };
  } else {
    checked = {
      check: false, username: req.body.username,
      message: "Incorrect password"
    };
  }
  res.contentType('json');
  res.send(checked);
});
server.listen(process.env.PORT, "localhost", function (err) {
  if (err) console.log(err);

  log(' listening at ' + process.env.PORT);
});
process.on('uncaughtException', function (err) {
  console.error("UNCAUGHT EXCEPTION - " + (err.stack || err));
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error(`UNHANDLED PROMISE REJECTION: ${util.inspect(p)}
reason: ${reason}`);
  process.exit(1);
});