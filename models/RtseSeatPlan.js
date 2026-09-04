const db = require("../config/database");

class RtseSeatPlan {

    // =====================================
    // Shift -> Room Configuration
    // =====================================

    static async getShifts(applicationYear) {
        const [shifts] = await db.query(
            `
            SELECT
                s.id,
                s.shift_no,
                s.shift_name,
                s.is_active,
                s.layout,
                s.created_at,
                s.updated_at,
                COUNT(r.id) AS room_count
            FROM rtse_seat_plan_shifts s
            LEFT JOIN rtse_seat_plan_rooms r
                ON r.shift_id = s.id
                AND r.application_year = ?
            GROUP BY
                s.id,
                s.shift_no,
                s.shift_name,
                s.is_active,
                s.layout,
                s.created_at,
                s.updated_at
            ORDER BY s.shift_no ASC
            `,
            [applicationYear]
        );

        for (const shift of shifts) {
            const [rooms] = await db.query(
                `
                SELECT
                    r.id,
                    r.shift_id,
                    r.application_year,
                    r.room_no,
                    r.is_active,
                    r.created_at,
                    r.updated_at
                FROM rtse_seat_plan_rooms r
                WHERE r.shift_id = ?
                  AND r.application_year = ?
                ORDER BY r.room_no ASC
                `,
                [shift.id, applicationYear]
            );

            shift.rooms = rooms;
        }

        return shifts;
    }

    static async addShift(applicationYear, shiftName) {
        const [nextRows] = await db.query(
            `
            SELECT COALESCE(MAX(shift_no), 0) + 1 AS next_shift_no
            FROM rtse_seat_plan_shifts
            `
        );

        const shiftNo = Number(nextRows[0]?.next_shift_no || 1);
        const name = shiftName || `Shift ${shiftNo}`;

        const [result] = await db.query(
            `
            INSERT INTO rtse_seat_plan_shifts
            (
                shift_no,
                shift_name,
                is_active,
                layout
            )
            VALUES (?, ?, 1, 'TWO_SIDE')
            `,
            [shiftNo, name]
        );

        return result.insertId;
    }

    static async updateShift(
        shiftId,
        applicationYear,
        shiftName
    ) {
        const [result] = await db.query(
            `
            UPDATE rtse_seat_plan_shifts s
            SET s.shift_name = ?
            WHERE s.id = ?
            `,
            [shiftName, shiftId]
        );

        return result.affectedRows;
    }

    static async removeShift(
        shiftId,
        applicationYear
    ) {
        const [result] = await db.query(
            `
            DELETE s
            FROM rtse_seat_plan_shifts s
            WHERE s.id = ?
            `,
            [shiftId]
        );

        return result.affectedRows;
    }

    static async toggleShift(
        shiftId,
        applicationYear
    ) {
        const [result] = await db.query(
            `
            UPDATE rtse_seat_plan_shifts s
            SET s.is_active =
                IF(s.is_active = 1, 0, 1)
            WHERE s.id = ?
            `,
            [shiftId]
        );

        return result.affectedRows;
    }

    // =====================================
    // Rooms belong to a Shift
    // =====================================

    static async addRoom(
        shiftId,
        applicationYear,
        roomNo
    ) {
        const [validShift] = await db.query(
            `
            SELECT id
            FROM rtse_seat_plan_shifts
            WHERE id = ?
            LIMIT 1
            `,
            [shiftId]
        );

        if (!validShift.length) {
            return 0;
        }

        const [result] = await db.query(
            `
            INSERT INTO rtse_seat_plan_rooms
            (
                shift_id,
                application_year,
                room_no,
                is_active
            )
            VALUES (?, ?, ?, 1)
            `,
            [
                shiftId,
                applicationYear,
                roomNo
            ]
        );

        return result.insertId;
    }

    static async updateRoom(
        roomId,
        shiftId,
        applicationYear,
        roomNo
    ) {
        const [result] = await db.query(
            `
            UPDATE rtse_seat_plan_rooms r
            SET r.room_no = ?
            WHERE r.id = ?
              AND r.shift_id = ?
              AND r.application_year = ?
            `,
            [
                roomNo,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        return result.affectedRows;
    }

    static async removeRoom(
        roomId,
        shiftId,
        applicationYear
    ) {
        const [result] = await db.query(
            `
            DELETE FROM rtse_seat_plan_rooms
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            `,
            [
                roomId,
                shiftId,
                applicationYear
            ]
        );

        return result.affectedRows;
    }

    static async toggleRoom(
        roomId,
        shiftId,
        applicationYear
    ) {
        const [result] = await db.query(
            `
            UPDATE rtse_seat_plan_rooms
            SET is_active =
                IF(is_active = 1, 0, 1)
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            `,
            [
                roomId,
                shiftId,
                applicationYear
            ]
        );

        return result.affectedRows;
    }

    // =====================================
    // Seat Designer
    // =====================================

    static async getSeatDesigner(
        shiftId,
        roomId,
        applicationYear
    ) {
        const [rows] = await db.query(
            `
            SELECT
                s.id,
                s.shift_no,
                s.shift_name,
                s.is_active AS shift_is_active,
                s.layout,
                r.id AS room_id,
                r.room_no,
                r.is_active AS room_is_active,
                r.seat_system,
                r.left_gender_lock,
                r.right_gender_lock,
                r.left_section_lock,
                r.right_section_lock
            FROM rtse_seat_plan_shifts s
            INNER JOIN rtse_seat_plan_rooms r
                ON r.shift_id = s.id
            WHERE s.id = ?
              AND r.id = ?
              AND r.shift_id = ?
              AND r.application_year = ?
            LIMIT 1
            `,
            [
                shiftId,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        if (!rows.length) {
            return null;
        }

        const shift = rows[0];

        const [seats] = await db.query(
            `
            SELECT
                id,
                shift_id,
                row_no,
                seat_no,
                position,
                section,
                gender,
                is_active,
                is_locked
            FROM rtse_seat_plan_seats
            WHERE shift_id = ?
              AND room_id = ?
            ORDER BY row_no ASC, seat_no ASC
            `,
            [shiftId, roomId]
        );

        shift.seats = seats;

        return shift;
    }

    static async setSeatLayout(
        shiftId,
        roomId,
        applicationYear,
        layout,
        rowCount,
        seatsPerSide = 4
    ) {
        if (!["TWO_SIDE", "SINGLE_LINE"].includes(layout)) {
            throw new Error("Invalid seat layout.");
        }

        rowCount = Number(rowCount);
        seatsPerSide = Number(seatsPerSide);

        if (
            !Number.isInteger(rowCount) ||
            rowCount < 1 ||
            rowCount > 200
        ) {
            throw new Error("Invalid row count.");
        }

        if (
            layout === "TWO_SIDE" &&
            (
                !Number.isInteger(seatsPerSide) ||
                seatsPerSide < 1 ||
                seatsPerSide > 20
            )
        ) {
            throw new Error("Invalid seats per side.");
        }

        const [valid] = await db.query(
            `
            SELECT s.id
            FROM rtse_seat_plan_shifts s
            INNER JOIN rtse_seat_plan_rooms r
                ON r.shift_id = s.id
            WHERE s.id = ?
              AND r.id = ?
              AND r.shift_id = ?
              AND r.application_year = ?
            LIMIT 1
            `,
            [
                shiftId,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        if (!valid.length) {
            throw new Error("Shift or room not found.");
        }

        await db.query(
            `
            UPDATE rtse_seat_plan_shifts
            SET layout = ?
            WHERE id = ?
            `,
            [
                layout,
                shiftId
            ]
        );

        await db.query(
            `
            DELETE FROM rtse_seat_plan_seats
            WHERE shift_id = ?
              AND room_id = ?
            `,
            [shiftId, roomId]
        );

        const values = [];
        let seatNo = 1;

        for (let row = 1; row <= rowCount; row++) {
            if (layout === "TWO_SIDE") {
                for (let i = 0; i < seatsPerSide; i++) {
                    values.push([
                        shiftId,
                        roomId,
                        row,
                        seatNo++,
                        "LEFT",
                        null,
                        "Any",
                        1
                    ]);
                }

                for (let i = 0; i < seatsPerSide; i++) {
                    values.push([
                        shiftId,
                        roomId,
                        row,
                        seatNo++,
                        "RIGHT",
                        null,
                        "Any",
                        1
                    ]);
                }
            } else {
                for (let i = 0; i < seatsPerSide; i++) {
                    values.push([
                        shiftId,
                        roomId,
                        row,
                        seatNo++,
                        "SINGLE",
                        null,
                        "Any",
                        1
                    ]);
                }
            }
        }

        if (values.length) {
            await db.query(
                `
                INSERT INTO rtse_seat_plan_seats
                (
                    shift_id,
                    room_id,
                    row_no,
                    seat_no,
                    position,
                    section,
                    gender,
                    is_active
                )
                VALUES ?
                `,
                [values]
            );
        }

        return values.length;
    }

    static async updateSeat(
        seatId,
        shiftId,
        roomId,
        applicationYear,
        section,
        gender
    ) {
        section = section || null;

        if (
            section !== null &&
            !["A", "B", "C", "D", "E"].includes(section)
        ) {
            throw new Error("Invalid section.");
        }

        if (!["Male", "Female", "Any"].includes(gender)) {
            throw new Error("Invalid gender rule.");
        }

        // Validate the seat and determine whether it is editable
        // under the room's current seat system.
        const [seatRows] = await db.query(
            `
            SELECT
                sp.id,
                sp.row_no,
                sp.seat_no,
                sp.position,
                r.seat_system
            FROM rtse_seat_plan_seats sp
            INNER JOIN rtse_seat_plan_rooms r
                ON r.id = sp.room_id
               AND r.shift_id = sp.shift_id
            WHERE sp.id = ?
              AND sp.shift_id = ?
              AND sp.room_id = ?
              AND r.id = ?
              AND r.shift_id = ?
              AND r.application_year = ?
            LIMIT 1
            `,
            [
                seatId,
                shiftId,
                roomId,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        if (!seatRows.length) {
            throw new Error("Seat not found.");
        }

        const seat = seatRows[0];

        if (seat.seat_system === "CORNER_TO_CORNER") {
            const [rowSeats] = await db.query(
                `
                SELECT seat_no
                FROM rtse_seat_plan_seats
                WHERE shift_id = ?
                  AND room_id = ?
                  AND row_no = ?
                  AND position = ?
                  AND is_active = 1
                ORDER BY seat_no ASC
                `,
                [
                    shiftId,
                    roomId,
                    seat.row_no,
                    seat.position
                ]
            );

            const seatNumbers = rowSeats.map(row => Number(row.seat_no));

            if (
                seatNumbers.length > 2 &&
                Number(seat.seat_no) !== seatNumbers[0] &&
                Number(seat.seat_no) !== seatNumbers[seatNumbers.length - 1]
            ) {
                throw new Error(
                    "This seat is not editable in Corner-to-Corner mode."
                );
            }
        }

        // is_active is deliberately NOT changed here.
        // The individual Active checkbox is no longer part of the UI.
        const [result] = await db.query(
            `
            UPDATE rtse_seat_plan_seats sp
            INNER JOIN rtse_seat_plan_shifts s
                ON s.id = sp.shift_id
            INNER JOIN rtse_seat_plan_rooms r
                ON r.id = sp.room_id
               AND r.shift_id = sp.shift_id
            SET
                sp.section = ?,
                sp.gender = ?
            WHERE sp.id = ?
              AND sp.shift_id = ?
              AND sp.room_id = ?
              AND r.id = ?
              AND r.shift_id = ?
              AND r.application_year = ?
            `,
            [
                section,
                gender,
                seatId,
                shiftId,
                roomId,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        return result.affectedRows;
    }

    // =====================================
    // Room Seat System
    // =====================================

    static async getRoomSeatSystem(
        shiftId,
        roomId,
        applicationYear
    ) {
        const [rows] = await db.query(
            `
            SELECT seat_system
            FROM rtse_seat_plan_rooms
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            LIMIT 1
            `,
            [
                roomId,
                shiftId,
                applicationYear
            ]
        );

        return rows[0]?.seat_system || "FULL";
    }

    static async updateRoomSeatSystem(
        shiftId,
        roomId,
        applicationYear,
        seatSystem
    ) {
        if (!["FULL", "CORNER_TO_CORNER"].includes(seatSystem)) {
            throw new Error("Invalid seat system.");
        }

        const [result] = await db.query(
            `
            UPDATE rtse_seat_plan_rooms
            SET seat_system = ?
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            `,
            [
                seatSystem,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        if (!result.affectedRows) {
            throw new Error("Room not found.");
        }

        return true;
    }

    // =====================================
    // Bounded Gender + Section Allocation
    // =====================================

    static async allocateGenderSectionToSide(
        shiftId,
        roomId,
        applicationYear,
        side,
        gender,
        section
    ) {
        const normalizedShiftId = Number(shiftId);
        const normalizedRoomId = Number(roomId);
        const normalizedYear = Number(applicationYear);
        const normalizedSide = String(side || "").trim().toUpperCase();
        const normalizedGender = String(gender || "").trim();
        const normalizedSection = String(section || "").trim().toUpperCase();

        if (!Number.isInteger(normalizedShiftId) || normalizedShiftId < 1) {
            throw new Error("Invalid RTSE shift.");
        }

        if (!Number.isInteger(normalizedRoomId) || normalizedRoomId < 1) {
            throw new Error("Invalid RTSE room.");
        }

        if (!normalizedYear) {
            throw new Error("Invalid RTSE application year.");
        }

        if (!["LEFT", "RIGHT"].includes(normalizedSide)) {
            throw new Error("Invalid room side.");
        }

        if (!["Male", "Female"].includes(normalizedGender)) {
            throw new Error("A valid gender is required.");
        }

        if (!["A", "B", "C", "D", "E"].includes(normalizedSection)) {
            throw new Error("A valid section is required.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [rooms] = await connection.query(
                `
                    SELECT
                        id,
                        room_no,
                        seat_system
                    FROM rtse_seat_plan_rooms
                    WHERE id = ?
                      AND shift_id = ?
                      AND application_year = ?
                      AND is_active = 1
                    LIMIT 1
                `,
                [
                    normalizedRoomId,
                    normalizedShiftId,
                    normalizedYear
                ]
            );

            if (!rooms.length) {
                throw new Error("Active room not found.");
            }

            const room = rooms[0];

            /*
             * Count only approved students who are still unallocated.
             * Gender + Section is the exact lock combination.
             */
            const [students] = await connection.query(
                `
                    SELECT
                        id,
                        registration_no,
                        full_name,
                        gender,
                        roll_no,
                        roll_number
                    FROM rtse_applications
                    WHERE archive = 0
                      AND status = 'Approved'
                      AND application_year = ?
                      AND section = ?
                      AND gender = ?
                      AND roll_no IS NOT NULL
                      AND seat_id IS NULL
                      AND (
                          shift_id IS NULL
                          AND room_id IS NULL
                      )
                    ORDER BY
                        roll_number ASC,
                        roll_no ASC,
                        registration_no ASC
                `,
                [
                    normalizedYear,
                    normalizedSection,
                    normalizedGender,
                ]
            );

            /*
             * Find only currently unused seats on this side.
             *
             * Existing configured seats are deliberately excluded so a
             * second lock never overwrites the first lock.
             */
            const [seats] = await connection.query(
                `
                    SELECT
                        sp.id AS seat_id,
                        sp.row_no,
                        sp.seat_no,
                        sp.position,
                        sp.section AS seat_section,
                        sp.gender AS seat_gender,
                        r.room_no,
                        r.seat_system
                    FROM rtse_seat_plan_seats sp
                    INNER JOIN rtse_seat_plan_rooms r
                        ON r.id = sp.room_id
                       AND r.shift_id = sp.shift_id
                    WHERE sp.shift_id = ?
                      AND sp.room_id = ?
                      AND sp.position = ?
                      AND sp.is_active = 1
                      AND sp.is_locked = 0
                      AND r.application_year = ?
                      AND r.is_active = 1
                    ORDER BY
                        sp.row_no ASC,
                        sp.seat_no ASC
                `,
                [
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedSide,
                    normalizedYear
                ]
            );

            const validSeats = [];

            for (const seat of seats) {
                /*
                 * Corner-to-Corner:
                 * only first and last physical seat of each row/side.
                 */
                if (room.seat_system === "CORNER_TO_CORNER") {
                    const [rowSeats] = await connection.query(
                        `
                            SELECT seat_no
                            FROM rtse_seat_plan_seats
                            WHERE shift_id = ?
                              AND room_id = ?
                              AND row_no = ?
                              AND position = ?
                              AND is_active = 1
                            ORDER BY seat_no ASC
                        `,
                        [
                            normalizedShiftId,
                            normalizedRoomId,
                            seat.row_no,
                            normalizedSide
                        ]
                    );

                    const numbers = rowSeats.map(
                        row => Number(row.seat_no)
                    );

                    if (
                        numbers.length > 2 &&
                        Number(seat.seat_no) !== numbers[0] &&
                        Number(seat.seat_no) !== numbers[numbers.length - 1]
                    ) {
                        continue;
                    }
                }

                /*
                 * Only completely unconfigured seats are available for
                 * a new Universal Gender + Section Lock.
                 *
                 * This is what allows multiple independent lock groups
                 * to coexist on the same side.
                 */
                const seatGender = String(
                    seat.seat_gender || "Any"
                ).trim();

                const seatSection = seat.seat_section
                    ? String(seat.seat_section).trim().toUpperCase()
                    : "";

                if (seatSection || seatGender !== "Any") {
                    continue;
                }

                validSeats.push(seat);
            }

            const eligibleStudents = students.length;
            const availableSeats = validSeats.length;

            /*
             * The room is capacity bounded.
             */
            const allocationCount = Math.min(
                eligibleStudents,
                availableSeats
            );

            let allocated = 0;

            for (let i = 0; i < allocationCount; i++) {
                const student = students[i];
                const seat = validSeats[i];

                /*
                 * Configure the physical seat for this exact
                 * Gender + Section combination.
                 */
                const [seatUpdate] = await connection.query(
                    `
                        UPDATE rtse_seat_plan_seats
                        SET
                            section = ?,
                            gender = ?,
                                                        is_locked = 1
                        WHERE id = ?
                          AND shift_id = ?
                          AND room_id = ?
                          AND is_active = 1
                          AND is_locked = 0
                          AND section IS NULL
                          AND gender = 'Any'
                    `,
                    [
                        normalizedSection,
                        normalizedGender,
                        seat.seat_id,
                        normalizedShiftId,
                        normalizedRoomId
                    ]
                );

                if (seatUpdate.affectedRows !== 1) {
                    continue;
                }

                /*
                 * Immediately assign the matching approved student.
                 */
                const [applicationUpdate] = await connection.query(
                    `
                        UPDATE rtse_applications
                        SET
                            shift_id = ?,
                            room_id = ?,
                            seat_id = ?,
                            room_no = ?,
                            seat_no = ?
                        WHERE id = ?
                          AND application_year = ?
                          AND archive = 0
                          AND status = 'Approved'
                          AND seat_id IS NULL
                          AND gender = ?
                          AND section = ?
                          AND (
                              shift_id IS NULL
                              AND room_id IS NULL
                          )
                    `,
                    [
                        normalizedShiftId,
                        normalizedRoomId,
                        seat.seat_id,
                        room.room_no,
                        seat.seat_no,
                        student.id,
                        normalizedYear,
                        normalizedGender,
                        normalizedSection,
                    ]
                );

                if (applicationUpdate.affectedRows === 1) {
                    allocated++;
                } else {
                    /*
                     * Never leave an incorrectly configured seat behind.
                     */
                    await connection.query(
                        `
                            UPDATE rtse_seat_plan_seats
                            SET
                                section = NULL,
                                gender = 'Any',
                                       is_locked = 0
                            WHERE id = ?
                              AND shift_id = ?
                              AND room_id = ?
                        `,
                        [
                            seat.seat_id,
                            normalizedShiftId,
                            normalizedRoomId
                        ]
                    );
                }
            }

            /*
             * Recalculate both remaining student count and remaining
             * physical/C2C seat capacity.
             */
            const [remainingStudentRows] = await connection.query(
                `
                    SELECT COUNT(*) AS total
                    FROM rtse_applications
                    WHERE archive = 0
                      AND status = 'Approved'
                      AND application_year = ?
                      AND section = ?
                      AND gender = ?
                      AND roll_no IS NOT NULL
                      AND seat_id IS NULL
                      AND (
                          shift_id IS NULL
                          AND room_id IS NULL
                      )
                `,
                [
                    normalizedYear,
                    normalizedSection,
                    normalizedGender,
                ]
            );

            const [remainingSeatRows] = await connection.query(
                `
                    SELECT
                        sp.id,
                        sp.row_no,
                        sp.seat_no
                    FROM rtse_seat_plan_seats sp
                    WHERE sp.shift_id = ?
                      AND sp.room_id = ?
                      AND sp.position = ?
                      AND sp.is_active = 1
                      AND sp.is_locked = 0
                      AND sp.section IS NULL
                      AND sp.gender = 'Any'
                    ORDER BY
                        sp.row_no ASC,
                        sp.seat_no ASC
                `,
                [
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedSide
                ]
            );

            let remainingSeats = remainingSeatRows;

            if (room.seat_system === "CORNER_TO_CORNER") {
                const grouped = {};

                for (const seat of remainingSeatRows) {
                    const row = Number(seat.row_no);

                    if (!grouped[row]) {
                        grouped[row] = [];
                    }

                    grouped[row].push(seat);
                }

                remainingSeats = [];

                for (const rowSeats of Object.values(grouped)) {
                    rowSeats.sort(
                        (a, b) =>
                            Number(a.seat_no) - Number(b.seat_no)
                    );

                    if (rowSeats.length <= 2) {
                        remainingSeats.push(...rowSeats);
                    } else {
                        remainingSeats.push(rowSeats[0]);
                        remainingSeats.push(
                            rowSeats[rowSeats.length - 1]
                        );
                    }
                }
            }

            await connection.commit();

            return {
                allocated,
                eligibleStudents,
                availableSeats,
                remainingStudents: Number(
                    remainingStudentRows[0]?.total || 0
                ),
                remainingSeats: remainingSeats.length,
                side: normalizedSide,
                gender: normalizedGender,
                section: normalizedSection,
                room
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }


    // =====================================
    // Individual Seat Gender + Section Allocation
    // =====================================

    static async allocateStudentToSpecificSeat(
        seatId,
        shiftId,
        roomId,
        applicationYear,
        section,
        gender
    ) {
        const normalizedSeatId = Number(seatId);
        const normalizedShiftId = Number(shiftId);
        const normalizedRoomId = Number(roomId);
        const normalizedYear = Number(applicationYear);

        const requestedSection = String(section || "")
            .trim()
            .toUpperCase();

        const requestedGender = String(gender || "")
            .trim();

        if (!Number.isInteger(normalizedSeatId) || normalizedSeatId < 1) {
            throw new Error("Invalid seat.");
        }

        if (!Number.isInteger(normalizedShiftId) || normalizedShiftId < 1) {
            throw new Error("Invalid RTSE shift.");
        }

        if (!Number.isInteger(normalizedRoomId) || normalizedRoomId < 1) {
            throw new Error("Invalid RTSE room.");
        }

        if (!normalizedYear) {
            throw new Error("Invalid RTSE application year.");
        }

        if (
            requestedSection &&
            !["A", "B", "C", "D", "E"].includes(requestedSection)
        ) {
            throw new Error("Invalid section.");
        }

        if (!["Male", "Female", "Any", ""].includes(requestedGender)) {
            throw new Error("Invalid gender rule.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [seatRows] = await connection.query(
                `
                SELECT
                    sp.id,
                    sp.row_no,
                    sp.seat_no,
                    sp.position,
                    sp.section AS seat_section,
                    sp.gender AS seat_gender,
                    sp.is_active,
                    sp.is_locked,
                    r.room_no,
                    r.seat_system,
                    r.left_gender_lock,
                    r.right_gender_lock,
                    r.left_section_lock,
                    r.right_section_lock
                FROM rtse_seat_plan_seats sp
                INNER JOIN rtse_seat_plan_rooms r
                    ON r.id = sp.room_id
                   AND r.shift_id = sp.shift_id
                WHERE sp.id = ?
                  AND sp.shift_id = ?
                  AND sp.room_id = ?
                  AND r.application_year = ?
                  AND r.is_active = 1
                LIMIT 1
                FOR UPDATE
                `,
                [
                    normalizedSeatId,
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedYear
                ]
            );

            if (!seatRows.length) {
                throw new Error("Seat not found.");
            }

            const seat = seatRows[0];

            if (!seat.is_active) {
                throw new Error("Seat is not active.");
            }

            if (seat.is_locked) {
                throw new Error("This seat is already locked.");
            }

            /*
             * Corner-to-Corner keeps its existing physical-seat rule:
             * only the first and last physical seat in each row are editable.
             */
            if (seat.seat_system === "CORNER_TO_CORNER") {
                const [rowSeats] = await connection.query(
                    `
                    SELECT seat_no
                    FROM rtse_seat_plan_seats
                    WHERE shift_id = ?
                      AND room_id = ?
                      AND row_no = ?
                      AND position = ?
                      AND is_active = 1
                    ORDER BY seat_no ASC
                    `,
                    [
                        normalizedShiftId,
                        normalizedRoomId,
                        seat.row_no,
                        seat.position
                    ]
                );

                const seatNumbers = rowSeats.map(row => Number(row.seat_no));

                if (
                    seatNumbers.length > 2 &&
                    Number(seat.seat_no) !== seatNumbers[0] &&
                    Number(seat.seat_no) !== seatNumbers[seatNumbers.length - 1]
                ) {
                    throw new Error(
                        "This seat is not editable in Corner-to-Corner mode."
                    );
                }
            }

            const side = String(seat.position || "")
                .trim()
                .toUpperCase();

            const sideGender =
                side === "LEFT"
                    ? String(seat.left_gender_lock || "").trim()
                    : side === "RIGHT"
                        ? String(seat.right_gender_lock || "").trim()
                        : "";

            const sideSection =
                side === "LEFT"
                    ? String(seat.left_section_lock || "").trim().toUpperCase()
                    : side === "RIGHT"
                        ? String(seat.right_section_lock || "").trim().toUpperCase()
                        : "";

            /*
             * A side lock can supply one factor while the individual
             * seat supplies the other. Existing individual configuration
             * is used when the request does not provide that factor.
             */
            const effectiveGender =
                sideGender ||
                (["Male", "Female"].includes(requestedGender)
                    ? requestedGender
                    : String(seat.seat_gender || "Any").trim());

            const effectiveSection =
                sideSection ||
                requestedSection ||
                String(seat.seat_section || "").trim().toUpperCase();

            /*
             * Only a complete Gender + Section combination is an
             * allocation/lock operation. Partial configuration remains
             * a normal seat restriction.
             */
            if (
                !["Male", "Female"].includes(effectiveGender) ||
                !["A", "B", "C", "D", "E"].includes(effectiveSection)
            ) {
                await connection.rollback();

                return {
                    allocated: false,
                    complete: false
                };
            }

            /*
             * Do not overwrite an already complete individual seat
             * configuration belonging to another lock group.
             *
             * A partial seat restriction is allowed to combine with
             * the missing factor supplied by the side lock.
             */
            const seatGender = String(seat.seat_gender || "Any").trim();
            const seatSection = String(seat.seat_section || "")
                .trim()
                .toUpperCase();

            const seatHasCompleteConfiguration =
                ["Male", "Female"].includes(seatGender) &&
                ["A", "B", "C", "D", "E"].includes(seatSection);

            if (seatHasCompleteConfiguration) {
                await connection.rollback();

                return {
                    allocated: false,
                    complete: true,
                    reason: "configured"
                };
            }

            /*
             * Select the next approved, unassigned student for the
             * exact Gender + Section combination.
             */
            const [students] = await connection.query(
                `
                SELECT
                    id,
                    full_name,
                    gender,
                    section,
                    roll_no,
                    roll_number,
                    registration_no
                FROM rtse_applications
                WHERE archive = 0
                  AND status = 'Approved'
                  AND application_year = ?
                  AND section = ?
                  AND gender = ?
                  AND roll_no IS NOT NULL
                  AND seat_id IS NULL
                  AND (
                      shift_id IS NULL
                      AND room_id IS NULL
                  )
                ORDER BY
                    roll_number ASC,
                    roll_no ASC,
                    registration_no ASC
                LIMIT 1
                FOR UPDATE
                `,
                [
                    normalizedYear,
                    effectiveSection,
                    effectiveGender,
                ]
            );

            if (!students.length) {
                await connection.rollback();

                return {
                    allocated: false,
                    complete: true,
                    reason: "no_student",
                    gender: effectiveGender,
                    section: effectiveSection
                };
            }

            const student = students[0];

            /*
             * Lock this exact physical seat first.
             */
            const [seatUpdate] = await connection.query(
                `
                UPDATE rtse_seat_plan_seats
                SET
                    section = ?,
                    gender = ?,
                    is_locked = 1
                WHERE id = ?
                  AND shift_id = ?
                  AND room_id = ?
                  AND is_active = 1
                  AND is_locked = 0
                  AND section IS NULL
                  AND gender = 'Any'
                `,
                [
                    effectiveSection,
                    effectiveGender,
                    normalizedSeatId,
                    normalizedShiftId,
                    normalizedRoomId
                ]
            );

            if (seatUpdate.affectedRows !== 1) {
                throw new Error("Unable to lock the selected seat.");
            }

            /*
             * Assign exactly one student to exactly this seat.
             */
            const [applicationUpdate] = await connection.query(
                `
                UPDATE rtse_applications
                SET
                    shift_id = ?,
                    room_id = ?,
                    seat_id = ?,
                    room_no = ?,
                    seat_no = ?
                WHERE id = ?
                  AND application_year = ?
                  AND archive = 0
                  AND status = 'Approved'
                  AND seat_id IS NULL
                  AND gender = ?
                  AND section = ?
                  AND (
                      shift_id IS NULL
                      AND room_id IS NULL
                  )
                `,
                [
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedSeatId,
                    seat.room_no,
                    seat.seat_no,
                    student.id,
                    normalizedYear,
                    effectiveGender,
                    effectiveSection,
                ]
            );

            if (applicationUpdate.affectedRows !== 1) {
                await connection.query(
                    `
                    UPDATE rtse_seat_plan_seats
                    SET
                        section = NULL,
                        gender = 'Any',
                        is_locked = 0
                    WHERE id = ?
                      AND shift_id = ?
                      AND room_id = ?
                    `,
                    [
                        normalizedSeatId,
                        normalizedShiftId,
                        normalizedRoomId
                    ]
                );

                throw new Error(
                    "The selected student could not be assigned to the seat."
                );
            }

            await connection.commit();

            return {
                allocated: true,
                complete: true,
                applicationId: Number(student.id),
                student,
                seatId: normalizedSeatId,
                gender: effectiveGender,
                section: effectiveSection,
                roomNo: seat.room_no,
                seatNo: seat.seat_no
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =====================================
    // Seat Plan Unlock / Assignment Reset
    // =====================================

    static async unlockRoomSideAndResetAssignments(
        shiftId,
        roomId,
        applicationYear,
        side
    ) {
        const normalizedShiftId = Number(shiftId);
        const normalizedRoomId = Number(roomId);
        const normalizedYear = Number(applicationYear);
        const normalizedSide = String(side || "").trim().toUpperCase();

        if (!Number.isInteger(normalizedShiftId) || normalizedShiftId < 1) {
            throw new Error("Invalid RTSE shift.");
        }

        if (!Number.isInteger(normalizedRoomId) || normalizedRoomId < 1) {
            throw new Error("Invalid RTSE room.");
        }

        if (!normalizedYear) {
            throw new Error("Invalid RTSE application year.");
        }

        if (!["LEFT", "RIGHT"].includes(normalizedSide)) {
            throw new Error("Invalid room side.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [rooms] = await connection.query(
                `
                SELECT id
                FROM rtse_seat_plan_rooms
                WHERE id = ?
                  AND shift_id = ?
                  AND application_year = ?
                LIMIT 1
                `,
                [
                    normalizedRoomId,
                    normalizedShiftId,
                    normalizedYear
                ]
            );

            if (!rooms.length) {
                throw new Error("Room not found.");
            }

            /*
             * Only release applications physically assigned to this
             * exact room and side. Other rooms remain untouched.
             */
            const [assigned] = await connection.query(
                `
                SELECT
                    a.id AS application_id,
                    a.seat_id
                FROM rtse_applications a
                INNER JOIN rtse_seat_plan_seats sp
                    ON sp.id = a.seat_id
                WHERE a.archive = 0
                  AND a.status = 'Approved'
                  AND a.application_year = ?
                  AND a.shift_id = ?
                  AND a.room_id = ?
                  AND a.seat_id IS NOT NULL
                  AND sp.shift_id = ?
                  AND sp.room_id = ?
                  AND sp.position = ?
                FOR UPDATE
                `,
                [
                    normalizedYear,
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedSide
                ]
            );

            const seatIds = assigned
                .map(row => Number(row.seat_id))
                .filter(Number.isInteger);

            if (assigned.length) {
                const applicationIds = assigned
                    .map(row => Number(row.application_id))
                    .filter(Number.isInteger);

                const placeholders = applicationIds.map(() => "?").join(",");

                /*
                 * These fields are populated by the seat-plan allocator.
                 * Releasing the assignment restores the application to
                 * the unassigned state so it can be allocated again.
                 */
                await connection.query(
                    `
                    UPDATE rtse_applications
                    SET
                        shift_id = NULL,
                        room_id = NULL,
                        seat_id = NULL,
                        room_no = NULL,
                        seat_no = NULL
                    WHERE id IN (${placeholders})
                      AND application_year = ?
                    `,
                    [
                        ...applicationIds,
                        normalizedYear
                    ]
                );
            }

            /*
             * Reset every locked physical seat on this exact side.
             *
             * Applications assigned through the seat-plan workflow were
             * released above. Clearing every locked seat here also removes
             * any stale/orphan physical lock state.
             */
            await connection.query(
                `
                UPDATE rtse_seat_plan_seats
                SET
                    section = NULL,
                    gender = 'Any',
                    is_locked = 0
                WHERE shift_id = ?
                  AND room_id = ?
                  AND position = ?
                  AND is_locked = 1
                `,
                [
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedSide
                ]
            );

            const genderColumn =
                normalizedSide === "LEFT"
                    ? "left_gender_lock"
                    : "right_gender_lock";

            const sectionColumn =
                normalizedSide === "LEFT"
                    ? "left_section_lock"
                    : "right_section_lock";

            await connection.query(
                `
                UPDATE rtse_seat_plan_rooms
                SET
                    ${genderColumn} = NULL,
                    ${sectionColumn} = NULL
                WHERE id = ?
                  AND shift_id = ?
                  AND application_year = ?
                `,
                [
                    normalizedRoomId,
                    normalizedShiftId,
                    normalizedYear
                ]
            );

            await connection.commit();

            return {
                released: assigned.length,
                side: normalizedSide
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async unlockSeatAndResetAssignment(
        seatId,
        shiftId,
        roomId,
        applicationYear
    ) {
        const normalizedSeatId = Number(seatId);
        const normalizedShiftId = Number(shiftId);
        const normalizedRoomId = Number(roomId);
        const normalizedYear = Number(applicationYear);

        if (!Number.isInteger(normalizedSeatId) || normalizedSeatId < 1) {
            throw new Error("Invalid seat.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [seats] = await connection.query(
                `
                SELECT
                    sp.id,
                    sp.is_locked
                FROM rtse_seat_plan_seats sp
                INNER JOIN rtse_seat_plan_rooms r
                    ON r.id = sp.room_id
                   AND r.shift_id = sp.shift_id
                WHERE sp.id = ?
                  AND sp.shift_id = ?
                  AND sp.room_id = ?
                  AND r.application_year = ?
                LIMIT 1
                `,
                [
                    normalizedSeatId,
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedYear
                ]
            );

            if (!seats.length) {
                throw new Error("Seat not found.");
            }

            const [assigned] = await connection.query(
                `
                SELECT id
                FROM rtse_applications
                WHERE archive = 0
                  AND status = 'Approved'
                  AND application_year = ?
                  AND shift_id = ?
                  AND room_id = ?
                  AND seat_id = ?
                LIMIT 1
                FOR UPDATE
                `,
                [
                    normalizedYear,
                    normalizedShiftId,
                    normalizedRoomId,
                    normalizedSeatId
                ]
            );

            if (assigned.length) {
                await connection.query(
                    `
                    UPDATE rtse_applications
                    SET
                        shift_id = NULL,
                        room_id = NULL,
                        seat_id = NULL,
                        room_no = NULL,
                        seat_no = NULL
                    WHERE id = ?
                      AND application_year = ?
                    `,
                    [
                        assigned[0].id,
                        normalizedYear
                    ]
                );
            }

            await connection.query(
                `
                UPDATE rtse_seat_plan_seats
                SET
                    section = NULL,
                    gender = 'Any',
                    is_locked = 0
                WHERE id = ?
                  AND shift_id = ?
                  AND room_id = ?
                `,
                [
                    normalizedSeatId,
                    normalizedShiftId,
                    normalizedRoomId
                ]
            );

            await connection.commit();

            return {
                released: assigned.length ? 1 : 0,
                seatId: normalizedSeatId
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =====================================
    // Room Side Locks
    // =====================================

    static async updateRoomSideLocks(
        shiftId,
        roomId,
        applicationYear,
        side,
        genderLock,
        sectionLock
    ) {
        const normalizedSide =
            String(side || "").trim().toUpperCase();

        if (!["LEFT", "RIGHT"].includes(normalizedSide)) {
            throw new Error("Invalid room side.");
        }

        if (
            genderLock !== null &&
            !["Male", "Female"].includes(genderLock)
        ) {
            throw new Error("Invalid gender lock.");
        }

        if (
            sectionLock !== null &&
            !["A", "B", "C", "D", "E"].includes(sectionLock)
        ) {
            throw new Error("Invalid section lock.");
        }

        const [rooms] = await db.query(
            `
            SELECT id
            FROM rtse_seat_plan_rooms
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            LIMIT 1
            `,
            [
                roomId,
                shiftId,
                applicationYear
            ]
        );

        if (!rooms.length) {
            throw new Error("Room not found.");
        }

        /*
         * Multiple Gender + Section groups are allowed on the same side.
         *
         * Already occupied/locked seats retain their own Gender + Section
         * values. The side metadata applies only to the current available
         * seat restriction.
         */

        const genderColumn =
            normalizedSide === "LEFT"
                ? "left_gender_lock"
                : "right_gender_lock";

        const sectionColumn =
            normalizedSide === "LEFT"
                ? "left_section_lock"
                : "right_section_lock";

        await db.query(
            `
            UPDATE rtse_seat_plan_rooms
            SET
                ${genderColumn} = ?,
                ${sectionColumn} = ?
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            `,
            [
                genderLock || null,
                sectionLock || null,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        return true;
    }

    static async getRoomSideLocks(
        shiftId,
        roomId,
        applicationYear
    ) {
        const [rows] = await db.query(
            `
            SELECT
                left_gender_lock,
                right_gender_lock,
                left_section_lock,
                right_section_lock
            FROM rtse_seat_plan_rooms
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            LIMIT 1
            `,
            [
                roomId,
                shiftId,
                applicationYear
            ]
        );

        return rows[0] || null;
    }

    static async clearSeats(
        shiftId,
        roomId,
        applicationYear
    ) {
        const [valid] = await db.query(
            `
            SELECT s.id
            FROM rtse_seat_plan_shifts s
            INNER JOIN rtse_seat_plan_rooms r
                ON r.shift_id = s.id
            WHERE s.id = ?
              AND r.id = ?
              AND r.shift_id = ?
              AND r.application_year = ?
            LIMIT 1
            `,
            [
                shiftId,
                roomId,
                shiftId,
                applicationYear
            ]
        );

        if (!valid.length) {
            throw new Error("Shift or room not found.");
        }

        await db.query(
            `
            DELETE FROM rtse_seat_plan_seats
            WHERE shift_id = ?
              AND room_id = ?
            `,
            [shiftId, roomId]
        );

        await db.query(
            `
            UPDATE rtse_seat_plan_shifts
            SET layout = 'TWO_SIDE'
            WHERE id = ?
            `,
            [shiftId]
        );
    }



    static async getAllocationData(applicationYear) {
        const [shifts] = await db.query(
            `
            SELECT
                s.id,
                s.shift_no,
                s.shift_name,
                s.is_active,
                COUNT(DISTINCT r.id) AS room_count,
                COUNT(DISTINCT CASE
                    WHEN r.is_active = 1 AND sp.is_active = 1
                    THEN sp.id
                END) AS active_seat_count
            FROM rtse_seat_plan_shifts s
            LEFT JOIN rtse_seat_plan_rooms r
                ON r.shift_id = s.id
               AND r.application_year = ?
            LEFT JOIN rtse_seat_plan_seats sp
                ON sp.shift_id = s.id
               AND sp.room_id = r.id
            GROUP BY
                s.id,
                s.shift_no,
                s.shift_name,
                s.is_active
            ORDER BY s.shift_no ASC
            `,
            [applicationYear]
        );

        for (const shift of shifts) {
            const [rooms] = await db.query(
                `
                SELECT
                    r.id,
                    r.room_no,
                    r.is_active,
                    COUNT(
                        CASE
                            WHEN sp.is_active = 1 THEN 1
                        END
                    ) AS active_seat_count,
                    COUNT(
                        CASE
                            WHEN sp.is_active = 1
                             AND sp.section IS NOT NULL
                            THEN 1
                        END
                    ) AS configured_seat_count
                FROM rtse_seat_plan_rooms r
                LEFT JOIN rtse_seat_plan_seats sp
                    ON sp.room_id = r.id
                   AND sp.shift_id = r.shift_id
                WHERE r.shift_id = ?
                  AND r.application_year = ?
                GROUP BY
                    r.id,
                    r.room_no,
                    r.is_active
                ORDER BY r.room_no ASC
                `,
                [shift.id, applicationYear]
            );

            shift.rooms = rooms;
        }

        return shifts;
    }

    // =====================================
    // Legacy application seat-plan generator
    // =====================================

    static async generate(
        section,
        roomCapacity,
        applicationYear
    ) {
        const [students] = await db.query(
            `
            SELECT *
            FROM rtse_applications
            WHERE archive = 0
              AND application_year = ?
              AND section = ?
              AND status = 'Approved'
              AND roll_no IS NOT NULL
            ORDER BY roll_no ASC
            `,
            [
                applicationYear,
                section
            ]
        );

        let roomNo = 1;
        let seatNo = 1;

        for (const student of students) {
            if (seatNo > roomCapacity) {
                roomNo++;
                seatNo = 1;
            }

            await db.query(
                `
                UPDATE rtse_applications
                SET
                    room_no = ?,
                    seat_no = ?
                WHERE id = ?
                  AND application_year = ?
                `,
                [
                    roomNo,
                    seatNo,
                    student.id,
                    applicationYear
                ]
            );

            seatNo++;
        }

        return students.length;
    }

    // =====================================
    // Legacy Room Wise Seat Plan
    // =====================================

    static async getRoomWise(
        section,
        applicationYear
    ) {
        const [rooms] = await db.query(
            `
            SELECT
                room_no,
                COUNT(*) AS total_students
            FROM rtse_applications
            WHERE archive = 0
              AND application_year = ?
              AND section = ?
              AND room_no IS NOT NULL
            GROUP BY room_no
            ORDER BY room_no ASC
            `,
            [
                applicationYear,
                section
            ]
        );

        for (const room of rooms) {
            const [students] = await db.query(
                `
                SELECT
                    roll_no,
                    registration_no,
                    full_name,
                    school_name,
                    seat_no
                FROM rtse_applications
                WHERE archive = 0
                  AND application_year = ?
                  AND section = ?
                  AND room_no = ?
                ORDER BY seat_no ASC
                `,
                [
                    applicationYear,
                    section,
                    room.room_no
                ]
            );

            room.students = students;
        }

        return rooms;
    }

    // =====================================
    // Lock allocated room seats
    // =====================================

    static async lockRoomAllocatedSeats(
        shiftId,
        roomId,
        applicationYear
    ) {
        const normalizedShiftId = Number(shiftId);
        const normalizedRoomId = Number(roomId);
        const normalizedYear = Number(applicationYear);

        if (!Number.isInteger(normalizedShiftId) || normalizedShiftId < 1) {
            throw new Error("Invalid RTSE shift.");
        }

        if (!Number.isInteger(normalizedRoomId) || normalizedRoomId < 1) {
            throw new Error("Invalid RTSE room.");
        }

        if (!Number.isInteger(normalizedYear) || normalizedYear < 1) {
            throw new Error("Invalid RTSE application year.");
        }

        const [rooms] = await db.query(
            `
            SELECT
                id,
                room_no,
                seat_system
            FROM rtse_seat_plan_rooms
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
              AND is_active = 1
            LIMIT 1
            `,
            [
                normalizedRoomId,
                normalizedShiftId,
                normalizedYear
            ]
        );

        if (!rooms.length) {
            throw new Error("Active room not found.");
        }

        const [allocated] = await db.query(
            `
            SELECT
                sp.id AS seat_id,
                sp.is_locked,
                a.id AS application_id,
                a.full_name
            FROM rtse_seat_plan_seats sp
            INNER JOIN rtse_applications a
                ON a.seat_id = sp.id
            WHERE sp.shift_id = ?
              AND sp.room_id = ?
              AND a.application_year = ?
              AND a.archive = 0
              AND a.status = 'Approved'
              AND a.shift_id = ?
              AND a.room_id = ?
              AND a.seat_id IS NOT NULL
            ORDER BY sp.row_no ASC, sp.seat_no ASC
            `,
            [
                normalizedShiftId,
                normalizedRoomId,
                normalizedYear,
                normalizedShiftId,
                normalizedRoomId
            ]
        );

        if (!allocated.length) {
            throw new Error(
                "No allocated students found in this room."
            );
        }

        await db.query(
            `
            UPDATE rtse_seat_plan_seats sp
            INNER JOIN rtse_applications a
                ON a.seat_id = sp.id
            SET sp.is_locked = 1
            WHERE sp.shift_id = ?
              AND sp.room_id = ?
              AND a.application_year = ?
              AND a.archive = 0
              AND a.status = 'Approved'
              AND a.shift_id = ?
              AND a.room_id = ?
              AND a.seat_id IS NOT NULL
            `,
            [
                normalizedShiftId,
                normalizedRoomId,
                normalizedYear,
                normalizedShiftId,
                normalizedRoomId
            ]
        );

        return {
            room: rooms[0],
            allocatedCount: allocated.length
        };
    }

}

module.exports = RtseSeatPlan;
