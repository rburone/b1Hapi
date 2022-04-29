## Standar routes:
* **URL:** `[GET] /`
* **Success Response:**
  * **Code:** 200
    **Content:**
    `"Hello World!"`
---
* **URL:** `[GET] /config`
* **Success Response:**
  * **Code:** 200
    **Content:**
    ```json
    {
      ...SERVER CONFIGURATION VARIBLES...
    }
    ```
---
* **URL:** 🔒(SUPER_ADMIN) `[GET] /testDB`
* **Success Response:**
  * **Code:** 200
    **Content:**
    ```json
    {
      ...MONGO SERVER CONFIGURATION VARIBLES...
    }
    ```
---
One-time server initialization:
  
  1) Super user creation

* **URL:** `[GET] /init_server`
* **Success Response:**
  * **Code:** 200
    **Content:**
    ```json
    {
      "_id" : "super@bur1.com", 
      "password" : "*", 
      "emailVerified" : true, 
      "roles" : [...], 
      "validationCode" : code
    }
    ```
* **Error Response:**
  * **Code:** 400 Bad Request