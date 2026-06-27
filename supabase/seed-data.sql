-- Seed admin user
INSERT INTO "users" ("id", "name", "email", "password", "role", "created_at", "updated_at")
VALUES (
  'admin-001',
  'Admin',
  'admin@fingerhr.com',
  '$2b$10$ukWjqJoVtXmad11yhJI9t.tWFx7OjNwS82w0AfdVdPD2s2qdpvLey',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Seed device REVO 208
INSERT INTO "devices" ("id", "cloud_id", "name", "type", "status", "timezone", "created_at", "updated_at")
VALUES (
  'device-revo-208',
  'C269248053121C21',
  'REVO 208',
  'REVO',
  'OFFLINE',
  'Asia/Jakarta',
  NOW(),
  NOW()
) ON CONFLICT ("cloud_id") DO NOTHING;

-- Seed default schedule SM1
INSERT INTO "schedules" ("id", "name", "start_time", "end_time", "grace_minutes", "is_active", "created_at", "updated_at")
VALUES (
  'schedule-sm1',
  'SM1',
  '08:30',
  '16:30',
  15,
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;
