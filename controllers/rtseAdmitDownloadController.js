const crypto = require("crypto");
const RtseApplication = require("../models/RtseApplication");
const googleIdentityService = require("../services/googleIdentityService");
const RtseAdmitDownload = require("../models/RtseAdmitDownload");

const GOOGLE_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const DOWNLOAD_AUTH_TTL_MS = 10 * 60 * 1000;

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function getStudent(req) {
  return req.session && req.session.rtseStudent
    ? req.session.rtseStudent
    : null;
}

function clearAdmitVerification(req) {
  if (!req.session) return;
  delete req.session.rtseAdmitDownload;
}

function createNonce() {
  return crypto.randomBytes(32).toString("hex");
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return String(forwarded)
      .split(",")[0]
      .trim()
      .slice(0, 45);
  }

  return String(
    req.ip ||
    req.socket?.remoteAddress ||
    ""
  )
    .trim()
    .slice(0, 45);
}

function getUserAgent(req) {
  return String(
    req.get("user-agent") || ""
  ).slice(0, 4000);
}

function normalizeMobile(value) {
  const digits = String(value || "")
    .replace(/\D/g, "");

  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new Error(
      "Please enter a valid 10-digit Indian mobile number."
    );
  }

  return digits;
}

function normalizeName(value) {
  const name = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!name) {
    throw new Error("Please enter your name.");
  }

  if (name.length < 2) {
    throw new Error("Name must contain at least 2 characters.");
  }

  if (name.length > 255) {
    throw new Error("Name is too long.");
  }

  return name;
}

exports.googleStatus = async (req, res) => {
  return sendJson(res, 200, {
    success: true,
    configured: googleIdentityService.isConfigured()
  });
};

exports.verifyGoogle = async (req, res) => {
  try {
    const student = getStudent(req);

    if (!student) {
      return sendJson(res, 401, {
        success: false,
        code: "STUDENT_LOGIN_REQUIRED",
        message:
          "Please log in to your RTSE student account first."
      });
    }

    if (!googleIdentityService.isConfigured()) {
      return sendJson(res, 503, {
        success: false,
        code: "GOOGLE_NOT_CONFIGURED",
        message:
          "Google authentication is not configured yet."
      });
    }

    const credential = String(
      req.body?.credential || ""
    ).trim();

    if (!credential) {
      return sendJson(res, 400, {
        success: false,
        code: "GOOGLE_CREDENTIAL_REQUIRED",
        message:
          "Google verification credential is required."
      });
    }

    const application =
      await RtseApplication.getById(student.id);

    if (!application) {
      return sendJson(res, 404, {
        success: false,
        code: "APPLICATION_NOT_FOUND",
        message:
          "RTSE application could not be found."
      });
    }

    const identity =
      await googleIdentityService.verifyGoogleCredential(
        credential
      );

    const now = Date.now();

    req.session.rtseAdmitDownload = {
      nonce: createNonce(),

      applicationId: application.id,
      registrationNo: application.registration_no,

      googleSubject: identity.subject,
      googleEmail: identity.email,
      googleName: identity.name,

      googleVerifiedAt: now,
      googleExpiresAt:
        now + GOOGLE_VERIFICATION_TTL_MS,

      downloaderName: null,
      mobile: null,

      downloadAuthorizedAt: null,
      downloadExpiresAt: null,

      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    };

    return sendJson(res, 200, {
      success: true,
      step: "details",

      google: {
        name: identity.name,
        email: identity.email
      },

      expiresInSeconds:
        Math.floor(
          GOOGLE_VERIFICATION_TTL_MS / 1000
        )
    });
  } catch (error) {
    console.error(
      "RTSE Google admit verification error:",
      error
    );

    clearAdmitVerification(req);

    return sendJson(res, 401, {
      success: false,
      code: "GOOGLE_VERIFICATION_FAILED",
      message:
        "Google account verification failed."
    });
  }
};

exports.getVerificationStatus = async (req, res) => {
  const student = getStudent(req);

  if (!student) {
    return sendJson(res, 401, {
      success: false,
      code: "STUDENT_LOGIN_REQUIRED"
    });
  }

  const verification =
    req.session?.rtseAdmitDownload;

  if (!verification) {
    return sendJson(res, 200, {
      success: true,
      step: "google",
      verified: false
    });
  }

  const now = Date.now();

  if (
    verification.googleExpiresAt &&
    now > Number(verification.googleExpiresAt)
  ) {
    clearAdmitVerification(req);

    return sendJson(res, 200, {
      success: true,
      step: "google",
      verified: false
    });
  }

  if (
    verification.downloadAuthorizedAt &&
    verification.downloadExpiresAt &&
    now <= Number(verification.downloadExpiresAt)
  ) {
    return sendJson(res, 200, {
      success: true,
      step: "download",
      verified: true,
      downloadAuthorized: true
    });
  }

  if (verification.googleVerifiedAt) {
    return sendJson(res, 200, {
      success: true,
      step: "details",
      verified: true,

      google: {
        name: verification.googleName,
        email: verification.googleEmail
      }
    });
  }

  clearAdmitVerification(req);

  return sendJson(res, 200, {
    success: true,
    step: "google",
    verified: false
  });
};

exports.submitDetails = async (req, res) => {
  try {
    const student = getStudent(req);

    if (!student) {
      return sendJson(res, 401, {
        success: false,
        code: "STUDENT_LOGIN_REQUIRED",
        message:
          "Please log in to your RTSE student account first."
      });
    }

    const verification =
      req.session?.rtseAdmitDownload;

    if (
      !verification ||
      !verification.googleVerifiedAt
    ) {
      return sendJson(res, 403, {
        success: false,
        code: "GOOGLE_VERIFICATION_REQUIRED",
        message:
          "Please verify your Google account first."
      });
    }

    const now = Date.now();

    if (
      verification.googleExpiresAt &&
      now > Number(verification.googleExpiresAt)
    ) {
      clearAdmitVerification(req);

      return sendJson(res, 403, {
        success: false,
        code: "GOOGLE_VERIFICATION_EXPIRED",
        message:
          "Google verification expired. Please start again."
      });
    }

    const downloaderName =
      normalizeName(req.body?.name);

    const mobile =
      normalizeMobile(req.body?.mobile);

    verification.downloaderName = downloaderName;
    verification.mobile = mobile;

    verification.downloadAuthorizedAt = now;
    verification.downloadExpiresAt =
      now + DOWNLOAD_AUTH_TTL_MS;

    verification.ipAddress = getClientIp(req);
    verification.userAgent = getUserAgent(req);

    req.session.rtseAdmitDownload =
      verification;

    return sendJson(res, 200, {
      success: true,
      step: "download",
      verified: true,
      downloadAuthorized: true,
      expiresInSeconds:
        Math.floor(
          DOWNLOAD_AUTH_TTL_MS / 1000
        )
    });
  } catch (error) {
    return sendJson(res, 400, {
      success: false,
      code: "DETAILS_INVALID",
      message:
        error.message ||
        "Please enter a valid name and mobile number."
    });
  }
};

exports.getRequestMetadata = (req) => ({
  ipAddress: getClientIp(req),
  userAgent: getUserAgent(req)
});

exports.getConstants = () => ({
  googleVerificationTtlMs:
    GOOGLE_VERIFICATION_TTL_MS,

  downloadAuthTtlMs:
    DOWNLOAD_AUTH_TTL_MS
});
