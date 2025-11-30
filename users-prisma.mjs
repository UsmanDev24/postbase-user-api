import { use } from 'react';
import { prisma } from './lib/prisma';
import { default as DBG } from 'debug'
const log = DBG('users:prisma')
const logErr = DBG('users:prisma_Error')
export async function connectDB() {
  try {
    await prisma.$connect()
  } catch (error) {
    console.error(error)
  }
}
export async function disconnetDB() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error(error)
  }
}
export function userParams(req) {
  const params = {
    username: req.body.username,
    password_hash: req.body.password_hash,
    provider: req.body.provider,
    pid: req.body.pid,
    displayName: req.body.displayName,
    fullName: req.body.fullName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    photoURL: req.body.photoURL,
    photo: req.body.photo
  }
  return params;
}

export function sanitizedUser(user) {
  const sanitized = {
    id: user.id,
    username: user.username,
    provider: user.provider,
    pid: user.pid,
    fullName: user.fullName,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photoURL: user.photoURL,
    photo: user.photo
  }
  return sanitized;
}
export const DBUsers = prisma.users;

export async function findOneUser(username) {
  try {
    const user = await DBUsers.findUnique({
      where: {
        username
      }
    });
    if (user) {
      const sanitized = sanitizedUser(user);
      return sanitized;
    }
    return user;

  } catch (error) {
    console.error(error)
  }
}

export async function createUser(req) {
  try {
    const user = await DBUsers.create({
      data: userParams(req)
    })
    const sanitized = sanitizedUser(user);
    return sanitized;
  } catch (error) {
    console.error(error)
  }
}

