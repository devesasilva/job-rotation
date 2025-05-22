const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verifica se já existe um usuário com o mesmo e-mail
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
        }

        // Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // Cria novo usuário
        const novoUsuario = new Usuario({
            nome,
            email,
            senha: senhaCriptografada
        });

        await novoUsuario.save();

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor.', erro: error.message });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Verifica se o usuário existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensagem: 'Usuário não encontrado.' });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(400).json({ mensagem: 'Senha incorreta.' });
        }

        // Gera token JWT
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ mensagem: 'Login realizado com sucesso!', token });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor.', erro: error.message });
    }
};

module.exports = {
    register,
    login
};
