module.exports = {
    server: {
        port      : 3500,                     // [R] Server port
        publicPath: `${__dirname}/public`,    // [R] System path for static files or empty to disable
        rootAPI   : '',                       // [R] REST api path for all routes created
        userAPI   : '',                       // [R] REST api path for user managment
        toolsAPI  : 'api',                    // [R] REST api path for access special routes
        viewsPath : 'views',                  // [R] System path (realtive) of templates to render views
        useTls    : false,                    // [R] will it use certificates? (https)
        verbose   : true,                     // [R] Will it print some messages on console?
        sendMails : true,                     // [R] Will it send emails notificacions?
        customData: `${__dirname}/customdata`,// TODO MOVER [R] System path for custom and plugins data
        // --------------------------------------------[ OPTIONAL ]
        // host      : 'localhost',           // [D] Server URL
    },
    certificate: {
        key : '/certificates/localhost-key.pem', // [R] Path to file with key if useTls is true
        cert: '/certificates/localhost.pem'      // [R] Path to with certificate if useTls is true
    },
    security: {
        modelToken  : 'AccessToken',      // [R] Model with tokens data
        modelUser   : 'User',             // [R] Model with users data
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
        fromEmail: 'app@app.com',   // [R] Outgoing email address from the server to send validation codes
    },
    dataSource: {
        defFile   : `${__dirname}/plugins/b1MongoRest/apidefs.js`,   // [R] File with API definition
        path      : '/db',
        conections: [
            {
                name: 'mongodb4',                             // [R] Conection name
                uri : 'mongodb://128.0.5.58:27044/maxclon',   // [R] URL MongoDB collection
            }
        ]
    },
    views: {
        //   emailVerificationCode  : 'email_code',              // [D] Email to send verification code to new user
        //   formChkVerificationCode: 'form_verify_code',        // [D] HTML form for check and validate code
        //   formChangePass         : 'form_change_pass',        // [D] HTML form for password change with actual pass
        //   formChgPassByCode      : 'form_code_change_pass',   // [D] HTML form for password change with valid code
    }
}
// -------- Reference
// [R] Required
// [D] Has default
