var mongoose = require('mongoose');

var authorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        companyName: {
            type: String,
            required: true
        },
        companyAddress: {
            type: String,
            required: true
        },
        companyProject:{
            type: String,
            required: true
        }
    },
    blockchain: {
        txhash: {
            type: String,
            required: true
        },
        blocknumber: {
            type: String,
            required: true
        },
        blockhash: {
            type: String,
            required: true
        },
        registrationDate: {
            type: String,
            required: true
        },
        gasused: {
            type: String,
            required: true
        }
    }
});

var Author = mongoose.model('Author', authorSchema);

module.exports = Author;