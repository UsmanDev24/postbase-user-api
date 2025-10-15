import express from "express";
import { default as DBG } from "debug";
import { SQUser, connectDB, findOneUser, createUser, sanitizedUser, userParams } from "./user-sequelize.mjs";
import authorizationParser from "./middleware/authparser.mjs"

const log = DBG('users:service');
const error = DBG('users:error');

const server = express();

server.use(authorizationParser)
server.use(check)
server.use(express.json())


server.listen(process.env.PORT, "localhost", function () {
  log(' listening at ' + process.env.PORT);
});

var apiKeys = [
  { user: 'them', key: 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' }];
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
  } else {
    res.status(500).send('No Authorization Key');
  }
}

server.post('/create-user', async (req, res, next) => {
  await connectDB();
  let isAlreadyUser = await findOneUser(req.body.username)
  if (isAlreadyUser) {
    res.status(500).send("Already a User has username: "+req.body.username)
  }
  let result = await createUser(req);
  res.type = 'json';
  res.send(result);
});

server.post('/find-or-create', async (req, res, next) => {

  await connectDB();
  let user = await findOneUser(req.body.username);
  if (!user) {
    user = await createUser(req);
    if (!user) throw new Error('No user created');
  }
  res.type = 'json';
  res.send(user);

});

server.get('/find/:username', async (req, res, next) => {

  await connectDB()
  log(req.params.username)
  let user = await findOneUser(req.params.username)
  if (user) {
    res.type = 'json';
    res.send(user)
  } else {
    res.status(404).send(new Error('Did not find: ' + req.params.username))
  }

})

server.get('/list', async (req, res, next) => {
  await connectDB();
  let users = await SQUser.findAll()
  users.map(user => sanitizedUser(user))
  res.type = 'json';
  res.send(users);
})

server.post('/update-user/:username', async (req, res, next) => {
  await connectDB();
  let isUser = await findOneUser(req.params.username)
  if (!isUser) {
    res.status(404).send("No Such User: " + req.params.username)
    return
  }
  let update  = req.body
  await SQUser.update(update, { where: { username: req.params.username } })
  const updated = await findOneUser(req.params.username);
  res.type = 'json',
    res.send(updated);
})

server.delete("/destroy/:username", async (req, res, next) => {
  await connectDB()
  let user = await SQUser.findOne({ where: { username: req.params.username } })
  if (!user) {
    res.status(404).send("No Such User: " + req.params.username)
    return
  }
  await user.destroy();
  res.contentType = 'json';
  res.send({})
})

server.post('/password-check', async (req, res, next) => {
  try {
    await connectDB();
    const user = await SQUser.findOne({
      where: { username: req.params.username }
    });
    let checked;
    if (!user) {
      checked = {
        check: false, username: req.params.username,
        message: "Could not find user"
      };
    } else if (user.username === req.params.username
      && user.password === req.params.password) {
      checked = { check: true, username: user.username };
    } else {
      checked = {
        check: false, username: req.params.username,
        message: "Incorrect password"
      };
    }
    res.contentType = 'json';
    res.send(checked);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
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