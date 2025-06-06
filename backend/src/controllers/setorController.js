const setorService = require('../services/setorService');

const criar = async (req, res) => {
    try{
        const setor = await setorService.criarSetor(req.body);
        res.status(201).json(setor);
    } catch (error) {
        res.status(400).json({mensagem: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const setores = await setorService.listarSetores();
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
};

const buscarPorId = async (req, res) => {
    try{
        const setor = await setorService.buscarPorId(req.params.id);
        if (!setor) return res.status(404).json({ mensagem: 'Setor não encontrado' });
        res.status(200).json(setor);
    } catch (error) {
        res.status(500).json({ mensagem: error.message });
    }
};

const atualizar = async (req, res) => {
    try {
        const setor = await setorService.atualizarSetor(req.params.id, req.body);
        if (!setor) return res.status(404).json({ mensagem: 'Setor não encontrado' });
    } catch (error) {
        res.status(400).json({ mensagem: error.message });
    }
};

const deletar = async (req, res) => {
    try {
        const setor = await setorService.deletarSetor(req.params.id);
        if(!setor) return res.status(404).json({ mensagem: 'Setor não encontrado' });
    } catch (error) {
        res.status(500).json({ mensagem: error.message});
    }
};

module.exports = {
    criar,
    listar,
    buscarPorId,
    atualizar,
    deletar
};
