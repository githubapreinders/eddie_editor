var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var jsonmonsterSchema = new Schema({
	json : Schema.Types.Mixed
    });

var JsonMonster = mongoose.model('jsonmonster',jsonmonsterSchema);
module.exports = JsonMonster;