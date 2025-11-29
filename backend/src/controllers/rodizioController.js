const Rodizio = require("../models/Rodizio");
const Equipe = require("../models/Setor"); 
const Usuario = require("../models/Usuario")
//const { sugerirAlocacoes } = require("../services/rodizioService")

// Função de validação dos membros
const validarMembros = async (membros) => {
  if (!membros || !Array.isArray(membros) || membros.length === 0) {
    return { valid: false, message: 'Membros são obrigatórios e devem ser um array não vazio.' };
  }
  if (membros.some(m => !m.nome || typeof m.nome !== 'string' || m.nome.trim() === '')) {
    return { valid: false, message: 'Todos os membros devem ter um nome associado (texto não vazio).' };
  }
  if (membros.some(m => m.funcao !== undefined && typeof m.funcao !== 'string')) {
      return { valid: false, message: 'A função do membro deve ser um texto.' };
  }
  return { valid: true };
};

// Função de validação das necessidades
const validarNecessidades = (necessidades) => {
  if (!necessidades || necessidades.length === 0) {
    return { valid: true };
  }

  for (const necessidade of necessidades) {
    if (!necessidade.habilidade || !necessidade.formacao || !necessidade.quantidade || typeof necessidade.quantidade !== 'number' || necessidade.quantidade <= 0) {
      return { valid: false, message: 'Cada necessidade deve ter habilidade, formação e uma quantidade numérica positiva.' };
    }
  }
  return { valid: true };
};

// Cria um novo Rodízio
const criarRodizio = async (req, res) => {
  // Captura o ID da equipe dos parâmetros da URL
  const equipeId = req.params.equipeId; 

  try {
    const { nome, descricao, ciclo, membros, necessidades, dataInicio, dataFim } = req.body;
    
    if (!nome || !ciclo || !equipeId || !dataInicio || !dataFim) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios faltando (nome, ciclo, ID da equipe e datas).' });
    }

    // O Rodízio será criado assumindo que o equipeId é válido.
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
      setor: equipeId, // Usa o ID da equipe
      membros,
      necessidades,
      dataInicio,
      dataFim,
    });

    await novoRodizio.save();

    res.status(201).json({ mensagem: 'Rodízio criado com sucesso!', rodizio: novoRodizio });
} catch (error) {
    console.error('Erro detalhado ao criar rodízio:', error);
    
    // O tratamento de CastError é mantido para IDs malformados
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ 
            mensagem: `ID de Equipe inválido ou malformado: ${equipeId}. Verifique o formato do ObjectId.`, 
            erro: error.message 
        });
    }

    res.status(500).json({ mensagem: 'Erro ao criar rodízio', erro: error.message });
}
};

// Lista todos os Rodízios (opcionalmente filtrado por equipe/setor)
const listarRodizios = async (req, res) => {
  try {
    const { equipeId } = req.query;

    let filter = {};
    if (equipeId) {
      filter.setor = equipeId; 
    }

    const rodizios = await Rodizio.find(filter)
      .populate("setor", "nome descricao")
      .lean();

    res.status(200).json(rodizios);
  } catch (error) {
    console.error("Erro ao listar rodízios:", error);
    res
      .status(500)
      .json({ mensagem: "Erro ao listar rodízios", erro: error.message });
  }
};

// Lista um Rodízio por ID
const listarRodizioPorId = async (req, res) => {
  try {
    const rodizio = await Rodizio.findById(req.params.id)
      .populate("setor", "nome descricao")
      .lean();

    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }

    res.status(200).json(rodizio);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar rodízio", erro: error.message });
  }
};

// Atualiza um Rodízio existente
const atualizarRodizio = async (req, res) => {
  try {
    const rodizio = await Rodizio.findById(req.params.id);

    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }

    const { equipe: equipeIdUpdate, membros: membrosUpdate, necessidades: necessidadesUpdate, ...rest } = req.body;

    Object.assign(rodizio, rest);

    if (equipeIdUpdate) {
        rodizio.setor = equipeIdUpdate;
    }

    if (membrosUpdate) {
        rodizio.membros = membrosUpdate;
      const validacaoMembros = await validarMembros(rodizio.membros);
      if (!validacaoMembros.valid) {
        return res.status(400).json({ mensagem: validacaoMembros.message });
      }
    }

    if (necessidadesUpdate) {
        rodizio.necessidades = necessidadesUpdate;
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

// Deleta um Rodízio
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

/*
// Função comentada para sugestão de alocações (mantida conforme solicitado)
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
};*/

module.exports = {
  criarRodizio,
  listarRodizios,
  listarRodizioPorId,
  atualizarRodizio,
  deletarRodizio,
  //sugerirAlocacoesRodizio,
};
