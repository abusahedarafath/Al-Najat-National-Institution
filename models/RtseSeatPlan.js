const db = require("../config/database");

class RtseSeatPlan {

    // =====================================
    // Generate Seat Plan
    // =====================================

    static async generate(section, roomCapacity, applicationYear){

    const [students] = await db.query(
        `
        SELECT *
        FROM rtse_applications
        WHERE
            archive = 0
            AND application_year = ?
            AND section = ?
            AND status = 'Approved'
            AND roll_no IS NOT NULL
        ORDER BY
            roll_no ASC
        `,
        [
            applicationYear,
            section
        ]
    );

    let roomNo = 1;
    let seatNo = 1;

    for(const student of students){

        if(seatNo > roomCapacity){
            roomNo++;
            seatNo = 1;
        }

        await db.query(
            `
            UPDATE rtse_applications
            SET
                room_no = ?,
                seat_no = ?
            WHERE
                id = ?
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
// Get Room Wise Seat Plan
// =====================================

static async getRoomWise(section, applicationYear){

    const [rooms] = await db.query(
        `
        SELECT
            room_no,
            COUNT(*) total_students
        FROM rtse_applications
        WHERE
            archive = 0
            AND application_year = ?
            AND section = ?
            AND room_no IS NOT NULL
        GROUP BY
            room_no
        ORDER BY
            room_no ASC
        `,
        [
            applicationYear,
            section
        ]
    );

    for(const room of rooms){

        const [students] = await db.query(
            `
            SELECT
                roll_no,
                registration_no,
                full_name,
                school_name,
                seat_no
            FROM rtse_applications
            WHERE
                archive = 0
                AND application_year = ?
                AND section = ?
                AND room_no = ?
            ORDER BY
                seat_no ASC
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
}

module.exports = RtseSeatPlan;

module.exports = RtseSeatPlan;
