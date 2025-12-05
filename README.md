# Headless Document Management System

A headless document management system built with Hono, Drizzle ORM, and TypeScript.

## Features

- **Document Upload**: Upload documents with metadata and tags
- **Metadata Management**: Create, read, update, and delete document metadata
- **Permission Management**: Fine-grained access control for documents
- **JWT Authentication**: Secure API endpoints with JWT-based authentication
- **Download Links**: Generate short-lived download links for files
- **Advanced Search**: Search documents by tags, metadata, and filename
- **Pagination**: Standard pagination support for all list endpoints

## Architecture

The system follows a clean architecture pattern with:

- **Repository Pattern**: Interface-based data access layer
- **Service Layer**: Business logic abstraction
- **Thin Controllers**: Validation, service calls, and response handling
- **Type Safety**: Full TypeScript support with Zod validation

## Tech Stack

- **Hono**: Fast HTTP framework
- **Drizzle ORM**: Type-safe SQL ORM
- **PostgreSQL**: Database
- **TypeScript**: Type safety
- **Zod**: Schema validation
- **JWT**: Authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate database migrations:
```bash
npm run db:generate
```

4. Run migrations:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Documents

#### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
metadata: {"key": "value"} (optional, JSON string)
tags: ["tag1", "tag2"] (optional, JSON string)
```

#### List Documents
```http
GET /api/documents?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Document
```http
GET /api/documents/:id
Authorization: Bearer <token>
```

#### Update Document
```http
PATCH /api/documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "new-name.pdf",
  "tags": ["tag1", "tag2"]
}
```

#### Delete Document
```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```

#### Search Documents
```http
GET /api/documents/search?tags=tag1&fileName=test&page=1&limit=10
Authorization: Bearer <token>
```

### Metadata

#### Get All Metadata
```http
GET /api/metadata/:documentId
Authorization: Bearer <token>
```

#### Get Metadata by Key
```http
GET /api/metadata/:documentId/:key
Authorization: Bearer <token>
```

#### Create Metadata
```http
POST /api/metadata/:documentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "author",
  "value": "John Doe"
}
```

#### Update Metadata
```http
PATCH /api/metadata/:documentId/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "Jane Doe"
}
```

#### Delete Metadata
```http
DELETE /api/metadata/:documentId/:id
Authorization: Bearer <token>
```

### Permissions

#### Get Document Permissions
```http
GET /api/permissions/:documentId
Authorization: Bearer <token>
```

#### Create Permission
```http
POST /api/permissions/:documentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "canRead": true,
  "canWrite": false,
  "canDelete": false
}
```

#### Update Permission
```http
PATCH /api/permissions/:documentId/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "canRead": true,
  "canWrite": true
}
```

#### Delete Permission
```http
DELETE /api/permissions/:documentId/:id
Authorization: Bearer <token>
```

### Download Links

#### Generate Download Link
```http
POST /api/download/:documentId/generate?expiresInHours=24
Authorization: Bearer <token>
```

#### Download File
```http
GET /api/download/:token
```

## Response Format

### Success Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Database Schema

- **users**: User accounts
- **documents**: Document records
- **document_metadata**: Key-value metadata for documents
- **permissions**: Document access permissions
- **download_links**: Short-lived download tokens

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Database Studio
```bash
npm run db:studio
```

## License

ISC

# headless-document-management-system
