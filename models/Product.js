const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:String,
    category:Array,
    price:Number,
    description:String,
    image:String
},
{timestamps:true}
);

module.exports = new mongoose.model('Product',productSchema)
