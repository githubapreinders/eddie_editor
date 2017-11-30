var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var snippetSchema = new Schema({
    name: String,
    description: String,
    xml: Schema.Types.Mixed,
    });

var Snippet = mongoose.model('snippet',snippetSchema);
module.exports = Snippet;