const db = require("../config/database");

// =============================
// Get All
// =============================
exports.getAll = async () => {

    const [rows] = await db.query(

        `SELECT
            a.*,
            l.name AS legend_name
        FROM honour_heart_awardees a
        LEFT JOIN honour_heart_legends l
        ON a.legend_id=l.id
        ORDER BY a.award_year DESC`

    );

    return rows;

};

// =============================
// Get Previous Awardees
// =============================
exports.getPrevious = async () => {

    const [rows] = await db.query(

        `SELECT
            a.*,
            l.name AS legend_name
        FROM honour_heart_awardees a
        LEFT JOIN honour_heart_legends l
        ON a.legend_id=l.id
        WHERE a.status='Previous'
        AND a.published='Yes'
        ORDER BY a.award_year DESC`

    );

    return rows;

};

// =============================
// Get Upcoming Awardee
// =============================
exports.getUpcoming = async () => {

    const [rows] = await db.query(

        `SELECT
            a.*,
            l.name AS legend_name
        FROM honour_heart_awardees a
        LEFT JOIN honour_heart_legends l
        ON a.legend_id=l.id
        WHERE a.status='Upcoming'
        AND a.published='Yes'
        LIMIT 1`

    );

    return rows[0];

};

// =============================
// Get Popup
// =============================
exports.getPopup = async () => {

    const [rows] = await db.query(

        `SELECT
            a.*,
            l.name AS legend_name
        FROM honour_heart_awardees a
        LEFT JOIN honour_heart_legends l
        ON a.legend_id=l.id
        WHERE a.status='Upcoming'
        AND a.popup='Yes'
        AND a.published='Yes'
        LIMIT 1`

    );

    return rows[0];

};

// =============================
// Get By ID
// =============================
exports.getById = async (id) => {

    const [rows] = await db.query(

        `SELECT *
        FROM honour_heart_awardees
        WHERE id=?`,

        [id]

    );

    return rows[0];

};

// =============================
// Create
// =============================
exports.create = async (data) => {

    const [result] = await db.query(

`INSERT INTO honour_heart_awardees
(
award_year,
photo,
name,
designation,
state,
country,
award_category,
legend_id,
biography,
achievements,
citation,
ceremony_date,
venue,
status,
popup,
published
)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,

[
data.award_year,
data.photo,
data.name,
data.designation,
data.state,
data.country,
data.award_category,
data.legend_id,
data.biography,
data.achievements,
data.citation,
data.ceremony_date,
data.venue,
data.status,
data.popup,
data.published
]

    );

    return result;

};

// =============================
// Update
// =============================
exports.update = async (id,data) => {

const [result] = await db.query(

`UPDATE honour_heart_awardees
SET

award_year=?,
photo=?,
name=?,
designation=?,
state=?,
country=?,
award_category=?,
legend_id=?,
biography=?,
achievements=?,
citation=?,
ceremony_date=?,
venue=?,
status=?,
popup=?,
published=?

WHERE id=?`,

[
data.award_year,
data.photo,
data.name,
data.designation,
data.state,
data.country,
data.award_category,
data.legend_id,
data.biography,
data.achievements,
data.citation,
data.ceremony_date,
data.venue,
data.status,
data.popup,
data.published,
id
]

);

return result;

};

// =============================
// Delete
// =============================
exports.delete = async (id) => {

const [result] = await db.query(

`DELETE FROM honour_heart_awardees
WHERE id=?`,

[id]

);

return result;

};
