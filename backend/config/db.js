const mongoose = require("mongoose");

const ConexaoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conexão com MongoDB Atlas bem-sucedida!");
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
    }
};

module.exports = ConexaoDB;