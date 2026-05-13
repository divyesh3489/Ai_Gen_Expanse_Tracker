# Expanse Tracker #

## Architecture #
- Django Rest Framework
- Django Simple JWT
- Celery
- Redis
- PostgreSQL


## Features ##
- User Registration
- User Login
- User Logout
- User Profiler
- User Verification
- Category Management
- Expanse Management
- Income Management
- Budget Management
- LLM based Suggestions
- Chatbot for Expanse and Income Management

## models ##

### baseModel ###
Abstract base model inherited by all resource models. Provides audit trail tracking.

**Fields:**
- `created_at` (DateTimeField, auto_now_add=True) - Timestamp when record was created
- `updated_at` (DateTimeField, auto_now=True) - Timestamp when record was last updated
- `created_by` (ForeignKey, User, on_delete=SET_NULL, null=True) - User who created the record
- `updated_by` (ForeignKey, User, on_delete=SET_NULL, null=True) - User who last updated the record

### User Model ###
The User model extends Django's AbstractUser and uses email as the primary authentication field.

**Fields:**
- `email` (EmailField, unique=True, required) - Primary authentication field
- `first_name` (CharField, max_length=30, blank=True) - User's first name
- `last_name` (CharField, max_length=30, blank=True) - User's last name
- `gender` (CharField, max_length=10, blank=True) - Gender choice: 'male' or 'female'
- `dob` (DateField, null=True, blank=True) - Date of birth
- `password` (CharField) - Hashed password (inherited from AbstractUser)
- `is_active` (BooleanField, default=True) - Whether the user account is active
- `is_staff` (BooleanField, default=False) - Whether the user can access admin site
- `is_superuser` (BooleanField, default=False) - Whether the user has all permissions
- `is_verified` (BooleanField, default=False) - Whether the user's email is verified
- `date_joined` (DateTimeField) - Account creation timestamp (inherited from AbstractUser)
- `last_login` (DateTimeField, null=True) - Last login timestamp (inherited from AbstractUser)

**Properties:**
- `full_name` - Returns concatenated first_name and last_name

**Managers:**
- `objects` - Default UserManager with create_user, create_superuser, and delete_user methods
- `active_objects` - ActiveUserManager for filtering active users only

**Authentication:**
- `USERNAME_FIELD` = 'email'
- `REQUIRED_FIELDS` = []
- `username` = None (username field is disabled)

### VerificationToken Model ###
The VerificationToken model is used to store verification tokens for user email verification.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='verification_tokens') - The user associated with the verification token
- `token` (CharField, max_length=255) - The verification token
- `created_at` (DateTimeField, auto_now_add=True) - The timestamp when the token was created

### Category Model ###
The Category model is used to store categories for expenses and incomes. Extends baseModel.

**Fields:**
- `name` (CharField, max_length=255, unique=True) - The name of the category
- `icon` (CharField, max_length=255, default='FaWallet') - Font Awesome icon name for the category
- `default_color` (CharField, max_length=7, default='#64748B') - Default hex color for the category
- `type` (CharField, max_length=20, choices=['expense', 'income']) - Type of category (expense or income)
- `created_at` (DateTimeField, auto_now_add=True) - Timestamp when category was created
- `updated_at` (DateTimeField, auto_now=True) - Timestamp when category was last updated
- `created_by` (ForeignKey, User, on_delete=SET_NULL, null=True) - User who created the category
- `updated_by` (ForeignKey, User, on_delete=SET_NULL, null=True) - User who last updated the category

### UserCategoryPreference Model ###
The UserCategoryPreference model allows users to customize category appearance. Extends baseModel.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='category_preferences') - The user
- `category` (ForeignKey, on_delete=CASCADE, related_name='user_preferences') - The category
- `custom_color` (CharField, max_length=7, blank=True, null=True) - Custom hex color the user set for this category

### Expanse Model ###
The Expanse model is used to store expenses. Extends baseModel.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='expanses') - The user associated with the expanse
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='expanses') - The category associated with the expanse
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the expanse
- `note` (TextField, blank=True, null=True) - The note of the expanse
- `date` (DateField) - The date of the expanse
- `created_at`, `updated_at`, `created_by`, `updated_by` (inherited from baseModel)

### Income Model ###
The Income model is used to store incomes. Extends baseModel.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='incomes') - The user associated with the income
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='incomes') - The category associated with the income
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the income
- `note` (TextField, blank=True, null=True) - The note of the income
- `date` (DateField) - The date of the income
- `created_at`, `updated_at`, `created_by`, `updated_by` (inherited from baseModel)

### Budget Model ###
The Budget model is used to store budgets. Extends baseModel.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='budgets') - The user associated with the budget
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='budgets') - The category associated with the budget
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the budget
- `start_date` (DateField) - The start date of the budget
- `end_date` (DateField) - The end date of the budget
- `created_at`, `updated_at`, `created_by`, `updated_by` (inherited from baseModel)

### Recurring Model ###
The Recurring model is used to store recurring expenses and incomes. Extends baseModel. Uses custom manager `recurringObjects` to filter active recurrings only.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='recurrings') - The user associated with the recurring
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='recurrings') - The category associated with the recurring
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the recurring
- `note` (TextField, blank=True, null=True) - The note of the recurring
- `start_date` (DateField) - The start date of the recurring
- `end_date` (DateField, null=True, blank=True) - The end date of the recurring
- `next_run_date` (DateField, null=True, blank=True) - The next run date of the recurring
- `frequency` (CharField, max_length=20, choices=['daily', 'weekly', 'monthly', 'yearly']) - The frequency of the recurring
- `type` (CharField, max_length=20, choices=['expense', 'income']) - The type of the recurring
- `is_active` (BooleanField, default=True) - Whether the recurring is active
- `created_at`, `updated_at`, `created_by`, `updated_by` (inherited from baseModel)

**Custom Manager:**
- `recurringObjects` - Filters only active recurrings (is_active=True). Provides methods:
  - `due_recurrings()` - Returns recurrings where next_run_date <= today
  - `update_next_run_date(recurring)` - Updates next run date based on frequency
  - `stop_recurrings(recurring)` - Deactivates a recurring


## Endpoints ##
- **Auth base**: `/api/v1/user/`
- **Resource base**: `/api/v1/expanse/`

### User/Auth (`/api/v1/user/`)
- `POST /api/v1/user/register/` - Register a new user (triggers verification email)
- `POST /api/v1/user/login/` - Login a user (returns JWT access/refresh; requires verified user)
- `POST /api/v1/user/token/refresh/` - Refresh access token
- `POST /api/v1/user/logout/` - Logout (blacklist refresh token)
- `GET  /api/v1/user/me/` - Get user profile (auth required)
- `PATCH /api/v1/user/me/` - Update user profile (auth required)
- `GET  /api/v1/user/verify/<str:token>/` - Verify user email
- `POST /api/v1/user/resend-verification/` - Resend verification email
- `POST /api/v1/user/upload-profile-picture/` - Upload profile picture (auth required)

### Categories (`/api/v1/expanse/`)
- `GET /api/v1/expanse/categories/` - Get all categories (auth required, supports optional `?type=expense` or `?type=income` filter)
- `POST /api/v1/expanse/categories/` - Create a new category (admin only)
- `GET /api/v1/expanse/categories/<int:pk>/` - Get a category by ID (auth required)
- `PUT /api/v1/expanse/categories/<int:pk>/` - Update a category (admin only)
- `DELETE /api/v1/expanse/categories/<int:pk>/` - Delete a category (admin only)

### User Category Preferences (`/api/v1/expanse/`)
- `GET /api/v1/expanse/user-category-preferences/` - Get all user's category preferences with defaults (auth required). Returns all expense categories with user's custom colors or default colors
- `POST /api/v1/expanse/user-category-preferences/` - Create a user category preference (auth required)
- `PUT /api/v1/expanse/user-category-preferences/<int:pk>/` - Update a user category preference (auth required, user's own only)
- `DELETE /api/v1/expanse/user-category-preferences/<int:pk>/` - Delete a user category preference (auth required, user's own only)

### Expenses (`/api/v1/expanse/`)
- `GET /api/v1/expanse/expanses/` - Get all user's expanses (auth required)
- `POST /api/v1/expanse/expanses/` - Create a new expanse (auth required)
- `GET /api/v1/expanse/expanses/<int:pk>/` - Get an expanse by ID (auth required, user's own only)
- `PUT /api/v1/expanse/expanses/<int:pk>/` - Update an expanse (auth required, user's own only)
- `DELETE /api/v1/expanse/expanses/<int:pk>/` - Delete an expanse (auth required, user's own only)

### Incomes (`/api/v1/expanse/`)
- `GET /api/v1/expanse/incomes/` - Get all user's incomes (auth required)
- `POST /api/v1/expanse/incomes/` - Create a new income (auth required)
- `GET /api/v1/expanse/incomes/<int:pk>/` - Get an income by ID (auth required, user's own only)
- `PUT /api/v1/expanse/incomes/<int:pk>/` - Update an income (auth required, user's own only)
- `DELETE /api/v1/expanse/incomes/<int:pk>/` - Delete an income (auth required, user's own only)

### Recurring (`/api/v1/expanse/`)
- `GET /api/v1/expanse/recurring/` - Get all active recurring entries (auth required, user's own only)
- `POST /api/v1/expanse/recurring/` - Create a recurring entry (auth required)
- `GET /api/v1/expanse/recurring/<int:pk>/` - Get a recurring entry by ID (auth required, user's own only)
- `PUT /api/v1/expanse/recurring/<int:pk>/` - Update a recurring entry (auth required, user's own only, supports partial updates)
- `DELETE /api/v1/expanse/recurring/<int:pk>/` - Delete a recurring entry (auth required, user's own only)

### Budgets (`/api/v1/expanse/`)
- `GET /api/v1/expanse/budgets/` - Get all user's budgets (auth required)
- `POST /api/v1/expanse/budgets/` - Create a budget (auth required)
- `GET /api/v1/expanse/budgets/<int:pk>/` - Get a budget by ID (auth required, user's own only)
- `PUT /api/v1/expanse/budgets/<int:pk>/` - Replace a budget (auth required, user's own only)
- `PATCH /api/v1/expanse/budgets/<int:pk>/` - Update a budget (auth required, user's own only, partial updates)
- `DELETE /api/v1/expanse/budgets/<int:pk>/` - Delete a budget (auth required, user's own only)
- `GET /api/v1/expanse/budgets/summary/?from=YYYY-MM-DD&to=YYYY-MM-DD` - Budget vs spent summary (auth required). Returns for each budget: budget_amount, spent_amount, remaining_amount, progress_percent, is_over_budget

## Frontend integration notes (JWT)
- All authenticated endpoints require `Authorization: Bearer <access_token>` header
- Resource endpoints (`/api/v1/expanse/*`) are user-specific and return only the current user's data
- Category endpoints are global (all users see the same categories), but category creation/updates are admin-only
- `login/` returns `access` + `refresh` tokens. Use `token/refresh/` with the refresh token to get a new access token when it expires
- `logout/` blacklists the refresh token (requires SimpleJWT blacklist app enabled)

## Example payloads (minimal)

### Create expense
Request body:
```json
{ "category": 1, "amount": "120.50", "note": "Groceries", "date": "2026-05-06" }
```

### Create recurring expense
Request body:
```json
{
  "category": 1,
  "amount": "499.00",
  "note": "Subscription",
  "start_date": "2026-05-01",
  "end_date": null,
  "next_run_date": null,
  "frequency": "monthly",
  "type": "expense"
}
```

### Create budget (category budget)
Request body:
```json
{ "category": 1, "amount": "5000.00", "start_date": "2026-05-01", "end_date": "2026-05-31" }
```

### Create/Update user category preference
Request body:
```json
{ "category": 1, "custom_color": "#FF5733" }
```


### AWS Architectural diagram ###
```
Internet
   │
   ▼
Nginx (Reverse Proxy)
   │
   ├── Frontend Container (React)
   └── Django Backend Container
           │
           ├── PostgreSQL Container
           ├── Redis Container
           ├── Celery Worker
           ├── S3 (for media storage)
           └── Celery Beat
```
