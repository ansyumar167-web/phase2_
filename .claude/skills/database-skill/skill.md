---
name: database-schema
description: Create and manage database tables, migrations, and schema design for structured and maintainable databases. Use for backend projects.
---

# Database Schema Design

## Instructions

1. **Tables and Structure**
   - Define clear table names reflecting entities
   - Use normalized design to reduce redundancy
   - Choose proper data types for each column

2. **Relationships**
   - Use primary and foreign keys correctly
   - Represent one-to-one, one-to-many, and many-to-many relationships
   - Consider indexing frequently queried columns

3. **Migrations**
   - Keep migration files versioned
   - Ensure schema changes are reversible
   - Test migrations before production deployment

4. **Constraints and Integrity**
   - Add NOT NULL, UNIQUE, and CHECK constraints where applicable
   - Use default values carefully
   - Enforce referential integrity

## Best Practices
- Maintain consistent naming conventions
- Optimize queries with proper indexing
- Document table relationships
- Backup database before applying major changes
- Consider serverless-friendly schema patterns if using Neon or similar

## Example Structure
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
