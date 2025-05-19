module.exports = {
    server: {
        port      : 3500,                        // [R] Server port
        publicPath: `${__dirname}/public`,       // [R] System path for static files or empty to disable
        rootAPI   : '',                          // [R] REST api path for all routes created
        toolsAPI  : 'api',                       // [R] REST api path for access special routes
        viewsPath : 'views',                     // [R] System path (realtive) of templates to render views
        useTls    : false,                       // [R] will it use certificates? (https)
        verbose   : true,                        // [R] Will it print some messages on console?
        sendMails : true,                        // [R] Will it send emails notificacions?
        customData: `${__dirname}/customdata`,   // TODO MOVER [R] System path for custom and plugins data
        proxyURL  : 'localhost:9000/hapi',       // [R] URL masked by proxy
        // --------------------------------------------[ OPTIONAL ]
        // host      : 'localhost',           // [D: localhost] Server URL
    },
    messages: {
        subjectRegister: 'Register OK'        // [R] Subject for notify user registration
    },
    telnet: {
        path: '/telnet'
    },
    certificate: {
        key : '/certificates/localhost-key.pem', // [R] Path to file with key if useTls is true
        cert: '/certificates/localhost.pem'      // [R] Path to with certificate if useTls is true
    },
    security: {
        modelToken : 'AccessToken',   // [R] Model with tokens data
        modelUser  : 'User',          // [R] Model with users data
        pathAPI    : 'User',          // [R] REST api path for user managment
        connection : 'mongodb8',      // [R] Conection name
        verifyEmail: true,            // [D: false] Is verification of email required?
        // --------------------------------------------[ OPTIONAL ]
        // ttl         : 1209600,         // [D: 1209600] Token duration
        // passMinLen  : 8,               // [D: 8] Minimun length for user password
        // lenVerifCode: 6,               // [D: 6] Length of verification code for new user
        // oneTimeCode : true,            // [D: true] Whether to reset the verification code after a true validation?
        // secureChange: false,           // [D: false] Need to be logged for user can changes password?
    },
    acl: {
        // --------------------------------------------[ OPTIONAL ]
        roles    : ['SYSADMIN', 'ADMIN', 'PROGRAMADOR', 'RESPONSABLE', 'CLIENTE'], // [D] Roles for ACL
        userAdmin: 'SYSADMIN'                                                      // [D: ADMIN] Role for user managment
    },
    mail: {
        service  : 'FakeSMTP',
        host     : 'localhost',     // [R] Host
        port     : '25',            // [R] Port
        fromEmail: 'app@app.com',   // [R] Outgoing email address from the server to send validation codes
    },
    _mail: {
        service  : "Outlook365",
        host     : "smtp.office365.com",
        port     : "587",
        fromEmail: 'rdburone@hotmail.com',
        tls      : {
            ciphers: "SSLv3",
            rejectUnauthorized: false,
        }
    },
    dataSource: {
        defFile   : `${__dirname}/plugins/b1MongoRest/apidefs.js`,   // [R] File with API definition
        path      : '/db',
        connections: [
            {
                name: 'mongodb8',                             // [R] Conection name
                uri : 'mongodb://127.0.0.1:27017/atticLab',   // [R] URL MongoDB collection
            },
            // {
            //     name: 'mongoStage',                                  // [R] Conection name
            //     uri : 'mongodb://128.0.5.58:27017/gestionStaging',   // [R] URL MongoDB collection
            // }
        ]
    },
    views: {
        emailVerificationCode  : 'email_code_ES',       // [D] Email to send verification code to new user
        //   formChkVerificationCode: 'form_verify_code', // [D] HTML form for check and validate code
        formChangePass    : 'form_change_pass_ES',        // [D] HTML form for password change with actual pass
        formChgPassByCode : 'form_code_change_pass_ES'    // [D] HTML form for password change with valid code
    }
}
// -------- Reference
// [R] Required
// [D] Has default
