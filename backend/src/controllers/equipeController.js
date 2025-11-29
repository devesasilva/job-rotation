const Equipe = require("../models/Equipe");
const Usuario = require("../models/Usuario");

const criarEquipe = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ mensagem: "Usuário não autenticado ou ID do usuário ausente no token." });
    }

    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ mensagem: "O nome da equipe é obrigatório." });
    }

    const membrosIniciais = [
      {
        usuario: userId,
      }
    ];

    const criadorId = userId;

    const equipe = new Equipe({ nome, descricao, criadorId, membros: membrosIniciais });
    await equipe.save();

    res.status(201).json(equipe);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensagens = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        mensagem: "Erro de validação ao criar equipe: " + mensagens,
        erro: error.message
      });
    }
    console.error("Erro ao criar equipe:", error);
    res.status(500).json({ mensagem: "Erro interno ao criar equipe", erro: error.message });
  }
};

const listarEquipes = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ mensagem: "Usuário não autenticado para listar equipes." });
    }

    const equipes = await Equipe.find({
      "membros.usuario": userId
    }).populate("membros.usuario", "nome email _id"); // Mudei aqui

    if (equipes.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(equipes);
  } catch (error) {
    console.error("Erro ao listar equipes filtradas:", error);
    res.status(500).json({ mensagem: "Erro ao listar equipes", erro: error.message });
  }
};

const atualizarEquipe = async (req, res) => {
  try {
    let equipe = await Equipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true 
    });

    if (!equipe) {
      return res.status(404).json({ mensagem: "Equipe não encontrada" });
    }

    equipe = await equipe.populate("membros.usuario", "nome email _id"); // Mudei aqui

    res.json(equipe);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao atualizar equipe", erro: error.message });
  }
};

const listarEquipePorId = async (req, res) => {
  try {
    // Adicionando _id à população para que o frontend possa identificar o criador
    const equipe = await Equipe.findById(req.params.id)
      .populate("membros.usuario", "nome email _id"); // Mudei aqui

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