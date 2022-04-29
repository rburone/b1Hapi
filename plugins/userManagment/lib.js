'use strict'

const crypto     = require('crypto');
const bcrypt     = require('bcryptjs');
const {generate} = require('../../lib/methods').b1Lib

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
        return {error, from: '[lib:userMangment:saveToken]'}
    }
}

module.exports = {
    /**
     * Check user credentials and generate token
     * @param {RequestObject} req
     * @param {Boolean} verifyEmail If required verify email
     * @returns String/Boolean access token or false
     */
    async checkUser(userCollection, tokenCollection, payload, {verifyEmail , ttl}) {
        try {
            const result = await userCollection.findOne({_id: payload.email})
            if (result) {
                if (bcrypt.compareSync(payload.password, result.password)) {
                    if (verifyEmail && !result.emailVerified) {
                        return 'Email not verified'
                    } else {
                        return await saveToken(tokenCollection, result._id, ttl);
                    }
                } else {
                    return {error: 401}
                }
            } else {
                return {error: 404}
            }
        } catch (error) {
            return {error, from: '[lib:userMangment:checkUser]'}
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
            return {error, from: '[lib:userMangment:checkUser]'}
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
            return {error, from: '[lib:userMangment:revokeToken]'}
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
            return {error, from: '[lib:userMangment:setVerificationCode]'}
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

            if (result.modifiedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:userMangment:chkVerificationCode]'}
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
            if (result.modifiedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:userMangment:updatePass]'}
        }
    },

    /**
     * Insert new user
     * @param {object} userCollection
     * @param {object} data
     * @returns object if ok or error object if not
     */
    async create(userCollection, data) {
        user.password = bcrypt.hashSync(data.password, 10);
        user.validationCode = generate(data.lenVerifCode)

        try {
            const result = await userCollection.insertOne(user)
            return result
        } catch (error) {
            return {error, from: '[lib:userMangment:create]'}
        }

    },

    /**
     * Remove user from db
     * @param {object} userCollection
     * @param {string} _id
     * @returns string 'ok' if deleted or 'unchanged' if not
     */
    async delete(userCollection, _id) {
        try {
            const result = await userCollection.deleteOne({_id})
            if (result.deletedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:userMangment:delete]'}
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

            if (result.modifiedCount == 1) {
                return 'ok'
            } else {
                return 'unchanged'
            }
        } catch (error) {
            return {error, from: '[lib:userMangment:update]'}
        }
    },
}
