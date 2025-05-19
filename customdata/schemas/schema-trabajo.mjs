import Joi from 'joi';
const { string, number } = Joi.types();

export default Joi.object({
    TRABAJO: string.required(),
    PRECIO : number.required()
})
