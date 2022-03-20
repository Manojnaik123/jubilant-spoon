const { kStringMaxLength } = require('buffer');
const mongoose = require('mongoose');

const Schema=mongoose.connection
const campgroundSchema=new mongoose.Schema({
    title:String,
    price:Number,
    image:String,
    description:String,
    location:String,
    review:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
})
    
const Campground=mongoose.model('Campground',campgroundSchema)
module.exports=Campground;