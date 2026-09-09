# Nilvee Engineering Agency — Frontend API Integration Contract

This document provides everything needed to integrate the Nilvee Frontend with the production backend.

## 1. Global Network Environment
* **Development Base URL**: `http://localhost:3000/api/v1`
* **Content-Type**: `application/json`

---

## 2. Global Response Formats

### Standard Data Envelope (Single Objects or Mutations)
```json
{
  "success": true,
  "data": {
    "id": "b6ca3606-64e6-4d83-aea9-5ec6b1c1ec7b",
    "name": "Custom Software Development"
  }
}
```

### Standard Collection List Envelope (Paginated Listings)
```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "name": "ValidationError",
    "message": "Invalid request payload parameters supplied"
  }
}
```

---

## 3. Authentication & Protected Access Route Flow

Protected endpoints require a stateless JSON Web Token (JWT) sent via the standard HTTP Header protocol:
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN_STRING>
```

### Authenticate Admin Credentials
* **Endpoint**: `POST /auth/login`
* **Access**: Public (Max 5 attempts / min)
* **Request Payload**:
```json
{
  "email": "admin@nilvee.com",
  "password": "SuperSecurePassword123!"
}
```
* **Response Payload**: Returns a stateless token to store in client memory or storage.
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "admin": {
      "id": "2857e3c7-5f38-4c13-8d66-39bc2d4480de",
      "email": "admin@nilvee.com",
      "name": "Nilvee Master Admin"
    }
  }
}
```

### Check Authenticated Identity Profile
* **Endpoint**: `GET /auth/me`
* **Access**: Protected (Requires valid Bearer token)
* **Response Payload**:
```json
{
  "success": true,
  "data": {
    "id": "2857e3c7-5f38-4c13-8d66-39bc2d4480de",
    "email": "admin@nilvee.com",
    "name": "Nilvee Master Admin"
  }
}
```

---

## 4. Public Gateway Endpoints

### Retrieve Available Engineering Services List
* **Endpoint**: `GET /services`
* **Access**: Public
* **Response Payload**: Standard Data Envelope matching an array of active agency capabilities.

### Submit Client Project Inquiry Form
* **Endpoint**: `POST /inquiries`
* **Access**: Public (Max 10 submissions / min)
* **Request Payload**:
```json
{
  "name": "Jane Developer",
  "email": "jane@nilvee.io",
  "company": "OpenSource Inc",
  "subject": "Partnership Pricing",
  "message": "We would love to discuss outsourcing options for core infrastructure."
}
```

### Submit New Engineering Development Order
* **Endpoint**: `POST /orders`
* **Access**: Public (Max 10 submissions / min)
* **Request Payload**:
```json
{
  "clientName": "Alex Rivera",
  "clientEmail": "alex@riveratech.com",
  "serviceId": "b6ca3606-64e6-4d83-aea9-5ec6b1c1ec7b",
  "projectBrief": "Build a secure high-velocity real-time logistics analytics tracking interface map layout.",
  "estimatedBudget": "25000"
}
```

---

## 5. Protected Administrative Management Endpoints

The following routes require a valid admin Bearer token and provide complete CRUD capability for management operations.

| Method | Endpoint | Description | Query Parameters (Optional) |
| :--- | :--- | :--- | :--- |
| **GET** | `/orders` | Paginated listing of client orders | `page`, `limit`, `status` |
| **GET** | `/orders/:id` | Detailed view of a single order item | None |
| **PATCH** | `/orders/:id` | Modify order statuses or parameters | None |
| **DELETE**| `/orders/:id` | Hard delete an order from database records | None |
| **GET** | `/inquiries` | Paginated listing of submitted inquiries | `page`, `limit`, `status` |
| **GET** | `/inquiries/:id`| Detailed view of a single inquiry item | None |
| **PATCH** | `/inquiries/:id`| Modify inquiry workflow status metrics | None |
| **DELETE**| `/inquiries/:id`| Hard delete an inquiry from database records| None |
