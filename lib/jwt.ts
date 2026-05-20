import jwt, { type SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "magik-link-dev-secret-2024";

export function signToken(payload: object, expiresIn: string): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken<T = Record<string, unknown>>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}
