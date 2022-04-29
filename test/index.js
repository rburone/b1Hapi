const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const {expect} = Code;
const lab = exports.lab = Lab.script();

const server = require('../server')
const config = require('../config-development.js')

config.server.port = 3600
// config.auth.verifyEmail = false

let theServer
lab.experiment('Server,', () => {
    lab.test('Init server', async () => {
        theServer = await server.init(config)
        const response = await theServer.inject(`${config.server.apiPath}/`)
        expect(response.result).to.equal('Bur1 Hapi\'s Server')
    })
})
//*/

const user = {
    email: 'test@domain.com',
    password: 'abcd1234',
}

const adminUser = {
    email: 'admin@domain.com',
    password: 'abcd1234'
}

let verifyCode
let token
let adminToken

lab.experiment('User mangment: ', () => {
    lab.test('Login admin', async () => {
        const response = await theServer.inject({
            method: 'POST',
            url: '/login',
            payload: adminUser
        })
        adminToken = response.result._id
        expect(response.result.userID).to.equal(adminUser.email)
    })

    lab.test('Create user', async () => {
        const payload = {...user, roles:[]}
        const response = await theServer.inject({
            method : 'POST',
            url    : `/user?access_token=${adminToken}`,
            payload
        })
        verifyCode = response.result
        expect(response.result).to.be.string().and.have.length(6);
    })

    lab.test('Confirm email (invalid code)', async () => {
        const response = await theServer.inject({
            method: 'GET',
            url   : `/chkCode/${user.email}/123456`
        })
        expect(response.result).to.equal('invalid')
    })

    lab.test('Confirm email', async () => {
        const response = await theServer.inject({
            method: 'GET',
            url   : `/chkCode/${user.email}/${verifyCode}`
        })
        expect(response.result).to.equal('ok')
    })

    lab.test('Login user', async () => {
        const response = await theServer.inject({
            method : 'POST',
            url    : '/login',
            payload: user
        })
        console.log(response.result)
        token = response.result._id
        expect(response.result.userID).to.equal(user.email)
    })

    lab.test('Generate code', async () => {
        const response = await theServer.inject({
            method: 'GET',
            url   : `/sendCode/${user.email}`
        })
        expect(response.result).to.equal('ok')
    })

    // lab.test('Reset password', async () => {
    //     const response = await theServer.inject({
    //         method: 'POST',
    //         url: '/rstPassword',
    //         payload: {
    //             email: user.email,
    //             code: verifyCode,
    //             password: '1234abcd'
    //         }
    //     })
    //     expect(response.result).to.equal('ok')
    // })

    // lab.test('Login user (new password)', async () => {
    //     const response = await theServer.inject({
    //         method: 'POST',
    //         url: '/login',
    //         payload: {
    //             email: user.email,
    //             password: '1234abcd'
    //         }
    //     })
    //     token = response._id
    //     expect(response.result.userId).to.equal(user.email)
    // })

    lab.test('Delete user', async () => {
        const response = await theServer.inject({
            method : 'DELETE',
            url    : `/${user.email}?access_token=${adminToken}`,
            payload: user
        })
        expect(response.result).to.equal('ok')
    })

    lab.test('Logout deleted user', async () => {
        const response = await theServer.inject({
            method: 'GET',
            url: `/logout?access_token=${token}`,
            payload: user
        })
        expect(response.result.statusCode).to.equal(401)
    })

})