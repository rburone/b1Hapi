# PLUGIN userManagment
## OPTIONS:
```json
{
  "modelToken"             : "AccessToken",   // [R] Model with tokens data
  "modelUser"              : "User",          // [R] Model with users data
  "path"                   : "",              // [R] REST api path for user managment
  "passMinLen"             : 8,               // [D] Minimun length for user password
  "verifyEmail"            : true,            // [D] Is verification of email required?
  "ttl"                    : 1209600,         // [D] Token duration
  "passMinLen"             : 8,               // [D] Minimun length for user password
  "lenVerifCode"           : 6,               // [D] Length of verification code for new user
  "oneTimeCode"            : true,            // [D] Specifies whether to reset the verification code after a true validation
  "roles"                  : ["..."],         // [R] Roles for ACL
  "userAdmin"              : "ADMIN",         // [D] Role for user managment
  "fromEmail"              : "app@app.com",   // [R] Email used for send by in emails with verifications codes
  "secureChange"           : false,           // [D] Need to be logged for user can changes password?
  "oneTimeCode"            : true,            // [D] Whether to reset the verification code after a true validation?
  "sendMails"              : true,            // [R] Send emails notificacions?
  "emailVerificationCode"  : "...",           // [D] Email to send verification code to new user
  "formChkVerificationCode": "...",           // [D] HTML form for check and validate codes
  "formChangePass"         : "..."
}
```
## **API LIST:**
All routes with a 🔒 requires a valid **access_token** passed in query string and in some cases the user need have sepecific role.

*Emails must be valid.*

---
## **_Login:_**

* **URL:** `[POST] /login`
* **Required payload data:**
  ```json
  {
    "email": [string],
    "password": [string]
  }
  ```
* **Success Response:**
  * **Code:** 200
    **Content:**
    ```json
    {
      "_id": [accesstoken],
      "ttl": 54000,
      "created": "2022-01-24T13:36:10.760Z",
      "userID": "user1@domain.com"
    }
    ```
  * **Code:** 200
    **Content:**
    `"Email not verified"`
* **Error Response:**
  * **Code:** 401 UNAUTHORIZED
  * **Code:** 400 Bad Request
---
## **🔒 _Logout:_**
* **URL:** `[GET] /logout`
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"ok"`
  * **Code:** 200
    **Content:**
    `"unchanged"`
* **Error Response:**
  * **Code:** 400 Bad Request
---
## **_Set a random validation code and email it:_**
* **URL:** `[GET] /sendCode/{email}`
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"ok"`
* **Error Response:**
  * **Code:** 400 Bad Request
  * **Code:** 404 Not found
---
## **_Set a new password through code validation:_**
If the password was set and _oneTimeCode_ is true, the validation code will be changed randomly.
* **URL:** `[PATCH] /setPassword`
* **Required payload data:**
  ```json
  {
    "email": [string],
    "password": [string],
    "code": [string]
  }
  ```
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"ok"`
  * **Code:** 200
    **Content:**
    `"unchanged"`
* **Error Response:**
  * **Code:** 400 Bad Request
---
## **_Set new password through old password validation:_**
If the setting _secureChange_ is _true_, it is necessary a valid acces token
* **URL:** `[PATCH] /changePassword`
* **Required payload data:**
  ```json
  {
    "email": [string],
    "new": [string],
    "actual": [string]
  }
  ```
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"ok"`
  * **Code:** 200
    **Content:**
    `"unchanged"`
* **Error Response:**
  * **Code:** 400 Bad Request
---
## **_Check if incoming code is valid:_**
if code is valid, email will be validated.
* **URL:** `[GET] /chkCode`
* **Required query data:**
  ```json
  {
    "email": [string],
    "code": [string]
  }
  ```
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"ok"`
  * **Code:** 200
    **Content:**
    `"invalid"`
* **Error Response:**
  * **Code:** 400 Bad Request
---
## **🔒 (ADMIN) _Delete user:_**
* **URL:** `[DELETE] /{email}`
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"ok"`
  * **Code:** 200
    **Content:**
    `"unchanged"`
* **Error Response:**
  * **Code:** 403 Forbidden
  * **Code:** 400 Bad Request
---
## **🔒 (ADMIN) _Create user:_**
* **URL:** `[POST] /user`
* **Required payload data:**
  ```json
  {
    "email": [string],
    "password": [string],
    "roles": [array]
  }
  ```
* **Success Response:**
  * **Code:** 200
    **Content:**
    *`code`*
* **Error Response:**
  * **Code:** 403 Forbidden
  * **Code:** 400 Bad Request
---
## **_Return HTML form for code validation:_**
* **URL:** `[GET] /validationForm`
* **Success Response:**
  * **Code:** 200
    **Content:**
    *`HTML FORM`*
* **Error Response:**
  * **Code:** 400 Bad Request
---
## **_Return HTML form for code change:_**
* **URL:** `[GET] /changePassForm`
* **Success Response:**
  * **Code:** 200
    **Content:**
    *`HTML FORM`*
* **Error Response:**
  * **Code:** 400 Bad Request
---
## **🔒 (ADMIN) _Set role/s for a user:_**

* **URL:** `[PATCH] /roles`
* **Required payload data:**
  ```json
  {
    "email": [string],
    "roles": [array]
  }
  ```
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"ok"`
  * **Code:** 200
    **Content:**
    `"unchanged"`
* **Error Response:**
  * **Code:** 400 Bad Request
---