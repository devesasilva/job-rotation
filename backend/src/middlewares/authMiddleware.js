const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const tokenLimpo = token.replace('Bearer ', '');
        const payload = jwt.verify(tokenLimpo, process.env.JWT_SECRET);

        req.user = payload;  // Anexa informações do usuário ao request
        next();
    } catch (error) {
        res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;
