CREATE TABLE IF NOT EXISTS rtse_admit_card_settings (
    id INT NOT NULL AUTO_INCREMENT,
    signature_image VARCHAR(255) NULL,
    instruction_1 TEXT NULL,
    instruction_2 TEXT NULL,
    instruction_3 TEXT NULL,
    instruction_4 TEXT NULL,
    instruction_5 TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO rtse_admit_card_settings
    (id, instruction_1, instruction_2, instruction_3, instruction_4, instruction_5)
SELECT
    1,
    'Carry your School ID Card and Admit Card. Ensure the Admit Card is scanned by the ARSP Super Scanner, or you may be marked ABSENT.',
    'Report at least 30 minutes before the reporting time. No entry will be allowed after the gate closes.',
    'Mobile phones, smart watches, Bluetooth devices, calculators and other electronic devices are strictly prohibited. Violation may result in expulsion.',
    'Fill and mark the OMR carefully as instructed. Do not fold, damage or tamper with it. Submit the OMR to the invigilator before leaving.',
    'Cheating, copying, impersonation or any unfair means will result in disqualification. Follow all instructions given by examination officials.'
WHERE NOT EXISTS (
    SELECT 1
    FROM rtse_admit_card_settings
    WHERE id = 1
);
