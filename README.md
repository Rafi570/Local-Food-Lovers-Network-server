# 🍽️ Local Food Lovers Network - Server

This is the **backend** for the Local Food Lovers Network project. It provides REST APIs to handle food reviews, favorites, and user-related operations. The server is built using **Node.js**, **Express**, and **MongoDB**, with Firebase authentication integration for secure routes.


---

## 🎯 Purpose

The server manages:

- Storing and fetching food reviews.
- Handling user favorites.
- Providing protected routes for authenticated users.
- Supporting search functionality via MongoDB `$regex`.
- Ensuring secure CRUD operations.

This backend works seamlessly with the **client-side SPA** to deliver a responsive and interactive food review experience.

---

## ✨ Key Features

1. **Reviews Management (CRUD)**
   - Add a new review (protected route)
   - Edit and delete a user’s own review
   - Fetch all reviews or a specific review by ID
   - Sort reviews by date

2. **Favorites System**
   - Add a food review to favorites
   - Remove a favorite
   - Fetch all favorites for a logged-in user

3. **Search Functionality**
   - Search reviews by food name using MongoDB `$regex` for dynamic results

4. **Authentication Integration**
   - Firebase token verification for protected routes
   - Ensures only authenticated users can add/edit/delete reviews or manage favorites

---

## 🛠️ Technologies & Packages Used

| Category | Technology / Package | Purpose |
|----------|-------------------|---------|
| Server | Node.js | Backend runtime environment |
| Framework | Express | REST API framework |
| Database | MongoDB / Atlas | Stores reviews & favorites |
| Authentication | Firebase Admin SDK | Verify Firebase tokens for protected routes |
| Environment | dotenv | Securely manage environment variables |
| CORS | cors | Allow cross-origin requests from client |
| Body Parsing | express.json() | Parse incoming JSON requests |

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- npm / yarn / pnpm
- MongoDB Atlas URI or local MongoDB
- Firebase project (for token verification)

### Installation

1. Clone the repository:
```bash
git clone [https://github.com/Rafi570/Local-Food-Lovers-Network-server.git]
