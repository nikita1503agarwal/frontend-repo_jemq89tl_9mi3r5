Store Rating App (Full-Stack)

What’s included
- Backend API (FastAPI + JWT + MongoDB)
- Frontend (React + Vite + Tailwind)
- Seed endpoint to create demo users, stores, and reviews
- Role-based access (user, owner, admin)

Quick start
Backend
1) Open a new terminal
2) cd backend
3) Create and edit .env (or copy .env.example):
   PORT=8000
   DATABASE_URL=mongodb://localhost:27017
   DATABASE_NAME=store_rating
   JWT_SECRET=supersecret_demo_key
   JWT_EXPIRES_IN=7d
4) pip install -r requirements.txt
5) uvicorn main:app --host 0.0.0.0 --port 8000 --reload
6) Seed demo data (run once):
   curl -X POST http://localhost:8000/seed

Frontend
1) Open another terminal
2) cd frontend
3) Create and edit .env (or copy .env.example):
   VITE_BACKEND_URL=http://localhost:8000
4) npm install
5) npm run dev

Demo accounts
- Admin: admin@demo.local / Admin@123
- Owner: owner@demo.local / Owner@123
- User:  user@demo.local / User@123

Test checklist
- Login as user, open a store, add a review, edit by posting again
- Login as owner, create a store, view ratings for it
- Login as admin, view users, change a user role
- Delete a review as its author or as admin

Sample API requests (curl)
Auth
- Register
  curl -X POST http://localhost:8000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Alice","email":"alice@demo.local","password":"Passw0rd!"}'
- Login
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@demo.local","password":"User@123"}'

Users (admin)
- List users
  curl http://localhost:8000/api/users -H "Authorization: Bearer <TOKEN>"
- Update role
  curl -X PATCH http://localhost:8000/api/users/<USER_ID>/role \
    -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
    -d '{"role":"owner"}'

Stores
- List stores (search + pagination)
  curl "http://localhost:8000/api/stores?q=cafe&page=1&limit=10"
- Get store detail
  curl http://localhost:8000/api/stores/<STORE_ID>
- Create store (owner/admin)
  curl -X POST http://localhost:8000/api/stores \
    -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
    -d '{"name":"New Shop","description":"...","address":"123 St"}'
- Update store (owner/admin)
  curl -X PATCH http://localhost:8000/api/stores/<STORE_ID> \
    -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
    -d '{"description":"Updated"}'
- Delete store (owner/admin)
  curl -X DELETE http://localhost:8000/api/stores/<STORE_ID> \
    -H "Authorization: Bearer <TOKEN>"

Reviews
- Create or update review (user/owner/admin)
  curl -X POST http://localhost:8000/api/stores/<STORE_ID>/reviews \
    -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
    -d '{"rating":5,"comment":"Great!"}'
- List reviews
  curl "http://localhost:8000/api/stores/<STORE_ID>/reviews?page=1&limit=10"
- Update review (author/admin)
  curl -X PATCH http://localhost:8000/api/reviews/<REVIEW_ID> \
    -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
    -d '{"comment":"Edited"}'
- Delete review (author/admin)
  curl -X DELETE http://localhost:8000/api/reviews/<REVIEW_ID> \
    -H "Authorization: Bearer <TOKEN>"

Notes
- JWT is stored in localStorage on the frontend; Authorization header is set automatically.
- The backend uses MongoDB in this environment; schema is enforced via application logic.
- Average ratings and reviews count are computed via aggregation.

Run commands summary
# backend
cd backend
pip install -r requirements.txt
# ensure MongoDB is running and accessible
uvicorn main:app --reload
curl -X POST http://localhost:8000/seed

# frontend
cd frontend
npm install
npm run dev
