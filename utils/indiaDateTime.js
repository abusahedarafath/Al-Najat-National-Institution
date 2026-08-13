const IST_OFFSET_MINUTES = 330;

/**
 * Convert an HTML datetime-local value entered in India time
 * (e.g. 2026-08-13T08:08) into a UTC MySQL datetime string.
 */
function indiaToUtc(value) {
    if (!value) {
        return null;
    }

    const match = String(value).match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
    );

    if (!match) {
        throw new Error(`Invalid datetime-local value: ${value}`);
    }

    const [
        ,
        year,
        month,
        day,
        hour,
        minute,
        second = "00"
    ] = match;

    const utcMillis =
        Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        ) - (IST_OFFSET_MINUTES * 60 * 1000);

    const date = new Date(utcMillis);

    const pad = number => String(number).padStart(2, "0");

    return [
        date.getUTCFullYear(),
        pad(date.getUTCMonth() + 1),
        pad(date.getUTCDate())
    ].join("-") + " " + [
        pad(date.getUTCHours()),
        pad(date.getUTCMinutes()),
        pad(date.getUTCSeconds())
    ].join(":");
}

/**
 * Convert a UTC MySQL datetime into the value expected by
 * an HTML datetime-local input in India time.
 */
function utcToIndia(value) {
    if (!value) {
        return "";
    }

    const date = new Date(
        String(value).replace(" ", "T") + "Z"
    );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const indiaMillis =
        date.getTime() + (IST_OFFSET_MINUTES * 60 * 1000);

    const indiaDate = new Date(indiaMillis);

    const pad = number => String(number).padStart(2, "0");

    return [
        indiaDate.getUTCFullYear(),
        pad(indiaDate.getUTCMonth() + 1),
        pad(indiaDate.getUTCDate())
    ].join("-") + "T" + [
        pad(indiaDate.getUTCHours()),
        pad(indiaDate.getUTCMinutes())
    ].join(":");
}

module.exports = {
    indiaToUtc,
    utcToIndia
};
