# Spring Boot Application - TrustChain Backend

## Overview
This document provides a comprehensive overview of the generated Spring Boot application structure for the TrustChain project.

## Generated Components

### 📦 Total Files Created: 52
- **13 Entity Classes** (Model Layer)
- **13 Repository Interfaces** (Data Access Layer)
- **13 Service Classes** (Business Logic Layer)
- **13 Controller Classes** (REST API Layer)

---

## 🗂️ Package Structure

```
com.trustchain.backend
├── model/              (13 entities)
├── repository/         (13 repositories)
├── service/            (13 services)
└── controller/         (13 controllers)
```

---

## 📋 Entities and Their Relationships

### 1. **Donor** (`/api/donor`)
- **Table**: `donor`
- **Primary Key**: `donor_id` (UUID)
- **Fields**: name, password
- **Relationships**: None

### 2. **Government** (`/api/government`)
- **Table**: `government`
- **Primary Key**: `govt_id` (UUID)
- **Fields**: govt_name, password
- **Relationships**: 
  - OneToMany → Scheme

### 3. **Scheme** (`/api/scheme`)
- **Table**: `scheme`
- **Primary Key**: `scheme_id` (UUID)
- **Fields**: scheme_name, budget, start_date, end_date, is_finished
- **Relationships**: 
  - ManyToOne → Government (govt_id FK)

### 4. **NGO** (`/api/ngo`)
- **Table**: `ngo`
- **Primary Key**: `ngo_id` (UUID)
- **Fields**: name, password
- **Relationships**: None

### 5. **Manage** (`/api/manage`)
- **Table**: `manage`
- **Primary Key**: `manage_id` (UUID)
- **Relationships**: 
  - ManyToOne → NGO (ngo_id FK)
  - ManyToOne → Scheme (scheme_id FK)

### 6. **Vendor** (`/api/vendor`)
- **Table**: `vendor`
- **Primary Key**: `vendor_id` (UUID)
- **Fields**: name, password, gstin, kyc_status, wallet_address
- **Relationships**: None

### 7. **NgoVendor** (`/api/ngo-vendor`)
- **Table**: `ngo_vendor`
- **Primary Key**: `ngo_vendor_id` (UUID)
- **Fields**: status, created_at
- **Relationships**: 
  - ManyToOne → Manage (manage_id FK)
  - ManyToOne → Vendor (vendor_id FK)

### 8. **Donation** (`/api/donation`)
- **Table**: `donation`
- **Primary Key**: `donation_id` (UUID)
- **Fields**: amount, transaction_ref, timestamp
- **Relationships**: 
  - ManyToOne → Donor (donor_id FK, nullable)
  - ManyToOne → Government (govt_id FK, nullable)
  - ManyToOne → Scheme (scheme_id FK)

### 9. **Transaction** (`/api/transaction`)
- **Table**: `transaction`
- **Primary Key**: `transaction_id` (UUID)
- **Fields**: escrow_contract_address, total_amount, status, created_at
- **Relationships**: 
  - ManyToOne → Manage (manage_id FK)

### 10. **Invoice** (`/api/invoice`)
- **Table**: `invoice`
- **Primary Key**: `invoice_id` (UUID)
- **Fields**: invoice_ipfs_hash, status, created_at
- **Relationships**: 
  - ManyToOne → Vendor (vendor_id FK)
  - ManyToOne → Manage (manage_id FK)

### 11. **Receipt** (`/api/receipt`)
- **Table**: `receipt`
- **Primary Key**: `receipt_id` (UUID)
- **Fields**: receipt_ipfs_hash, status, created_at
- **Relationships**: 
  - ManyToOne → Vendor (vendor_id FK)
  - ManyToOne → Manage (manage_id FK)

### 12. **Auditor** (`/api/auditor`)
- **Table**: `auditor`
- **Primary Key**: `auditor_id` (UUID)
- **Fields**: name, password
- **Relationships**: None

### 13. **AuditLog** (`/api/audit-log`)
- **Table**: `audit_log`
- **Primary Key**: `log_id` (UUID)
- **Fields**: remarks, created_at
- **Relationships**: 
  - ManyToOne → Auditor (auditor_id FK)
  - ManyToOne → Manage (manage_id FK)

---

## 🔌 REST API Endpoints

Each entity has the following standard CRUD endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{entity}` | Get all records |
| GET | `/api/{entity}/{id}` | Get record by ID |
| POST | `/api/{entity}` | Create new record |
| PUT | `/api/{entity}/{id}` | Update existing record |
| DELETE | `/api/{entity}/{id}` | Delete record |

### Available Entity Endpoints:
- `/api/donor`
- `/api/government`
- `/api/scheme`
- `/api/ngo`
- `/api/manage`
- `/api/vendor`
- `/api/ngo-vendor`
- `/api/donation`
- `/api/transaction`
- `/api/invoice`
- `/api/receipt`
- `/api/auditor`
- `/api/audit-log`

---

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Java Version**: 17
- **Database**: PostgreSQL (Supabase)
- **ORM**: Hibernate (Spring Data JPA)
- **Build Tool**: Maven
- **Primary Key Type**: UUID

---

## 📝 Implementation Notes

### Entity Classes
- All entities use `@Entity` and `@Table` annotations
- UUID primary keys with `@GeneratedValue(strategy = GenerationType.UUID)`
- Proper JPA relationships using `@ManyToOne` and `@OneToMany`
- Foreign keys mapped with `@JoinColumn`
- Constructors, getters, and setters included

### Repository Interfaces
- All extend `JpaRepository<Entity, UUID>`
- Annotated with `@Repository`
- Provide built-in CRUD operations

### Service Classes
- Annotated with `@Service`
- Autowired repository dependencies
- Empty method stubs for CRUD operations:
  - `getAll{Entity}s()`
  - `get{Entity}ById(UUID id)`
  - `create{Entity}({Entity} entity)`
  - `update{Entity}(UUID id, {Entity} entity)`
  - `delete{Entity}(UUID id)`

### Controller Classes
- Annotated with `@RestController`
- `@RequestMapping` with appropriate base paths
- Empty REST endpoint stubs:
  - `@GetMapping` - List all
  - `@GetMapping("/{id}")` - Get by ID
  - `@PostMapping` - Create
  - `@PutMapping("/{id}")` - Update
  - `@DeleteMapping("/{id}")` - Delete

---

## ⚙️ Database Configuration

The application is configured to connect to a PostgreSQL database (Supabase):

```properties
spring.datasource.url=jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:6543/postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

**Note**: Hibernate is set to `ddl-auto=update`, which will automatically create/update database tables based on entity definitions.

---

## 🚀 Next Steps

To complete the implementation, you need to:

1. **Implement Service Methods**
   - Add business logic to service layer methods
   - Implement CRUD operations using repositories

2. **Implement Controller Endpoints**
   - Wire service methods to REST endpoints
   - Add proper HTTP status codes
   - Implement error handling

3. **Add Validation**
   - Use `@Valid` and validation annotations
   - Add custom validators if needed

4. **Add DTOs (Optional)**
   - Create Data Transfer Objects
   - Implement mappers between entities and DTOs

5. **Add Security**
   - Implement authentication/authorization
   - Secure sensitive endpoints
   - Hash passwords

6. **Add Exception Handling**
   - Create custom exceptions
   - Implement global exception handler

7. **Add Testing**
   - Write unit tests for services
   - Write integration tests for controllers

---

## 📊 Entity Relationship Diagram

```
Government (1) ──────< (N) Scheme
                           │
                           │ (N)
                           ▼
                        Manage (1) ──────< (N) NgoVendor
                           │                      │
                    (N)    │                      │ (N)
                           ▼                      ▼
                         NGO                   Vendor
                                                  │
                                                  │
                                    ┌─────────────┴─────────────┐
                                    │                           │
                                    ▼                           ▼
                                 Invoice                    Receipt
                                    │                           │
                                    └───────────┬───────────────┘
                                                │
                                                ▼
                                            Manage
                                                │
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                                    ▼                       ▼
                              Transaction              AuditLog
                                                            │
                                                            ▼
                                                        Auditor

Donation ──> Scheme
Donation ──> Donor (nullable)
Donation ──> Government (nullable)
```

---

## ✅ Generated Files Summary

### Model Package (13 files)
- Donor.java
- Government.java
- Scheme.java
- Ngo.java
- Manage.java
- Vendor.java
- NgoVendor.java
- Donation.java
- Transaction.java
- Invoice.java
- Receipt.java
- Auditor.java
- AuditLog.java

### Repository Package (13 files)
- DonorRepository.java
- GovernmentRepository.java
- SchemeRepository.java
- NgoRepository.java
- ManageRepository.java
- VendorRepository.java
- NgoVendorRepository.java
- DonationRepository.java
- TransactionRepository.java
- InvoiceRepository.java
- ReceiptRepository.java
- AuditorRepository.java
- AuditLogRepository.java

### Service Package (13 files)
- DonorService.java
- GovernmentService.java
- SchemeService.java
- NgoService.java
- ManageService.java
- VendorService.java
- NgoVendorService.java
- DonationService.java
- TransactionService.java
- InvoiceService.java
- ReceiptService.java
- AuditorService.java
- AuditLogService.java

### Controller Package (13 files)
- DonorController.java
- GovernmentController.java
- SchemeController.java
- NgoController.java
- ManageController.java
- VendorController.java
- NgoVendorController.java
- DonationController.java
- TransactionController.java
- InvoiceController.java
- ReceiptController.java
- AuditorController.java
- AuditLogController.java

---

**Generated on**: 2026-01-27  
**Framework**: Spring Boot 3.2.1  
**Java Version**: 17  
**Total Components**: 52 files
