ALTER TABLE vocabulary ADD COLUMN romaja TEXT;
ALTER TABLE vocabulary ADD COLUMN part_of_speech TEXT;
ALTER TABLE vocabulary ADD COLUMN tags_json TEXT DEFAULT '[]';
