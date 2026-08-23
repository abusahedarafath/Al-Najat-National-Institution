const db = require("../config/database");

class RtseCentre {

    static async getAll() {
        const [rows] = await db.query(`
            SELECT
                c.*,
                COALESCE(sa.school_count, 0) AS school_count,
                COALESCE(ra.student_count, 0) AS student_count
            FROM rtse_centres c
            LEFT JOIN (
                SELECT
                    centre_id,
                    COUNT(*) AS school_count
                FROM rtse_school_centre_assignments
                WHERE status IN ('Approved', 'Active')
                GROUP BY centre_id
            ) sa ON sa.centre_id = c.id
            LEFT JOIN (
                SELECT
                    sca.centre_id,
                    COUNT(DISTINCT a.id) AS student_count
                FROM rtse_school_centre_assignments sca
                INNER JOIN rtse_applications a
                    ON a.school_id = sca.school_id
                   AND a.application_year = sca.application_year
                   AND a.archive = 0
                WHERE sca.status IN ('Approved', 'Active')
                GROUP BY sca.centre_id
            ) ra ON ra.centre_id = c.id
            ORDER BY
                CASE c.status
                    WHEN 'Pending' THEN 1
                    WHEN 'Approved' THEN 2
                    WHEN 'Inactive' THEN 3
                    WHEN 'Suspended' THEN 4
                    WHEN 'Rejected' THEN 5
                    ELSE 6
                END,
                c.id DESC
        `);

        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT
                c.*,
                COALESCE(sa.school_count, 0) AS school_count,
                COALESCE(ra.student_count, 0) AS student_count
            FROM rtse_centres c
            LEFT JOIN (
                SELECT
                    centre_id,
                    COUNT(*) AS school_count
                FROM rtse_school_centre_assignments
                WHERE status IN ('Approved', 'Active')
                GROUP BY centre_id
            ) sa ON sa.centre_id = c.id
            LEFT JOIN (
                SELECT
                    sca.centre_id,
                    COUNT(DISTINCT a.id) AS student_count
                FROM rtse_school_centre_assignments sca
                INNER JOIN rtse_applications a
                    ON a.school_id = sca.school_id
                   AND a.application_year = sca.application_year
                   AND a.archive = 0
                WHERE sca.status IN ('Approved', 'Active')
                GROUP BY sca.centre_id
            ) ra ON ra.centre_id = c.id
            WHERE c.id = ?
            LIMIT 1
        `, [id]);

        return rows[0] || null;
    }

    // =====================================
    // Centre Portal Dashboard Statistics
    // =====================================
    static async getPortalDashboardStats(centreId) {
        const [rows] = await db.query(`
            SELECT
                (
                    SELECT COUNT(DISTINCT sca2.school_id)
                    FROM rtse_school_centre_assignments sca2
                    WHERE sca2.centre_id = sca.centre_id
                      AND sca2.status IN ('Approved', 'Active')
                ) AS assigned_schools,
                COUNT(DISTINCT a.id) AS total_students,
                SUM(a.status = 'Approved') AS approved_students,
                SUM(a.status = 'Pending') AS pending_students,
                SUM(a.status = 'Rejected') AS rejected_students,
                SUM(a.roll_no IS NOT NULL AND a.roll_no <> '') AS roll_generated,
                SUM(ea.attendance_status = 'PRESENT') AS present_students,
                SUM(ea.attendance_status = 'ABSENT') AS absent_students,
                SUM(ea.attendance_status = 'NOT_SCANNED' OR ea.attendance_status IS NULL) AS not_scanned_students
              FROM rtse_school_centre_assignments sca
            INNER JOIN rtse_applications a
                ON a.school_id = sca.school_id
                AND a.application_year = sca.application_year
                AND a.archive = 0
            LEFT JOIN rtse_exam_attendance ea
                ON ea.application_id = a.id
            WHERE sca.centre_id = ?
              AND sca.status IN ('Approved', 'Active')
        `, [centreId]);

        return rows[0] || {
            assigned_schools: 0,
            total_students: 0,
            approved_students: 0,
            pending_students: 0,
            rejected_students: 0,
            roll_generated: 0,
            present_students: 0,
            absent_students: 0,
            not_scanned_students: 0};
    }

    // =====================================
    // Centre Portal Candidate Registry
    // =====================================
    static async getPortalStudents(
        centreId,
        search = "",
        status = "",
        applicationYear = "",
        attendance = ""
    ) {
        const keyword = String(search || "").trim();
        const selectedStatus = String(status || "").trim();
        const year = String(applicationYear || "").trim();
        const selectedAttendance = String(attendance || "").trim().toUpperCase();

        const params = [centreId];
        let sql = `
            SELECT
                a.id,
                a.registration_no,
                a.full_name,
                a.father_name,
                a.mobile,
                a.school_id,
                a.school_name,
                a.class,
                a.section,
                a.application_year,
                a.status,
                a.roll_no,
                a.roll_number,
                a.admit_generated,
                sca.centre_id,
                sca.status AS assignment_status,
                s.school_code,
                s.school_name AS registered_school_name,
                ea.attendance_status,
                ea.scanned_at
            FROM rtse_applications a
            INNER JOIN rtse_school_centre_assignments sca
                ON sca.school_id = a.school_id
                AND sca.application_year = a.application_year
            LEFT JOIN arsp_schools s
                ON s.id = a.school_id
            LEFT JOIN rtse_exam_attendance ea
                ON ea.application_id = a.id
            WHERE sca.centre_id = ?
              AND sca.status IN ('Approved', 'Active')
              AND a.archive = 0
        `;

        if (["Pending", "Approved", "Rejected"].includes(selectedStatus)) {
            sql += ` AND a.status = ?`;
            params.push(selectedStatus);
        }

        if (/^\d{4}$/.test(year)) {
            sql += ` AND a.application_year = ?`;
            params.push(Number(year));
        }

        if (["NOT_SCANNED", "PRESENT", "ABSENT"].includes(selectedAttendance)) {
            if (selectedAttendance === "NOT_SCANNED") {
                sql += ` AND (ea.attendance_status = 'NOT_SCANNED' OR ea.attendance_status IS NULL)`;
            } else {
                sql += ` AND ea.attendance_status = ?`;
                params.push(selectedAttendance);
            }
        }

        if (keyword) {
            const like = `%${keyword}%`;

            sql += `
                AND (
                    a.registration_no LIKE ?
                    OR a.full_name LIKE ?
                    OR a.mobile LIKE ?
                    OR a.school_name LIKE ?
                    OR s.school_code LIKE ?
                    OR CAST(a.class AS CHAR) LIKE ?
                    OR a.section LIKE ?
                    OR a.roll_no LIKE ?
                    OR CAST(a.roll_number AS CHAR) LIKE ?
                )
            `;

            params.push(
                like,
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

        sql += `
            ORDER BY
                a.class ASC,
                a.section ASC,
                a.full_name ASC,
                a.registration_no ASC
        `;

        const [rows] = await db.query(sql, params);
        return rows;
    }

    // =====================================
    // Centre Portal Candidate Details
    // IMPORTANT:
    // Candidate access is strictly limited to
    // schools assigned to the logged-in centre.
    // =====================================
    static async getPortalStudentById(centreId, studentId) {
        const [rows] = await db.query(
            `
            SELECT
                a.*,
                sca.centre_id,
                sca.status AS assignment_status,

                s.school_code,
                s.school_name AS registered_school_name,
                s.school_type AS registered_school_type,

                c.centre_id AS centre_public_id,
                c.centre_code,
                c.centre_name,
                c.centre_type,

                ea.attendance_status,
                ea.scanned_at,
                ea.qr_token

            FROM rtse_applications a

            INNER JOIN rtse_school_centre_assignments sca
                ON sca.school_id = a.school_id
                AND sca.application_year = a.application_year

            INNER JOIN rtse_centres c
                ON c.id = sca.centre_id

            LEFT JOIN arsp_schools s
                ON s.id = a.school_id

            LEFT JOIN rtse_exam_attendance ea
                ON ea.application_id = a.id

            WHERE
                a.id = ?
                AND a.archive = 0
                AND sca.centre_id = ?
                AND sca.status IN ('Approved', 'Active')

            LIMIT 1
            `,
            [studentId, centreId]
        );

        return rows[0] || null;
    }

    // =====================================
    // Centre Portal Application Years
    // =====================================
    static async getPortalApplicationYears(centreId) {
        const [rows] = await db.query(`
            SELECT DISTINCT
                sca.application_year
            FROM rtse_school_centre_assignments sca
            WHERE sca.centre_id = ?
              AND sca.status IN ('Approved', 'Active')
            ORDER BY sca.application_year DESC
        `, [centreId]);

        return rows;
    }


    // =====================================
    // Get Schools Assigned To Centre
    // =====================================
    static async getAssignedSchools(centreId, applicationYear = null) {
        let sql = `
            SELECT
                sca.id AS assignment_id,
                sca.school_id,
                sca.centre_id,
                sca.application_year,
                sca.status AS assignment_status,
                sca.assigned_by,
                sca.approved_by,
                sca.approved_at,
                sca.remarks AS assignment_remarks,
                sca.created_at AS assignment_created_at,
                sca.updated_at AS assignment_updated_at,

                s.school_code,
                s.school_name,
                s.school_type,
                s.head_name,
                s.mobile,
                s.email,
                s.district,
                s.state,
                s.status AS school_status

            FROM rtse_school_centre_assignments sca

            INNER JOIN arsp_schools s
                ON s.id = sca.school_id

            WHERE sca.centre_id = ?
        `;

        const params = [centreId];

        if (applicationYear) {
            sql += ` AND sca.application_year = ?`;
            params.push(applicationYear);
        }

        sql += `
            ORDER BY
                sca.application_year DESC,
                s.school_name ASC
        `;

        const [rows] = await db.query(sql, params);

        return rows;
    }


    // =====================================
    // School-Centre Assignment
    // =====================================

    static async getAssignmentById(assignmentId) {
        const [rows] = await db.query(`
            SELECT
                sca.*,
                s.school_code,
                s.school_name,
                s.school_type,
                s.status AS school_status,
                c.centre_code,
                c.centre_name,
                c.status AS centre_status
            FROM rtse_school_centre_assignments sca
            INNER JOIN arsp_schools s
                ON s.id = sca.school_id
            INNER JOIN rtse_centres c
                ON c.id = sca.centre_id
            WHERE sca.id = ?
            LIMIT 1
        `, [assignmentId]);

        return rows[0] || null;
    }

    static async getSchoolAssignment(schoolId, applicationYear) {
        const [rows] = await db.query(`
            SELECT
                sca.*,
                c.centre_code,
                c.centre_name,
                c.status AS centre_status,
                s.school_code,
                s.school_name,
                s.status AS school_status
            FROM rtse_school_centre_assignments sca
            INNER JOIN rtse_centres c
                ON c.id = sca.centre_id
            INNER JOIN arsp_schools s
                ON s.id = sca.school_id
            WHERE sca.school_id = ?
              AND sca.application_year = ?
            LIMIT 1
        `, [schoolId, applicationYear]);

        return rows[0] || null;
    }

    static async getAssignments(centreId, applicationYear = null) {
        let sql = `
            SELECT
                sca.id AS assignment_id,
                sca.school_id,
                sca.centre_id,
                sca.application_year,
                sca.status AS assignment_status,
                sca.assigned_by,
                sca.approved_by,
                sca.approved_at,
                sca.remarks AS assignment_remarks,
                sca.created_at AS assignment_created_at,
                sca.updated_at AS assignment_updated_at,
                s.school_code,
                s.school_name,
                s.school_type,
                s.head_name,
                s.district,
                s.status AS school_status
            FROM rtse_school_centre_assignments sca
            INNER JOIN arsp_schools s
                ON s.id = sca.school_id
            WHERE sca.centre_id = ?
        `;

        const params = [centreId];

        if (applicationYear) {
            sql += ` AND sca.application_year = ?`;
            params.push(applicationYear);
        }

        sql += `
            ORDER BY
                sca.application_year DESC,
                s.school_name ASC
        `;

        const [rows] = await db.query(sql, params);
        return rows;
    }

    static async getAvailableSchools(applicationYear) {
        const [rows] = await db.query(`
            SELECT
                s.id,
                s.school_code,
                s.school_name,
                s.school_type,
                s.head_name,
                s.mobile,
                s.district,
                s.state,
                s.status
            FROM arsp_schools s
            LEFT JOIN rtse_school_centre_assignments sca
                ON sca.school_id = s.id
                AND sca.application_year = ?
                AND sca.status IN ('Pending', 'Approved', 'Active')
            WHERE s.status = 'Approved'
              AND sca.id IS NULL
            ORDER BY s.school_name ASC
        `, [applicationYear]);

        return rows;
    }

    static async assignSchool(data) {
        const [result] = await db.query(`
            INSERT INTO rtse_school_centre_assignments (
                school_id,
                centre_id,
                application_year,
                status,
                assigned_by,
                remarks
            )
            VALUES (?, ?, ?, 'Pending', ?, ?)
        `, [
            data.school_id,
            data.centre_id,
            data.application_year,
            data.assigned_by || null,
            data.remarks || null
        ]);

        return result.insertId;
    }


    static async updateAssignmentStatus(
        assignmentId,
        status,
        adminId = null,
        remarks = null
    ) {
        const allowed = [
            "Pending",
            "Approved",
            "Rejected",
            "Active",
            "Inactive"
        ];

        if (!allowed.includes(status)) {
            throw new Error("Invalid assignment status.");
        }

        if (status === "Approved" || status === "Active") {
            const [result] = await db.query(`
                UPDATE rtse_school_centre_assignments
                SET
                    status = ?,
                    approved_by = ?,
                    approved_at = NOW(),
                    remarks = COALESCE(?, remarks)
                WHERE id = ?
            `, [
                status,
                adminId,
                remarks || null,
                assignmentId
            ]);

            return result.affectedRows > 0;
        }

        const [result] = await db.query(`
            UPDATE rtse_school_centre_assignments
            SET
                status = ?,
                remarks = COALESCE(?, remarks)
            WHERE id = ?
        `, [
            status,
            remarks || null,
            assignmentId
        ]);

        return result.affectedRows > 0;
    }

    // =====================================
    // Get Centre Assignment For Specific Centre
    // =====================================
    static async getCentreAssignment(centreId, assignmentId) {
        const [rows] = await db.query(`
            SELECT
                sca.id AS assignment_id,
                sca.school_id,
                sca.centre_id,
                sca.application_year,
                sca.status AS assignment_status,
                sca.assigned_by,
                sca.approved_by,
                sca.approved_at,
                sca.remarks AS assignment_remarks,
                sca.created_at AS assignment_created_at,
                sca.updated_at AS assignment_updated_at,

                s.school_code,
                s.school_name,
                s.school_type,
                s.head_name,
                s.mobile,
                s.email,
                s.address,
                s.village,
                s.post_office,
                s.district,
                s.state,
                s.pincode,
                s.status AS school_status,

                c.centre_code,
                c.centre_name,
                c.status AS centre_status

            FROM rtse_school_centre_assignments sca

            INNER JOIN arsp_schools s
                ON s.id = sca.school_id

            INNER JOIN rtse_centres c
                ON c.id = sca.centre_id

            WHERE sca.id = ?
              AND sca.centre_id = ?

            LIMIT 1
        `, [assignmentId, centreId]);

        return rows[0] || null;
    }

    // =====================================
    // Centre Portal: Approve Assignment
    // =====================================
    static async approveCentreAssignment(
        centreId,
        assignmentId,
        centreAccountId = null
    ) {
        const assignment =
            await this.getCentreAssignment(
                centreId,
                assignmentId
            );

        if (!assignment) {
            throw new Error(
                "Assignment not found for this Centre."
            );
        }

        if (assignment.assignment_status !== "Pending") {
            throw new Error(
                `This assignment is already ${assignment.assignment_status}.`
            );
        }

        const [result] = await db.query(`
            UPDATE rtse_school_centre_assignments
            SET
                status = 'Approved',
                approved_by = ?,
                approved_at = NOW(),
                remarks = COALESCE(
                    ?,
                    remarks
                )
            WHERE id = ?
              AND centre_id = ?
              AND status = 'Pending'
        `, [
            centreAccountId,
            "School examination centre assignment approved by Centre.",
            assignmentId,
            centreId
        ]);

        return result.affectedRows > 0;
    }

    // =====================================
    // Centre Portal: Reject Assignment
    // =====================================
    static async rejectCentreAssignment(
        centreId,
        assignmentId,
        centreAccountId = null,
        remarks = null
    ) {
        const assignment =
            await this.getCentreAssignment(
                centreId,
                assignmentId
            );

        if (!assignment) {
            throw new Error(
                "Assignment not found for this Centre."
            );
        }

        if (assignment.assignment_status !== "Pending") {
            throw new Error(
                `This assignment is already ${assignment.assignment_status}.`
            );
        }

        const rejectionRemarks =
            String(remarks || "").trim() ||
            "School examination centre assignment rejected by Centre.";

        const [result] = await db.query(`
            UPDATE rtse_school_centre_assignments
            SET
                status = 'Rejected',
                approved_by = ?,
                approved_at = NOW(),
                remarks = ?
            WHERE id = ?
              AND centre_id = ?
              AND status = 'Pending'
        `, [
            centreAccountId,
            rejectionRemarks,
            assignmentId,
            centreId
        ]);

        return result.affectedRows > 0;
    }

    static async deleteAssignment(assignmentId) {
        const [result] = await db.query(`
            DELETE FROM rtse_school_centre_assignments
            WHERE id = ?
        `, [assignmentId]);

        return result.affectedRows > 0;
    }

    static async getApproved() {
        const [rows] = await db.query(`
            SELECT
                id,
                centre_code,
                centre_name,
                centre_type,
                head_name,
                mobile,
                address,
                village,
                post_office,
                district,
                state,
                pincode,
                capacity
            FROM rtse_centres
            WHERE status = 'Approved'
            ORDER BY centre_name ASC
        `);

        return rows;
    }

    static async create(data) {
        /*
         * Centre numeric DB ID:
         * generated automatically by MySQL AUTO_INCREMENT.
         *
         * Public Centre ID:
         * RTSE53700001, RTSE53700002, ...
         *
         * Public Centre Code:
         * R26001, R26002, ...
         */

        const uniqueToken =
            Date.now().toString() +
            "-" +
            Math.floor(Math.random() * 1000000);

        /*
         * Temporary database placeholders must fit the VARCHAR(20)
         * centre_id column. The final public IDs are generated below.
         */
        const temporaryCentreId = "TMP" + Date.now();
        const temporaryCentreCode = "TMC" + Date.now();

        const [result] = await db.query(`
            INSERT INTO rtse_centres (
                centre_id,
                centre_code,
                centre_name,
                centre_type,
                head_name,
                mobile,
                email,
                address,
                village,
                post_office,
                district,
                state,
                pincode,
                capacity,
                status,
                remarks,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
        `, [
            temporaryCentreId,
            temporaryCentreCode,
            data.centre_name,
            data.centre_type || "School",
            data.head_name || null,
            data.mobile || null,
            data.email || null,
            data.address || null,
            data.village || null,
            data.post_office || null,
            data.district || null,
            data.state || "Assam",
            data.pincode || null,
            Number(data.capacity) || 0,
            data.remarks || null,
            data.created_by || null
        ]);

        const centreDbId = result.insertId;

        const [rows] = await db.query(`
            SELECT COALESCE(
                MAX(
                    CAST(
                        SUBSTRING(centre_id, 9)
                        AS UNSIGNED
                    )
                ),
                0
            ) AS last_number
            FROM rtse_centres
            WHERE centre_id LIKE 'RTSE537%'
              AND centre_id NOT LIKE 'TMP%'
        `);

        const lastNumber = Number(rows[0]?.last_number || 0);
        const nextNumber = lastNumber + 1;

        const centreId =
            "RTSE537" +
            String(nextNumber).padStart(5, "0");

        const centreCode =
            "R26" +
            String(nextNumber).padStart(3, "0");

        await db.query(`
            UPDATE rtse_centres
            SET
                centre_id = ?,
                centre_code = ?
            WHERE id = ?
        `, [
            centreId,
            centreCode,
            centreDbId
        ]);

        return {
            id: centreDbId,
            centre_id: centreId,
            centre_code: centreCode
        };
    }

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE rtse_centres
            SET
                centre_code = ?,
                centre_name = ?,
                centre_type = ?,
                head_name = ?,
                mobile = ?,
                email = ?,
                address = ?,
                village = ?,
                post_office = ?,
                district = ?,
                state = ?,
                pincode = ?,
                capacity = ?,
                remarks = ?
            WHERE id = ?
        `, [
            data.centre_code,
            data.centre_name,
            data.centre_type || "School",
            data.head_name || null,
            data.mobile || null,
            data.email || null,
            data.address || null,
            data.village || null,
            data.post_office || null,
            data.district || null,
            data.state || "Assam",
            data.pincode || null,
            Number(data.capacity) || 0,
            data.remarks || null,
            id
        ]);

        return result.affectedRows > 0;
    }

    static async updateStatus(id, status, adminId = null, remarks = null) {
        const allowed = [
            "Pending",
            "Approved",
            "Rejected",
            "Inactive",
            "Suspended"
        ];

        if (!allowed.includes(status)) {
            throw new Error("Invalid centre status.");
        }

        if (status === "Approved") {
            const [result] = await db.query(`
                UPDATE rtse_centres
                SET
                    status = 'Approved',
                    approved_by = ?,
                    approved_at = NOW(),
                    remarks = COALESCE(?, remarks)
                WHERE id = ?
            `, [adminId, remarks || null, id]);

            return result.affectedRows > 0;
        }

        const [result] = await db.query(`
            UPDATE rtse_centres
            SET
                status = ?,
                remarks = COALESCE(?, remarks)
            WHERE id = ?
        `, [status, remarks || null, id]);

        return result.affectedRows > 0;
    }

    static async getStats() {
        const [rows] = await db.query(`
            SELECT
                COUNT(*) AS total,
                SUM(status = 'Pending') AS pending,
                SUM(status = 'Approved') AS approved,
                SUM(status = 'Rejected') AS rejected,
                SUM(status = 'Inactive') AS inactive,
                SUM(status = 'Suspended') AS suspended
            FROM rtse_centres
        `);

        return rows[0];
    }
}

module.exports = RtseCentre;
