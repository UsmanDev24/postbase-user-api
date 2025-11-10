import { Sequelize, Model, DataTypes } from "sequelize";
import { default as jsyaml } from 'js-yaml';
import { promises as fs } from 'fs';
import * as util from 'util';
import DBG from 'debug';

const log = DBG('users:model-users');
const error = DBG('users:error');

let sequlz;

export class SQUser extends Model { }

export async function connectDB() {

  if (sequlz) return sequlz;
  const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT,
    'utf8');

  const params = await jsyaml.load(yamltext, 'utf8');

  if (typeof process.env.SEQUELIZE_DBNAME !== 'undefined'
    && process.env.SEQUELIZE_DBNAME !== '') {
    params.dbname = process.env.SEQUELIZE_DBNAME;
  }
  if (typeof process.env.SEQUELIZE_DBUSER !== 'undefined'
    && process.env.SEQUELIZE_DBUSER !== '') {
    params.username = process.env.SEQUELIZE_DBUSER;
  }
  if (typeof process.env.SEQUELIZE_DBPASSWD !== 'undefined'
    && process.env.SEQUELIZE_DBPASSWD !== '') {
    params.password = process.env.SEQUELIZE_DBPASSWD;
  }
  if (typeof process.env.SEQUELIZE_DBHOST !== 'undefined'
    && process.env.SEQUELIZE_DBHOST !== '') {
    params.params.host = process.env.SEQUELIZE_DBHOST;
  }
  if (typeof process.env.SEQUELIZE_DBPORT !== 'undefined'
    && process.env.SEQUELIZE_DBPORT !== '') {
    params.params.port = process.env.SEQUELIZE_DBPORT;
  }
  if (typeof process.env.SEQUELIZE_DBDIALECT !== 'undefined'
    && process.env.SEQUELIZE_DBDIALECT !== '') {
    params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
  }
  log('Sequelize params ' + util.inspect(params));
  sequlz = new Sequelize(params.dbname, params.username,
    params.password, params.params);

  await sequlz.authenticate()

  SQUser.init({
    username: { type: DataTypes.STRING(), "unique": true },
    password: { type: DataTypes.STRING() },
    provider: { type: DataTypes.STRING() },
    familyName: { type: DataTypes.STRING() },
    givenName: { type: DataTypes.STRING() },
    middleName: { type: DataTypes.STRING() },
    emails: { type: DataTypes.STRING() },
    photos: { type: DataTypes.STRING() }
  }, {
    sequelize: sequlz,
    modelName: 'SQUser'
  });
  await SQUser.sync();
}
export function userParams(req) {
  return {
    username: req.body.username,
    password: req.body.password,
    provider: req.body.provider,
    familyName: req.body.familyName,
    givenName: req.body.givenName,
    middleName: req.body.middleName,
    emails: req.body.emails,
    photos: JSON.stringify(req.body.photos)
  };
}
export function sanitizedUser(user) {
  var ret = {
    id: user.username,
    username: user.username,
    provider: user.provider,
    familyName: user.familyName,
    givenName: user.givenName,
    middleName: user.middleName
  };
  try {
    ret.emails = user.emails;
  } catch (e) { ret.emails = null; }
  try {
    ret.photos = JSON.parse(user.photos);
  } catch (e) { ret.photos = []; }
  return ret;
}

export async function findOneUser(username) {
  let user = await SQUser.findOne({ where: { username: username } });
  user = user ? sanitizedUser(user) : undefined;
  return user;
  
} export async function createUser(req) {
  let tocreate = userParams(req);
  console.log(tocreate)
  await SQUser.create(tocreate);
  const result = await findOneUser(req.body.username);
  return result;
}
