'use strict'

const crypto       = require('crypto');
const bcrypt       = require('bcryptjs');
const { generate } = require('../../lib/methods').b1Lib
// const UserManagmentError = require('./errorMangment')

require('../../lib/b1-colorString')

async function saveToken(collection, userId, ttl) {
    const accessToken = {
        '_id'    : crypto.randomBytes(48).toString('hex'),
        'created': new Date(),
        'userId' : userId,
        ttl,
    }

    try {
        await collection.insertOne(accessToken)
        return accessToken
    } catch (error) {
        console.log('ERROR')
        return {error, from: '[lib:atticUser:saveToken]'}
    }
}

module.exports = {
    /**
     * Check user credentials and generate token
     * @param {RequestObject} req
     * @param {Boolean} verifyEmail If required verify email
     * @returns String/Boolean access token or false
     */
    async checkUser(userCollection, tokenCollection, payload, { verifyEmail, ttl }, includes) {
        if (userCollection && tokenCollection) { // TODO [20/07/2023] Ver como mejorar la deteccion de mala configuraricón de los modelos
            try {
                const user = await userCollection.findOne({ _id: payload.email })
                if (user) {
                    if (bcrypt.compareSync(payload.password, user.password)) {
                        if (verifyEmail && !user.emailVerified) {
                            return 'Email not verified'
                        } else {
                            const token = await saveToken(tokenCollection, user._id, ttl);
                            if (includes) {
                                const includeArr = includes.split(',')
                                for (const element of includeArr) {
                                    if (user[element]) {
                                        token[element] = user[element]
                                    }
                                }
                            }
                            return token
                        }
                    } else {
                        return { error: 401 }
                    }
                } else {
                    return { error: 404 }
                }
            } catch (error) {
                return { error, from: '[lib:atticUser:checkUser]' }
            }
        } else {
            return { error: `Non exists ${collection}`, from: '[plugin:atticUser:getDbCollection]' }
        }
    },

    /**
     * Verify password of a user
     * @param {object} userCollection
     * @param {string} _id
     * @param {string} passToCheck
     * @returns string if valid or error object if not valid
     */
    async checkPassword(userCollection, _id, passToCheck) {
        try {
            const result = await userCollection.findOne({_id})
            if (result) {
                if (bcrypt.compareSync(passToCheck, result.password)) {
                    return 'ok'
                } else {
                    return 'NO'
                }
            } else {
                return {error: 404}
            }
        } catch (error) {
            return {error, from: '[lib:atticUser:checkUser]'}
        }
    },

    /**
     * Remove access token from db
     * @param {object} tokenCollection
     * @param {string} token
     * @returns string 'ok' if deleted or string 'unchanged' if not
     */
    async revokeToken(tokenCollection, token) {
        try {
            const result = await tokenCollection.deleteOne({_id: token})
            if (result.deletedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:atticUser:revokeToken]'}
        }
    },

    /**
     *
     * @param {object} userCollection
     * @param {object} data
     * @returns string with code or error object
     */
    async setVerificationCode(userCollection, data) {
        const _id = data.email
        const code = generate(data.lenVerifCode)
        const $set = {
            validationCode: code
        }

        try {
            const result = await userCollection.updateOne({_id}, {$set})
            if (result.modifiedCount == 1) {
                return code
            } else {
                return {error: 404}
            }
        } catch (error) {
            return {error, from: '[lib:atticUser:setVerificationCode]'}
        }
    },

    /**
     * Set emailVerified to true if the code is valid
     * @param {object} userCollection
     * @param {string} _id
     * @param {string} validationCode
     * @param {boolean} oneTime Set if code will be changed if valid
     * @returns string 'ok' if valid code or string 'unchanged' if not
     */
    async chkVerificationCode(userCollection, _id, validationCode, oneTime = true) {
        try {
            const $set = {emailVerified: true}

            if (oneTime) {
                $set.validationCode = generate(6)
            }

            const result = await userCollection.updateOne({_id, validationCode}, {$set})
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} [lib:atticUser:chkVerificationCode]`, validationCode, result.modifiedCount == 1 ? 'OK'.FgGreen:'NO'.FgRed)
            if (result.modifiedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:atticUser:chkVerificationCode]'}
        }
    },

    /**
     * Change password of validated user
     * @param {object} userCollection
     * @param {string} _id
     * @param {string} password
     * @returns string 'ok' if chage occur or 'unchanged' if not
     */
    async updatePass(userCollection, _id, password) {
        try {
            const $set = {
                password: bcrypt.hashSync(password, 10)
            }

            const result = await userCollection.updateOne({_id, emailVerified: true}, {$set})
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} [lib:atticUser:updatePass]`, _id, result.modifiedCount == 1 ? 'YES'.FgGreen : 'NO'.FgRed)
            if (result.modifiedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:atticUser:updatePass]'}
        }
    },

    /**
     * Insert new user
     * @param {object} userCollection
     * @param {object} user
     * @returns object if ok or error object if not
     */
    async create(userCollection, usrDataCollection, user, settings) {
        const loginUsr = {
            _id           : user.email,
            password      : user.password != '*' ? bcrypt.hashSync(user.password, 10) : '*',
            roles         : ['Responsable'],
            validationCode: generate(settings.lenVerifCode),
            emailVerified : !settings.verifyEmail,
        }

        user.data._id = user.email

        try {
            const dataRst = await usrDataCollection.insertOne(user.data)
            let result = await userCollection.insertOne(loginUsr)
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} [lib:atticUser:create]`, loginUsr._id, result.insertedId ? 'YES'.Bright.FgGreen : 'NO'.Bright.FgRed)
            return result
        } catch (error) {
            return { error }
        }
    },

    /**
     * Remove user from db
     * @param {object} userCollection
     * @param {string} _id
     * @returns string 'ok' if deleted or 'unchanged' if not
     */
    async delete(userCollection, usrDataCollection, _id) {
        try {
            const result = await userCollection.deleteOne({ _id })
            const dataRst = await usrDataCollection.deleteOne({ _id })
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} [lib:atticUser:delete]`, _id, result.deletedCount ? 'YES'.Bright.FgGreen : 'NO'.Bright.FgRed)
            if (result.deletedCount == 1 && dataRst.deletedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return { error }
        }

    },

    /**
     * Update roles of a user
     * @param {object} userCollection
     * @param {object} userData
     * @returns string 'ok' if updated or 'unchanged' if not
     */
    async update(userCollection, userData) {
        try {
            const _id = userData._id
            const $set = {
                roles: userData.roles
            }

            const result = await userCollection.updateOne({_id}, {$set})
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} [lib:atticUser:update]`, userData._id, result.modifiedCount ? 'YES'.Bright.FgGreen : 'NO'.Bright.FgRed)
            if (result.modifiedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:atticUser:update]'}
        }
    },
    async find(userCollection) {
        try {
            const result = await userCollection.find().toArray()
            const out = result.map(u => {
                u.password = '*'
                return u
            })
            return out
        } catch (error) {
            return { error, from: `[lib:atticUser:find]` }
        }
    },
    async rolList(userCollection) {
        try {
            const result = await userCollection.find().toArray()
            const out = result.map(u => {
                u.password = '*'
                return u
            })
            return out
        } catch (error) {
            return { error, from: `[lib:atticUser:find]` }
        }
    }
}
