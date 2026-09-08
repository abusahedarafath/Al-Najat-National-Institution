const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = String(
  process.env.GOOGLE_CLIENT_ID || ""
).trim();

let client = null;

if (GOOGLE_CLIENT_ID) {
  client = new OAuth2Client(GOOGLE_CLIENT_ID);
}

function getClientId() {
  return GOOGLE_CLIENT_ID;
}

function isConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

async function verifyGoogleCredential(credential) {
  if (!credential || typeof credential !== "string") {
    throw new Error("Google credential is required.");
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google authentication is not configured.");
  }

  if (!client) {
    client = new OAuth2Client(GOOGLE_CLIENT_ID);
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Google token payload is missing.");
  }

  const issuer = String(payload.iss || "").trim();

  if (
    issuer !== "https://accounts.google.com" &&
    issuer !== "accounts.google.com"
  ) {
    throw new Error("Invalid Google token issuer.");
  }

  const subject = String(payload.sub || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const name = String(payload.name || "").trim();

  if (!subject) {
    throw new Error("Google account ID is missing.");
  }

  if (!email) {
    throw new Error("Google account email is missing.");
  }

  if (payload.email_verified !== true) {
    throw new Error("Google email is not verified.");
  }

  return {
    subject,
    email,
    name: name || email,
    emailVerified: true,
    picture: String(payload.picture || "").trim() || null,
    hostedDomain: String(payload.hd || "").trim() || null
  };
}

module.exports = {
  isConfigured,
  getClientId,
  verifyGoogleCredential
};
