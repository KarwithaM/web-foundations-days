# School Database Design

## Table Explanations

- **students**: Stores core information about each student. The `email` is `UNIQUE` to prevent duplicate accounts.
- **courses**: Stores the catalog of available classes.
- **enrolments**: A join table that records which student is taking which course, along with the grade they received.

## Relationships

- **One-to-Many**: A single `student` can have many `enrolments`. A single `course` can have many `enrolments`.
- **Many-to-Many**: A student can take many courses, and a course can have many students. This is resolved using the `enrolments` join table. We cannot put a `course_id` in the `students` table (because a student takes many courses), nor a `student_id` in the `courses` table (because a course has many students). The join table elegantly solves this.
- **Preventing Duplicates**: The `enrolments` table uses a composite `PRIMARY KEY (student_id, course_id)`. This database-level rule guarantees that the exact same pair cannot be inserted twice, preventing a student from being enrolled in the same course twice.

## Indexing

I would add the following index:

```sql
CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);
```

## Reason:

A very common query in a school system is "Show me all courses and grades for this specific student." Indexing student_id allows the database to instantly find all of a student's enrolments without scanning the entire enrolments table.

## SQL vs. NoSQL Choice

I would absolutely choose a Relational (SQL) database for this system. School data is highly structured and relies heavily on strict relationships and data integrity. We need to guarantee that an enrolment always points to a valid student and a valid course (Referential Integrity). Furthermore, academic records require ACID compliance to ensure that grades and enrolments are recorded reliably without anomalies. NoSQL (document) databases are better suited for unstructured data or massive, flexible scaling, which is not the primary requirement for a structured school grading system.
