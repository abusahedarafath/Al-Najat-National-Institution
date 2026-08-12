INSERT INTO header_buttons
    (title, icon, url, button_color, display_order, status)
SELECT
    defaults.title,
    defaults.icon,
    defaults.url,
    defaults.button_color,
    defaults.display_order,
    defaults.status
FROM (
    SELECT
        'CHIEF CONTROLLER LOGIN' AS title,
        NULL AS icon,
        '/admin/login' AS url,
        '#ba2222' AS button_color,
        1 AS display_order,
        'Active' AS status
    UNION ALL
    SELECT
        'RTSE STUDENT LOGIN',
        NULL,
        '/rtse/student/login',
        '#0066ff',
        2,
        'Active'
) AS defaults
WHERE NOT EXISTS (
    SELECT 1
    FROM header_buttons hb
    WHERE hb.title = defaults.title
      AND hb.url = defaults.url
);
