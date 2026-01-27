# Supabase Setup Guide for TrustChain

This guide will help you set up Supabase as the database for TrustChain.

## 🚀 Quick Setup

### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (recommended)
4. Create a new organization (if you don't have one)
5. Click **"New Project"**
6. Fill in:
   - **Name:** TrustChain
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine for development
7. Click **"Create new project"**
8. Wait 2-3 minutes for setup to complete

### Step 2: Get Database Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **"Database"** in the left sidebar
3. Scroll down to **"Connection string"**
4. You'll see connection details:
   - **Host:** `db.<your-project-ref>.supabase.co`
   - **Database name:** `postgres`
   - **Port:** `5432`
   - **User:** `postgres`
   - **Password:** (the one you set in Step 1)

### Step 3: Configure Your Application

#### Option A: Using Environment Variables (Recommended for Production)

1. Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

2. Edit `.env` with your Supabase credentials:

```env
SUPABASE_DB_HOST=db.xxxxxxxxxxxxx.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-database-password
SUPABASE_DB_PORT=5432
```

3. Update `application.properties` to use environment variables:

```properties
spring.datasource.url=jdbc:postgresql://${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT}/${SUPABASE_DB_NAME}
spring.datasource.username=${SUPABASE_DB_USER}
spring.datasource.password=${SUPABASE_DB_PASSWORD}
```

#### Option B: Direct Configuration (Quick Start)

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://db.xxxxxxxxxxxxx.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=your-database-password
```

**⚠️ Warning:** Don't commit this file with real credentials!

### Step 4: Update Docker Compose (Optional)

If using Docker, update `docker-compose.yml`:

```yaml
services:
  backend:
    build: ./backend
    container_name: spring-backend
    ports:
      - "8080:8080"
    environment:
      SUPABASE_DB_HOST: db.xxxxxxxxxxxxx.supabase.co
      SUPABASE_DB_NAME: postgres
      SUPABASE_DB_USER: postgres
      SUPABASE_DB_PASSWORD: your-database-password
    restart: unless-stopped
```

### Step 5: Test the Connection

1. Start your application:

```bash
# Using Maven
cd backend
./mvnw spring-boot:run

# Or using Docker
docker compose up --build
```

2. Check the logs for:
```
Hibernate: create table users ...
```

This means the database connection is working!

## 📊 Verify in Supabase Dashboard

1. Go to your Supabase project
2. Click **"Table Editor"** in the left sidebar
3. You should see a `users` table created automatically by Hibernate

## 🔒 Security Best Practices

### For Development:
- ✅ Use `.env` files (already in `.gitignore`)
- ✅ Never commit real credentials
- ✅ Share credentials securely with teammates (1Password, LastPass, etc.)

### For Production:
- ✅ Use environment variables
- ✅ Enable Row Level Security (RLS) in Supabase
- ✅ Use connection pooling
- ✅ Enable SSL connections

## 🤝 Team Collaboration

### For Team Lead (You):

1. **Share credentials securely:**
   - Use 1Password, LastPass, or similar
   - Or share via encrypted message
   - **Never** commit to Git

2. **Update README:**
   - Add note about Supabase setup
   - Link to this guide

### For Teammates:

1. Get Supabase credentials from team lead
2. Create `backend/.env` file with credentials
3. Run `docker compose up --build`
4. Start developing!

## 📚 Supabase Features You Can Use

### 1. **Database** (What we're using)
- PostgreSQL database
- Automatic backups
- Connection pooling

### 2. **Authentication** (Optional - for later)
- Built-in user authentication
- Social login (Google, GitHub, etc.)
- JWT tokens

### 3. **Storage** (Optional - for later)
- File storage for images, documents
- CDN for fast delivery

### 4. **Realtime** (Optional - for later)
- Real-time database changes
- WebSocket connections

### 5. **Edge Functions** (Optional - for later)
- Serverless functions
- Run code on the edge

## 🧪 Testing the Database

### Create a Test Endpoint

Add this to your `HelloController.java`:

```java
@Autowired
private UserRepository userRepository;

@GetMapping("/api/test-db")
public String testDatabase() {
    long count = userRepository.count();
    return "Database connected! Users count: " + count;
}
```

Test it:
```bash
curl http://localhost:8080/api/test-db
# Expected: "Database connected! Users count: 0"
```

## 🔧 Troubleshooting

### Connection Refused
- Check if your IP is allowed in Supabase (Settings → Database → Connection pooling)
- Verify credentials are correct
- Check if Supabase project is active

### SSL Error
Add to `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://...?sslmode=require
```

### Hibernate Errors
- Check if `spring.jpa.hibernate.ddl-auto=update` is set
- Verify PostgreSQL dialect is configured

## 📖 Next Steps

1. ✅ Supabase connected
2. ⏳ Create more entities (NGO, Transaction, etc.)
3. ⏳ Build REST APIs
4. ⏳ Add authentication
5. ⏳ Implement business logic

## 🆘 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Spring Data JPA:** https://spring.io/projects/spring-data-jpa
- **PostgreSQL:** https://www.postgresql.org/docs/

---

**Status:** ✅ Supabase integration ready!  
**Last Updated:** January 27, 2026
