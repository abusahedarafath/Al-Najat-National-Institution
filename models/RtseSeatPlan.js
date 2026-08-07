const db = require("../config/database");

class RtseSeatPlan {

    // =====================================
    // Generate Seat Plan
    // =====================================

    static async generate(section, roomCapacity){

        const [students] = await db.query(

            `SELECT *

             FROM rtse_applications

             WHERE

                section=?

             AND

                status='Approved'

             AND

                roll_no IS NOT NULL

             ORDER BY

                roll_no ASC`,

            [

                section

            ]

        );

        let roomNo = 1;

        let seatNo = 1;

        for(const student of students){

            if(seatNo>roomCapacity){

                roomNo++;

                seatNo=1;

            }

            await db.query(

                `UPDATE rtse_applications

                 SET

                    room_no=?,

                    seat_no=?

                 WHERE id=?`,

                [

                    roomNo,

                    seatNo,

                    student.id

                ]

            );

            seatNo++;

        }

        return students.length;

    }



// =====================================
// Get Room Wise Seat Plan
// =====================================

static async getRoomWise(section){

    const [rooms] = await db.query(

        `SELECT

            room_no,

            COUNT(*) total_students

         FROM rtse_applications

         WHERE

            section=?

         AND

            room_no IS NOT NULL

         GROUP BY room_no

         ORDER BY room_no ASC`,

        [

            section

        ]

    );

    for(const room of rooms){

        const [students] = await db.query(

            `SELECT

                roll_no,

                registration_no,

                full_name,

                school_name,

                seat_no

             FROM rtse_applications

             WHERE

                section=?

             AND

                room_no=?

             ORDER BY

                seat_no ASC`,

            [

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
