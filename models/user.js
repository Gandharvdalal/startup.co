var mongoose=require("mongoose");
var paasportlocalmongoose=require('passport-local-mongoose')
var UserSchema=new mongoose.Schema({
    username:String,
    password:String
});

UserSchema.plugin(paasportlocalmongoose);
module.exports=mongoose.model("User",UserSchema);