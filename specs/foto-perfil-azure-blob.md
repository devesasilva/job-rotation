# Especificação: foto de perfil do usuário com Azure Blob Storage

## Objetivo

Permitir que a pessoa autenticada cadastre, visualize, substitua e exclua sua foto de perfil. O arquivo será armazenado no Azure Blob Storage e os metadados necessários para localizá-lo serão mantidos no documento do usuário no MongoDB.

## Escopo funcional

- Exibir a foto atual do usuário ou, quando não houver uma, um avatar com as iniciais do nome.
- Permitir selecionar uma imagem local, ver uma prévia antes do envio, cancelar a seleção e confirmar em **Salvar**.
- Enviar a nova imagem ao backend como `multipart/form-data`; o backend valida e envia o conteúdo ao Azure Blob Storage.
- Atualizar a foto exibida na tela após sucesso, sem exigir novo login ou recarga completa da página.
- Permitir remover a foto com confirmação e retornar à exibição das iniciais.
- Restringir todas as operações à identidade do token JWT. O cliente não informa o ID do usuário a ser alterado.
- Caso as variáveis de ambiente sejam inexistentes ou a conexão com o Azure não funcione, não retorne um erro crítico, apesar deixe a opção de colocar, editar ou excluir foto desabilitada, fazendo com que o usuário entenda isso claramente.

## Fluxo proposto

1. A página de perfil carrega os dados do usuário autenticado e a URL temporária de leitura da foto, se existir.
2. Ao escolher um arquivo, o navegador valida a seleção para feedback imediato e cria uma prévia local com `URL.createObjectURL`. A prévia é revogada ao cancelar, trocar o arquivo ou sair da página.
3. Ao salvar, o frontend envia o arquivo em `FormData` no campo `avatar`, com o token JWT no cabeçalho `Authorization: Bearer <token>`.
4. O backend valida o arquivo, grava um blob com nome aleatório e atualiza os metadados do usuário no MongoDB.
5. Após a resposta de sucesso, o frontend substitui a prévia pela URL de leitura retornada pela API e atualiza o estado local do perfil.
6. Ao excluir, o backend remove a referência do usuário e apaga o blob. A interface volta ao avatar com iniciais.

## Decisões técnicas

### Azure Blob Storage

- Criar uma Storage Account no Azure e um container `user-profiles`.
- Usar container **privado**. Fotos de perfil são dados associados à conta do usuário; não tornar o container publicamente legível.
- Usar `@azure/storage-blob` no backend. Em produção, autenticar a aplicação com Managed Identity e conceder somente a função necessária para operar blobs no container. Para desenvolvimento local, usar credencial configurada por variável de ambiente, sem incluir segredos no repositório.
- Criar blob names imprevisíveis com UUID e extensão derivada do tipo validado, por exemplo `avatars/<userId>/<uuid>.webp`. Não usar o nome original do arquivo como caminho.
- Persistir no MongoDB a URL canônica do blob (sem SAS) e o `blobName`. Como o container é privado, a URL canônica não concede leitura por si só. A API gera uma URL SAS somente de leitura, com curta duração (sugestão: 5 minutos), quando o perfil é consultado. Nunca armazenar nem registrar a URL SAS no banco ou em logs.
- Configurar política de expiração/limpeza para blobs órfãos e monitorar falhas de exclusão.

### Upload e validação

- Usar `multer` com `memoryStorage` para receber o multipart e limites explícitos; limite inicial: 5 MB por arquivo.
- Aceitar somente JPEG, PNG e WebP. Validar o MIME e a assinatura/conteúdo do arquivo; não confiar apenas no MIME ou na extensão enviados pelo navegador.
- Rejeitar arquivo ausente, tipo não permitido ou tamanho acima do limite com resposta 400/413 apropriada. Não persistir conteúdo no disco local.
- Definir o `Content-Type` correto no blob para que o navegador renderize a imagem.
- O frontend deve aceitar apenas uma imagem, informar tipos/tamanho permitidos e mostrar estados de carregamento, sucesso e erro.

### Consistência entre Azure e MongoDB

- Na criação/substituição, enviar primeiro o novo blob e depois atualizar o usuário. Se a atualização do MongoDB falhar, tentar apagar o novo blob para não deixar um órfão.
- Após salvar a nova referência, apagar o blob anterior. Se a exclusão falhar, manter o perfil atualizado, registrar a falha sem dados sensíveis e permitir limpeza posterior.
- Na exclusão, remover primeiro a referência do usuário e depois tentar apagar o blob. A resposta e a interface devem deixar claro que a foto foi removida mesmo se uma falha de limpeza do blob exigir retry operacional.
- Não incluir campos de upload ou permitir que o cliente altere `avatar` por rotas genéricas de edição de usuário.

### Modelo de dados

Adicionar ao schema `Usuario` um campo opcional, por exemplo:

```js
avatar: {
  blobName: String,
  url: String,          // URL canônica sem SAS
  contentType: String,
  size: Number,
  updatedAt: Date
}
```

Usuários existentes sem o campo continuam válidos e usam o avatar com iniciais. A resposta pública do usuário nunca deve incluir `senha`; respostas com avatar podem incluir `avatarUrl` SAS de curta duração, sem expor credenciais Azure.

### API

Todas as rotas abaixo exigem JWT válido e operam exclusivamente sobre `req.user.id`.

| Método e rota | Uso | Resposta esperada |
|---|---|---|
| `GET /api/users/avatar` | Consultar a foto atual do usuário | `200` com `avatar: null` quando não houver foto; caso contrário, `avatarUrl`, `contentType` e `updatedAt` |
| `POST /api/users/avatar` | Cadastrar a primeira foto | `201` com os metadados e URL SAS nova; `409` se já existir foto |
| `PUT /api/users/avatar` | Substituir a foto existente | `200` com os metadados e URL SAS nova; `404` se ainda não houver foto |
| `DELETE /api/users/avatar` | Excluir a foto atual | `204` sem corpo; operação idempotente, inclusive quando já não houver foto |

O upload recebe `multipart/form-data` com o campo `avatar`; não recebe `userId` nem URL de blob do cliente. Respostas de erro devem manter o padrão `{ mensagem: "..." }` já usado pela API. Documentar os endpoints e os esquemas no Swagger. O caminho inclui `/api` porque a feature será montada sob esse prefixo no roteador principal; confirmar a URL base configurada em `VITE_BACKEND_API` para evitar duplicar `/api`.

## Tela e interação React

- Adicionar uma página de perfil com foto atual/avatar de iniciais, seletor de imagem, prévia, **Salvar**, **Cancelar** e **Remover foto**.
- O controle para abrir o perfil deve ficar acessível na área autenticada (por exemplo, opção **Meu Perfil** no menu e rota `/perfil`).
- Reutilizar Axios e o token armazenado em `localStorage`, seguindo o padrão já aplicado em `Main.jsx`.
- Ao enviar, desabilitar ações duplicadas e exibir estado de progresso. Em erro, preservar a seleção e a foto anterior, mostrar mensagem compreensível e permitir nova tentativa.
- Se a SAS expirar durante a sessão, buscar outra URL pela API e atualizar o `src` da imagem.
- Usar texto alternativo para a foto e controles acessíveis por teclado; pedir confirmação antes de remover.

## Arquivos afetados previstos

### Backend

- `backend/package.json` e `backend/package-lock.json`: adicionar `@azure/storage-blob` e `multer`.
- `backend/src/models/Usuario.js`: adicionar os metadados opcionais de avatar.
- `backend/src/routes/index.js`: montar as rotas de usuário no prefixo `/api/users`.
- `backend/src/routes/userRoutes.js` *(novo)*: declarar endpoints e middleware de autenticação/upload.
- `backend/src/controllers/userController.js` *(novo)*: tratar requisições e respostas HTTP.
- `backend/src/services/avatarService.js` *(novo)*: encapsular upload, SAS, substituição e remoção no Azure e sincronização com MongoDB.
- `backend/config/azureStorage.js` *(novo)*: criar cliente/container a partir da identidade/variáveis de ambiente.
- `backend/server.js`: verificar se o limite de payload e o CORS permitem o fluxo multipart; `multer` trata o corpo do upload, não `express.json`.
- `backend/src/controllers/authController.js`: incluir os dados de avatar/URL temporária na resposta de `/auth/me`, se essa resposta for a fonte de dados da tela.
- Configuração local/deploy documentada: nome da conta e do container e credenciais locais; segredos não devem ser versionados. O `.gitignore` já ignora arquivos `.env`.

### Frontend

- `frontend/job-rotation/src/App.jsx`: registrar a rota autenticada `/perfil`.
- `frontend/job-rotation/src/pages/Perfil.jsx` *(novo)*: estado da tela, prévia e ações de cadastro, troca e remoção.
- `frontend/job-rotation/src/pages/Main.jsx` e/ou `frontend/job-rotation/src/components/Header/Header.jsx`: exibir avatar e ligar a navegação **Meu Perfil** à nova tela; integrar o componente conforme o layout autenticado efetivamente usado.
- Opcionalmente, `frontend/job-rotation/src/services/avatarService.js` *(novo)*: centralizar chamadas Axios multipart e cabeçalhos JWT caso a lógica não permaneça na página.

## Decomposição da implementação

### 1. Preparação e configuração do ambiente

- Criar a Storage Account e o container privado `user-profiles`.
- Definir as variáveis de ambiente para desenvolvimento e produção, sem versionar segredos.
- Configurar a identidade/permissão mínima do backend para ler, gravar e excluir blobs.
- Adicionar `@azure/storage-blob` e `multer` e documentar a configuração local e de deploy.
- Implementar uma verificação de disponibilidade do Azure para que a interface possa desabilitar as ações de foto e informar o motivo sem interromper o restante da aplicação.

### 2. Persistência e serviço de armazenamento

- Estender o schema `Usuario` com o campo opcional `avatar` e manter compatibilidade com usuários existentes.
- Criar o módulo de configuração do cliente Azure e o serviço de avatar.
- Implementar geração de nomes imprevisíveis, upload com `Content-Type` correto e geração de SAS de leitura curta.
- Implementar o fluxo compensatório: apagar o novo blob se a atualização do MongoDB falhar e registrar falhas de limpeza do blob antigo para retry posterior.
- Implementar a exclusão idempotente, removendo primeiro a referência no MongoDB e tentando apagar o blob em seguida.

### 3. API autenticada

- Criar rotas, controller e middleware de upload para `GET`, `POST`, `PUT` e `DELETE /api/users/avatar`.
- Vincular todas as operações a `req.user.id`, sem aceitar `userId` ou caminho de blob enviados pelo cliente.
- Configurar `multer` com `memoryStorage`, arquivo único, limite de 5 MB e tratamento uniforme dos seus erros.
- Validar presença, tamanho, MIME e assinatura do arquivo; aceitar apenas JPEG, PNG e WebP.
- Retornar os status e o formato `{ mensagem: "..." }` definidos na especificação e expor apenas a SAS temporária nas respostas.
- Atualizar `/auth/me`, se for a fonte de dados do perfil, e documentar contratos no Swagger.

### 4. Tela de perfil e integração do frontend

- Registrar a rota autenticada `/perfil` e disponibilizar o acesso por **Meu Perfil** na área autenticada.
- Criar a tela com avatar de iniciais, seletor, prévia local, salvar, cancelar e remover com confirmação.
- Centralizar as chamadas Axios multipart/JWT em um serviço ou na própria página, seguindo o padrão atual do projeto.
- Controlar os estados de carregamento, sucesso, erro e indisponibilidade do Azure; bloquear envios duplicados e preservar a seleção após falha.
- Revogar URLs criadas com `URL.createObjectURL` ao cancelar, trocar arquivo ou desmontar a tela.
- Atualizar o estado local com a SAS retornada e buscar uma nova URL caso a imagem deixe de carregar por expiração.
- Garantir navegação por teclado, rótulos acessíveis e texto alternativo adequado.

### 5. Testes e validação de entrega

- Testar o serviço com Azure simulado: upload, geração de SAS, rollback e falha de limpeza.
- Testar os endpoints para autenticação, isolamento entre usuários, arquivo ausente, tipo inválido, excesso de tamanho, criação, substituição, consulta e exclusão idempotente.
- Testar a tela para prévia, cancelamento, feedback de erro, atualização imediata, expiração de SAS, confirmação de remoção e indisponibilidade do Azure.
- Executar uma validação ponta a ponta com MongoDB e Azure configurados, confirmando que não há SAS ou segredos em banco e logs.
- Atualizar Swagger e a documentação de configuração, conferindo todos os itens da definição de pronto.

### Ordem sugerida

1. Preparação e configuração do ambiente.
2. Persistência e serviço de armazenamento.
3. API autenticada e documentação Swagger.
4. Tela de perfil e integração do frontend.
5. Testes automatizados, validação ponta a ponta e revisão da definição de pronto.

## Definição de pronto

- [ ] Storage Account e container privado `user-profiles` criados e acessíveis pelo backend com permissões mínimas; segredos ficam fora do controle de versão.
- [ ] Usuário autenticado sem foto vê avatar com iniciais e consegue cadastrar uma imagem válida.
- [ ] A seleção mostra uma prévia antes de salvar; cancelar preserva a foto persistida.
- [ ] Uma imagem salva aparece imediatamente no perfil; substituir a foto apaga ou agenda a limpeza do blob anterior.
- [ ] Remover a foto limpa os metadados no MongoDB, tenta apagar o blob e restaura o avatar com iniciais na interface.
- [ ] Usuários sem autenticação recebem 401; um usuário não consegue ler, trocar ou excluir a foto de outro usuário alterando parâmetros do cliente.
- [ ] Tipos inválidos e arquivos acima do limite são rejeitados com erro compreensível; falhas de Azure/MongoDB não deixam referência quebrada no perfil.
- [ ] Container permanece privado; SAS de leitura tem curta duração e permissões somente de leitura; nenhum segredo/SAS é salvo no MongoDB ou exposto em logs.
- [ ] Frontend apresenta carregamento, sucesso, erro, confirmação para exclusão e controles acessíveis; atualização não exige novo login.
- [ ] Endpoints e respostas estão descritos no Swagger e a configuração necessária está documentada para desenvolvimento e deploy.

## Fora do escopo inicial

- Recorte, rotação, compressão avançada ou transformação de imagem no servidor.
- Upload direto do navegador para o Azure com SAS de escrita.
- Fotos públicas ou compartilhamento de URLs permanentes sem autenticação.
- Galeria, histórico ou restauração de fotos anteriores.
