const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

const register = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({
            nome,
            email,
            senha: senhaCriptografada,
        });

        await novoUsuario.save();

        res.status(201).json({ 
            mensagem: 'Usuário cadastrado com sucesso!',
        });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor.', erro: error.message });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensagem: 'Usuário não encontrado.' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(400).json({ mensagem: 'Senha incorreta.' });
        }

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

const logout = (req, res) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            mensagem: 'Token não fornecido.'
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            mensagem: 'Token malformado.'
        });
    }

    authMiddleware.invalidarToken(token);

    return res.status(200).json({
        mensagem: 'Logout realizado com sucesso!'
    });
};

const me = async (req, res) => {
    try {
        const usuarioId = req.user?.id;

        if (!usuarioId) {
            return res.status(401).json({
                mensagem: 'Usuário não autenticado.'
            });
        }

        const usuario = await Usuario.findById(usuarioId).select('-senha');

        if (!usuario) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json(usuario);

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao buscar usuário.',
            erro: error.message
        });
    }
};

module.exports = {
    register,
    login,
    me,
    logout
};