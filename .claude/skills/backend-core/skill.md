---
name: backend-routes
description: Generate API routes, handle requests and responses, and connect to databases. Use for building RESTful backend functionality.
---

# Backend Route Handling

## Instructions

1. **Route Structure**
   - Define clear endpoint paths
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Organize routes logically by resource

2. **Request & Response**
   - Validate incoming request data
   - Handle errors gracefully
   - Send consistent JSON responses

3. **Database Integration**
   - Connect securely to databases
   - Use ORM or parameterized queries
   - Handle transactions and errors

## Best Practices
- Keep endpoints single-responsibility
- Sanitize inputs to prevent SQL injection
- Return meaningful status codes
- Follow RESTful conventions

## Example Structure
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
def create_item(item: Item, db: Session):
    try:
        db_item = DBModel(name=item.name, price=item.price)
        db.add(db_item)
        db.commit()
        return {"status": "success", "item": item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
