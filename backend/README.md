# UniShare Backend

Spring Boot 4 / Java 17 REST API with MySQL and Spring Data JPA.

## Run locally

From the repository root, set the database password in your terminal (do not commit it):

```bash
export DB_PASSWORD='your-local-mysql-password'
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell use `$env:DB_PASSWORD="your-local-mysql-password"` and `.\mvnw.cmd spring-boot:run`.

The database `unishare_web_db` must exist on the local MySQL server. Hibernate creates/updates tables on startup.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | List available products |
| GET | `/api/products?search=book` | Search by title |
| GET | `/api/products?category=Books` | Filter by category |
| GET | `/api/products/{id}` | Product details |
| POST | `/api/products` | Create a listing |
| DELETE | `/api/products/{id}?sellerId=1` | Delete own listing |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders?buyerId=1` | View a student's orders |

Registration JSON:
```json
{"fullName":"A Student","email":"student@example.com","password":"secret123","collegeName":"VIT Pune"}
```

Login JSON:
```json
{"email":"student@example.com","password":"secret123"}
```

Create product JSON:
```json
{"title":"Engineering Calculator","description":"Good condition","price":500,"category":"Electronics","imageUrl":"","listingType":"SALE","sellerId":1}
```

Place order JSON:
```json
{"buyerId":2,"productId":1}
```

**Demo limitation:** Login returns the student profile, not a JWT. The user IDs supplied to listing/order endpoints are suitable for a local academic demonstration only; add authenticated sessions/JWT and server-side authorization before real deployment.
