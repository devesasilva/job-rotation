const Rodizio = require("../models/Rodizio");

const criarRodizio = async (req, res) => {
  try {
    const setorExistente = await Setor.findById(req.body.setor);
    if (!setorExistente) {
      return res.status(400).json({ mensagem: "Setor não encontrado" });
    }

    const rodizio = new Rodizio(req.body);
    await rodizio.save();
    res.status(201).json(rodizio);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao criar rodízio", erro: error.message });
  }
};

const listarRodizios = async (req, res) => {
  try {
    const rodizios = await Rodizio.find()
      .populate("setor", "nome descricao")
      .populate("membros.usuario", "nome email");

    if (rodizios.length === 0) {
      return res.status(404).json({ mensagem: "Nenhum rodízio encontrado." });
    }

    res.status(200).json(rodizios);
  } catch (error) {
    console.error("Erro ao listar rodízios:", error);
    res
      .status(500)
      .json({ mensagem: "Erro ao listar rodízios", erro: error.message });
  }
};

const listarRodizioPorId = async (req, res) => {
  try {
    const rodizio = await Rodizio.findById(req.params.id)
      .populate("setor", "nome descricao")
      .populate("membros.usuario", "nome email");

    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado." });
    }

    res.status(200).json(rodizio);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar rodízio", erro: error.message });
  }
};

const atualizarRodizio = async (req, res) => {
  try {
    const rodizio = await Rodizio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }
    res.json(rodizio);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao atualizar rodízio", erro: error.message });
  }
};

const deletarRodizio = async (req, res) => {
  try {
    const rodizio = await Rodizio.findByIdAndDelete(req.params.id);
    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }
    res.json({ mensagem: "Rodízio removido com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao deletar rodízio", erro: error.message });
  }
};

module.exports = {
  criarRodizio,
  listarRodizios,
  listarRodizioPorId,
  atualizarRodizio,
  deletarRodizio,
};