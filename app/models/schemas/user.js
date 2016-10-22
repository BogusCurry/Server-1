'use strict';


module.exports = mongoose => {

    const Schema = mongoose.Schema;
    const schema = new Schema(
        {
            user: {
                type: String,
                trim: true,
                lowercase: true,
                default: null
            },
            gender: {
                type: String,
                default: null
            },
            meta: {
                createdOn: {
                    type: Date,
                    default: Date.now
                }
            }
        },
        {
            strict: true,
            versionKey: false
        }
    );

    return mongoose.model('User', schema, 'users');
};
