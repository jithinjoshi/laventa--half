const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category:String
},{timestamps:true});

module.exports = new mongoose.model('Category',categorySchema);