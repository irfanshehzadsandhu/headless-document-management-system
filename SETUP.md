# Database Setup Guide

## Prerequisites

Make sure PostgreSQL is installed on your system.

### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

## Creating Database and User

### Option 1: Using psql Command Line

1. **Connect to PostgreSQL as the default superuser:**
```bash
psql postgres
```

Or if you need to specify a user:
```bash
psql -U postgres
```

2. **Create a new user (role):**
```sql
CREATE USER document_user WITH PASSWORD 'your_secure_password';
```

3. **Create the database:**
```sql
CREATE DATABASE document_management OWNER document_user;
```

4. **Grant privileges:**
```sql
GRANT ALL PRIVILEGES ON DATABASE document_management TO document_user;
```

5. **Connect to the new database:**
```sql
\c document_management
```

6. **Grant schema privileges (if needed):**
```sql
GRANT ALL ON SCHEMA public TO document_user;
```

7. **Exit psql:**
```sql
\q
```

### Option 2: Using a Single Command

You can also create everything in one command from your terminal:

```bash
psql postgres -c "CREATE USER document_user WITH PASSWORD 'your_secure_password';"
psql postgres -c "CREATE DATABASE document_management OWNER document_user;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE document_management TO document_user;"
```

### Option 3: Using a SQL Script

Create a file `setup-db.sql`:

```sql
-- Create user
CREATE USER document_user WITH PASSWORD 'your_secure_password';

-- Create database
CREATE DATABASE document_management OWNER document_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE document_management TO document_user;
```

Then run:
```bash
psql postgres -f setup-db.sql
```

## Update .env File

After creating the database and user, update your `.env` file:

```env
DATABASE_URL=postgresql://document_user:your_secure_password@localhost:5432/document_management
```

Or using the default postgres user:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/document_management
```

## Verify Connection

Test the connection:
```bash
psql postgresql://document_user:your_secure_password@localhost:5432/document_management
```

## Run Migrations

After setting up the database, run the migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Troubleshooting

### Connection refused error
- Make sure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check if PostgreSQL is listening on the default port 5432

### Authentication failed
- Verify the username and password are correct
- Check PostgreSQL's `pg_hba.conf` file for authentication settings

### Permission denied
- Make sure the user has proper privileges on the database
- Try using the `postgres` superuser for initial setup

