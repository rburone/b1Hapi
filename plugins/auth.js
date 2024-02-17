'use strict'
  /******************************************************
* auth.js
* Plugin for authorizartion using accesstoken
* Autor: Ricardo D. Burone <rdburone@gmail.com>
*
* Check duration of accesstoken
*/
const AuthBearer = require('hapi-auth-bearer-token');
const Joi        = require('joi')

async function checkToken(token, req, modelToken, modelUser) {
    try {
        const aggregate = [
            {
                $match: {
                    _id: token
                }
            },
            {
                $lookup: {
                    'from'        : modelUser,
                    'localField'  : 'userId',
                    'foreignField': '_id',
                    'as'          : 'user'
                }
            },
            {
                $project: {
                    roles  : {$arrayElemAt: ['$user.roles', 0]},
                    ttl    : 1,
                    created: 1
                }
            },
        ]

        const result = (await req.mongo.db.collection(modelToken).aggregate(aggregate).toArray())[0]

        if (result) {
            const created = new Date(result.created)
            const diff    = Math.round((new Date() - created) / 1000)
            const isValid = diff <= result.ttl

            return {isValid, permissions: result.roles}
        } else {
            return {isValid: false}
        }
    } catch (error) {
        return error
    }
}

const OptionsSchema = Joi.object({
    modelToken: Joi.string().required(),
    modelUser : Joi.string().required(),
})

module.exports = {
    name: 'auth',
    async register(server, options) {
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:auth:options]')

        await server.register(AuthBearer)
        server.auth.strategy('simple', 'bearer-access-token', {
            allowQueryToken: true,
            validate       : async (req, token/*, h*/) => {
                const check = await checkToken(token, req, options.modelToken, options.modelUser)
                const credentials = {token, permissions: check.permissions};                             // 👨‍💻 Used by ACL system
                // const artifacts = {test: 'info'};
                return {isValid: check.isValid, credentials/*, artifacts*/};
            }
        });
        server.auth.default('simple');
    }
}
