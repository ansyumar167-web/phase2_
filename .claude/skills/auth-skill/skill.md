---
name: auth-skill
description: Implement signup, signin, password hashing, JWT authentication, and secure auth flows. Use for backend authentication features.
---

# Auth Skill

## Instructions

1. **Signup Flow**
   - Collect user email and password
   - Hash passwords securely (bcrypt or argon2)
   - Store users safely in database

2. **Signin Flow**
   - Verify user credentials
   - Generate JWT token on successful login
   - Return access token and refresh token if needed

3. **Security Practices**
   - Use strong password hashing
   - Validate input to prevent injection
   - Implement token expiration and refresh handling

4. **Integration**
   - Support JWT-based auth in APIs
   - Work with frontend login forms
   - Allow middleware for route protection

## Best Practices
- Never store plain passwords
- Keep tokens short-lived
- Validate user input thoroughly
- Apply rate-limiting to login routes
- Use environment variables for secrets

## Example Structure
```python
# Signup example
hashed_password = hash_password(user_password)
save_user(email, hashed_password)

# Signin example
if verify_password(input_password, stored_hash):
    token = generate_jwt(user_id)
    return token
