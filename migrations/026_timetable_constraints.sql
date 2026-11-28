-- Additive schedule constraints. Existing weekly volumes, sessions and published versions stay unchanged.
ALTER TABLE timetable_requirements ADD COLUMN session_durations SMALLINT[],
 ADD COLUMN allowed_days SMALLINT[],
 ADD COLUMN period TEXT CHECK(period IN ('morning','afternoon') OR period IS NULL),
 ADD COLUMN max_per_day SMALLINT CHECK(max_per_day BETWEEN 1 AND 20 OR max_per_day IS NULL),
 ADD CONSTRAINT timetable_requirements_session_durations_check CHECK(session_durations IS NULL OR (cardinality(session_durations)=sessions AND array_position(session_durations,NULL) IS NULL)),
 ADD CONSTRAINT timetable_requirements_allowed_days_check CHECK(allowed_days IS NULL OR (cardinality(allowed_days) BETWEEN 1 AND 7 AND array_position(allowed_days,NULL) IS NULL));
-- Keep every original attachment immutable. Several announcement pictures can coexist;
-- their visibility/order is stored separately so history is never erased.
ALTER TABLE communication_files DROP CONSTRAINT communication_files_entity_type_entity_id_kind_key;
CREATE INDEX communication_files_announcement_gallery ON communication_files(entity_id,id) WHERE entity_type='announcement';
CREATE TABLE announcement_file_layout (
 file_id BIGINT PRIMARY KEY REFERENCES communication_files(id),
 visible BOOLEAN NOT NULL DEFAULT true,
 sort_order INTEGER NOT NULL DEFAULT 0,
 updated_by BIGINT REFERENCES accounts(id),updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO announcement_file_layout(file_id,sort_order)
 SELECT id,least(id,10000)::integer FROM communication_files WHERE entity_type='announcement';
CREATE TABLE announcement_appearance (
 id SMALLINT PRIMARY KEY DEFAULT 1 CHECK(id=1),
 preset TEXT NOT NULL DEFAULT 'institutional' CHECK(preset IN ('classic','modern','institutional','large_image','side_image','compact','framed')),
 primary_color TEXT NOT NULL DEFAULT '#075b36',secondary_color TEXT NOT NULL DEFAULT '#eabf3b',
 font_family TEXT NOT NULL DEFAULT 'system' CHECK(font_family IN ('system','serif')),
 title_size SMALLINT NOT NULL DEFAULT 28 CHECK(title_size BETWEEN 18 AND 40),
 text_size SMALLINT NOT NULL DEFAULT 16 CHECK(text_size BETWEEN 13 AND 22),
 updated_by BIGINT REFERENCES accounts(id),updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK(primary_color ~ '^#[0-9A-Fa-f]{6}$' AND secondary_color ~ '^#[0-9A-Fa-f]{6}$')
);
INSERT INTO announcement_appearance(id) VALUES(1);
