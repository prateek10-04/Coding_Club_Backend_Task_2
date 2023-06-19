const mongoose=require('mongoose')
const User=require('../models/user')

const bookSchema=mongoose.Schema({
    
    title:{type : String, required:true},
    author:{type : String, required:true},
    price:{type : Number, required:true},
    rating:{type : Number, required:true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

module.exports=mongoose.model('Books',bookSchema)