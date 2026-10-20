INSERT INTO rtse_certificate_category_settings (
    category_key,
    certificate_name,
    certificate_description
)
VALUES (
    'appreciation',
    'CERTIFICATE OF APPRECIATION',
    'This certificate is proudly presented to {student_name} in recognition of their achievement in {exam_name}. Their dedication, perseverance, and sincere effort are highly appreciated.'
)
ON DUPLICATE KEY UPDATE
    category_key = VALUES(category_key);
