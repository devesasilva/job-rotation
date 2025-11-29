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
    if (!necessidade.habilidade || necessidade.habilidade.trim() === '') {
        return { valid: false, message: 'Toda necessidade deve ter uma descrição de habilidade válida.' };
    }
    if (typeof necessidade.slots !== 'number' || necessidade.slots <= 0) {
        return { valid: false, message: `A necessidade '${necessidade.habilidade}' deve ter um número positivo de slots.` };
    }
  }
  return { valid: true };
};

// =========================================================================
// FUNÇÃO ADICIONADA: criarRodizio (Corrige o erro 400 Bad Request)
// =========================================================================
const criarRodizio = async (req, res) => {
  try {
    // O ID da equipe (Setor) vem dos parâmetros da URL
    const equipeId = req.params.equipeId; 
    const { titulo, descricao, dataInicio, dataFim, periodoRotacaoEmDias, membros, necessidades } = req.body;

    // 1. VALIDAR A EXISTÊNCIA DA EQUIPE/SETOR
    const equipe = await Equipe.findById(equipeId);
    if (!equipe) {
      // Retorna a mensagem de erro que o cliente estava recebendo, garantindo que o ID exista.
      return res.status(400).json({ mensagem: "A Equipe especificada não foi encontrada." });
    }

    // 2. Validações básicas e de membros/necessidades
    if (!titulo || !dataInicio || !dataFim || !periodoRotacaoEmDias) {
      return res.status(400).json({ mensagem: "Campos obrigatórios ausentes (título, datas, período)." });
    }

    const validacaoMembros = await validarMembros(membros);
    if (!validacaoMembros.valid) {
      return res.status(400).json({ mensagem: validacaoMembros.message });
    }

    const validacaoNecessidades = validarNecessidades(necessidades);
    if (!validacaoNecessidades.valid) {
      return res.status(400).json({ mensagem: validacaoNecessidades.message });
    }
    
    // 3. Sugerir Alocações (Usando o Service)
    const alocacoesSugeridas = sugerirAlocacoes(
        membros, 
        necessidades, 
        new Date(dataInicio), 
        new Date(dataFim), 
        periodoRotacaoEmDias
    );

    // 4. Criar o novo Rodízio
    const novoRodizio = new Rodizio({
      equipe: equipeId,
      titulo,
      descricao,
      dataInicio,
      dataFim,
      periodoRotacaoEmDias,
      membros,
      necessidades,
      alocacoes: alocacoesSugeridas,
      status: 'Aberto'
    });

    await novoRodizio.save();

    res.status(201).json({ 
        mensagem: "Rodízio criado com sucesso!", 
        rodizio: novoRodizio 
    });

  } catch (error) {
    console.error("Erro ao criar rodízio:", error);
    res
      .status(500)
      .json({ mensagem: "Erro interno ao criar rodízio", erro: error.message });
  }
};


// Funções existentes listadas no snippet (Manter a estrutura original)
const getRodizio = async (req, res) => {
  // Implementação para buscar um rodízio
  // ... (Conteúdo original não fornecido, apenas mantendo a referência)
};

const listarRodiziosPorEquipe = async (req, res) => {
  // Implementação para listar rodízios por equipe
  // ... (Conteúdo original não fornecido, apenas mantendo a referência)
};

const listarRodiziosPorUsuario = async (req, res) => {
  // Implementação para listar rodízios por usuário
  // ... (Conteúdo original não fornecido, apenas mantendo a referência)
};


const atualizarRodizio = async (req, res) => {
  try {
    const rodizio = await Rodizio.findById(req.params.id);

    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }

    // Aplica as atualizações do body
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      rodizio[key] = updates[key];
    });

    // Revalida membros e necessidades se forem atualizados
    if (rodizio.membros) {
      const validacaoMembros = await validarMembros(rodizio.membros);
      if (!validacaoMembros.valid) {
        return res.status(400).json({ mensagem: validacaoMembros.message });
      }
    }

    if (rodizio.necessidades) {
      const validacaoNecessidades = validarNecessidades(rodizio.necessidades);
      if (!validacaoNecessidades.valid) {
        return res.status(400).json({ mensagem: validacaoNecessidades.message });
      }
    }

    await rodizio.save();

    res.json({ mensagem: \"Rodízio atualizado com sucesso!\", rodizio });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: \"Erro ao atualizar rodízio\", erro: error.message });
  }
};

const deletarRodizio = async (req, res) => {
  try {
    const rodizio = await Rodizio.findByIdAndDelete(req.params.id);
    if (!rodizio) {
      return res.status(404).json({ mensagem: \"Rodízio não encontrado\" });
    }
    res.json({ mensagem: \"Rodízio removido com sucesso\" });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: \"Erro ao deletar rodízio\", erro: error.message });
  }
};

module.exports = {
  // Garante que 'criarRodizio' seja exportado
  criarRodizio, 
  getRodizio,
  listarRodiziosPorEquipe,
  listarRodiziosPorUsuario,
  atualizarRodizio,
  deletarRodizio,
};
