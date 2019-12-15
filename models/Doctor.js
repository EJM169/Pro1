var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
//Declaring the doctor schema
var doctorSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    userid:String,
    mobile:Number,
    dateOfJoin:{type:Date , default:Date.now}
    // username:s,
    // email:string,

});

doctorSchema.plugin(passportLocalMongoose); //Creating the mangoose schema using passport
module.exports = mongoose.model("Doctor", doctorSchema);       //Exporting the schema
