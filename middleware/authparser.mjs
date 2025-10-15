
import debug from "debug";

const log = debug("users:authParser-log")

export default function authorizationParser(req, res, next) {
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
  }

  req.authorization = auth;
  return next();
}
