module.exports = {
    server: {
        port      : 3500,                    // [R] Server port
        host      : 'localhost',             // [R] Server URL
        publicPath: `${__dirname}/public`,   // [R] Public path or empty to disable
        rootPath  : '',                      // [R] Path for all routes created
        userPath  : '',                      // [R] REST api path for user managment
        toolsPath : '/api',                  // [R] Path for access special routes
        viewsPath : 'views',                 // [R] Path of templates to render views
        useTls    : true,                    // [R] Use certificates? (https)
        verbose   : true,                    // [R] Print some messages on console?
        sendMails : true,                    // [R] Send emails notificacions?
    },
    certificate: {
        key : '/certificates/localhost-key.pem', // [R] Path to file with key if useTls is true
        cert: '/certificates/localhost.pem'      // [R] Path to with certificate if useTls is true
    },
    security: {
        modelToken  : 'AccessToken',   // [R] Model with tokens data
        modelUser   : 'User',          // [R] Model with users data
        // --------------------------------------------[ OPTIONAL ]
        // verifyEmail : false,           // [D] Is verification of email required?
        // ttl         : 1209600,         // [D] Token duration
        // passMinLen  : 8,               // [D] Minimun length for user password
        // lenVerifCode: 6,               // [D] Length of verification code for new user
        // oneTimeCode : true,            // [D] Whether to reset the verification code after a true validation?
        // secureChange: false,           // [D] Need to be logged for user can changes password?
    },
    acl: {
        // --------------------------------------------[ OPTIONAL ]
        // roles: ['SUPER_ADMIN', 'ADMIN', 'USER', 'GUEST'],   // [D] Roles for ACL
        // userAdmin: 'ADMIN',                                 // [D] Role for user managment
    },
    mail: {
        host     : 'localhost',     // [R] Host
        port     : '25',            // [R] Port
        user     : 'nouser',        // [R] User
        pass     : 'nopass',        // [R] Password
        fromEmail: 'app@app.com',   // [R] Outgoing email address from the server to send validation codes
    },
    dataBase: {
        port   : 27017,
        url    : 'mongodb://localhost:27017/gestion-dev',         // [R] URL MongoDB collection
        defFile: `${__dirname}/plugins/b1MongoRest/apidefs.js`,   // [R] File with API definition
        path   : '/db',
    },
    views: {
        // emailVerificationCode  : 'email_code',       // [D] Email to send verification code to new user
        // formChkVerificationCode: 'form_verify_code', // [D] HTML form for check and validate code
        // formChangePass         : 'form_change_pass', // [D] HTML form for password change with actual pass
    }
}
// -------- Reference
// [R] Required
// [D] Has default