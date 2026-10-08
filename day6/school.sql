-- ==========================================
-- 1. CREATE TABLES
-- ==========================================

CREATE TABLE students (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id          INTEGER PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT
);

-- The join table. The composite PRIMARY KEY prevents the same student 
-- from enrolling in the same course twice.
CREATE TABLE enrolments (
  student_id INTEGER NOT NULL,
  course_id  INTEGER NOT NULL,
  grade      TEXT,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

-- ==========================================
-- 2. INSERT SAMPLE DATA
-- ==========================================

-- 3 Students (Note: Charlie will have 0 enrolments for Query 4)
INSERT INTO students (id, name, email) VALUES 
  (1, 'Alice', 'alice@school.edu'),
  (2, 'Bob', 'bob@school.edu'),
  (3, 'Charlie', 'charlie@school.edu');

-- 3 Courses
INSERT INTO courses (id, title, description) VALUES 
  (1, 'Mathematics', 'Intro to Algebra and Calculus'),
  (2, 'Computer Science', 'Programming fundamentals'),
  (3, 'History', 'World History 101');

-- 5 Enrolments (Alice has 2, Bob has 3, Charlie has 0)
INSERT INTO enrolments (student_id, course_id, grade) VALUES 
  (1, 1, 'A'),   -- Alice in Math
  (1, 2, 'B'),   -- Alice in CS
  (2, 1, 'C'),   -- Bob in Math
  (2, 2, 'A'),   -- Bob in CS
  (2, 3, 'B');   -- Bob in History

-- ==========================================
-- 3. THE FIVE REQUIRED QUERIES
-- ==========================================

-- Query 1: All courses for one student (by name)
SELECT c.title, e.grade
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON s.id = e.student_id
WHERE s.name = 'Alice';

-- Query 2: All students on one course
SELECT s.name, e.grade
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE c.title = 'Computer Science';

-- Query 3: The number of students per course
SELECT c.title, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id;

-- Query 4: Students who have no enrolments
SELECT s.name
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.student_id IS NULL;

-- Query 5: Update one enrolment's grade (e.g., change Bob's Math grade from 'C' to 'B')
UPDATE enrolments 
SET grade = 'B' 
WHERE student_id = 2 AND course_id = 1;