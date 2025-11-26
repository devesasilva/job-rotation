// services/rodizioService.js
const Usuario = require('../models/Usuario');
const Rodizio = require('../models/Rodizio');
//const Setor = require('../models/Setor');

async function sugerirAlocacoes(rodizioId) {
  const rodizio = await Rodizio.findById(rodizioId).populate('setor');

  if (!rodizio || !rodizio.necessidades) {
    throw new Error('Rodízio inválido ou sem necessidades definidas.');
  }

  // 1. Obter todos os usuários disponíveis
  const usuarios = await Usuario.find({});

  const sugestoes = usuarios.map(usuario => {
    // Peso 1: Habilidades e formação compatíveis com as necessidades do rodízio
    const matchHabilidades = rodizio.necessidades.habilidades.filter(hab =>
      usuario.habilidades?.includes(hab)
    ).length;

    const matchFormacao = rodizio.necessidades.formacao?.includes(usuario.formacao) ? 1 : 0;

    const matchScore = matchHabilidades + (matchFormacao * 2); // formação pesa mais

    // Peso 2: Tempo no cargo atual (mais tempo = mais chance de trocar)
    const tempoNoCargo = usuario.dataInicioCargoAtual
      ? Date.now() - new Date(usuario.dataInicioCargoAtual).getTime()
      : 0;

    const diasNoCargo = Math.floor(tempoNoCargo / (1000 * 60 * 60 * 24));

    return {
      usuario,
      score: matchScore,
      tempoNoCargo: diasNoCargo,
    };
  });

  // Ordenar por melhor score e mais tempo no cargo
  const ordenados = sugestoes
    .sort((a, b) => {
      if (b.score === a.score) {
        return b.tempoNoCargo - a.tempoNoCargo; // quem está há mais tempo
      }
      return b.score - a.score;
    });

  return ordenados.map(s => ({
    usuario: s.usuario.nome,
    score: s.score,
    diasNoCargo: s.tempoNoCargo,
    id: s.usuario._id,
  }));
}

module.exports = {
  sugerirAlocacoes
};
