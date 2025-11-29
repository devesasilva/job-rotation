const mongoose = require('mongoose');

const rodizioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    descricao: {
        type: String
    },
    ciclo: {
        type: String,
        enum: ['Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Anual'],
    },
    setor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Setor',
    },
    
    membros: [{
        type: String,
        required: true,
    }],
    
    funcoes: [{
        type: String,
        required: true,
    }],
    
    dataInicio: {
        type: Date,
        required: true,
    },
    dataFim: {
        type: Date,
        required: true,
    },
    duracaoTurno: {
        type: Number,
        required: true,
    }

}, { timestamps: true });

const Rodizio = mongoose.models.Rodizio || mongoose.model('Rodizio', rodizioSchema);

module.exports = Rodizio;
