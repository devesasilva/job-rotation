const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

const uploadAvatarMiddleware = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            mensagem: "O arquivo excede o limite máximo permitido de 5 MB.",
          });
        }
        return res.status(400).json({
          mensagem: `Erro no upload do arquivo: ${err.message}`,
        });
      }
      return res.status(400).json({
        mensagem: err.message || "Erro no envio do arquivo de imagem.",
      });
    }
    next();
  });
};

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Endpoints para gerenciamento do perfil do usuário e avatar
 */

/**
 * @swagger
 * /api/users/avatar:
 *   get:
 *     summary: Consulta a foto de perfil atual do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consulta realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       description: URL temporária de leitura (SAS)
 *                     contentType:
 *                       type: string
 *                     size:
 *                       type: number
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 storageAvailable:
 *                   type: boolean
 *                 storageReason:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Não autorizado
 */
router.get("/avatar", authMiddleware, userController.obterAvatar);

/**
 * @swagger
 * /api/users/avatar/status:
 *   get:
 *     summary: Verifica o status de disponibilidade do Azure Blob Storage para avatares
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status do storage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 reason:
 *                   type: string
 */
router.get("/avatar/status", authMiddleware, userController.obterStatusStorage);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Cadastra a primeira foto de perfil do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPEG, PNG ou WebP até 5MB)
 *     responses:
 *       201:
 *         description: Foto cadastrada com sucesso
 *       400:
 *         description: Arquivo ausente ou formato inválido
 *       409:
 *         description: O usuário já possui foto cadastrada
 *       413:
 *         description: Arquivo excede 5MB
 *       503:
 *         description: Azure Blob Storage indisponível
 */
router.post(
  "/avatar",
  authMiddleware,
  uploadAvatarMiddleware,
  userController.criarAvatar
);

/**
 * @swagger
 * /api/users/avatar:
 *   put:
 *     summary: Substitui a foto de perfil existente do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Nova imagem (JPEG, PNG ou WebP até 5MB)
 *     responses:
 *       200:
 *         description: Foto substituída com sucesso
 *       400:
 *         description: Arquivo ausente ou formato inválido
 *       404:
 *         description: Nenhuma foto encontrada para substituir
 *       413:
 *         description: Arquivo excede 5MB
 *       503:
 *         description: Azure Blob Storage indisponível
 */
router.put(
  "/avatar",
  authMiddleware,
  uploadAvatarMiddleware,
  userController.atualizarAvatar
);

/**
 * @swagger
 * /api/users/avatar:
 *   delete:
 *     summary: Exclui a foto de perfil do usuário (idempotente)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Foto excluída com sucesso (sem corpo)
 *       401:
 *         description: Não autorizado
 */
router.delete("/avatar", authMiddleware, userController.deletarAvatar);

module.exports = router;
