# UniShare

A college-exclusive student marketplace for buying, selling, lending, and borrowing items within a campus community.

## Planned technology

- **Frontend:** React + Tailwind CSS
- **Backend:** Java + Spring Boot (REST APIs)
- **Database:** MySQL
- **Persistence:** Spring Data JPA / Hibernate
- **Authentication:** Spring Security (JWT; implementation planned)

## Core modules

1. Student registration and login
2. College-restricted student accounts
3. Marketplace browsing, search, and categories
4. Student product listings
5. Cart and campus-pickup orders
6. Borrowing and lending
7. Admin moderation

## Repository layout (planned)

```text
unishare-web/
├── frontend/     # React application
├── backend/      # Spring Boot REST API
├── database/     # MySQL schema, seed data, DBMS scripts
├── docs/         # ER diagram and project documentation
└── README.md
```

## Development status

Project planning and repository initialization.

Features will be marked complete only after implementation and testing.

## Local development

Prerequisites and exact startup commands will be documented as the frontend and backend are added.

## Database

MySQL is the system of record. Application data must be stored and retrieved through the Spring Boot backend; the browser must not be used as the application's database.
