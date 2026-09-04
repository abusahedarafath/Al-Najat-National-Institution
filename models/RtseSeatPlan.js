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
         * Do not allow a new side lock to conflict with
         * students already allocated on that side.
         */
        const [allocatedStudents] = await db.query(
            `
            SELECT
                a.id,
                a.full_name,
                a.gender,
                a.section
            FROM rtse_applications a
            INNER JOIN rtse_seat_plan_seats sp
                ON sp.id = a.seat_id
            WHERE a.archive = 0
              AND a.status = 'Approved'
              AND a.application_year = ?
              AND a.shift_id = ?
              AND a.room_id = ?
              AND sp.position = ?
              AND a.seat_id IS NOT NULL
            `,
            [
                applicationYear,
                shiftId,
                roomId,
                normalizedSide
            ]
        );

        for (const student of allocatedStudents) {
            if (
                genderLock &&
                student.gender !== genderLock
            ) {
                throw new Error(
                    `Cannot lock ${normalizedSide} side for ${genderLock}. ` +
                    `${student.full_name} is already allocated there.`
                );
            }

            if (
                sectionLock &&
                student.section !== sectionLock
            ) {
                throw new Error(
                    `Cannot lock ${normalizedSide} side for Section ${sectionLock}. ` +
                    `${student.full_name} is already allocated there.`
                );
            }
        }

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


    // =====================================
    // Open-Ended Student Seat Allocation
    // =====================================

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

    static async allocateStudents(
        section,
        shiftId,
        applicationYear
    ) {
        const normalizedSection =
            String(section || "").trim().toUpperCase();

        const normalizedShiftId =
            Number(shiftId);

        const normalizedYear =
            Number(applicationYear);

        if (!["A", "B", "C", "D", "E"].includes(normalizedSection)) {
            throw new Error("Invalid RTSE section.");
        }

        if (!Number.isInteger(normalizedShiftId) || normalizedShiftId < 1) {
            throw new Error("Invalid RTSE shift.");
        }

        if (!normalizedYear) {
            throw new Error("Invalid RTSE application year.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [shiftRows] = await connection.query(
                `
                SELECT id, shift_no, shift_name
                FROM rtse_seat_plan_shifts
                WHERE id = ?
                  AND is_active = 1
                LIMIT 1
                `,
                [normalizedShiftId]
            );

            if (!shiftRows.length) {
                throw new Error("Active shift not found.");
            }

            /*
             * Only approved students with generated roll numbers
             * are eligible for allocation.
             *
             * Existing allocations are deliberately excluded so
             * repeated allocation does not reshuffle students.
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
                  AND roll_no IS NOT NULL
                  AND seat_id IS NULL
                  AND (
                        (shift_id IS NULL AND room_id IS NULL)
                        OR (shift_id = ? AND room_id IS NOT NULL)
                  )
                ORDER BY
                    roll_number ASC,
                    roll_no ASC,
                    registration_no ASC
                `,
                [
                    normalizedYear,
                    normalizedSection,
                    normalizedShiftId
                ]
            );

            if (!students.length) {
                await connection.commit();

                return {
                    allocated: 0,
                    skipped: 0,
                    students: 0,
                    message:
                        `No unallocated approved students found for Section ${normalizedSection}.`
                };
            }

            /*
             * A seat is eligible when:
             *
             *   - shift matches
             *   - room is active
             *   - seat is active
             *   - seat section is either NULL or the student's section
             *   - seat gender is Any or matches student's gender
             *
             * Seats are consumed in deterministic room/seat order.
             */
            const [seats] = await connection.query(
                `
                SELECT
                    sp.id AS seat_id,
                    sp.shift_id,
                    sp.room_id,
                    sp.seat_no,
                    sp.section AS seat_section,
                    sp.gender AS seat_gender,
                    sp.position,
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
                WHERE sp.shift_id = ?
                  AND sp.is_active = 1
                  AND sp.is_locked = 0
                  AND r.application_year = ?
                  AND r.is_active = 1
                  AND (
                        sp.section IS NULL
                        OR sp.section = ?
                  )
                  AND (
                        r.seat_system = 'FULL'
                        OR sp.seat_no = (
                            SELECT MIN(sp2.seat_no)
                            FROM rtse_seat_plan_seats sp2
                            WHERE sp2.shift_id = sp.shift_id
                              AND sp2.room_id = sp.room_id
                              AND sp2.row_no = sp.row_no
                              AND sp2.position = sp.position
                              AND sp2.is_active = 1
                        )
                        OR sp.seat_no = (
                            SELECT MAX(sp3.seat_no)
                            FROM rtse_seat_plan_seats sp3
                            WHERE sp3.shift_id = sp.shift_id
                              AND sp3.room_id = sp.room_id
                              AND sp3.row_no = sp.row_no
                              AND sp3.position = sp.position
                              AND sp3.is_active = 1
                        )
                  )
                ORDER BY
                    r.room_no ASC,
                    sp.seat_no ASC
                `,
                [
                    normalizedShiftId,
                    normalizedYear,
                    normalizedSection
                ]
            );

            const availableSeats = seats.filter(seat => {
                return true;
            });

            let allocated = 0;
            const remainingSeats = [...availableSeats];

            for (const student of students) {
                const studentGender =
                    String(student.gender || "").trim();

                const seatIndex = remainingSeats.findIndex(
                    candidate => {
                        const genderRule =
                            String(candidate.seat_gender || "Any");

                        const side =
                            String(candidate.position || "").toUpperCase();

                        const sideGenderLock =
                            side === "LEFT"
                                ? candidate.left_gender_lock
                                : side === "RIGHT"
                                    ? candidate.right_gender_lock
                                    : null;

                        const sideSectionLock =
                            side === "LEFT"
                                ? candidate.left_section_lock
                                : side === "RIGHT"
                                    ? candidate.right_section_lock
                                    : null;

                        return (
                            (genderRule === "Any" ||
                             genderRule === studentGender) &&
                            (!sideGenderLock ||
                             sideGenderLock === studentGender) &&
                            (!sideSectionLock ||
                             sideSectionLock === normalizedSection)
                        );
                    }
                );

                if (seatIndex === -1) {
                    break;
                }

                const selectedSeat =
                    remainingSeats.splice(seatIndex, 1)[0];

                const [result] = await connection.query(
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
                      AND (
                            (shift_id IS NULL AND room_id IS NULL)
                            OR (shift_id = ? AND room_id IS NOT NULL)
                      )
                    `,
                    [
                        normalizedShiftId,
                        selectedSeat.room_id,
                        selectedSeat.seat_id,
                        selectedSeat.room_no,
                        selectedSeat.seat_no,
                        student.id,
                        normalizedYear,
                        normalizedShiftId
                    ]
                );

                if (result.affectedRows === 1) {
                    allocated++;
                }
            }

            await connection.commit();

            return {
                allocated,
                skipped: students.length - allocated,
                students: students.length,
                shift: shiftRows[0]
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async clearStudentAllocations(
        section,
        shiftId,
        applicationYear
    ) {
        const normalizedSection =
            String(section || "").trim().toUpperCase();

        const normalizedShiftId =
            Number(shiftId);

        const normalizedYear =
            Number(applicationYear);

        if (!["A", "B", "C", "D", "E"].includes(normalizedSection)) {
            throw new Error("Invalid RTSE section.");
        }

        if (!Number.isInteger(normalizedShiftId) || normalizedShiftId < 1) {
            throw new Error("Invalid RTSE shift.");
        }

        const [result] = await db.query(
            `
            UPDATE rtse_applications
            SET
                shift_id = NULL,
                room_id = NULL,
                seat_id = NULL,
                room_no = NULL,
                seat_no = NULL
            WHERE archive = 0
              AND status = 'Approved'
              AND application_year = ?
              AND section = ?
              AND shift_id = ?
            `,
            [
                normalizedYear,
                normalizedSection,
                normalizedShiftId
            ]
        );

        return result.affectedRows;
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
