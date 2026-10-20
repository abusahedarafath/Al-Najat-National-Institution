const db = require("../config/database");

class RtseExamSection {
    static normalizeSectionName(value) {
        const name = String(value ?? "").trim().toUpperCase();

        if (!/^[A-Z0-9][A-Z0-9 _-]{0,19}$/.test(name)) {
            throw new Error(
                "Section names must be 1–20 characters using letters, numbers, spaces, hyphens, or underscores."
            );
        }

        return name;
    }

    // Normalize a user-defined class name without restricting it to
    // numeric classes I-XII. Existing numeric mappings remain unchanged.
    static normalizeClassName(value) {
        const name = String(value ?? "").trim();

        if (
            !name ||
            name.length > 50 ||
            !/^[\p{L}\p{N}][\p{L}\p{N} .&()_-]{0,49}$/u.test(name)
        ) {
            throw new Error(
                "Class names must be 1–50 characters and begin with a letter or number."
            );
        }

        return name;
    }

    // Validate named class definitions against the sections configured
    // for the same examination. This does not write to the database.
    static validateClassDefinitions(classDefinitions, sections) {
        if (!Array.isArray(classDefinitions) || classDefinitions.length === 0) {
            throw new Error("At least one class definition is required.");
        }

        if (!Array.isArray(sections) || sections.length === 0) {
            throw new Error("At least one section is required.");
        }

        const sectionNames = new Set(
            sections.map(item => this.normalizeSectionName(item.section_name))
        );
        const classNames = new Set();

        for (const item of classDefinitions) {
            const className = this.normalizeClassName(
                item.class_name ?? item.name
            );
            const nameKey = className.toLocaleLowerCase();

            if (classNames.has(nameKey)) {
                throw new Error("Duplicate class name: " + className);
            }

            const sectionName = this.normalizeSectionName(item.section_name);

            if (!sectionNames.has(sectionName)) {
                throw new Error(
                    "Class mapping refers to an undefined section: " + sectionName
                );
            }

            classNames.add(nameKey);
        }

        return true;
    }

    static validateConfiguration(sections, classMappings) {
        if (!Array.isArray(sections) || sections.length === 0) {
            throw new Error("At least one section is required.");
        }

        if (!Array.isArray(classMappings)) {
            throw new Error("Class mappings must be an array.");
        }

        const names = new Set();
        const ranges = [];

        for (const item of sections) {
            const name = this.normalizeSectionName(item.section_name);
            const start = Number(item.roll_start);
            const end = Number(item.roll_end);

            if (names.has(name)) {
                throw new Error("Duplicate section name: " + name);
            }

            if (
                !Number.isSafeInteger(start) ||
                !Number.isSafeInteger(end) ||
                start < 1 ||
                end < start ||
                end > 2147483647
            ) {
                throw new Error("Invalid inclusive roll range for section " + name + ".");
            }

            names.add(name);
            ranges.push({ name, start, end });
        }

        ranges.sort((a, b) => a.start - b.start);

        for (let i = 1; i < ranges.length; i++) {
            if (ranges[i].start <= ranges[i - 1].end) {
                throw new Error(
                    "Roll ranges overlap between sections " +
                    ranges[i - 1].name + " and " + ranges[i].name + "."
                );
            }
        }

        const mappedClasses = new Set();
        for (const mapping of classMappings) {
            const studentClass = this.normalizeClassName(mapping.student_class);
            const classKey = studentClass.toLocaleLowerCase();
            const sectionName = this.normalizeSectionName(mapping.section_name);

            if (!names.has(sectionName)) {
                throw new Error(
                    "Class mapping refers to an undefined section: " + sectionName
                );
            }
            if (mappedClasses.has(classKey)) {
                throw new Error(
                    "A class cannot be mapped to more than one section."
                );
            }
            mappedClasses.add(classKey);
        }

        return true;
    }

    // Save examination-specific sections and class mappings.
    // Refuse configuration changes after applications are associated
    // with this examination. Existing roll numbers are never rewritten.
    static async saveConfiguration(examSettingId, sections, classMappings, classDefinitions) {
        const id = Number(examSettingId);
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid examination setting ID.");
        }

        this.validateConfiguration(sections, classMappings);

        const seenIds = new Set();
        const normalizedSections = sections.map((item, index) => {
            const rawId = String(item.id ?? item.section_id ?? "").trim();
            let sectionId = null;

            if (rawId) {
                sectionId = Number(rawId);
                if (!Number.isInteger(sectionId) || sectionId <= 0 || seenIds.has(sectionId)) {
                    throw new Error("Invalid or duplicate section ID.");
                }
                seenIds.add(sectionId);
            }

            return {
                id: sectionId,
                section_name: this.normalizeSectionName(item.section_name),
                roll_start: Number(item.roll_start),
                roll_end: Number(item.roll_end),
                sort_order: index + 1
            };
        });

        const normalizedMappings = classMappings.map(item => ({
            student_class: this.normalizeClassName(item.student_class),
            section_name: this.normalizeSectionName(item.section_name)
        })).sort((a, b) =>
            a.student_class.localeCompare(b.student_class, undefined, {
                sensitivity: "base"
            })
        );

        let normalizedClassDefinitions;
        if (classDefinitions !== undefined) {
            if (!Array.isArray(classDefinitions)) {
                throw new Error("Invalid named-class configuration.");
            }

            const sectionNames = new Set(normalizedSections.map(x => x.section_name));
            const seenNames = new Set();
            const seenIds = new Set();

            normalizedClassDefinitions = classDefinitions.map((item, index) => {
                const rawId = String(item.id ?? "").trim();
                const classId = rawId ? Number(rawId) : null;
                const className = this.normalizeClassName(item.class_name);
                const sectionName = this.normalizeSectionName(item.section_name);
                const key = className.toLocaleLowerCase();

                if (classId !== null &&
                    (!Number.isInteger(classId) || classId <= 0 || seenIds.has(classId))) {
                    throw new Error("Invalid or duplicate named-class ID.");
                }
                if (classId !== null) seenIds.add(classId);

                if (seenNames.has(key)) {
                    throw new Error("Named class names must be unique within an examination.");
                }
                seenNames.add(key);

                if (!sectionNames.has(sectionName)) {
                    throw new Error("Named class refers to an undefined section: " + sectionName);
                }

                return {
                    id: classId,
                    class_name: className,
                    section_name: sectionName,
                    sort_order: index + 1
                };
            });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [examRows] = await connection.query(
                "SELECT id FROM rtse_exam_settings WHERE id = ? FOR UPDATE",
                [id]
            );
            if (!examRows.length) throw new Error("Examination not found.");

            const [existing] = await connection.query(
                `SELECT id, section_name, roll_start, roll_end, sort_order
                 FROM rtse_exam_sections
                 WHERE exam_setting_id = ?
                 ORDER BY sort_order, id FOR UPDATE`,
                [id]
            );

            const [mappingRows] = await connection.query(
                `SELECT m.student_class, s.section_name
                 FROM rtse_exam_section_classes m
                 INNER JOIN rtse_exam_sections s
                   ON s.id = m.exam_section_id
                  AND s.exam_setting_id = m.exam_setting_id
                 WHERE m.exam_setting_id = ?
                 ORDER BY m.student_class FOR UPDATE`,
                [id]
            );

            let currentClassDefinitions = [];
            if (normalizedClassDefinitions !== undefined) {
                const [classRows] = await connection.query(
                    `SELECT c.id, c.class_name, c.sort_order, s.section_name
                     FROM rtse_exam_classes c
                     INNER JOIN rtse_exam_sections s
                       ON s.id = c.exam_section_id
                      AND s.exam_setting_id = c.exam_setting_id
                     WHERE c.exam_setting_id = ?
                     ORDER BY c.sort_order, c.id FOR UPDATE`,
                    [id]
                );

                currentClassDefinitions = classRows.map(row => ({
                    id: Number(row.id),
                    class_name: this.normalizeClassName(row.class_name),
                    section_name: this.normalizeSectionName(row.section_name),
                    sort_order: Number(row.sort_order)
                }));

                const existingIds = new Set(currentClassDefinitions.map(x => x.id));
                for (const item of normalizedClassDefinitions) {
                    if (item.id !== null && !existingIds.has(item.id)) {
                        throw new Error("A named-class ID does not belong to this examination. Reload the page.");
                    }
                }
            }

            const current = existing.map(s => ({
                id: Number(s.id),
                section_name: this.normalizeSectionName(s.section_name),
                roll_start: Number(s.roll_start),
                roll_end: Number(s.roll_end),
                sort_order: Number(s.sort_order)
            }));
            const currentById = new Map(current.map(s => [s.id, s]));

            for (const s of normalizedSections) {
                if (s.id !== null && !currentById.has(s.id)) {
                    throw new Error("A section ID does not belong to this examination. Reload the page.");
                }
            }

            const currentMappings = mappingRows.map(row => ({
                student_class: this.normalizeClassName(row.student_class),
                section_name: this.normalizeSectionName(row.section_name)
            })).sort((a, b) =>
                a.student_class.localeCompare(b.student_class, undefined, {
                    sensitivity: "base"
                })
            );

            const shape = rows => rows.map(s => ({
                id: s.id,
                section_name: s.section_name,
                roll_start: s.roll_start,
                roll_end: s.roll_end,
                sort_order: s.sort_order
            }));

            if (
                JSON.stringify(shape(current)) === JSON.stringify(shape(normalizedSections)) &&
                JSON.stringify(currentMappings) === JSON.stringify(normalizedMappings) &&
                (normalizedClassDefinitions === undefined ||
                    JSON.stringify(currentClassDefinitions.map(x => ({
                        id: x.id, class_name: x.class_name,
                        section_name: x.section_name, sort_order: x.sort_order
                    }))) ===
                    JSON.stringify(normalizedClassDefinitions.map(x => ({
                        id: x.id, class_name: x.class_name,
                        section_name: x.section_name, sort_order: x.sort_order
                    }))))
            ) {
                await connection.commit();
                return {
                    changed: false,
                    sectionCount: current.length,
                    mappingCount: currentMappings.length,
                    namedClassCount: currentClassDefinitions.length
                };
            }

            const [applicationRows] = await connection.query(
                "SELECT COUNT(*) AS total FROM rtse_applications WHERE exam_setting_id = ?",
                [id]
            );
            if (Number(applicationRows[0]?.total || 0) > 0) {
                throw new Error(
                    "Section configuration cannot be changed after applications are associated with this examination."
                );
            }

            const submittedIds = new Set(
                normalizedSections.filter(s => s.id !== null).map(s => s.id)
            );
            const desiredById = new Map(
                normalizedSections.filter(s => s.id !== null).map(s => [s.id, s])
            );
            const removed = current.filter(s => !submittedIds.has(s.id));
            const renamed = current.filter(s => {
                const target = desiredById.get(s.id);
                return target && target.section_name !== s.section_name;
            });

            // Refuse ambiguous section-name collisions; never silently swap names.
            const oldNameOwner = new Map(current.map(s => [s.section_name, s.id]));
            for (const s of normalizedSections) {
                const owner = oldNameOwner.get(s.section_name);
                if (owner !== undefined && owner !== s.id) {
                    throw new Error(
                        "A section name is already in use. Rename conflicting sections separately."
                    );
                }
            }

            // Section labels may also be referenced by seat-plan assignments or locks.
            for (const s of [...removed, ...renamed]) {
                const [refs] = await connection.query(
                    `SELECT
                       (SELECT COUNT(*) FROM rtse_seat_plan_seats WHERE section = ?) +
                       (SELECT COUNT(*) FROM rtse_seat_plan_rooms
                        WHERE left_section_lock = ?
                           OR right_section_lock = ?
                           OR universal_section_lock = ?) AS total`,
                    [s.section_name, s.section_name, s.section_name, s.section_name]
                );
                if (Number(refs[0]?.total || 0) > 0) {
                    throw new Error(
                        'Section "' + s.section_name +
                        '" is referenced by the seat plan and cannot be renamed or removed.'
                    );
                }
            }

            // Remove numeric mappings only within this examination.
            await connection.query(
                "DELETE FROM rtse_exam_section_classes WHERE exam_setting_id = ?",
                [id]
            );

            // Keep surviving section IDs and create new sections first.
            for (const section of normalizedSections) {
                if (section.id !== null) {
                    await connection.query(
                        `UPDATE rtse_exam_sections
                         SET section_name = ?, roll_start = ?, roll_end = ?, sort_order = ?
                         WHERE id = ? AND exam_setting_id = ?`,
                        [section.section_name, section.roll_start, section.roll_end,
                         section.sort_order, section.id, id]
                    );
                } else {
                    const [inserted] = await connection.query(
                        `INSERT INTO rtse_exam_sections
                         (exam_setting_id, section_name, roll_start, roll_end, sort_order)
                         VALUES (?, ?, ?, ?, ?)`,
                        [id, section.section_name, section.roll_start,
                         section.roll_end, section.sort_order]
                    );
                    section.id = Number(inserted.insertId);
                }
            }

            const idByName = new Map(
                normalizedSections.map(section => [section.section_name, section.id])
            );

            // Sync named classes before removing sections they may reference.
            if (normalizedClassDefinitions !== undefined) {
                const wantedIds = new Set(
                    normalizedClassDefinitions.filter(x => x.id !== null).map(x => x.id)
                );

                for (const oldClass of currentClassDefinitions) {
                    if (!wantedIds.has(oldClass.id)) {
                        await connection.query(
                            "DELETE FROM rtse_exam_classes WHERE exam_setting_id = ? AND id = ?",
                            [id, oldClass.id]
                        );
                    }
                }

                const [remaining] = await connection.query(
                    "SELECT id, class_name FROM rtse_exam_classes WHERE exam_setting_id = ? FOR UPDATE",
                    [id]
                );
                const nameOwners = new Map(
                    remaining.map(row => [
                        String(row.class_name).toLocaleLowerCase(), Number(row.id)
                    ])
                );

                for (const item of normalizedClassDefinitions) {
                    const key = item.class_name.toLocaleLowerCase();
                    const owner = nameOwners.get(key);
                    if (owner !== undefined && owner !== item.id) {
                        throw new Error(
                            "A named class with this name already exists. Rename conflicting classes separately."
                        );
                    }

                    const sectionId = idByName.get(item.section_name);
                    if (!sectionId) {
                        throw new Error("Named class refers to an undefined section.");
                    }

                    if (item.id !== null) {
                        await connection.query(
                            `UPDATE rtse_exam_classes
                             SET class_name = ?, exam_section_id = ?, sort_order = ?
                             WHERE id = ? AND exam_setting_id = ?`,
                            [item.class_name, sectionId, item.sort_order, item.id, id]
                        );
                    } else {
                        const [inserted] = await connection.query(
                            `INSERT INTO rtse_exam_classes
                             (exam_setting_id, class_name, exam_section_id, sort_order)
                             VALUES (?, ?, ?, ?)`,
                            [id, item.class_name, sectionId, item.sort_order]
                        );
                        item.id = Number(inserted.insertId);
                        nameOwners.set(key, item.id);
                    }
                }
            }

            // Delete removed sections only after their named classes are removed.
            for (const section of removed) {
                await connection.query(
                    "DELETE FROM rtse_exam_sections WHERE id = ? AND exam_setting_id = ?",
                    [section.id, id]
                );
            }

            for (const mapping of normalizedMappings) {
                const sectionId = idByName.get(mapping.section_name);
                if (!sectionId) throw new Error("Class mapping refers to an undefined section.");

                await connection.query(
                    `INSERT INTO rtse_exam_section_classes
                       (exam_setting_id, exam_section_id, student_class)
                     VALUES (?, ?, ?)`,
                    [id, sectionId, mapping.student_class]
                );
            }

            await connection.commit();
            return {
                changed: true,
                sectionCount: normalizedSections.length,
                mappingCount: normalizedMappings.length,
                namedClassCount: normalizedClassDefinitions === undefined
                    ? undefined
                    : normalizedClassDefinitions.length
            };
        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("RTSE section configuration rollback error:", rollbackError.message);
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getSections(examSettingId) {
        const id = Number(examSettingId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid examination setting ID.");
        }

        const [rows] = await db.query(
            `SELECT id, exam_setting_id, section_name,
                    roll_start, roll_end, sort_order
             FROM rtse_exam_sections
             WHERE exam_setting_id = ?
             ORDER BY sort_order ASC, id ASC`,
            [id]
        );

        return rows;
    }

    static async getClassMappings(examSettingId) {
        const id = Number(examSettingId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid examination setting ID.");
        }

        const [rows] = await db.query(
            `SELECT m.id, m.exam_setting_id, m.exam_section_id,
                    m.student_class, s.section_name
             FROM rtse_exam_section_classes AS m
             INNER JOIN rtse_exam_sections AS s
               ON s.id = m.exam_section_id
              AND s.exam_setting_id = m.exam_setting_id
             WHERE m.exam_setting_id = ?
             ORDER BY m.student_class ASC`,
            [id]
        );

        return rows;
    }

    static async getSectionForClass(examSettingId, studentClass) {
        const id = Number(examSettingId);
        if (!Number.isInteger(id) || id <= 0) return "";

        let className;
        try {
            className = this.normalizeClassName(studentClass);
        } catch {
            return "";
        }

        const [rows] = await db.query(
            `SELECT s.section_name
             FROM rtse_exam_section_classes AS m
             INNER JOIN rtse_exam_sections AS s
               ON s.id = m.exam_section_id
              AND s.exam_setting_id = m.exam_setting_id
             WHERE m.exam_setting_id = ?
               AND m.student_class = ?
             LIMIT 1`,
            [id, className]
        );
        return rows[0]?.section_name || "";
    }
}

module.exports = RtseExamSection;
