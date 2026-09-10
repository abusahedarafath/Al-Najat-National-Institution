const db = require("../config/database");

class RtseAdmitDownload {
  static async create(data) {
    const sql = `
      INSERT INTO rtse_admit_downloads (
        application_id,
        registration_no,
        student_name,
        google_subject,
        google_email,
        google_name,
        downloader_name,
        mobile,
        mobile_verified,
        otp_provider,
        otp_request_id,
        verified_at,
        downloaded_at,
        ip_address,
        user_agent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `;

    const [result] = await db.query(sql, [
      data.applicationId,
      data.registrationNo,
      data.studentName,
      data.googleSubject,
      data.googleEmail,
      data.googleName,
      data.downloaderName || null,
      data.mobile,
      data.mobileVerified ? 1 : 0,
      data.otpProvider || null,
      data.otpRequestId || null,
      data.verifiedAt || null,
      data.ipAddress || null,
      data.userAgent || null
    ]);

    return {
      id: result.insertId
    };
  }

  static async countForApplication(applicationId) {
    const [rows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM rtse_admit_downloads
        WHERE application_id = ?
      `,
      [applicationId]
    );

    return Number(rows[0]?.total || 0);
  }

  static async countForGoogleSubject(googleSubject) {
    const [rows] = await db.query(
      `
        SELECT COUNT(DISTINCT application_id) AS total
        FROM rtse_admit_downloads
        WHERE google_subject = ?
      `,
      [googleSubject]
    );

    return Number(rows[0]?.total || 0);
  }


  static async getAdminHistory(options = {}) {
    const page = Math.max(
      1,
      Number.parseInt(options.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        10,
        Number.parseInt(options.limit, 10) || 25
      )
    );

    const offset = (page - 1) * limit;

    const search = String(options.search || "").trim();
    const dateFrom = String(options.dateFrom || "").trim();
    const dateTo = String(options.dateTo || "").trim();

    const conditions = [];
    const params = [];

    if (search) {
      const like = `%${search}%`;

      conditions.push(`(
        registration_no LIKE ?
        OR student_name LIKE ?
        OR google_name LIKE ?
        OR google_email LIKE ?
        OR google_subject LIKE ?
        OR downloader_name LIKE ?
        OR mobile LIKE ?
        OR ip_address LIKE ?
      )`);

      params.push(
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        like
      );
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
      conditions.push("downloaded_at >= ?");
      params.push(`${dateFrom} 00:00:00`);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      conditions.push("downloaded_at <= ?");
      params.push(`${dateTo} 23:59:59`);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM rtse_admit_downloads
        ${where}
      `,
      params
    );

    const total = Number(countRows[0]?.total || 0);

    const totalPages = Math.max(
      1,
      Math.ceil(total / limit)
    );

    const safePage = Math.min(page, totalPages);
    const safeOffset = (safePage - 1) * limit;

    const [rows] = await db.query(
      `
        SELECT
          id,
          application_id,
          registration_no,
          student_name,
          google_subject,
          google_email,
          google_name,
          downloader_name,
          mobile,
          mobile_verified,
          otp_provider,
          otp_request_id,
          verified_at,
          downloaded_at,
          ip_address,
          user_agent
        FROM rtse_admit_downloads
        ${where}
        ORDER BY downloaded_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, safeOffset]
    );

    return {
      rows,
      page: safePage,
      limit,
      total,
      totalPages
    };
  }

  // =====================================
  // School Portal - Admit Card Download History
  // =====================================
  static async getSchoolHistory(schoolId, options = {}) {
    const safeSchoolId = Number(schoolId);

    if (!Number.isInteger(safeSchoolId) || safeSchoolId <= 0) {
      throw new Error("Invalid school ID.");
    }

    const page = Math.max(
      1,
      Number.parseInt(options.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(10, Number.parseInt(options.limit, 10) || 25)
    );

    const search = String(options.search || "").trim();
    const dateFrom = String(options.dateFrom || "").trim();
    const dateTo = String(options.dateTo || "").trim();

    const conditions = [
      `(
        ra.school_id=?
        OR (
          ra.school_id IS NULL
          AND LOWER(TRIM(ra.school_name)) COLLATE utf8mb4_unicode_ci =
              LOWER(
                (
                  SELECT TRIM(s.school_name) COLLATE utf8mb4_unicode_ci
                  FROM arsp_schools s
                  WHERE s.id=?
                  LIMIT 1
                )
              )
        )
      )`,
      `ra.archive=0`
    ];

    const params = [safeSchoolId, safeSchoolId];

    if (search) {
      const like = `%${search}%`;

      conditions.push(`(
        rad.registration_no LIKE ?
        OR rad.student_name LIKE ?
        OR rad.google_name LIKE ?
        OR rad.google_email LIKE ?
        OR rad.google_subject LIKE ?
        OR rad.downloader_name LIKE ?
        OR rad.mobile LIKE ?
        OR ra.full_name LIKE ?
      )`);

      params.push(
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        like
      );
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
      conditions.push("rad.downloaded_at >= ?");
      params.push(`${dateFrom} 00:00:00`);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      conditions.push("rad.downloaded_at <= ?");
      params.push(`${dateTo} 23:59:59`);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM rtse_admit_downloads rad
       INNER JOIN rtse_applications ra
         ON ra.id=rad.application_id
       ${where}`,
      params
    );

    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const safePage = Math.min(page, totalPages);
    const safeOffset = (safePage - 1) * limit;

    const [rows] = await db.query(
      `SELECT
        rad.id,
        rad.application_id,
        rad.registration_no,
        rad.student_name,
        rad.google_subject,
        rad.google_email,
        rad.google_name,
        rad.downloader_name,
        rad.mobile,
        rad.mobile_verified,
        rad.otp_provider,
        rad.verified_at,
        rad.downloaded_at,
        rad.ip_address,
        ra.full_name AS application_student_name,
        ra.class AS student_class,
        ra.section AS student_section
       FROM rtse_admit_downloads rad
       INNER JOIN rtse_applications ra
         ON ra.id=rad.application_id
       ${where}
       ORDER BY rad.downloaded_at DESC, rad.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, safeOffset]
    );

    const [statsRows] = await db.query(
      `SELECT
        COUNT(*) AS total,
        COUNT(DISTINCT rad.application_id) AS unique_students,
        SUM(
          CASE
            WHEN rad.downloaded_at >= CURDATE()
            THEN 1
            ELSE 0
          END
        ) AS today
       FROM rtse_admit_downloads rad
       INNER JOIN rtse_applications ra
         ON ra.id=rad.application_id
       ${where}`,
      params
    );

    const stat = statsRows[0] || {};

    return {
      rows,
      page: safePage,
      limit,
      total,
      totalPages,
      stats: {
        total: Number(stat.total || 0),
        uniqueStudents: Number(stat.unique_students || 0),
        today: Number(stat.today || 0)
      }
    };
  }

  static async getAdminStats() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(DISTINCT google_subject) AS unique_google_accounts,
        COUNT(DISTINCT mobile) AS unique_mobile_numbers,
        COUNT(DISTINCT application_id) AS unique_students,
        SUM(
          CASE
            WHEN downloaded_at >= CURDATE()
            THEN 1
            ELSE 0
          END
        ) AS today
      FROM rtse_admit_downloads
    `);

    const row = rows[0] || {};

    return {
      total: Number(row.total || 0),
      today: Number(row.today || 0),
      uniqueGoogleAccounts:
        Number(row.unique_google_accounts || 0),
      uniqueMobileNumbers:
        Number(row.unique_mobile_numbers || 0),
      uniqueStudents:
        Number(row.unique_students || 0)
    };
  }

  static async countForMobile(mobile) {
    const [rows] = await db.query(
      `
        SELECT COUNT(DISTINCT application_id) AS total
        FROM rtse_admit_downloads
        WHERE mobile = ?
      `,
      [mobile]
    );

    return Number(rows[0]?.total || 0);
  }
}

module.exports = RtseAdmitDownload;
