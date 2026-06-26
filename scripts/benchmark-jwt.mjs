import jwt from "jsonwebtoken";

const SECRET = "benchmark-secret-key-32-chars-ok";
const ITERATIONS = 10_000;

const magicLinkPayload = { email: "user@example.com", purpose: "magic-link" };
const sessionPayload = { userId: "507f1f77bcf86cd799439011", email: "user@example.com", purpose: "session" };

function percentile(sorted, p) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[idx];
}

function bench(label, fn) {
  const times = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const t0 = performance.now();
    fn();
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  console.log(`${label}:`);
  console.log(`  p50 = ${percentile(times, 50).toFixed(4)} ms`);
  console.log(`  p95 = ${percentile(times, 95).toFixed(4)} ms`);
  console.log(`  p99 = ${percentile(times, 99).toFixed(4)} ms`);
}

// Measure token sizes
const magicToken = jwt.sign(magicLinkPayload, SECRET, { expiresIn: "15m" });
const sessionToken = jwt.sign(sessionPayload, SECRET, { expiresIn: "7d" });

console.log("=== Token Size Analysis ===");
console.log(`Magic link JWT  : ${Buffer.byteLength(magicToken, "utf8")} bytes`);
console.log(`Session JWT     : ${Buffer.byteLength(sessionToken, "utf8")} bytes`);
console.log(`Session ID (ref): 32 bytes (UUID v4 / opaque session ID equivalent)`);
console.log("");

// Measure sign performance
console.log("=== Sign Performance ===");
bench("signToken (magic-link, HS256)", () =>
  jwt.sign(magicLinkPayload, SECRET, { expiresIn: "15m" })
);
bench("signToken (session, HS256)", () =>
  jwt.sign(sessionPayload, SECRET, { expiresIn: "7d" })
);
console.log("");

// Measure verify performance
console.log("=== Verify Performance ===");
bench("verifyToken (magic-link)", () => jwt.verify(magicToken, SECRET));
bench("verifyToken (session)", () => jwt.verify(sessionToken, SECRET));
