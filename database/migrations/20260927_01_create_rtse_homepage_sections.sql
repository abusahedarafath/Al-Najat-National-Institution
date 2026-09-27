CREATE TABLE IF NOT EXISTS rtse_homepage_sections (
    id INT NOT NULL AUTO_INCREMENT,
    section_key VARCHAR(80) NOT NULL,
    section_type VARCHAR(50) NOT NULL DEFAULT 'content',
    title VARCHAR(255) DEFAULT NULL,
    subtitle VARCHAR(500) DEFAULT NULL,
    content LONGTEXT DEFAULT NULL,
    settings LONGTEXT DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rtse_homepage_section_key (section_key),
    KEY idx_rtse_homepage_order (display_order),
    KEY idx_rtse_homepage_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO rtse_homepage_sections
(section_key, section_type, title, subtitle, content, settings, display_order, is_active)
VALUES
(
    'hero',
    'hero',
    'Ratabari Talent Search Examination',
    'RTSE 2026',
    'Discover your potential. Showcase your talent.',
    '{"primary_label":"Apply Now","primary_url":"/rtse/apply","secondary_label":"Student Portal","secondary_url":"/rtse/student/login","badge":"RTSE 2026","image":""}',
    10,
    1
),
(
    'announcement',
    'announcement',
    'Important Announcement',
    'Stay updated with RTSE',
    'All important examination announcements will appear here.',
    '{"button_label":"View Details","button_url":"/rtse/"}',
    20,
    1
),
(
    'quick_services',
    'quick_services',
    'RTSE Quick Services',
    'Everything you need in one place',
    '[{"title":"Apply Online","description":"Submit your RTSE application online.","icon":"📝","url":"/rtse/apply"},{"title":"Student Portal","description":"Access your RTSE student dashboard.","icon":"🎓","url":"/rtse/student/login"},{"title":"Result","description":"Check your RTSE result when published.","icon":"🏆","url":"/rtse/result"},{"title":"Certificate","description":"Access RTSE certificate services.","icon":"📜","url":"/rtse/certificate"},{"title":"Verify Registration","description":"Verify an RTSE registration number.","icon":"✓","url":"/rtse/verify"},{"title":"Verify Certificate","description":"Verify an RTSE certificate.","icon":"🔐","url":"/rtse/verify/certificate"}]',
    '{}',
    30,
    1
),
(
    'why_rtse',
    'cards',
    'Why Participate in RTSE?',
    'A platform to identify and encourage student talent',
    '[{"title":"Recognise Talent","description":"Get an opportunity to demonstrate your academic potential."},{"title":"Compete & Learn","description":"Take part in a structured talent search examination."},{"title":"Track Your Journey","description":"Use the student portal for important RTSE services."}]',
    '{}',
    40,
    1
),
(
    'how_it_works',
    'steps',
    'How RTSE Works',
    'A simple journey from registration to result',
    '[{"number":"01","title":"Register","description":"Complete the online RTSE application."},{"number":"02","title":"Prepare","description":"Keep your application and examination information ready."},{"number":"03","title":"Appear","description":"Attend the examination according to the published schedule."},{"number":"04","title":"Result","description":"Check your result and certificate through the RTSE portal."}]',
    '{}',
    50,
    1
),
(
    'cta',
    'cta',
    'Ready to Participate?',
    'Begin your RTSE journey today.',
    'Complete your application through the official RTSE portal.',
    '{"primary_label":"Apply for RTSE","primary_url":"/rtse/apply","secondary_label":"Student Login","secondary_url":"/rtse/student/login"}',
    60,
    1
),
(
    'faq',
    'faq',
    'Frequently Asked Questions',
    'Quick answers about RTSE',
    '[{"question":"How can I apply?","answer":"Use the Apply Online button and complete the official RTSE application form."},{"question":"Where can I access my student services?","answer":"Use the RTSE Student Portal to access available student services."},{"question":"Where will results be published?","answer":"Results become available through the RTSE result service when they are published by the administration."}]',
    '{}',
    70,
    1
)
ON DUPLICATE KEY UPDATE
    section_type = VALUES(section_type);
