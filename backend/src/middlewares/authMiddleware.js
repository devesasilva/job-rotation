const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ mensagem: 'Token malformado.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = payload;  // Anexa informações do usuário ao request
        next();
    } catch (error) {
        res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;
