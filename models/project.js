
const mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: String,
        required: true,
        trim: true
    },
    link: String,
    description: String,
    image: String,
    reviewStatus: Boolean,
    authors: {
        type: String,
      
    },
    author: [{

        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: [String],
        user: [String]
    }],
    abstract: String,
    supervisor: String,

})

module.exports = mongoose.model("Project", projectSchema)