var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var iaftagSchema = new Schema({
    type: {type:String,required:true},
    classname: {type:String, required:true},
    description:{type:String, default:""},
    children : {type:Array, default:[]},
    properties: {type:Array,default:[]},
    attrs:{type: Schema.Types.Mixed,default:{}},
    xml : {type:Schema.Types.Mixed, default:{}},
    free : {type:String, default:"true"},
    url : {type:String, default:""}
    },{minimize : false});

var Iaftag = mongoose.model('iaftag',iaftagSchema);
module.exports = Iaftag;