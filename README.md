# b1Hapi ![Version](https://img.shields.io/badge/version-1.0.0-green)
## Simple hapi framework implementation by Ricardo D. Burone (bur1)
### Features:
- Access with token autentification
- User managment
    - Create
    - Delete
    - Email validation by code confirmation
    - Password change and lost password managment
- Database conection
    - MongoDB support
    - Auto rest API generation
    - ACL for models based on user roles
- Centralized and easy error managment for avoid server shutdown
- Testing and information routes
- Statics routes
- Mailer conector

## Configuration:
Use _.env_ for credentials and specify the name of config file to use.
```
# Configuration file to read
CONFIG_FILE = config-development

# Database credentials
DB_USER  = nouser
DB_PASS  = nopass
AUTH_SRC = admin

# Mailer credentials
MAIL_USER = nouser
MAIL_PASS = nopass

# Mercado Pago credentials
MP_PROD_ACCESSTOKEN = ...
MP_PROD_PUBLICKEY   = ...
MP_TEST_ACCESSTOKEN = ...
MP_TEST_PUBLICKEY   = ...
```
