var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var iaftagSchema = new Schema({
    type: {type:String,default:""},
    classname: String,
    description:{type:Array, default:[]},
    children : {type:Array, default:[]},
    properties: {type:Array,default:[]},
    attrs:{},
    file : {type:String,default:""},
    });

var Iaftag = mongoose.model('iaftag',iaftagSchema);
module.exports = Iaftag;