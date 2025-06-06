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
        required: true,
    },
    setor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Setor',
        required: true,
    },
    membros: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
        },
        funcao: String,
    }],
}, { timestamps: true });

const Rodizio = mongoose.models.Rodizio || mongoose.model('Rodizio', rodizioSchema);


module.exports = Rodizio;