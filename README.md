# b1Hapi ![Version](https://img.shields.io/github/package-json/v/rburone/b1Hapi?color=green)
## Simple hapi framework implementation by Ricardo D. Burone (Bur1)
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

# Database 1 credentials
DB_USER_DB1NAME  = nouser
DB_PASS_DB1NAME  = nopass
AUTH_SRC_DB1NAME = admin

# Database 2 credentials
DB_USER_DB2NAME  = nouser
DB_PASS_DB2NAME  = nopass
AUTH_SRC_DB2NAME = admin

# Mailer credentials
MAIL_USER = nouser
MAIL_PASS = nopass

```
