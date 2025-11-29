const Rodizio = require("../models/Rodizio");
const Equipe = require("../models/Setor");
const Usuario = require("../models/Usuario")
const { sugerirAlocacoes } = require("../services/rodizioService")

const validarMembros = async (membros) => {
  if (!membros || !Array.isArray(membros) || membros.length === 0) {
    return { valid: false, message: 'Membros são obrigatórios e devem ser um array não vazio.' };
  }
  if (membros.some(m => !m.usuario)) {
    return { valid: false, message: 'Todos os membros devem ter um ID de usuário associado.' };
  }
  const usuarioIds = membros.map(m => m.usuario);
  const usuariosEncontrados = await Usuario.find({ _id: { $in: usuarioIds } });
  if (usuariosEncontrados.length !== usuarioIds.length) {
    return { valid: false, message: 'Um ou mais usuários referenciados não foram encontrados.' };
  }
  return { valid: true };
};

const validarNecessidades = (necessidades) => {
  if (!necessidades || !Array.isArray(necessidades) || necessidades.length === 0) {
    return { valid: false, message: 'Necessidades são obrigatórias e devem ser um array não vazio.' };
  }
  for (const necessidade of necessidades) {
    if (!necessidade.habilidade || !necessidade.formacao || !necessidade.quantidade || typeof necessidade.quantidade !== 'number' || necessidade.quantidade <= 0) {
      return { valid: false, message: 'Cada necessidade deve ter habilidade, formação e uma quantidade numérica positiva.' };
    }
  }
  return { valid: true };
};

const criarRodizio = async (req, res) => {
  try {
    const { equipeId: equipeIdFromParams } = req.params;

    const { nome, descricao, ciclo, equipe: equipeIdFromBody, membros, necessidades, dataInicio, dataFim } = req.body;

    const equipe = equipeIdFromParams || equipeIdFromBody;

    if (!nome || !ciclo || !equipe || !dataInicio || !dataFim) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios faltando (nome, ciclo, equipe e datas).' });
    }

    const equipeExiste = await Equipe.findById(equipe);
    if (!equipeExiste) {
      return res.status(400).json({ mensagem: 'A Equipe especificada não foi encontrada.' });
    }

    const validacaoMembros = await validarMembros(membros);
    if (!validacaoMembros.valid) {
      return res.status(400).json({ mensagem: validacaoMembros.message });
    }

    const validacaoNecessidades = validarNecessidades(necessidades);
    if (!validacaoNecessidades.valid) {
      return res.status(400).json({ mensagem: validacaoNecessidades.message });
    }

    const novoRodizio = new Rodizio({
      nome,
      descricao,
      ciclo,
      setor: equipe,
      membros,
      necessidades,
      dataInicio,
      dataFim,
    });

    await novoRodizio.save();

    res.status(201).json({ mensagem: 'Rodízio criado com sucesso!', rodizio: novoRodizio });
  } catch (error) {
    console.error('Erro detalhado ao criar rodízio:', error);
    res.status(500).json({ mensagem: 'Erro ao criar rodízio', erro: error.message });
  }
};

const listarRodizios = async (req, res) => {
  try {
    const { equipeId } = req.query;

    let filter = {};
    if (equipeId) {
      filter.setor = equipeId;
    }

    const rodizios = await Rodizio.find(filter)
      .populate("setor", "nome descricao")
      .populate("membros.usuario", "nome email");

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
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }

    res.status(200).json(rodizio);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar rodízio", erro: error.message });
  }
};

const atualizarRodizio = async (req, res) => {
  try {
    const rodizio = await Rodizio.findById(req.params.id);

    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }

    Object.assign(rodizio, req.body);

    if (req.body.equipe) {
      const equipeExiste = await Equipe.findById(req.body.equipe);
      if (!equipeExiste) {
        return res.status(400).json({ mensagem: 'A Equipe especificada não foi encontrada.' });
      }
      rodizio.setor = req.body.equipe;
    }

    if (req.body.membros) {
      const validacaoMembros = await validarMembros(rodizio.membros);
      if (!validacaoMembros.valid) {
        return res.status(400).json({ mensagem: validacaoMembros.message });
      }
    }

    if (req.body.necessidades) {
      const validacaoNecessidades = validarNecessidades(rodizio.necessidades);
      if (!validacaoNecessidades.valid) {
        return res.status(400).json({ mensagem: validacaoNecessidades.message });
      }
    }

    await rodizio.save();

    res.json({ mensagem: "Rodízio atualizado com sucesso!", rodizio });
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
    if (error.message.includes("Rodízio não encontrado")) {
      return res.status(404).json({ mensagem: error.message });
    }
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