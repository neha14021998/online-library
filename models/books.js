let mongoose = require('mongoose');
 let bookSchema = new mongoose.Schema({
    reference_id: String,
    bookname: String,
    slot:Number,
    status: String,
 });

 bookSchema.index({bookname:'text'});

 let Books = mongoose.model('Books',bookSchema);
 module.exports = Books;