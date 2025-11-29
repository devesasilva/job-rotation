const Rodizio = require("../models/Rodizio");
const Equipe = require("../models/Setor"); 
const Usuario = require("../models/Usuario")
const { sugerirAlocacoes } = require("../services/rodizioService")

// [ATUALIZADO] Valida se membros é um array de strings não vazio (nomes)
const validarMembros = async (membros) => {
  if (!membros || !Array.isArray(membros) || membros.length === 0) {
    return { valid: false, message: 'Membros são obrigatórios e devem ser um array não vazio.' };
  }
  // Removemos a verificação de ID de usuário, agora apenas valida se são strings
  if (membros.some(m => typeof m !== 'string' || m.trim().length === 0)) {
    return { valid: false, message: 'Todos os membros devem ser nomes válidos (strings).' };
  }
  return { valid: true };
};

// [ADICIONADO] Valida se funções é um array de strings não vazio (cargos)
const validarFuncoes = (funcoes) => {
  if (!funcoes || !Array.isArray(funcoes) || funcoes.length === 0) {
    return { valid: false, message: 'Funções são obrigatórias e devem ser um array não vazio.' };
  }
  if (funcoes.some(f => typeof f !== 'string' || f.trim().length === 0)) {
    return { valid: false, message: 'Todas as funções devem ser nomes válidos (strings).' };
  }
  return { valid: true };
};

// [ATUALIZADO] Necessidades temporariamente ignoradas conforme sua solicitação
const validarNecessidades = (necessidades) => {
  return { valid: true };
};

// =========================================================================
// FUNÇÃO: criarRodizio (Compatível com o Schema Simplificado)
// =========================================================================
const criarRodizio = async (req, res) => {
  try {
    // Campos esperados pelo Frontend e compatíveis com o Schema: nome, duracaoTurno, membros, funcoes
    const { nome, dataInicio, dataFim, duracaoTurno, membros, funcoes } = req.body;

    // 1. Validação Básica
    if (!nome || !dataInicio || !dataFim || !duracaoTurno || !membros || !funcoes) {
      return res.status(400).json({ mensagem: "Todos os campos obrigatórios (nome, datas, duração, membros, funções) devem ser preenchidos." });
    }

    // 2. Validação de Membros (agora strings)
    const validacaoMembros = await validarMembros(membros);
    if (!validacaoMembros.valid) {
      return res.status(400).json({ mensagem: validacaoMembros.message });
    }

    // 3. Validação de Funções (agora strings)
    const validacaoFuncoes = validarFuncoes(funcoes);
    if (!validacaoFuncoes.valid) {
      return res.status(400).json({ mensagem: validacaoFuncoes.message });
    }
    
    // NOTA: 'setor' e 'ciclo' são opcionais no schema, então não são necessários aqui.

    // 4. Criar o novo Rodízio
    const novoRodizio = new Rodizio({
      nome,
      dataInicio,
      dataFim,
      duracaoTurno,
      membros, // Array de strings (nomes)
      funcoes, // Array de strings (cargos)
      // Necessidades, setor e ciclo são opcionais ou omitidos
    });

    await novoRodizio.save();

    res.status(201).json({ mensagem: "Rodízio criado com sucesso!", rodizio: novoRodizio });
  } catch (error) {
    console.error("Erro ao criar rodízio:", error);
    res.status(500).json({ mensagem: "Erro interno ao criar rodízio", erro: error.message });
  }
};

const listarRodizios = async (req, res) => {
  try {
    // Se o RodizioController anterior usava listarRodiziosPorEquipe, você pode mudar o nome ou manter
    // Para simplificar, vou usar o nome genérico 'listarRodizios'
    const rodizios = await Rodizio.find();
    res.json(rodizios);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar rodízios", erro: error.message });
  }
};

const buscarRodizio = async (req, res) => {
  try {
    const rodizio = await Rodizio.findById(req.params.id);
    if (!rodizio) {
      return res.status(404).json({ mensagem: "Rodízio não encontrado" });
    }
    res.json(rodizio);
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

    const updates = req.body;
    
    // Validação de membros e funções se estiverem presentes no update
    if (updates.membros) {
      const validacaoMembros = await validarMembros(updates.membros);
      if (!validacaoMembros.valid) {
        return res.status(400).json({ mensagem: validacaoMembros.message });
      }
    }
    if (updates.funcoes) {
      const validacaoFuncoes = validarFuncoes(updates.funcoes);
      if (!validacaoFuncoes.valid) {
        return res.status(400).json({ mensagem: validacaoFuncoes.message });
      }
    }
    
    // Ignorando validação de necessidades
    
    // Aplica as atualizações no objeto Rodizio
    Object.keys(updates).forEach(key => {
      // Ignora campos complexos que não são mais usados, como 'necessidades'
      if (key !== 'necessidades') { 
        rodizio[key] = updates[key];
      }
    });

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

module.exports = {
  criarRodizio,
  listarRodizios, // Usando função genérica
  buscarRodizio,
  atualizarRodizio,
  deletarRodizio,
  // As funções listarRodiziosPorEquipe, listarRodiziosPorUsuario, e getRodizio foram removidas
  // pois não há implementação completa delas e a estrutura simplificada não as requer
};
