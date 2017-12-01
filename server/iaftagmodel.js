var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var iaftagSchema = new Schema({
    type: {type:String,default:""},
    classname: String,
    description:{type:String, default:""},
    children : {type:Array, default:[]},
    properties: {type:Array,default:[]},
    attrs:{},
    file : {type:String,default:""},
    xml : {type:Schema.Types.Mixed, default:{}}
    });

var Iaftag = mongoose.model('iaftag',iaftagSchema);
module.exports = Iaftag;