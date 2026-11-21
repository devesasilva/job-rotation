const jwt = require('jsonwebtoken');

const tokensInvalidos = new Set();

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const tokenQuery = req.query?.token;

    if (!authHeader && !tokenQuery) {
        return res.status(401).json({
            mensagem: 'Acesso negado. Token não fornecido.'
        });
    }

    const token = authHeader
        ? authHeader.split(' ')[1]
        : tokenQuery;

    if (!token) {
        return res.status(401).json({
            mensagem: 'Token malformado.'
        });
    }

    if (tokensInvalidos.has(token)) {
        return res.status(401).json({
            mensagem: 'Token inválido ou sessão encerrada.'
        });
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = payload;

        next();

    } catch (error) {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado.'
        });
    }
};

const invalidarToken = (token) => {
    tokensInvalidos.add(token);
};

module.exports = authMiddleware;
module.exports.invalidarToken = invalidarToken;