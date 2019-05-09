
var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({ 
    author: { 
        type: String,
        required: true
    },
    publisher: { 
        type: String,
        required: true
    },
    rating: { 
        type: Number,
        required: true
    },
    text: { 
        type: String,
        required: true
    }
});

var commentSchema = new mongoose.Schema({ 
    username: { 
        type: String,
        required: true
    },
    text: { 
        type: String,
        required: true
    }
});

var tvshowSchema = new mongoose.Schema({ 
    title: { 
        type: String,
        required: true
    },
    network: { 
        type: String,
        required: true
    },
    actors: { 
        type: [String],
        required: true
    },
    genres: { 
        type: [String],
        required: true
    },
    language: { 
        type: String,
        required: true
    },
    rating: { 
        type: Number,
        required: true
    },
    reviews: [reviewSchema],
    comments: [commentSchema]
});

var TVShow = mongoose.model('TVShow', tvshowSchema); // constructor for schema

module.exports = TVShow