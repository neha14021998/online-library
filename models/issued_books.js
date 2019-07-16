let mongoose = require('mongoose');
let issueSchema = new mongoose.Schema({
    libcard: String,
    book_ref:String,
    req_date:Date,
    issue_date: Date,
    return_date: Date,
    fine:Number
 });    

 let Books_issued = mongoose.model('Books_issued',issueSchema);
 module.exports = Books_issued;