
import debug from "debug" ;
import { default as jwt} from 'jsonwebtoken';

const log = debug("users:authParser-log")

export default async function authorizationParser(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    req.authorization = null;
    return next();
  }
  
  const index = header.indexOf(" ");
  if (index === -1) {
    req.authorization = { scheme: header, credentials: null };
    return next();
  }

  const scheme = header.substring(0, index);
  const credentials = header.substring(index + 1);
  const auth = { scheme, credentials };

  if (scheme.toLowerCase() === "basic") {
    try {
      const decoded = Buffer.from(credentials, "base64").toString();
      const [username, password] = decoded.split(":");
      auth.basic = {username: username, password: password}
    } catch {
      // Ignore invalid Base64 to maintain non-blocking behavior
    }
  } else if (scheme.toLowerCase() === 'bearer') {
    try {
      const decoded = jwt.verify(credentials, process.env.BEARER_TOKEN_PRIVATEKEY)
      const {username, password} = decoded
      auth.bearer = {username: username, password, password}
    } catch (error) {
      
    }
  }
  
  req.authorization = auth;
  return next();
}
