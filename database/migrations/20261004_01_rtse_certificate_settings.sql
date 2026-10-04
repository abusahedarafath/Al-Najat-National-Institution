CREATE TABLE IF NOT EXISTS rtse_certificate_settings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    exam_name VARCHAR(255) NOT NULL DEFAULT '',
    organized_by VARCHAR(255) NOT NULL DEFAULT '',
    left_signature VARCHAR(255) NULL,
    left_signature_label VARCHAR(255) NOT NULL DEFAULT '',
    right_signature VARCHAR(255) NULL,
    right_signature_label VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rtse_certificate_category_settings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_key VARCHAR(20) NOT NULL,
    certificate_name VARCHAR(255) NOT NULL DEFAULT '',
    certificate_description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rtse_certificate_category_key (category_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO rtse_certificate_settings (
    id,
    exam_name,
    organized_by,
    left_signature_label,
    right_signature_label
)
VALUES (
    1,
    'RATABARI TALLENT SEARCH EXAMINATION 2026',
    'ARSP NGO',
    'President',
    'RTSE Controller'
)
ON DUPLICATE KEY UPDATE
    id = id;

INSERT INTO rtse_certificate_category_settings (
    category_key,
    certificate_name,
    certificate_description
)
VALUES
(
    'rank1',
    'CERTIFICATE OF EXCELLENCE',
    'This certificate is proudly presented to {student_name} for securing the {rank_label} in {exam_name}.'
),
(
    'rank2',
    'CERTIFICATE OF EXCELLENCE',
    'This certificate is proudly presented to {student_name} for securing the {rank_label} in {exam_name}.'
),
(
    'rank3',
    'CERTIFICATE OF EXCELLENCE',
    'This certificate is proudly presented to {student_name} for securing the {rank_label} in {exam_name}.'
),
(
    'merit',
    'CERTIFICATE OF MERIT',
    'This certificate is proudly presented to {student_name} for securing the {rank_label} in {exam_name}. Their dedication, perseverance, and outstanding performance across all subjects have distinguished them among their peers. We commend their hard work and commitment to excellence.'
)
ON DUPLICATE KEY UPDATE
    category_key = VALUES(category_key);
