const Setor = require('../models/setor')

const criarSetor = async (dados) => {
    const setor = new Setor(dados);
    return await setor.save();
};

const listarSetores = async () => {
    return await Setor.find().populate('equipe');
};

const buscarSetorPorId = async (id) => {
    return await Setor.findById(id).populate('equipe');  
};

const atualizarSetor = async (id, dados) => {
    return await Setor.findByIdAndUpdate(id, dados, {new: true});
};

const deletarSetor = async (id) => {
    return await Setor.findByIdAndDelete(id);
};

module.exports = {
    criarSetor,
    listarSetores,
    buscarSetorPorId,
    atualizarSetor,
    deletarSetor
};