const Rodizio = require("../models/Rodizio");
const Setor = require("../models/Setor");
const Usuario = require("../models/Usuario")
const { sugerirAlocacoes } = require("../services/rodizioService")

const criarRodizio = async (req, res) => {
  try {
    const { nome, descricao, ciclo, setor, membros, necessidades, dataInicio, dataFim } = req.body;

    
     // 1. Verificar campos obrigatórios básicos
    if (!nome || !ciclo || !setor || !dataInicio || !dataFim) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios faltando.' });
    }

    // 2. Validar membros - se for obrigatório
    if (!membros || !Array.isArray(membros) || membros.length === 0) {
      return res.status(400).json({ mensagem: 'Membros são obrigatórios e devem ser um array não vazio.' });
    }

    // 3. Validar que todos os usuários existem
    const usuarioIds = membros.map(m => m.usuario);
    const usuariosEncontrados = await Usuario.find({ _id: { $in: usuarioIds } });

    if (usuariosEncontrados.length !== usuarioIds.length) {
      return res.status(400).json({ mensagem: 'Um ou mais usuários não foram encontrados.' });
    }

    // 4. Validar necessidades - se for obrigatório
    if (!necessidades || !Array.isArray(necessidades) || necessidades.length === 0) {
      return res.status(400).json({ mensagem: 'Necessidades são obrigatórias e devem ser um array não vazio.' });
    }

    // 5. Validar campos de cada necessidade
    for (const necessidade of necessidades) {
      if (!necessidade.habilidade || !necessidade.formacao || !necessidade.quantidade) {
        return res.status(400).json({ mensagem: 'Cada necessidade deve ter habilidade, formação e quantidade.' });
      }
    }

    // Se chegou aqui, tá tudo certo pra criar
    const novoRodizio = new Rodizio({
      nome,
      descricao,
      ciclo,
      setor,
      membros,
      necessidades,
      dataInicio,
      dataFim,
    });

    await novoRodizio.save();

    res.status(201).json({ mensagem: 'Rodízio criado com sucesso!', rodizio: novoRodizio });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao criar rodízio', erro: error.message });
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

const sugerirAlocacoesRodizio = async (req, res) => {
  try {
    const { id } = req.params;
    const sugestoes = await sugerirAlocacoes(id);
    res.status(200).json(sugestoes);
  } catch (error) {
    console.error("Erro ao sugerir alocações:", error);
    res.status(500).json({ mensagem: "Erro ao sugerir alocações", erro: error.message });
  }
};

module.exports = {
  criarRodizio,
  listarRodizios,
  listarRodizioPorId,
  atualizarRodizio,
  deletarRodizio,
  sugerirAlocacoesRodizio,
};