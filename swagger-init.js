
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "info": {
      "title": "Schoolmate ERP Backend Platform API Documentation",
      "version": "1.0.0",
      "description": "Stateless, high-concurrency multi-tenant School ERP Backend Platform supporting up to 100,000 concurrent active users."
    },
    "servers": [
      {
        "url": "/api/v1",
        "description": "Local API server (v1)"
      }
    ],
    "tags": [
      {
        "name": "Module 1: Super Admin & School Tenant Management",
        "description": "Platform-level operations for super admins: school tenant CRUD, suspension, and global analytics overview."
      },
      {
        "name": "Module 2: Student Admission Management",
        "description": "End-to-end admission pipeline: application submission, document upload, verification, approval, and enrollment."
      },
      {
        "name": "Module 3: Student Profile Management",
        "description": "Student roster management: direct registration, profile updates, parent contact linking, and ID card generation."
      },
      {
        "name": "Module 4: Attendance Management",
        "description": "Attendance recording (manual bulk and RFID/biometric), class aggregates, leave requests, and reports."
      },
      {
        "name": "Module 5: Academic & Class Management",
        "description": "Academic structure: classes, sections, subjects, timetable slots, homework, exam schedules, marks entry, and report cards."
      },
      {
        "name": "Module 6: Sports & Activities Management",
        "description": "Sports catalog CRUD, student assignment/unassignment to sports, and related activities management."
      },
      {
        "name": "Module 7: Parent & Teacher Communication",
        "description": "Announcements, direct messaging channels, real-time chat history, and parent-teacher meeting scheduling."
      },
      {
        "name": "Module 8: Finance & Fee Management (Cash Payments & Invoices)",
        "description": "Fee structure configuration, yearly ledger generation, cash collection, discount application, invoices, and daily cash ledger reporting. All monetary amounts in INR (₹)."
      },
      {
        "name": "Module 9: HR & Staff Management",
        "description": "Employee onboarding, profile management, monthly payroll calculation, disbursement, and payslip history."
      },
      {
        "name": "Module 10: Transport Management",
        "description": "Bus route and vehicle registration, driver assignment, and student route allocation."
      },
      {
        "name": "Module 11: Library Management",
        "description": "Book catalog (add/update/remove), barcode-based issue/return workflows, overdue tracking, and fine settlement."
      },
      {
        "name": "Module 12: Analytics & Reporting",
        "description": "School admin dashboard KPIs, student performance progression, and teacher grade distribution aggregates."
      },
      {
        "name": "Module 13: Bulk Data Import & Export Operations",
        "description": "CSV/Excel student roster import, Excel export for students and finances, and database backup."
      },
      {
        "name": "Module 14: Firebase Notifications Management",
        "description": "FCM device token registration and deregistration for push notification delivery."
      }
    ],
    "components": {
      "securitySchemes": {
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "description": "Access token acquired via /auth/login or super-admin/auth/login endpoints."
        },
        "tenantHeader": {
          "type": "apiKey",
          "in": "header",
          "name": "X-School-ID",
          "description": "Mandatory MongoDB ObjectId Hex representing the active School tenant."
        }
      },
      "parameters": {
        "tenantHeader": {
          "name": "X-School-ID",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "example": "60d21b4667d0d8992e610c85"
          },
          "description": "MongoDB Hex ID of the School tenant. Mandatory for all tenant endpoints."
        },
        "pageQuery": {
          "name": "page",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "default": 1,
            "example": 1
          },
          "description": "Standard pagination page number (1-indexed)."
        },
        "limitQuery": {
          "name": "limit",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "default": 50,
            "maximum": 100,
            "example": 50
          },
          "description": "Standard page size limit. Maximum 100 records per page."
        },
        "fieldsQuery": {
          "name": "fields",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "example": "firstName,lastName,enrollmentNumber"
          },
          "description": "Projection fields. Comma-separated field names to include in the response (e.g. firstName,lastName)."
        }
      },
      "schemas": {
        "School": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c85"
            },
            "name": {
              "type": "string",
              "example": "Greenwood High International School"
            },
            "registrationNumber": {
              "type": "string",
              "example": "REG-2026-90231"
            },
            "address": {
              "type": "string",
              "example": "123 Tech Parkway, Bengaluru"
            },
            "contactEmail": {
              "type": "string",
              "example": "admin@greenwoodhigh.edu.in"
            },
            "contactPhone": {
              "type": "string",
              "example": "+91-80-2345-6789"
            },
            "status": {
              "type": "string",
              "enum": [
                "ACTIVE",
                "SUSPENDED"
              ],
              "example": "ACTIVE"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "User": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c86"
            },
            "schoolId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c85"
            },
            "username": {
              "type": "string",
              "example": "johndoe"
            },
            "email": {
              "type": "string",
              "example": "johndoe@schoolmate.io"
            },
            "role": {
              "type": "string",
              "enum": [
                "SUPER_ADMIN",
                "SCHOOL_ADMIN",
                "ACADEMIC_ADMIN",
                "TEACHER",
                "ACCOUNTANT",
                "LIBRARIAN",
                "DRIVER",
                "PARENT",
                "STUDENT"
              ],
              "example": "TEACHER"
            },
            "firstName": {
              "type": "string",
              "example": "John"
            },
            "lastName": {
              "type": "string",
              "example": "Doe"
            },
            "phone": {
              "type": "string",
              "example": "+91-98765-43210"
            },
            "status": {
              "type": "string",
              "enum": [
                "ACTIVE",
                "INACTIVE"
              ],
              "example": "ACTIVE"
            }
          }
        },
        "Student": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c87"
            },
            "schoolId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c85"
            },
            "enrollmentNumber": {
              "type": "string",
              "example": "STU-2026-0001"
            },
            "firstName": {
              "type": "string",
              "example": "Priya"
            },
            "lastName": {
              "type": "string",
              "example": "Sharma"
            },
            "gender": {
              "type": "string",
              "example": "FEMALE"
            },
            "dateOfBirth": {
              "type": "string",
              "format": "date",
              "example": "2012-05-14"
            },
            "emergencyContact": {
              "type": "string",
              "example": "+91-98001-11223"
            },
            "photoUrl": {
              "type": "string",
              "example": "/uploads/student_priya.webp"
            },
            "status": {
              "type": "string",
              "enum": [
                "APPLIED",
                "VERIFIED",
                "APPROVED",
                "ENROLLED",
                "REJECTED"
              ],
              "example": "ENROLLED"
            },
            "parentContact": {
              "type": "object",
              "properties": {
                "fatherName": {
                  "type": "string",
                  "example": "Ramesh Sharma"
                },
                "motherName": {
                  "type": "string",
                  "example": "Sunita Sharma"
                },
                "primaryPhone": {
                  "type": "string",
                  "example": "+91-98765-00001"
                },
                "homeAddress": {
                  "type": "string",
                  "example": "45 MG Road, Bengaluru 560001"
                }
              }
            },
            "classId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c88"
            },
            "sectionId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c89"
            }
          }
        },
        "ErrorResponse": {
          "type": "object",
          "properties": {
            "success": {
              "type": "boolean",
              "example": false
            },
            "message": {
              "type": "string",
              "example": "Resource not found."
            },
            "code": {
              "type": "string",
              "example": "NOT_FOUND"
            }
          }
        },
        "PaginatedMeta": {
          "type": "object",
          "properties": {
            "page": {
              "type": "integer",
              "example": 1
            },
            "limit": {
              "type": "integer",
              "example": 50
            },
            "total": {
              "type": "integer",
              "example": 320
            },
            "totalPages": {
              "type": "integer",
              "example": 7
            }
          }
        },
        "Homework": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c93"
            },
            "schoolId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c85"
            },
            "classId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610888"
            },
            "sectionId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610889"
            },
            "subjectId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c91"
            },
            "teacherId": {
              "type": "string",
              "example": "60d21b4667d0d8992e610c86"
            },
            "title": {
              "type": "string",
              "example": "Chapter 5 — Newton's Laws of Motion problems"
            },
            "description": {
              "type": "string",
              "example": "Solve all numerical questions."
            },
            "dueDate": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-30T23:59:00.000Z"
            },
            "submissions": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "example": "60d21b4667d0d8992e610c94"
                  },
                  "studentId": {
                    "type": "string",
                    "example": "60d21b4667d0d8992e610c87"
                  },
                  "textSubmission": {
                    "type": "string",
                    "example": "F = ma. For Q1: F = 10N"
                  },
                  "attachmentUrl": {
                    "type": "string",
                    "example": "/uploads/hw/submission.pdf"
                  },
                  "grade": {
                    "type": "string",
                    "example": "A+"
                  },
                  "marks": {
                    "type": "number",
                    "example": 95
                  },
                  "feedback": {
                    "type": "string",
                    "example": "Excellent work!"
                  },
                  "isEvaluated": {
                    "type": "boolean",
                    "example": true
                  },
                  "submittedAt": {
                    "type": "string",
                    "format": "date-time"
                  }
                }
              }
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        }
      }
    },
    "paths": {
      "/super-admin/auth/login": {
        "post": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Authenticate Super Admin",
          "description": "Authenticates the platform-wide Super Admin using email/password credentials. Returns a signed JWT access token and a refresh token on success.",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email",
                    "password"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "superadmin@schoolmate.io",
                      "description": "Registered super admin email address."
                    },
                    "password": {
                      "type": "string",
                      "example": "S3cur3P@ssw0rd!",
                      "description": "Super admin account password."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Super Admin successfully authenticated. Returns JWT tokens.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "accessToken": {
                        "type": "string",
                        "example": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                      },
                      "refreshToken": {
                        "type": "string",
                        "example": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Missing required credentials (email or password).",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid email or password.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Authenticate General User (Parent, Student, Teacher, etc.)",
          "description": "Authenticates a general platform user (Student, Parent, Teacher, Librarian, Accountant, etc.) using email/username and password. Returns a signed JWT access token and a refresh token on success.",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "password"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "parent.liam.smith@schoolmate.com",
                      "description": "Registered user email address (optional if username is provided)."
                    },
                    "username": {
                      "type": "string",
                      "example": "parent_liam.smith",
                      "description": "Registered username (optional if email is provided)."
                    },
                    "password": {
                      "type": "string",
                      "example": "parent123",
                      "description": "User account password."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User successfully authenticated. Returns JWT tokens and user profile.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Authenticated successfully."
                      },
                      "accessToken": {
                        "type": "string",
                        "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      },
                      "refreshToken": {
                        "type": "string",
                        "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      },
                      "user": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610c86"
                          },
                          "email": {
                            "type": "string",
                            "example": "parent.liam.smith@schoolmate.com"
                          },
                          "username": {
                            "type": "string",
                            "example": "parent_liam.smith"
                          },
                          "role": {
                            "type": "string",
                            "example": "PARENT"
                          },
                          "firstName": {
                            "type": "string",
                            "example": "Arthur"
                          },
                          "lastName": {
                            "type": "string",
                            "example": "Smith"
                          },
                          "schoolId": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610c85"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Missing required credentials (identifier or password).",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid email/username or password.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Account is deactivated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/auth/refresh": {
        "post": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Refresh User Access Token",
          "description": "Exchanges a valid 7-day refresh token for a brand new access token and a rotating refresh token. Unified endpoint for all users, including parents, students, teachers, librarians, and super admins.",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "refreshToken"
                  ],
                  "properties": {
                    "refreshToken": {
                      "type": "string",
                      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      "description": "Valid, unexpired JWT refresh token acquired from previous login or refresh."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "New tokens successfully issued.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "accessToken": {
                        "type": "string",
                        "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      },
                      "refreshToken": {
                        "type": "string",
                        "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Missing required refreshToken parameter.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid, malformed or expired refresh token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/super-admin/schools": {
        "post": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Register New School Tenant",
          "description": "Registers a new school institution as an isolated tenant on the global platform. Provisions a dedicated database namespace and default SCHOOL_ADMIN user. Requires SUPER_ADMIN JWT.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "name",
                    "registrationNumber",
                    "address",
                    "contactEmail",
                    "contactPhone"
                  ],
                  "properties": {
                    "name": {
                      "type": "string",
                      "example": "Delhi Public School, Dwarka",
                      "description": "Official school name."
                    },
                    "registrationNumber": {
                      "type": "string",
                      "example": "REG-DPS-2026-001",
                      "description": "Unique government registration number."
                    },
                    "address": {
                      "type": "string",
                      "example": "Sector 10, Dwarka, New Delhi 110075",
                      "description": "Full postal address."
                    },
                    "contactEmail": {
                      "type": "string",
                      "format": "email",
                      "example": "principal@dpsdwarka.edu.in",
                      "description": "Primary contact email."
                    },
                    "contactPhone": {
                      "type": "string",
                      "example": "+91-11-2800-1234",
                      "description": "Primary contact phone number."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "School tenant registered successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/School"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges. SUPER_ADMIN role required.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "409": {
              "description": "Registration number already exists on the platform.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "List Registered Schools",
          "description": "Retrieves a paginated list of all school tenants registered on the platform. Supports pagination. Requires SUPER_ADMIN JWT.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated school tenant list returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/School"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/super-admin/schools/{id}": {
        "get": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Get School Details",
          "description": "Fetches structural details for a specific registered school tenant by its MongoDB ObjectId. Requires SUPER_ADMIN JWT.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c85"
              },
              "description": "MongoDB ObjectId of the target school tenant."
            }
          ],
          "responses": {
            "200": {
              "description": "School details returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/School"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "School tenant not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "put": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Update School Details",
          "description": "Updates operational parameters (name, address, contact details) of an existing school tenant. Requires SUPER_ADMIN JWT.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c85"
              },
              "description": "MongoDB ObjectId of the target school tenant."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "example": "Delhi Public School, Dwarka (Updated)"
                    },
                    "address": {
                      "type": "string",
                      "example": "Plot 7, Sector 10, Dwarka, New Delhi 110075"
                    },
                    "contactEmail": {
                      "type": "string",
                      "format": "email",
                      "example": "info@dpsdwarka.edu.in"
                    },
                    "contactPhone": {
                      "type": "string",
                      "example": "+91-11-2800-9999"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "School details updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/School"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "School tenant not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "delete": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Soft-Delete School Tenant",
          "description": "Soft-deletes a school tenant and flags status as SUSPENDED, queuing cascading background cleanup tasks. Data is retained for 90 days before permanent erasure.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c85"
              },
              "description": "MongoDB ObjectId of the school tenant to delete."
            }
          ],
          "responses": {
            "200": {
              "description": "School successfully marked as deleted/suspended.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "School tenant suspended and queued for cleanup."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "School tenant not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/super-admin/schools/{id}/suspend": {
        "patch": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Toggle School Suspension",
          "description": "Instantly suspends or reactivates a school tenant on the global platform. Suspended schools cannot authenticate or access any API endpoints.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c85"
              },
              "description": "MongoDB ObjectId of the target school tenant."
            }
          ],
          "responses": {
            "200": {
              "description": "Suspension status toggled successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "status": {
                        "type": "string",
                        "enum": [
                          "ACTIVE",
                          "SUSPENDED"
                        ],
                        "example": "SUSPENDED"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "School tenant not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/super-admin/analytics/overview": {
        "get": {
          "tags": [
            "Module 1: Super Admin & School Tenant Management"
          ],
          "summary": "Fetch Platform Overview KPIs",
          "description": "Returns global control analytics including total school count, active platform users, suspended tenants, and server health metrics.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Platform overview metrics returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "totalSchools": {
                            "type": "integer",
                            "example": 142
                          },
                          "activeSchools": {
                            "type": "integer",
                            "example": 138
                          },
                          "suspendedSchools": {
                            "type": "integer",
                            "example": 4
                          },
                          "totalUsers": {
                            "type": "integer",
                            "example": 98340
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/admissions/apply": {
        "post": {
          "tags": [
            "Module 2: Student Admission Management"
          ],
          "summary": "Submit Admission Application",
          "description": "Registers a prospective student application. The initial status is set to APPLIED. No authentication required — intended for parents/guardians applying online.",
          "security": [
            {
              "tenantHeader": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "firstName",
                    "lastName",
                    "gender",
                    "dateOfBirth",
                    "emergencyContact",
                    "parentContact"
                  ],
                  "properties": {
                    "firstName": {
                      "type": "string",
                      "example": "Priya",
                      "description": "Applicant first name."
                    },
                    "lastName": {
                      "type": "string",
                      "example": "Sharma",
                      "description": "Applicant last name."
                    },
                    "gender": {
                      "type": "string",
                      "enum": [
                        "MALE",
                        "FEMALE",
                        "OTHER"
                      ],
                      "example": "FEMALE",
                      "description": "Applicant gender."
                    },
                    "dateOfBirth": {
                      "type": "string",
                      "format": "date",
                      "example": "2012-05-14",
                      "description": "Date of birth (YYYY-MM-DD)."
                    },
                    "emergencyContact": {
                      "type": "string",
                      "example": "+91-98001-11223",
                      "description": "Emergency contact phone number."
                    },
                    "parentContact": {
                      "type": "object",
                      "required": [
                        "fatherName",
                        "motherName",
                        "primaryPhone",
                        "homeAddress"
                      ],
                      "properties": {
                        "fatherName": {
                          "type": "string",
                          "example": "Ramesh Sharma"
                        },
                        "motherName": {
                          "type": "string",
                          "example": "Sunita Sharma"
                        },
                        "primaryPhone": {
                          "type": "string",
                          "example": "+91-98765-00001"
                        },
                        "homeAddress": {
                          "type": "string",
                          "example": "45 MG Road, Bengaluru 560001"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Admission application registered successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "applicationId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610c90"
                      },
                      "status": {
                        "type": "string",
                        "example": "APPLIED"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid or missing required fields.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/admissions/applications": {
        "get": {
          "tags": [
            "Module 2: Student Admission Management"
          ],
          "summary": "List Admission Applications",
          "description": "Retrieves a paginated list of all admission applications, optionally filtered by status. Requires SCHOOL_ADMIN or ACADEMIC_ADMIN privileges.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "APPLIED",
                  "VERIFIED",
                  "APPROVED",
                  "ENROLLED",
                  "REJECTED"
                ],
                "example": "APPLIED"
              },
              "description": "Filter applications by their current status."
            },
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated list of admission applications returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Student"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/admissions/applications/{id}": {
        "get": {
          "tags": [
            "Module 2: Student Admission Management"
          ],
          "summary": "Fetch Single Application Details",
          "description": "Retrieves the full details of a single admission application including uploaded documents and status history.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c90"
              },
              "description": "MongoDB ObjectId of the admission application."
            }
          ],
          "responses": {
            "200": {
              "description": "Application details returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/Student"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Application not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/admissions/applications/{id}/documents": {
        "post": {
          "tags": [
            "Module 2: Student Admission Management"
          ],
          "summary": "Upload Applicant Document",
          "description": "Uploads an applicant credential document (e.g. Birth Certificate, previous marksheets, Transfer Certificate) via multipart form-data. Files are stored in object storage and linked to the application.",
          "security": [
            {
              "tenantHeader": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c90"
              },
              "description": "MongoDB ObjectId of the target admission application."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "documentType",
                    "file"
                  ],
                  "properties": {
                    "documentType": {
                      "type": "string",
                      "enum": [
                        "BIRTH_CERTIFICATE",
                        "MARKSHEET",
                        "TRANSFER_CERTIFICATE",
                        "PHOTO",
                        "AADHAR_CARD"
                      ],
                      "example": "BIRTH_CERTIFICATE",
                      "description": "Category of the document being uploaded."
                    },
                    "file": {
                      "type": "string",
                      "format": "binary",
                      "description": "Document file (PDF, JPG, PNG, max 5MB)."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Document uploaded and linked to the application.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "documentUrl": {
                        "type": "string",
                        "example": "/uploads/docs/birth_cert_priya.pdf"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid document type or missing file.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Application not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/admissions/applications/{id}/verify": {
        "patch": {
          "tags": [
            "Module 2: Student Admission Management"
          ],
          "summary": "Verify Applicant Credentials",
          "description": "Marks the uploaded documents of an application as verified by an admin. Moves application status from APPLIED to VERIFIED.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c90"
              },
              "description": "MongoDB ObjectId of the admission application."
            }
          ],
          "responses": {
            "200": {
              "description": "Application documents marked as verified. Status → VERIFIED.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "status": {
                        "type": "string",
                        "example": "VERIFIED"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Application not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/admissions/applications/{id}/approve": {
        "patch": {
          "tags": [
            "Module 2: Student Admission Management"
          ],
          "summary": "Approve Admission Application",
          "description": "Approves a verified admission application. Moves status from VERIFIED to APPROVED. After approval, the application is eligible for enrollment.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c90"
              },
              "description": "MongoDB ObjectId of the admission application."
            }
          ],
          "responses": {
            "200": {
              "description": "Application moved to APPROVED state.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "status": {
                        "type": "string",
                        "example": "APPROVED"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Application not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/admissions/applications/{id}/enroll": {
        "post": {
          "tags": [
            "Module 2: Student Admission Management"
          ],
          "summary": "Enroll Approved Student",
          "description": "Concludes the admission workflow by enrolling an APPROVED applicant. Generates an official enrollment number, creates the Student profile, allocates to the specified class/section, and provisions a parent login.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c90"
              },
              "description": "MongoDB ObjectId of the approved admission application."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "classId",
                    "sectionId"
                  ],
                  "properties": {
                    "classId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c88",
                      "description": "Target class MongoDB ObjectId."
                    },
                    "sectionId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c89",
                      "description": "Target section MongoDB ObjectId."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Student enrolled successfully. Enrollment number generated.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "enrollmentNumber": {
                        "type": "string",
                        "example": "STU-2026-0042"
                      },
                      "studentId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610c87"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Application, class, or section not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/students": {
        "post": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "Administrative Student Registration",
          "description": "Directly registers a student without going through the admission pipeline. Used for bulk administrative onboarding. Requires SCHOOL_ADMIN privileges.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "firstName",
                    "lastName",
                    "gender",
                    "dateOfBirth",
                    "emergencyContact",
                    "classId",
                    "sectionId"
                  ],
                  "properties": {
                    "firstName": {
                      "type": "string",
                      "example": "Rahul",
                      "description": "Student first name."
                    },
                    "lastName": {
                      "type": "string",
                      "example": "Verma",
                      "description": "Student last name."
                    },
                    "gender": {
                      "type": "string",
                      "enum": [
                        "MALE",
                        "FEMALE",
                        "OTHER"
                      ],
                      "example": "MALE"
                    },
                    "dateOfBirth": {
                      "type": "string",
                      "format": "date",
                      "example": "2011-08-20"
                    },
                    "emergencyContact": {
                      "type": "string",
                      "example": "+91-98001-55678"
                    },
                    "classId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c88"
                    },
                    "sectionId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c89"
                    },
                    "parentContact": {
                      "type": "object",
                      "properties": {
                        "fatherName": {
                          "type": "string",
                          "example": "Suresh Verma"
                        },
                        "motherName": {
                          "type": "string",
                          "example": "Anita Verma"
                        },
                        "primaryPhone": {
                          "type": "string",
                          "example": "+91-99887-66554"
                        },
                        "homeAddress": {
                          "type": "string",
                          "example": "12 Nehru Nagar, Jaipur 302001"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Student successfully registered and enrollment number assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/Student"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "Query Student Profiles",
          "description": "Returns a paginated, filterable roster of student profiles. Can be filtered by classId and sectionId. Supports field projection via the `fields` query parameter.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "classId",
              "in": "query",
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c88"
              },
              "description": "Filter by class MongoDB ObjectId."
            },
            {
              "name": "sectionId",
              "in": "query",
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c89"
              },
              "description": "Filter by section MongoDB ObjectId."
            },
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            },
            {
              "$ref": "#/components/parameters/fieldsQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated student roster returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Student"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/students/{id}": {
        "get": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "Get Student Profile Card",
          "description": "Returns the complete profile card for a specific student including parent contact details, class/section assignment, and academic status.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "responses": {
            "200": {
              "description": "Student profile card returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/Student"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "put": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "Update Student Profile",
          "description": "Updates mutable fields on a student profile such as medical details and blood group. Used by school admin or medical staff.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "medicalDetails": {
                      "type": "string",
                      "example": "Mild asthma — carries inhaler. No nut allergy."
                    },
                    "bloodGroup": {
                      "type": "string",
                      "enum": [
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "AB+",
                        "AB-",
                        "O+",
                        "O-"
                      ],
                      "example": "O+"
                    },
                    "emergencyContact": {
                      "type": "string",
                      "example": "+91-98001-11223"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Student profile updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/Student"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "delete": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "De-enroll / Soft-Delete Student",
          "description": "Soft-deletes a student record by setting their status to DE-ENROLLED. All historical data is preserved for reporting and audit.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "responses": {
            "200": {
              "description": "Student status updated to DE-ENROLLED.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Student de-enrolled successfully."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/students/{id}/id-card": {
        "get": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "Generate Student ID Card Layout",
          "description": "Returns structured ID card data payload (name, photo, enrollment number, class, QR code) ready for client-side rendering or PDF generation.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "responses": {
            "200": {
              "description": "ID Card layout payload returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "name": {
                            "type": "string",
                            "example": "Priya Sharma"
                          },
                          "enrollmentNumber": {
                            "type": "string",
                            "example": "STU-2026-0001"
                          },
                          "className": {
                            "type": "string",
                            "example": "Grade 9 - Section A"
                          },
                          "photoUrl": {
                            "type": "string",
                            "example": "/uploads/student_priya.webp"
                          },
                          "qrCodeData": {
                            "type": "string",
                            "example": "STU-2026-0001|60d21b4667d0d8992e610c87"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/students/{id}/parent": {
        "put": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "Link / Update Parent Contacts",
          "description": "Links or updates parent/guardian contact details denormalized on the student record. Used to update contact info without going through the full admission pipeline.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "primaryPhone"
                  ],
                  "properties": {
                    "fatherName": {
                      "type": "string",
                      "example": "Ramesh Sharma"
                    },
                    "motherName": {
                      "type": "string",
                      "example": "Sunita Sharma"
                    },
                    "primaryPhone": {
                      "type": "string",
                      "example": "+91-98765-00001",
                      "description": "Primary guardian phone number."
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "ramesh.sharma@gmail.com"
                    },
                    "homeAddress": {
                      "type": "string",
                      "example": "45 MG Road, Bengaluru 560001"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Parent contact details updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Parent details linked successfully."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/students/trigger-birthdays": {
        "post": {
          "tags": [
            "Module 3: Student Profile Management"
          ],
          "summary": "Trigger Daily Birthday Notifications",
          "description": "Scans for students celebrating birthdays today and dispatches push notifications and SMS alerts to their respective parents.",
          "security": [
            {
              "tenantHeader": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "responses": {
            "200": {
              "description": "Birthday scan and dispatch execution completed.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Birthday scanning job triggered and pushed successfully."
                      },
                      "report": {
                        "type": "object",
                        "properties": {
                          "scannedCount": {
                            "type": "integer",
                            "example": 120
                          },
                          "birthdayCount": {
                            "type": "integer",
                            "example": 2
                          },
                          "notifiedCount": {
                            "type": "integer",
                            "example": 2
                          },
                          "errors": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/attendance/record": {
        "post": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "Bulk Daily Attendance Input",
          "description": "Records daily attendance for an entire class section in bulk. Each record contains the student ID and their presence status for the given date.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "classId",
                    "sectionId",
                    "date",
                    "records"
                  ],
                  "properties": {
                    "classId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c88"
                    },
                    "sectionId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c89"
                    },
                    "date": {
                      "type": "string",
                      "format": "date",
                      "example": "2026-05-23",
                      "description": "Attendance date (YYYY-MM-DD)."
                    },
                    "records": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "required": [
                          "studentId",
                          "status"
                        ],
                        "properties": {
                          "studentId": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610c87"
                          },
                          "status": {
                            "type": "string",
                            "enum": [
                              "PRESENT",
                              "ABSENT",
                              "LATE",
                              "HALF_DAY"
                            ],
                            "example": "PRESENT"
                          },
                          "remarks": {
                            "type": "string",
                            "example": "Arrived 10 minutes late due to traffic."
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Roster attendance recorded successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "recorded": {
                        "type": "integer",
                        "example": 42,
                        "description": "Number of records saved."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/attendance/biometric-RFID": {
        "post": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "Biometric RFID Scan Check-In Callback",
          "description": "Receives scan events from physical RFID gate scanners and pushes them into high-speed BullMQ queues for asynchronous stream processing. Responds with 202 immediately without waiting for DB write.",
          "security": [
            {
              "tenantHeader": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "rfidCardCode",
                    "scannerId",
                    "timestamp"
                  ],
                  "properties": {
                    "rfidCardCode": {
                      "type": "string",
                      "example": "RFID-128301",
                      "description": "Unique RFID card identifier of the student."
                    },
                    "scannerId": {
                      "type": "string",
                      "example": "GATE-MAIN-01",
                      "description": "Identifier of the gate scanner device."
                    },
                    "timestamp": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2026-05-23T07:45:00.000Z",
                      "description": "Exact UTC timestamp of the scan event."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "202": {
              "description": "Scan event accepted and queued for processing.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Check-in event queued."
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/attendance/student/{studentId}": {
        "get": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "Fetch Student Attendance Logs",
          "description": "Returns attendance history for a specific student. Can be filtered by date range. Returns daily status and monthly summary statistics.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "studentId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            },
            {
              "name": "startDate",
              "in": "query",
              "schema": {
                "type": "string",
                "format": "date",
                "example": "2026-04-01"
              },
              "description": "Start of date range (YYYY-MM-DD)."
            },
            {
              "name": "endDate",
              "in": "query",
              "schema": {
                "type": "string",
                "format": "date",
                "example": "2026-04-30"
              },
              "description": "End of date range (YYYY-MM-DD)."
            }
          ],
          "responses": {
            "200": {
              "description": "Student attendance log history returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "date": {
                              "type": "string",
                              "format": "date",
                              "example": "2026-04-01"
                            },
                            "status": {
                              "type": "string",
                              "enum": [
                                "PRESENT",
                                "ABSENT",
                                "LATE",
                                "HALF_DAY"
                              ],
                              "example": "PRESENT"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/attendance/class/{classId}": {
        "get": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "Fetch Class Attendance Aggregates",
          "description": "Returns aggregated attendance statistics for a class on a specific date, including present/absent counts and percentage breakdowns.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "classId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c88"
              },
              "description": "MongoDB ObjectId of the class."
            },
            {
              "name": "date",
              "in": "query",
              "required": true,
              "schema": {
                "type": "string",
                "format": "date",
                "example": "2026-05-23"
              },
              "description": "Target date (YYYY-MM-DD)."
            }
          ],
          "responses": {
            "200": {
              "description": "Class attendance aggregates returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "totalStudents": {
                            "type": "integer",
                            "example": 42
                          },
                          "present": {
                            "type": "integer",
                            "example": 38
                          },
                          "absent": {
                            "type": "integer",
                            "example": 4
                          },
                          "attendancePercentage": {
                            "type": "number",
                            "example": 90.48
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Class not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/attendance/reports": {
        "get": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "Fetch Monthly/Term Attendance Reports",
          "description": "Returns compiled monthly or term-level attendance analytics including school-wide absence trends and individual student summary data.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "month",
              "in": "query",
              "schema": {
                "type": "integer",
                "example": 5
              },
              "description": "Month number (1–12)."
            },
            {
              "name": "year",
              "in": "query",
              "schema": {
                "type": "integer",
                "example": 2026
              },
              "description": "Calendar year."
            }
          ],
          "responses": {
            "200": {
              "description": "Term analytical attendance reports returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "description": "School-wide attendance analytics."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/attendance/leaves": {
        "post": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "Submit Student Leave Request",
          "description": "Registers a leave application for a student on behalf of a parent or guardian. Leave requires admin approval before being effective.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "studentId",
                    "startDate",
                    "endDate",
                    "reason"
                  ],
                  "properties": {
                    "studentId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c87"
                    },
                    "startDate": {
                      "type": "string",
                      "format": "date",
                      "example": "2026-06-01"
                    },
                    "endDate": {
                      "type": "string",
                      "format": "date",
                      "example": "2026-06-03"
                    },
                    "reason": {
                      "type": "string",
                      "example": "Family function — wedding ceremony."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Leave request submitted and pending admin approval.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "leaveId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610d00"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "List Active Leave Applications",
          "description": "Returns a paginated list of pending and recently processed student leave applications.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated leave applications returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/attendance/leaves/{id}/status": {
        "patch": {
          "tags": [
            "Module 4: Attendance Management"
          ],
          "summary": "Approve or Reject Leave Application",
          "description": "Updates the status of a pending leave application to APPROVED or REJECTED. Notifies the parent via push notification.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d00"
              },
              "description": "MongoDB ObjectId of the leave application."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "APPROVED",
                        "REJECTED"
                      ],
                      "example": "APPROVED"
                    },
                    "remarks": {
                      "type": "string",
                      "example": "Approved. Please submit medical certificate on return."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Leave status updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "status": {
                        "type": "string",
                        "example": "APPROVED"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Leave application not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/classes": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Create Academic Class Level",
          "description": "Creates a new academic class level (e.g. Grade 9, Grade 10) under the school tenant. Requires ACADEMIC_ADMIN or SCHOOL_ADMIN privileges.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "className"
                  ],
                  "properties": {
                    "className": {
                      "type": "string",
                      "example": "Grade 10",
                      "description": "Human-readable class name."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Class level created successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610c88"
                          },
                          "className": {
                            "type": "string",
                            "example": "Grade 10"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "List School Classes",
          "description": "Returns all active class levels for the school tenant, including section counts.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "List of active class levels returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/classes/{classId}/sections": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Create Section Under Class",
          "description": "Adds a new section (e.g. Section A, Section B) under an existing class level and optionally assigns a class teacher.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "classId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c88"
              },
              "description": "MongoDB ObjectId of the parent class."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "sectionName"
                  ],
                  "properties": {
                    "sectionName": {
                      "type": "string",
                      "example": "Section A"
                    },
                    "classTeacherId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the assigned class teacher."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Section created and appended to the class.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "sectionName": {
                            "type": "string",
                            "example": "Section A"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Class not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/subjects": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Create Subject Catalog Entry",
          "description": "Adds a new subject to the school subject catalog. Subjects are then linked to specific class sections and teachers.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "subjectName",
                    "subjectCode"
                  ],
                  "properties": {
                    "subjectName": {
                      "type": "string",
                      "example": "Physics",
                      "description": "Full subject name."
                    },
                    "subjectCode": {
                      "type": "string",
                      "example": "PHY-10",
                      "description": "Short unique subject code."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Subject created and added to catalog.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "subjectName": {
                            "type": "string",
                            "example": "Physics"
                          },
                          "subjectCode": {
                            "type": "string",
                            "example": "PHY-10"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "List School Subjects",
          "description": "Returns all registered subjects for the school tenant, sorted alphabetically by name.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "List of subjects returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "subjects": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "60d21b4667d0d8992e610c91"
                            },
                            "subjectName": {
                              "type": "string",
                              "example": "Physics"
                            },
                            "subjectCode": {
                              "type": "string",
                              "example": "PHY-10"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/subjects/{id}": {
        "get": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Get Subject Details",
          "description": "Fetches details of a specific subject by its ID.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c91"
              },
              "description": "MongoDB ObjectId of the subject."
            }
          ],
          "responses": {
            "200": {
              "description": "Subject details returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "subject": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610c91"
                          },
                          "subjectName": {
                            "type": "string",
                            "example": "Physics"
                          },
                          "subjectCode": {
                            "type": "string",
                            "example": "PHY-10"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Subject not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/classes/{classId}/sections/{sectionId}/subjects": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Link Subject to Section & Assign Teacher",
          "description": "Associates a subject from the catalog with a specific class section and assigns the teaching faculty for that subject-section pairing.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "classId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c88"
              },
              "description": "MongoDB ObjectId of the class."
            },
            {
              "name": "sectionId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c89"
              },
              "description": "MongoDB ObjectId of the section."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "subjectId",
                    "teacherId"
                  ],
                  "properties": {
                    "subjectId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c91",
                      "description": "MongoDB ObjectId of the subject."
                    },
                    "teacherId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the assigned teacher."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Subject linked to section and teacher assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Subject assigned to section successfully."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Class, section, subject, or teacher not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/timetable/slots": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Create Timetable Slot",
          "description": "Registers a timetable slot defining which subject is taught by which teacher in a given section on a specific day and time.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "classId",
                    "sectionId",
                    "subjectId",
                    "teacherId",
                    "dayOfWeek",
                    "startTime",
                    "endTime"
                  ],
                  "properties": {
                    "classId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c88"
                    },
                    "sectionId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c89"
                    },
                    "subjectId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c91"
                    },
                    "teacherId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86"
                    },
                    "dayOfWeek": {
                      "type": "string",
                      "enum": [
                        "MONDAY",
                        "TUESDAY",
                        "WEDNESDAY",
                        "THURSDAY",
                        "FRIDAY",
                        "SATURDAY"
                      ],
                      "example": "MONDAY"
                    },
                    "startTime": {
                      "type": "string",
                      "example": "09:00",
                      "description": "Slot start time (HH:MM, 24-hour format)."
                    },
                    "endTime": {
                      "type": "string",
                      "example": "09:45",
                      "description": "Slot end time (HH:MM, 24-hour format)."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Timetable slot created and cached.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "slotId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610c92"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/timetable/class/{classId}/section/{sectionId}": {
        "get": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Fetch Timetable Schedule Grid",
          "description": "Returns the complete weekly timetable grid for a class section. Served from Redis cache for sub-millisecond response times.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "classId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c88"
              },
              "description": "MongoDB ObjectId of the class."
            },
            {
              "name": "sectionId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c89"
              },
              "description": "MongoDB ObjectId of the section."
            }
          ],
          "responses": {
            "200": {
              "description": "Weekly timetable grid returned (from Redis cache).",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "description": "Map of dayOfWeek → array of timetable slots."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Class or section not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/homework": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Publish Homework Assignment",
          "description": "Creates and publishes a homework assignment for a class section. A push notification is dispatched to all student devices in the section.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "classId",
                    "sectionId",
                    "subjectId",
                    "title",
                    "dueDate"
                  ],
                  "properties": {
                    "classId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c88"
                    },
                    "sectionId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c89"
                    },
                    "subjectId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c91"
                    },
                    "title": {
                      "type": "string",
                      "example": "Chapter 5 — Newton's Laws of Motion problems (Q1–Q20)"
                    },
                    "description": {
                      "type": "string",
                      "example": "Solve all numerical questions. Show working clearly."
                    },
                    "dueDate": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2026-05-30T23:59:00.000Z"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Homework assignment published and notification dispatched.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Homework published."
                      },
                      "homework": {
                        "$ref": "#/components/schemas/Homework"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Query Homework Assignments",
          "description": "Returns a paginated list of homework assignments. Can be filtered by classId and sectionId.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "classId",
              "in": "query",
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c88"
              },
              "description": "Filter by class."
            },
            {
              "name": "sectionId",
              "in": "query",
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c89"
              },
              "description": "Filter by section."
            },
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated homework assignments list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "meta": {
                        "type": "object",
                        "properties": {
                          "total": {
                            "type": "integer",
                            "example": 1
                          },
                          "page": {
                            "type": "integer",
                            "example": 1
                          },
                          "limit": {
                            "type": "integer",
                            "example": 10
                          },
                          "pages": {
                            "type": "integer",
                            "example": 1
                          }
                        }
                      },
                      "homeworks": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Homework"
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/homework/{id}/submissions": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Submit Homework Answer",
          "description": "Records a student's homework submission (text or attachment URL) for a given homework assignment.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c93"
              },
              "description": "MongoDB ObjectId of the homework assignment."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "studentId"
                  ],
                  "properties": {
                    "studentId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c87"
                    },
                    "textSubmission": {
                      "type": "string",
                      "example": "F = ma. For Q1: F = 5kg × 2m/s² = 10N"
                    },
                    "attachmentUrl": {
                      "type": "string",
                      "example": "/uploads/hw/priya_phy_ch5.pdf"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Homework submission logged successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Submission logged."
                      },
                      "homework": {
                        "$ref": "#/components/schemas/Homework"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Homework assignment not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/homework/{homeworkId}/submissions/{id}/evaluate": {
        "put": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Evaluate & Grade Homework Submission",
          "description": "Allows a teacher to grade a student homework submission, assign marks, and provide written feedback.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "homeworkId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c93"
              },
              "description": "MongoDB ObjectId of the homework assignment."
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c94"
              },
              "description": "MongoDB ObjectId of the submission to evaluate."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "marks"
                  ],
                  "properties": {
                    "grade": {
                      "type": "string",
                      "example": "A+",
                      "description": "Letter grade awarded."
                    },
                    "marks": {
                      "type": "number",
                      "example": 95,
                      "description": "Numerical marks awarded."
                    },
                    "feedback": {
                      "type": "string",
                      "example": "Excellent work! Very clear and concise solutions."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Submission graded and feedback saved.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Submission graded."
                      },
                      "homework": {
                        "$ref": "#/components/schemas/Homework"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Homework or submission not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/exams": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Define Examination Structure",
          "description": "Registers a new exam event (e.g. First Term Exams, Annual Exams). Individual subject schedules are added separately via the schedules endpoint.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "examName",
                    "term"
                  ],
                  "properties": {
                    "examName": {
                      "type": "string",
                      "example": "First Term Examinations 2026"
                    },
                    "term": {
                      "type": "string",
                      "example": "Term 1",
                      "description": "Academic term identifier."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Exam structure registered.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "examId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610c95"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "List Scheduled Exams",
          "description": "Retrieves all defined examination events under the active school tenant, complete with their populated subject schedules, dates, and times.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "responses": {
            "200": {
              "description": "List of exams retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "exams": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string",
                              "example": "60d21b4667d0d8992e610c95"
                            },
                            "examName": {
                              "type": "string",
                              "example": "First Term Examinations 2026"
                            },
                            "term": {
                              "type": "string",
                              "example": "Term 1"
                            },
                            "schedules": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "subjectId": {
                                    "type": "object",
                                    "properties": {
                                      "subjectName": {
                                        "type": "string",
                                        "example": "Mathematics"
                                      },
                                      "subjectCode": {
                                        "type": "string",
                                        "example": "MATH101"
                                      }
                                    }
                                  },
                                  "examDate": {
                                    "type": "string",
                                    "format": "date-time",
                                    "example": "2026-06-15T09:00:00.000Z"
                                  },
                                  "durationMinutes": {
                                    "type": "integer",
                                    "example": 180
                                  },
                                  "maxMarks": {
                                    "type": "integer",
                                    "example": 100
                                  },
                                  "passingMarks": {
                                    "type": "integer",
                                    "example": 40
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/exams/{examId}/schedules": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Define Exam Subject Schedule",
          "description": "Creates a schedule entry for a specific subject within an exam, defining the exam date and maximum marks.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "examId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c95"
              },
              "description": "MongoDB ObjectId of the exam."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "subjectId",
                    "examDate",
                    "maxMarks"
                  ],
                  "properties": {
                    "subjectId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c91"
                    },
                    "examDate": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2026-06-15T09:00:00.000Z"
                    },
                    "maxMarks": {
                      "type": "number",
                      "example": 100,
                      "default": 100,
                      "description": "Maximum marks for this subject paper."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Exam subject schedule registered.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "scheduleId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610c96"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Exam not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/exams/schedules/{scheduleId}/marks": {
        "post": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Bulk Input Student Exam Marks",
          "description": "Bulk-enters student marks for a specific exam schedule (subject paper). Accepts an array of student–marks pairs.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "scheduleId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c96"
              },
              "description": "MongoDB ObjectId of the exam schedule entry."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "marksList"
                  ],
                  "properties": {
                    "marksList": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "required": [
                          "studentId",
                          "marksObtained"
                        ],
                        "properties": {
                          "studentId": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610c87"
                          },
                          "marksObtained": {
                            "type": "number",
                            "example": 88,
                            "description": "Marks obtained by the student in this paper."
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Exam marks recorded successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "recorded": {
                        "type": "integer",
                        "example": 42
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Schedule not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/exams/report-card/student/{studentId}": {
        "get": {
          "tags": [
            "Module 5: Academic & Class Management"
          ],
          "summary": "Generate Student Academic Report Card",
          "description": "Generates a comprehensive academic report card for a student, aggregating marks across all subjects and computing grades and overall percentage.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "studentId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "responses": {
            "200": {
              "description": "Detailed academic grade report card returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "studentName": {
                            "type": "string",
                            "example": "Priya Sharma"
                          },
                          "enrollmentNumber": {
                            "type": "string",
                            "example": "STU-2026-0001"
                          },
                          "totalPercentage": {
                            "type": "number",
                            "example": 87.4
                          },
                          "grade": {
                            "type": "string",
                            "example": "A"
                          },
                          "subjects": {
                            "type": "array",
                            "items": {
                              "type": "object"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/sports": {
        "post": {
          "tags": [
            "Module 6: Sports & Activities Management"
          ],
          "summary": "Create Sports Category",
          "description": "Registers a new sports category (e.g. Cricket, Football, Badminton) in the school catalog. Students can then be assigned to these sports.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "name"
                  ],
                  "properties": {
                    "name": {
                      "type": "string",
                      "example": "Cricket",
                      "description": "Name of the sport."
                    },
                    "coachId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the assigned sports coach/instructor."
                    },
                    "venue": {
                      "type": "string",
                      "example": "School Cricket Ground, Block C"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Sports category created successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "sportId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610ca0"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 6: Sports & Activities Management"
          ],
          "summary": "List All Sports Categories",
          "description": "Returns all registered sports categories for the school tenant, including participant counts.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Sports categories list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/sports/{id}": {
        "get": {
          "tags": [
            "Module 6: Sports & Activities Management"
          ],
          "summary": "Get Sports Category Details",
          "description": "Returns detailed information about a specific sports category including assigned students and coach details.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610ca0"
              },
              "description": "MongoDB ObjectId of the sports category."
            }
          ],
          "responses": {
            "200": {
              "description": "Sports category details returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Sports category not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "put": {
          "tags": [
            "Module 6: Sports & Activities Management"
          ],
          "summary": "Update Sports Category",
          "description": "Updates details of an existing sports category such as name, venue, or coach assignment.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610ca0"
              },
              "description": "MongoDB ObjectId of the sports category."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "example": "Cricket (Girls)"
                    },
                    "coachId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86"
                    },
                    "venue": {
                      "type": "string",
                      "example": "Indoor Cricket Nets, Block D"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Sports category updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Sports category not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "delete": {
          "tags": [
            "Module 6: Sports & Activities Management"
          ],
          "summary": "Delete Sports Category",
          "description": "Soft-deletes a sports category. All student assignments to this sport are also deactivated.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610ca0"
              },
              "description": "MongoDB ObjectId of the sports category."
            }
          ],
          "responses": {
            "200": {
              "description": "Sports category deleted successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Sports category removed."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Sports category not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/sports/{id}/assign": {
        "post": {
          "tags": [
            "Module 6: Sports & Activities Management"
          ],
          "summary": "Assign Student to Sport",
          "description": "Enrolls a student into a specific sports category. Validates that the student is not already assigned to this sport.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610ca0"
              },
              "description": "MongoDB ObjectId of the sports category."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "studentId"
                  ],
                  "properties": {
                    "studentId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c87",
                      "description": "MongoDB ObjectId of the student to assign."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Student assigned to sport successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Student assigned to Cricket."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Sports category or student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/sports/{id}/unassign": {
        "post": {
          "tags": [
            "Module 6: Sports & Activities Management"
          ],
          "summary": "Unassign Student from Sport",
          "description": "Removes a student from a sports category, deactivating their enrollment in that sport.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610ca0"
              },
              "description": "MongoDB ObjectId of the sports category."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "studentId"
                  ],
                  "properties": {
                    "studentId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c87",
                      "description": "MongoDB ObjectId of the student to unassign."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Student unassigned from sport successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Student removed from Cricket."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Sports category or student assignment not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/announcements": {
        "post": {
          "tags": [
            "Module 7: Parent & Teacher Communication"
          ],
          "summary": "Post School Announcement / Circular",
          "description": "Creates and broadcasts a school-wide announcement or notice circular to the specified audience scope. Push notifications are dispatched to all targeted devices.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title",
                    "content",
                    "audienceScope"
                  ],
                  "properties": {
                    "title": {
                      "type": "string",
                      "example": "School Holiday — Republic Day",
                      "description": "Announcement title/subject."
                    },
                    "content": {
                      "type": "string",
                      "example": "School will remain closed on January 26th for Republic Day celebrations."
                    },
                    "audienceScope": {
                      "type": "string",
                      "enum": [
                        "ALL",
                        "TEACHERS",
                        "PARENTS",
                        "STUDENTS"
                      ],
                      "example": "ALL",
                      "description": "Target audience group."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Announcement posted and notifications dispatched.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "announcementId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610cb0"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 7: Parent & Teacher Communication"
          ],
          "summary": "List Announcements / Circulars",
          "description": "Returns a paginated list of all school announcements, sorted by date (most recent first).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated announcements list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/communication/channels": {
        "post": {
          "tags": [
            "Module 7: Parent & Teacher Communication"
          ],
          "summary": "Create Direct Message Channel",
          "description": "Creates a private messaging channel between two or more participants (e.g. teacher–parent). Backed by WebSocket real-time delivery.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "participants"
                  ],
                  "properties": {
                    "participants": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610c86"
                      },
                      "description": "Array of participant User MongoDB ObjectIds.",
                      "example": [
                        "60d21b4667d0d8992e610c86",
                        "60d21b4667d0d8992e610c85"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Messaging channel established.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "channelId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610cc0"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/communication/channels/{id}/messages": {
        "post": {
          "tags": [
            "Module 7: Parent & Teacher Communication"
          ],
          "summary": "Send Direct Message",
          "description": "Sends a text message from a sender to a channel. The message is delivered in real-time via WebSocket to all active channel participants.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610cc0"
              },
              "description": "MongoDB ObjectId of the messaging channel."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "senderId",
                    "messageText"
                  ],
                  "properties": {
                    "senderId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the message sender."
                    },
                    "messageText": {
                      "type": "string",
                      "example": "Hello, I would like to discuss Priya's performance in Physics this term."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Message sent and delivered via WebSocket.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "messageId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610cd0"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Channel not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 7: Parent & Teacher Communication"
          ],
          "summary": "Get Channel Message History",
          "description": "Retrieves paginated message history for a specific channel, ordered from most recent to oldest.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610cc0"
              },
              "description": "MongoDB ObjectId of the messaging channel."
            },
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated message history returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Channel not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/communication/meetings/schedule": {
        "post": {
          "tags": [
            "Module 7: Parent & Teacher Communication"
          ],
          "summary": "Schedule Parent-Teacher Meeting (PTM)",
          "description": "Books a parent-teacher meeting slot. A real-time push notification is dispatched to both the teacher and the parent confirming the appointment details.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "teacherId",
                    "parentId",
                    "meetingDate"
                  ],
                  "properties": {
                    "teacherId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the teacher."
                    },
                    "parentId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c85",
                      "description": "MongoDB ObjectId of the parent user."
                    },
                    "meetingDate": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2026-06-10T10:00:00.000Z",
                      "description": "Scheduled meeting date and time (UTC)."
                    },
                    "agenda": {
                      "type": "string",
                      "example": "Discuss Priya's term performance and attendance."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Meeting booked and push notifications dispatched to both parties.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "meetingId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610ce0"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/communication/meetings": {
        "get": {
          "tags": [
            "Module 7: Parent & Teacher Communication"
          ],
          "summary": "List Parent-Teacher Meetings (PTM)",
          "description": "Retrieves a list of scheduled parent-teacher meetings under the active school tenant. For teachers and parents, results are automatically scoped to their own profile for security. Admins can view all scheduled meetings.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "teacherId",
              "in": "query",
              "required": false,
              "schema": {
                "type": "string"
              },
              "description": "Filter by teacher ID (ignored for logged-in teachers)."
            },
            {
              "name": "parentId",
              "in": "query",
              "required": false,
              "schema": {
                "type": "string"
              },
              "description": "Filter by parent ID (ignored for logged-in parents)."
            },
            {
              "name": "status",
              "in": "query",
              "required": false,
              "schema": {
                "type": "string",
                "enum": [
                  "SCHEDULED",
                  "COMPLETED",
                  "CANCELLED"
                ]
              },
              "description": "Filter by meeting status."
            }
          ],
          "responses": {
            "200": {
              "description": "List of scheduled meetings retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "meetings": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string",
                              "example": "60d21b4667d0d8992e610ce0"
                            },
                            "meetingDate": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2026-06-10T10:00:00.000Z"
                            },
                            "agenda": {
                              "type": "string",
                              "example": "Discuss Priya's term performance."
                            },
                            "status": {
                              "type": "string",
                              "example": "SCHEDULED"
                            },
                            "teacherId": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string",
                                  "example": "60d21b4667d0d8992e610c86"
                                },
                                "firstName": {
                                  "type": "string",
                                  "example": "Arthur"
                                },
                                "lastName": {
                                  "type": "string",
                                  "example": "Dent"
                                },
                                "email": {
                                  "type": "string",
                                  "example": "arthur.dent@schoolmate.com"
                                }
                              }
                            },
                            "parentId": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string",
                                  "example": "60d21b4667d0d8992e610c85"
                                },
                                "firstName": {
                                  "type": "string",
                                  "example": "Ford"
                                },
                                "lastName": {
                                  "type": "string",
                                  "example": "Prefect"
                                },
                                "email": {
                                  "type": "string",
                                  "example": "ford.prefect@schoolmate.com"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/structures": {
        "post": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "Configure Class Baseline Fee Structure",
          "description": "Defines the baseline fee structure (amount in INR ₹) for a class with a specified payment interval. This structure is used to generate yearly ledger entries for all students in that class.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "classId",
                    "baseFeeAmount",
                    "feeInterval"
                  ],
                  "properties": {
                    "classId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c88",
                      "description": "MongoDB ObjectId of the target class."
                    },
                    "baseFeeAmount": {
                      "type": "number",
                      "example": 12500,
                      "description": "Base fee amount in INR (₹). E.g. ₹12,500 per term."
                    },
                    "feeInterval": {
                      "type": "string",
                      "enum": [
                        "MONTHLY",
                        "QUARTERLY",
                        "YEARLY"
                      ],
                      "example": "QUARTERLY",
                      "description": "Fee payment frequency."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Base fee structure configured successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "structureId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610cf0"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges. ACCOUNTANT or SCHOOL_ADMIN required.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "View Baseline Fee Structures",
          "description": "Returns all active class fee structures, including amounts in INR (₹), payment intervals, and linked class names.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Active fee structures list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "className": {
                              "type": "string",
                              "example": "Grade 10"
                            },
                            "baseFeeAmount": {
                              "type": "number",
                              "example": 12500,
                              "description": "Amount in INR (₹)."
                            },
                            "feeInterval": {
                              "type": "string",
                              "example": "QUARTERLY"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/generate-yearly": {
        "post": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "Generate Yearly Fee Ledger",
          "description": "Triggers a background BullMQ worker task that maps base class fee structures into individual student fee ledger entries for the academic year. Responds with 202 Accepted immediately.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "responses": {
            "202": {
              "description": "Yearly fee generation task queued and processing in background.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Fee generation task queued. This may take a few minutes."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/student/{studentId}": {
        "get": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "Check Student Outstanding Balances",
          "description": "Returns the complete fee ledger for a student, including base amount (₹), discount applied (₹), total cash paid (₹), and remaining outstanding balance (₹).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "studentId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "responses": {
            "200": {
              "description": "Student fee ledger returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "baseFee": {
                            "type": "number",
                            "example": 12500,
                            "description": "Base fee amount in INR (₹)."
                          },
                          "discountApplied": {
                            "type": "number",
                            "example": 1000,
                            "description": "Discount applied in INR (₹)."
                          },
                          "totalPaid": {
                            "type": "number",
                            "example": 7500,
                            "description": "Total amount paid in INR (₹)."
                          },
                          "outstandingBalance": {
                            "type": "number",
                            "example": 4000,
                            "description": "Remaining balance due in INR (₹)."
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student or fee ledger not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/student/{studentId}/discount": {
        "post": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "Apply Scholarship / Discount",
          "description": "Applies a scholarship or fee discount (in INR ₹) to a student's active fee ledger record. Executed within a MongoDB session transaction.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "studentId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "discountAmount",
                    "reason"
                  ],
                  "properties": {
                    "discountAmount": {
                      "type": "number",
                      "example": 2500,
                      "description": "Discount amount in INR (₹) to apply."
                    },
                    "reason": {
                      "type": "string",
                      "example": "Academic Excellence Scholarship — Top 3 rank in class."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Discount applied successfully. Ledger updated atomically.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "newBalance": {
                        "type": "number",
                        "example": 10000,
                        "description": "Updated outstanding balance in INR (₹)."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student or fee ledger not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/student/{studentId}/pay-cash": {
        "post": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "Collect Cash Payment",
          "description": "Records a cash fee payment (in INR ₹). Uses Mongoose sessions to perform double-entry accounting ledger checks atomically. Automatically generates a printed invoice on success.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "studentId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "amountPaid",
                    "receivedBy"
                  ],
                  "properties": {
                    "amountPaid": {
                      "type": "number",
                      "example": 5000,
                      "description": "Amount collected in INR (₹)."
                    },
                    "receivedBy": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the accountant collecting the payment."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Cash payment recorded and invoice generated.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "invoiceId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610d10"
                      },
                      "remainingBalance": {
                        "type": "number",
                        "example": 5000,
                        "description": "Remaining balance due in INR (₹)."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student or fee ledger not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/invoices": {
        "get": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "List School Fee Invoices",
          "description": "Returns a paginated list of all payment invoices generated for the school, sorted by date (most recent first).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated invoice list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/invoices/{id}": {
        "get": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "Fetch Individual Invoice Details",
          "description": "Returns full invoice details including student info, amount paid (₹), payment date, and accountant reference. Used for printing payment receipts.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d10"
              },
              "description": "MongoDB ObjectId of the invoice."
            }
          ],
          "responses": {
            "200": {
              "description": "Invoice receipt details returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "invoiceNumber": {
                            "type": "string",
                            "example": "INV-2026-00142"
                          },
                          "studentName": {
                            "type": "string",
                            "example": "Priya Sharma"
                          },
                          "amountPaid": {
                            "type": "number",
                            "example": 5000,
                            "description": "Amount paid in INR (₹)."
                          },
                          "paymentDate": {
                            "type": "string",
                            "format": "date-time"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Invoice not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/fees/reports/daily-cash-ledger": {
        "get": {
          "tags": [
            "Module 8: Finance & Fee Management (Cash Payments & Invoices)"
          ],
          "summary": "Daily Cash Ledger Balance Report",
          "description": "Returns the daily cash collection aggregate report for the school, showing total cash collected (₹) and transaction count for the specified date.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "date",
              "in": "query",
              "schema": {
                "type": "string",
                "format": "date",
                "example": "2026-05-23"
              },
              "description": "Target date for the ledger report (YYYY-MM-DD). Defaults to today."
            }
          ],
          "responses": {
            "200": {
              "description": "Daily cash ledger aggregate returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-05-23"
                          },
                          "totalCollected": {
                            "type": "number",
                            "example": 87500,
                            "description": "Total cash collected today in INR (₹)."
                          },
                          "transactionCount": {
                            "type": "integer",
                            "example": 18
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/hr/employees": {
        "post": {
          "tags": [
            "Module 9: HR & Staff Management"
          ],
          "summary": "Onboard Employee Profile",
          "description": "Creates a new employee profile and provisions their user account with the assigned role. Salary is stored in INR (₹).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email",
                    "firstName",
                    "lastName",
                    "role",
                    "baseSalary"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "teacher.arjun@schoolmate.io"
                    },
                    "firstName": {
                      "type": "string",
                      "example": "Arjun"
                    },
                    "lastName": {
                      "type": "string",
                      "example": "Kapoor"
                    },
                    "role": {
                      "type": "string",
                      "enum": [
                        "TEACHER",
                        "ACCOUNTANT",
                        "LIBRARIAN",
                        "DRIVER",
                        "SPORTS"
                      ],
                      "example": "TEACHER"
                    },
                    "baseSalary": {
                      "type": "number",
                      "example": 45000,
                      "description": "Monthly base salary in INR (₹)."
                    },
                    "phone": {
                      "type": "string",
                      "example": "+91-98765-12345"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Employee profile registered and user account provisioned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/User"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 9: HR & Staff Management"
          ],
          "summary": "List Employees",
          "description": "Returns a paginated list of all employee profiles, optionally filtered by role.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "role",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "TEACHER",
                  "ACCOUNTANT",
                  "LIBRARIAN",
                  "DRIVER"
                ],
                "example": "TEACHER"
              },
              "description": "Filter by employee role."
            },
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated employee list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/User"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/hr/employees/{id}": {
        "get": {
          "tags": [
            "Module 9: HR & Staff Management"
          ],
          "summary": "Get Specific Employee Profile",
          "description": "Returns the full employee profile card including role, salary details (₹), and account status.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c86"
              },
              "description": "MongoDB ObjectId of the employee user."
            }
          ],
          "responses": {
            "200": {
              "description": "Full employee profile returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/User"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Employee not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "put": {
          "tags": [
            "Module 9: HR & Staff Management"
          ],
          "summary": "Update Employee Details",
          "description": "Updates mutable fields on an employee profile such as phone number and address.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c86"
              },
              "description": "MongoDB ObjectId of the employee user."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "phone": {
                      "type": "string",
                      "example": "+91-98765-99999"
                    },
                    "address": {
                      "type": "string",
                      "example": "22 Shivaji Nagar, Pune 411005"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Employee profile updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/User"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Employee not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/hr/payroll/calculate": {
        "post": {
          "tags": [
            "Module 9: HR & Staff Management"
          ],
          "summary": "Calculate Monthly Payroll",
          "description": "Triggers a background BullMQ task to calculate payroll for all active employees for the given month/year. Deductions and allowances are applied automatically. Salaries are computed in INR (₹).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "month",
                    "year"
                  ],
                  "properties": {
                    "month": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 12,
                      "example": 5,
                      "description": "Month number (1=January, 12=December)."
                    },
                    "year": {
                      "type": "integer",
                      "example": 2026,
                      "description": "Calendar year."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "202": {
              "description": "Payroll calculation task queued.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Payroll calculation for May 2026 queued."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/hr/payroll/{id}/pay": {
        "patch": {
          "tags": [
            "Module 9: HR & Staff Management"
          ],
          "summary": "Mark Payroll Record as Paid",
          "description": "Updates a calculated payroll record to PAID status, recording the disbursement date. The net salary (₹) is locked at this point.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d20"
              },
              "description": "MongoDB ObjectId of the payroll record."
            }
          ],
          "responses": {
            "200": {
              "description": "Salary disbursed and payroll record marked PAID.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "status": {
                        "type": "string",
                        "example": "PAID"
                      },
                      "disbursedAt": {
                        "type": "string",
                        "format": "date-time"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Payroll record not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/hr/payroll/history": {
        "get": {
          "tags": [
            "Module 9: HR & Staff Management"
          ],
          "summary": "Query Payslip History Logs",
          "description": "Returns paginated payroll history records for all employees, showing salary amounts (₹), month, and disbursement status.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Payroll history records returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/transport/routes": {
        "post": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Register Bus Route",
          "description": "Creates a new bus transport route. Route fare is specified in INR (₹).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "routeName",
                    "routeFare"
                  ],
                  "properties": {
                    "routeName": {
                      "type": "string",
                      "example": "Route 7 — Koramangala to School",
                      "description": "Descriptive route name."
                    },
                    "routeFare": {
                      "type": "number",
                      "example": 1800,
                      "description": "Monthly route fare in INR (₹)."
                    },
                    "stops": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "example": [
                        "Koramangala",
                        "BTM Layout",
                        "Jayanagar",
                        "Basavanagudi"
                      ],
                      "description": "Ordered list of stop names."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Bus route created successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "routeId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610d30"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "List Active Transport Routes",
          "description": "Returns all active bus routes for the school, including stop details and assigned vehicles.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Active route list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/transport/vehicles": {
        "post": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Register Vehicle",
          "description": "Adds a new school vehicle (bus/van) to the transport fleet with its capacity and registration details.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "licensePlate",
                    "capacity"
                  ],
                  "properties": {
                    "licensePlate": {
                      "type": "string",
                      "example": "KA-09-AB-1234",
                      "description": "Vehicle registration plate number."
                    },
                    "capacity": {
                      "type": "integer",
                      "example": 52,
                      "description": "Maximum seating capacity."
                    },
                    "vehicleType": {
                      "type": "string",
                      "enum": [
                        "BUS",
                        "MINIBUS",
                        "VAN"
                      ],
                      "example": "BUS"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Vehicle registered in transport fleet.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "vehicleId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610d40"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "List Registered Vehicles",
          "description": "Retrieves a list of all registered transport vehicles (buses/vans) populated with their assigned driver profiles under the active school tenant.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "responses": {
            "200": {
              "description": "List of vehicles retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "vehicles": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string",
                              "example": "60d21b4667d0d8992e610d40"
                            },
                            "vehicleNumber": {
                              "type": "string",
                              "example": "KA-09-AB-1234"
                            },
                            "model": {
                              "type": "string",
                              "example": "Tata Starbus"
                            },
                            "capacity": {
                              "type": "integer",
                              "example": 52
                            },
                            "status": {
                              "type": "string",
                              "example": "ACTIVE"
                            },
                            "driverId": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string",
                                  "example": "60d21b4667d0d8992e610c86"
                                },
                                "firstName": {
                                  "type": "string",
                                  "example": "Ravi"
                                },
                                "lastName": {
                                  "type": "string",
                                  "example": "Kumar"
                                },
                                "phone": {
                                  "type": "string",
                                  "example": "+91-98765-43210"
                                },
                                "email": {
                                  "type": "string",
                                  "example": "ravi.kumar@schoolmate.com"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/transport/drivers": {
        "post": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Assign Driver to Vehicle",
          "description": "Links a DRIVER-role employee to a specific vehicle in the transport fleet.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "driverId",
                    "vehicleId"
                  ],
                  "properties": {
                    "driverId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the DRIVER employee."
                    },
                    "vehicleId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610d40",
                      "description": "MongoDB ObjectId of the vehicle."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Driver successfully assigned to vehicle.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Driver assigned to vehicle KA-09-AB-1234."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Driver or vehicle not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "List Registered Drivers",
          "description": "Retrieves a list of all active employee drivers registered under the active school tenant.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "responses": {
            "200": {
              "description": "List of drivers retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "drivers": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string",
                              "example": "60d21b4667d0d8992e610c86"
                            },
                            "firstName": {
                              "type": "string",
                              "example": "Ravi"
                            },
                            "lastName": {
                              "type": "string",
                              "example": "Kumar"
                            },
                            "phone": {
                              "type": "string",
                              "example": "+91-98765-43210"
                            },
                            "email": {
                              "type": "string",
                              "example": "ravi.kumar@schoolmate.com"
                            },
                            "username": {
                              "type": "string",
                              "example": "driver_ravi"
                            },
                            "status": {
                              "type": "string",
                              "example": "ACTIVE"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/transport/allocations": {
        "post": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Allocate Student to Route Stop",
          "description": "Assigns a student to a specific route and boarding/drop-off stop for daily commute.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "studentId",
                    "routeId",
                    "stopName"
                  ],
                  "properties": {
                    "studentId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c87"
                    },
                    "routeId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610d30"
                    },
                    "stopName": {
                      "type": "string",
                      "example": "BTM Layout"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Student route allocation logged successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "allocationId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610d50"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student or route not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/transport/allocations/student/{studentId}": {
        "get": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Get Student Transport Allocation",
          "description": "Returns the assigned route, vehicle, driver, and boarding stop details for a specific student.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "studentId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "responses": {
            "200": {
              "description": "Student transport allocation details returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "routeName": {
                            "type": "string",
                            "example": "Route 7 — Koramangala to School"
                          },
                          "stopName": {
                            "type": "string",
                            "example": "BTM Layout"
                          },
                          "driverName": {
                            "type": "string",
                            "example": "Raju Kumar"
                          },
                          "vehiclePlate": {
                            "type": "string",
                            "example": "KA-09-AB-1234"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student or transport allocation not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/transport/routes/{routeId}/allocations": {
        "get": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Get Route Allocations",
          "description": "Returns all student allocations for a specific bus route.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "routeId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d30"
              },
              "description": "MongoDB ObjectId of the transport route."
            }
          ],
          "responses": {
            "200": {
              "description": "Route allocations returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "allocations": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/transport/routes/{routeId}/location": {
        "get": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Get Route Telemetry Location",
          "description": "Fetches the live telemetry location (latitude and longitude) of a transport route (bus/van) from Redis cache or database.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "routeId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d30"
              },
              "description": "MongoDB ObjectId of the transport route."
            }
          ],
          "responses": {
            "200": {
              "description": "Route telemetry location returned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "location": {
                        "type": "object",
                        "properties": {
                          "routeId": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610d30"
                          },
                          "latitude": {
                            "type": "number",
                            "example": 17.5123
                          },
                          "longitude": {
                            "type": "number",
                            "example": 78.4321
                          },
                          "source": {
                            "type": "string",
                            "example": "cache",
                            "enum": [
                              "cache",
                              "db"
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "No live telemetry location found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "post": {
          "tags": [
            "Module 10: Transport Management"
          ],
          "summary": "Update Route Telemetry Location",
          "description": "Updates the live coordinate telemetry of a transport route. Requires DRIVER privileges. Throttled to skip database write if updated within 30 seconds (cached only).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "routeId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d30"
              },
              "description": "MongoDB ObjectId of the transport route."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "latitude",
                    "longitude"
                  ],
                  "properties": {
                    "latitude": {
                      "type": "number",
                      "example": 17.5123,
                      "description": "Current latitude."
                    },
                    "longitude": {
                      "type": "number",
                      "example": 78.4321,
                      "description": "Current longitude."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Telemetry updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Telemetry updated successfully (persisted)."
                      },
                      "location": {
                        "type": "object",
                        "properties": {
                          "routeId": {
                            "type": "string",
                            "example": "60d21b4667d0d8992e610d30"
                          },
                          "latitude": {
                            "type": "number",
                            "example": 17.5123
                          },
                          "longitude": {
                            "type": "number",
                            "example": 78.4321
                          },
                          "updatedAt": {
                            "type": "string",
                            "example": "2026-06-05T10:45:00.000Z"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Transport route not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/library/books": {
        "post": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "Add Book to Catalog",
          "description": "Adds a new book copy to the library catalog. Supports barcode scanner input for rapid entry. Book status defaults to AVAILABLE on creation.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title",
                    "isbn",
                    "barcode"
                  ],
                  "properties": {
                    "title": {
                      "type": "string",
                      "example": "Concepts of Physics Vol. 1",
                      "description": "Full book title."
                    },
                    "isbn": {
                      "type": "string",
                      "example": "978-81-7709-187-8",
                      "description": "ISBN-13 identifier."
                    },
                    "barcode": {
                      "type": "string",
                      "example": "LIB-BARCODE-00923",
                      "description": "Physical barcode on the book copy."
                    },
                    "author": {
                      "type": "string",
                      "example": "H.C. Verma"
                    },
                    "rackLocation": {
                      "type": "string",
                      "example": "Aisle 2, Shelf B-4",
                      "description": "Physical storage location."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Book copy added to library catalog.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "bookId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610d60"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "Search Book Catalog",
          "description": "Full-text search of the library catalog using MongoDB text indexes for sub-millisecond query responses. Supports pagination.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "q",
              "in": "query",
              "schema": {
                "type": "string",
                "example": "physics verma"
              },
              "description": "Full-text search query string (title, author, ISBN)."
            },
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Matching books returned from catalog.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/library/books/{id}": {
        "put": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "Update Book Details or Status",
          "description": "Updates a book catalog entry — typically to change the rack location or mark the copy as DAMAGED/LOST.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d60"
              },
              "description": "MongoDB ObjectId of the library book copy."
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "rackLocation": {
                      "type": "string",
                      "example": "Aisle 3, Shelf C-2"
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "AVAILABLE",
                        "ISSUED",
                        "DAMAGED",
                        "LOST"
                      ],
                      "example": "DAMAGED"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Book record updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Book not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "delete": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "Remove Book from Catalog",
          "description": "Permanently removes a book copy record from the library catalog. Only allowed if the book is not currently issued.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d60"
              },
              "description": "MongoDB ObjectId of the library book copy."
            }
          ],
          "responses": {
            "200": {
              "description": "Book record removed from catalog.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Book removed from library catalog."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Book not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/library/issues": {
        "post": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "Check Out (Issue) Book Copy",
          "description": "Issues a book copy to a student using the barcode scanner. Sets book status to ISSUED and records issue date for overdue tracking.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "studentId",
                    "barcode"
                  ],
                  "properties": {
                    "studentId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c87",
                      "description": "MongoDB ObjectId of the student borrowing the book."
                    },
                    "barcode": {
                      "type": "string",
                      "example": "LIB-BARCODE-00923",
                      "description": "Barcode of the physical book copy being issued."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Book issued to student. Issue record created.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "issueId": {
                        "type": "string",
                        "example": "60d21b4667d0d8992e610d70"
                      },
                      "dueDate": {
                        "type": "string",
                        "format": "date",
                        "example": "2026-06-07",
                        "description": "Expected return date (14 days from issue)."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student or book not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        },
        "get": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "List All Issued Books / Checkouts",
          "description": "Retrieves a list of all active or returned book checkout transactions under the active school tenant. Supports filtering by status and studentId.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "status",
              "in": "query",
              "required": false,
              "schema": {
                "type": "string",
                "enum": [
                  "ISSUED",
                  "RETURNED"
                ]
              },
              "description": "Filter by issue status."
            },
            {
              "name": "studentId",
              "in": "query",
              "required": false,
              "schema": {
                "type": "string"
              },
              "description": "Filter by student ID."
            },
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "List of borrowing records retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "meta": {
                        "type": "object",
                        "properties": {
                          "total": {
                            "type": "integer",
                            "example": 12
                          },
                          "page": {
                            "type": "integer",
                            "example": 1
                          },
                          "limit": {
                            "type": "integer",
                            "example": 50
                          },
                          "pages": {
                            "type": "integer",
                            "example": 1
                          }
                        }
                      },
                      "issues": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string",
                              "example": "60d21b4667d0d8992e610d70"
                            },
                            "bookId": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string",
                                  "example": "60d21b4667d0d8992e610d88"
                                },
                                "title": {
                                  "type": "string",
                                  "example": "To Kill a Mockingbird"
                                },
                                "barcode": {
                                  "type": "string",
                                  "example": "LIB-BARCODE-00923"
                                }
                              }
                            },
                            "studentId": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string",
                                  "example": "60d21b4667d0d8992e610c87"
                                },
                                "firstName": {
                                  "type": "string",
                                  "example": "Arthur"
                                },
                                "lastName": {
                                  "type": "string",
                                  "example": "Smith"
                                }
                              }
                            },
                            "issueDate": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2026-05-30T09:00:00.000Z"
                            },
                            "dueDate": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2026-06-13T09:00:00.000Z"
                            },
                            "status": {
                              "type": "string",
                              "example": "ISSUED"
                            },
                            "fineAmount": {
                              "type": "number",
                              "example": 0
                            },
                            "finePaid": {
                              "type": "boolean",
                              "example": true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/library/returns": {
        "post": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "Check In (Return) Book Copy",
          "description": "Processes a book return via barcode scan. Automatically calculates overdue fines if the book is returned after its due date. Returns fine amount in INR (₹) if applicable.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "barcode"
                  ],
                  "properties": {
                    "barcode": {
                      "type": "string",
                      "example": "LIB-BARCODE-00923",
                      "description": "Barcode of the book copy being returned."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Book checked in. Returns fine details if overdue.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "isOverdue": {
                        "type": "boolean",
                        "example": true
                      },
                      "fineAmount": {
                        "type": "number",
                        "example": 25,
                        "description": "Overdue fine amount in INR (₹). 0 if returned on time."
                      },
                      "daysOverdue": {
                        "type": "integer",
                        "example": 5
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Book or issue record not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/library/issues/overdue": {
        "get": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "List Overdue Book Checkouts",
          "description": "Returns a paginated list of all currently overdue book issues, including student details, days overdue, and accrued fine amounts (₹).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/pageQuery"
            },
            {
              "$ref": "#/components/parameters/limitQuery"
            }
          ],
          "responses": {
            "200": {
              "description": "Overdue book issues list returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      },
                      "meta": {
                        "$ref": "#/components/schemas/PaginatedMeta"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/library/fines/{id}/pay": {
        "post": {
          "tags": [
            "Module 11: Library Management"
          ],
          "summary": "Settle Overdue Return Fine",
          "description": "Marks a library overdue fine as settled/paid. Fine amount is in INR (₹).",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610d80"
              },
              "description": "MongoDB ObjectId of the library issue/fine record."
            }
          ],
          "responses": {
            "200": {
              "description": "Library fine settled successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Fine of ₹25 settled for issue ID 60d21b4667d0d8992e610d70."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Fine or issue record not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/analytics/school-dashboard": {
        "get": {
          "tags": [
            "Module 12: Analytics & Reporting"
          ],
          "summary": "Fetch School Admin Dashboard KPIs",
          "description": "Returns the school admin dashboard summary block: total enrollment, today's attendance rate, outstanding fee balance (₹), active staff count, and library metrics.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Dashboard KPI block returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "totalStudents": {
                            "type": "integer",
                            "example": 1243
                          },
                          "attendanceToday": {
                            "type": "number",
                            "example": 91.4,
                            "description": "Today's school-wide attendance percentage."
                          },
                          "outstandingFees": {
                            "type": "number",
                            "example": 324000,
                            "description": "Total outstanding fees across all students in INR (₹)."
                          },
                          "activeStaff": {
                            "type": "integer",
                            "example": 67
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/analytics/student-performance/{id}": {
        "get": {
          "tags": [
            "Module 12: Analytics & Reporting"
          ],
          "summary": "Get Student Performance Analytics",
          "description": "Returns time-series academic performance data for a student including exam marks progression across terms and subjects.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c87"
              },
              "description": "MongoDB ObjectId of the student."
            }
          ],
          "responses": {
            "200": {
              "description": "Student performance analytics returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "description": "Time-series performance metrics per subject."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Student not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/analytics/teacher-performance/{id}": {
        "get": {
          "tags": [
            "Module 12: Analytics & Reporting"
          ],
          "summary": "Get Teacher Performance Analytics",
          "description": "Returns grade distribution aggregates and class-level performance metrics for a teacher's assigned subjects.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "60d21b4667d0d8992e610c86"
              },
              "description": "MongoDB ObjectId of the teacher user."
            }
          ],
          "responses": {
            "200": {
              "description": "Teacher performance grade distribution aggregates returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "description": "Grade distribution metrics per subject taught."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "Teacher not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/data/import/students": {
        "post": {
          "tags": [
            "Module 13: Bulk Data Import & Export Operations"
          ],
          "summary": "Bulk Import Student Roster from CSV/Excel",
          "description": "Ingests a student roster from an uploaded CSV or Excel (.xlsx) file.\n\n**Supported formats:** CSV, XLSX\n\n**Required CSV column headers:**\n| Column | Type | Description |\n|---|---|---|\n| `firstName` | string | Student first name |\n| `lastName` | string | Student last name |\n| `gender` | MALE/FEMALE/OTHER | Gender |\n| `dateOfBirth` | YYYY-MM-DD | Date of birth |\n| `classId` | string | Class MongoDB ObjectId |\n| `sectionId` | string | Section MongoDB ObjectId |\n| `fatherName` | string | Father's name |\n| `motherName` | string | Mother's name |\n| `primaryPhone` | string | Parent primary phone |\n| `homeAddress` | string | Home address |\n| `emergencyContact` | string | Emergency phone |\n\n**CSV Example row:**\n`Priya,Sharma,FEMALE,2012-05-14,60d21b...,60d21b...,Ramesh Sharma,Sunita Sharma,+91-98765-00001,45 MG Road Bengaluru,+91-98001-11223`\n\nInvalid rows are skipped and reported in the response errors array.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary",
                      "description": "Student roster CSV or XLSX file (max 10MB)."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Student roster ingested. Returns import summary.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "imported": {
                        "type": "integer",
                        "example": 142,
                        "description": "Number of students successfully imported."
                      },
                      "skipped": {
                        "type": "integer",
                        "example": 3,
                        "description": "Number of rows skipped due to validation errors."
                      },
                      "errors": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "row": {
                              "type": "integer",
                              "example": 14
                            },
                            "reason": {
                              "type": "string",
                              "example": "Invalid dateOfBirth format."
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/data/export/students": {
        "get": {
          "tags": [
            "Module 13: Bulk Data Import & Export Operations"
          ],
          "summary": "Export Student Roster as Excel Spreadsheet",
          "description": "Generates and streams a complete student roster as an Excel (.xlsx) binary file. The file includes all student profile fields, class/section assignments, and parent contact details.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Excel student roster file streamed as binary.",
              "content": {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                  "schema": {
                    "type": "string",
                    "format": "binary",
                    "description": "XLSX binary file containing the student roster."
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/data/export/finances": {
        "get": {
          "tags": [
            "Module 13: Bulk Data Import & Export Operations"
          ],
          "summary": "Export Financial Data as Excel Spreadsheet",
          "description": "Generates and streams a complete financial report as an Excel (.xlsx) binary file. Includes all invoices, fee ledgers, cash collections (₹), and outstanding balances.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Excel financial report file streamed as binary.",
              "content": {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                  "schema": {
                    "type": "string",
                    "format": "binary",
                    "description": "XLSX binary file containing financial data."
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/data/system/backup": {
        "post": {
          "tags": [
            "Module 13: Bulk Data Import & Export Operations"
          ],
          "summary": "Trigger Database Backup",
          "description": "Triggers a full MongoDB database backup dump for the school tenant. The backup is stored in object storage and a download link is emailed to the SCHOOL_ADMIN.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "responses": {
            "200": {
              "description": "Database backup initiated.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Backup initiated. Download link will be emailed to the school admin."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges. SCHOOL_ADMIN required.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/uploads/test": {
        "post": {
          "tags": [
            "Module 13: Bulk Data Import & Export Operations"
          ],
          "summary": "Developer Upload Pipeline Test",
          "description": "Testing endpoint to upload a single file. Supported files include images, documents, and spreadsheets up to 10MB.",
          "security": [
            {
              "tenantHeader": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary",
                      "description": "The file to upload."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "File uploaded successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Single file uploaded and stored successfully."
                      },
                      "file": {
                        "type": "object",
                        "properties": {
                          "filename": {
                            "type": "string",
                            "example": "1717234567890-test.pdf"
                          },
                          "path": {
                            "type": "string",
                            "example": "/uploads/1717234567890-test.pdf"
                          },
                          "size": {
                            "type": "integer",
                            "example": 1048576
                          },
                          "mimetype": {
                            "type": "string",
                            "example": "application/pdf"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/notifications/fcm-token": {
        "post": {
          "tags": [
            "Module 14: Firebase Notifications Management"
          ],
          "summary": "Register Client Device FCM Token",
          "description": "Registers a Firebase Cloud Messaging (FCM) device token for the authenticated user. Tokens are used to deliver targeted push notifications to specific devices.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "token",
                    "deviceType"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string",
                      "example": "60d21b4667d0d8992e610c86",
                      "description": "MongoDB ObjectId of the user registering the token."
                    },
                    "token": {
                      "type": "string",
                      "example": "fGH2k3s8tZ:APA91bH9eX...",
                      "description": "Firebase Cloud Messaging device registration token."
                    },
                    "deviceType": {
                      "type": "string",
                      "enum": [
                        "IOS",
                        "ANDROID",
                        "WEB"
                      ],
                      "example": "ANDROID",
                      "description": "Device platform type."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "FCM token successfully registered.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "FCM token registered."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/notifications/fcm-token/{token}": {
        "delete": {
          "tags": [
            "Module 14: Firebase Notifications Management"
          ],
          "summary": "Deregister FCM Token on Logout",
          "description": "Removes a Firebase Cloud Messaging token from the system on user logout, preventing push notifications from being sent to signed-out devices.",
          "security": [
            {
              "tenantHeader": []
            },
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "$ref": "#/components/parameters/tenantHeader"
            },
            {
              "name": "token",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "example": "fGH2k3s8tZ:APA91bH9eX..."
              },
              "description": "The FCM device token to deregister."
            }
          ],
          "responses": {
            "200": {
              "description": "FCM token successfully deregistered.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "FCM token removed."
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid Bearer token.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "403": {
              "description": "Insufficient privileges.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },
            "404": {
              "description": "FCM token not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.preauthorizeApiKey) {
    const key = customOptions.preauthorizeApiKey.authDefinitionKey;
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
