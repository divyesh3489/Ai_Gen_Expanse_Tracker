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
The Category model is used to store categories for expenses and incomes.

**Fields:**
- `name` (CharField, max_length=100) - The name of the category
- `user` (ForeignKey, on_delete=CASCADE, related_name='categories') - The user associated with the category
- `is_default` (BooleanField, default=False) - Whether the category is a default category

### Expanse Model ###
The Expanse model is used to store expenses.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='expanses') - The user associated with the expanse
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='expanses') - The category associated with the expanse
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the expanse
- `note` (TextField, blank=True, null=True) - The note of the expanse
- `date` (DateField) - The date of the expanse

### Income Model ###
The Income model is used to store incomes.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='incomes') - The user associated with the income
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='incomes') - The category associated with the income
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the income
- `note` (TextField, blank=True, null=True) - The note of the income
- `date` (DateField) - The date of the income

### Budget Model ###
The Budget model is used to store budgets.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='budgets') - The user associated with the budget
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='budgets') - The category associated with the budget
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the budget
- `start_date` (DateField) - The start date of the budget
- `end_date` (DateField) - The end date of the budget

### Recurring Model ###
The Recurring model is used to store recurring expenses and incomes.

**Fields:**
- `user` (ForeignKey, on_delete=CASCADE, related_name='recurrings') - The user associated with the recurring
- `category` (ForeignKey, on_delete=SET_NULL, null=True, blank=True, related_name='recurrings') - The category associated with the recurring
- `amount` (DecimalField, max_digits=10, decimal_places=2) - The amount of the recurring
- `note` (TextField, blank=True, null=True) - The note of the recurring
- `start_date` (DateField) - The start date of the recurring
- `end_date` (DateField, null=True, blank=True) - The end date of the recurring
- `next_run_date` (DateField, null=True, blank=True) - The next run date of the recurring
- `frequency` (CharField, max_length=20, choices=FREQUENCY_CHOICES) - The frequency of the recurring
- `type` (CharField, max_length=20, choices=TYPE_CHOICES) - The type of the recurring
- `is_active` (BooleanField, default=True) - Whether the recurring is active


## Endpoints ##
- `POST /api/v1/users/register/` - Register a new user
- `POST /api/v1/users/login/` - Login a user
- `POST /api/v1/users/logout/` - Logout a user
- `GET /api/v1/users/me/` - Get user profile
- `GET /api/v1/users/verify/<str:token>/` - Verify user email
