import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const jsonMiddleware = express.json();

export const urlEncodedMiddleware = express.urlencoded({ extended: true });

export const staticMiddleware = express.static('public');

export const exercisesMiddleware = express.static(path.join(__dirname, 'exercises'));

export const sessionMiddleware = session({
  name: 'AuthState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
});

/**
 * Logs information about an incoming request and passes control to the next middleware.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const requestLoggerMiddleware = (req, res, next) => {
  const timestamp = Date.now();
  const datetime = new Date(timestamp).toLocaleString();
  console.log(`Received ${req.method} request to ${req.originalUrl} at ${datetime}`);
  next();
};

/**
 * Middleware function for user session handling.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const userSessionMiddleware = (req, res, next) => {
  res.locals.user = req.session.user;
  next();
};