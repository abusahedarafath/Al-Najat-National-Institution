ALTER TABLE arsp_members
ADD COLUMN admit_card_access ENUM('Partial','Full')
NOT NULL DEFAULT 'Partial'
AFTER approval_status;
