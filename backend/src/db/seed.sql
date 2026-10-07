USE community_portal_db;

-- Insert Standard Categories
INSERT INTO categories (id, name, description, icon_name) VALUES
  (1, 'Education', 'Academic tutoring, literacy programs, and digital skill coaching', 'GraduationCap'),
  (2, 'Healthcare', 'Health screenings, medical camps, and wellness awareness', 'HeartPulse'),
  (3, 'Environment', 'Urban greening, tree plantation, recycling, and clean-up drives', 'Leaf'),
  (4, 'Food Distribution', 'Community pantries, food banks, and surplus meal distribution', 'Utensils'),
  (5, 'Elderly Care', 'Companion visits, digital literacy, and grocery delivery for seniors', 'Users'),
  (6, 'Animal Welfare', 'Shelter support, vaccination camps, and stray rescue coordination', 'PawPrint'),
  (7, 'Disaster Relief', 'Emergency preparedness, relief kits, and rapid community response', 'ShieldAlert')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Demo Users (Password: Password@123)
-- Admin
INSERT INTO users (id, full_name, email, password_hash, role, phone, address) VALUES
  (1, 'System Administrator', 'admin@servehub.org', '$2a$10$96JEwRxqmnpmI3Dn28bfH.1O.UuMk4GHW8KiPJOZu2fHzpXZGDHVC', 'ADMIN', '+1-555-0100', 'Civic Center, Suite 400')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Volunteer
INSERT INTO users (id, full_name, email, password_hash, role, phone, address) VALUES
  (2, 'Sarah Jenkins', 'sarah.volunteer@servehub.org', '$2a$10$96JEwRxqmnpmI3Dn28bfH.1O.UuMk4GHW8KiPJOZu2fHzpXZGDHVC', 'VOLUNTEER', '+1-555-0101', '742 Evergreen Terrace')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Citizen / User
INSERT INTO users (id, full_name, email, password_hash, role, phone, address) VALUES
  (3, 'Alex Mercer', 'alex.citizen@servehub.org', '$2a$10$96JEwRxqmnpmI3Dn28bfH.1O.UuMk4GHW8KiPJOZu2fHzpXZGDHVC', 'USER', '+1-555-0102', '120 Elm Street, Apt 3B')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Volunteer Profile for Sarah (Completed: 4, Hours: 16 -> Score: 4*10 + 16*2 = 72)
INSERT INTO volunteer_profiles (user_id, skills, interests, availability, completed_activities, total_hours, impact_score) VALUES
  (2, 'First Aid Certified, STEM Teaching, Event Coordination', 'Healthcare, Education, Environmental Care', 'Weekends & Friday Evenings', 4, 16, 72)
ON DUPLICATE KEY UPDATE total_hours=VALUES(total_hours);

-- Insert Community Services
INSERT INTO services (id, title, description, category_id, location, service_date, max_participants, status, created_by) VALUES
  (1, 'Free STEM Tutoring & Homework Help', 'Weekly tutoring sessions for high school and middle school students covering Mathematics, Physics, and Coding basics.', 1, 'Downtown Public Library, Study Hall B', '2026-10-18', 35, 'ACTIVE', 1),
  (2, 'Community Health & Blood Pressure Screening', 'Free preventive healthcare checkup including vitals, blood sugar test, and nutritionist counseling for all residents.', 2, 'St. Jude Community Clinic', '2026-10-22', 100, 'ACTIVE', 1),
  (3, 'Weekend Meal Pantry & Grocery Relief', 'Essential food and nutrition package distribution for low-income families and unhoused individuals.', 4, 'Civic Center Pavilion 2', '2026-10-25', 60, 'ACTIVE', 1),
  (4, 'Senior Tech Companion Workshop', 'Help elderly seniors learn smartphones, video calls with family, online banking safety, and cyber awareness.', 5, 'Golden Oaks Senior Living Center', '2026-11-01', 25, 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Community Events
INSERT INTO events (id, title, description, category_id, location, event_date, start_time, end_time, capacity, available_slots, required_volunteers, available_volunteer_slots, status, created_by) VALUES
  (1, 'Riverside Park Cleanup & Tree Plantation', 'Join your neighbors to restore Riverside Park! We will plant 150 indigenous saplings and clean the riverside promenade.', 3, 'Riverside Memorial Park, North Gate', '2026-10-24', '08:30:00', '13:00:00', 80, 68, 12, 8, 'UPCOMING', 1),
  (2, 'Annual City Blood Donation Marathon', 'Every drop counts! Certified Red Cross nurses on-site for blood and platelet collection with complimentary refreshments.', 2, 'Metro Convention Hall A', '2026-11-05', '09:00:00', '16:00:00', 150, 134, 15, 11, 'UPCOMING', 1),
  (3, 'Community Winter Coat & Blanket Drive', 'Collecting and sorting winter garments, jackets, and thermal blankets for families in need ahead of cold season.', 4, 'Westside Community Gym', '2026-11-12', '10:00:00', '15:30:00', 50, 42, 8, 5, 'UPCOMING', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Sample Service Request from Alex
INSERT INTO service_requests (id, user_id, service_id, request_notes, status, admin_feedback) VALUES
  (1, 3, 1, 'Requesting math tutoring for 10th-grade calculus concepts.', 'APPROVED', 'Matched with tutor volunteer Sarah Jenkins. Session scheduled for Oct 18.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Sample Event Registration
INSERT INTO event_registrations (user_id, event_id, status) VALUES
  (3, 1, 'CONFIRMED')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Sample Volunteer Hours
INSERT INTO volunteer_hours (volunteer_id, event_id, hours_logged, activity_date, notes, verified_by) VALUES
  (2, 1, 4.00, '2026-09-20', 'Coordinated tree sapling logistics and volunteer registration desk.', 1)
ON DUPLICATE KEY UPDATE hours_logged=VALUES(hours_logged);

-- Sample Notification
INSERT INTO notifications (user_id, title, message, type) VALUES
  (3, 'Service Request Approved', 'Your request for Free STEM Tutoring & Homework Help has been approved!', 'SUCCESS'),
  (2, 'Volunteer Hours Verified', '4.0 volunteer hours have been verified by the administrator.', 'INFO')
ON DUPLICATE KEY UPDATE title=VALUES(title);
