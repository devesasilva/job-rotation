const Equipe = require("../models/Equipe");
const Usuario = require("../models/Usuario");

const criarEquipe = async (req, res) => {
    try {
        const { nome, descricao, membros } = req.body;

        for (let membro of membros) {
            const usuarioExistente = await Usuario.findById(membro.usuario);
            if (!usuarioExistente) {
                return res.status(400).json({ mensagem: `Usuário ${membro.usuario} não encontrado` });
            }
        }

        const equipe = new Equipe({ nome, descricao, membros });
        await equipe.save();

        res.status(201).json(equipe);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao criar equipe", erro: error.message });
    }
};

const listarEquipes = async (req, res) => {
    try {
        const equipes = await Equipe.find().populate("membros.usuario", "nome email");

        res.status(200).json(equipes);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao listar equipes", erro: error.message });
    }
};

const atualizarEquipe = async (req, res) => {
    try {
        const equipe = await Equipe.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!equipe) {
            return res.status(404).json({ mensagem: "Equipe não encontrada" });
        }

        res.json(equipe);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao atualizar equipe", erro: error.message });
    }
};

const listarEquipePorId = async (req, res) => {
    try {
        const equipe = await Equipe.findById(req.params.id)
            .populate("membros.usuario", "nome email");

        if (!equipe) {
            return res.status(404).json({ mensagem: "Equipe não encontrada." });
        }

        res.status(200).json(equipe);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar equipe", erro: error.message });
    }
};

const deletarEquipe = async (req, res) => {
    try {
        const equipe = await Equipe.findByIdAndDelete(req.params.id);

        if (!equipe) {
            return res.status(404).json({ mensagem: "Equipe não encontrada" });
        }

        res.json({ mensagem: "Equipe removida com sucesso" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar equipe", erro: error.message });
    }
};

module.exports = {
    criarEquipe,
    listarEquipes,
    atualizarEquipe,
    deletarEquipe,
    listarEquipePorId,
};