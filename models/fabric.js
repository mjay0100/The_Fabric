var mongoose = require("mongoose");

// Schema Setup
var fabricSchema = new mongoose.Schema({
    name : String,
    image : String,
    imageId : String,
    description : String,
    createdAt: { type: Date, default: Date.now },
    cost : Number,
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        } ,
        username : String
    }
})

module.exports = mongoose.model("Fabric", fabricSchema);