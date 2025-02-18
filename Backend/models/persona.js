const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    persona: { type: [String], default: [] }
});

module.exports = mongoose.model('Persona', personaSchema);
