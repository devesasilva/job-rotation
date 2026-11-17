# Backend

## Azure Blob Storage — foto de perfil

Crie uma Storage Account e o container privado `user-profiles` no Azure. O backend não cria o container automaticamente: assim, a infraestrutura e as permissões permanecem sob controle do ambiente de deploy.

Para desenvolvimento local, preencha em `.env`:

```env
AZURE_STORAGE_AUTH_MODE=connection-string
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
AZURE_STORAGE_ACCOUNT_NAME=nome-da-storage-account
AZURE_STORAGE_CONTAINER_NAME=user-profiles
```

Em produção, prefira Managed Identity e conceda à identidade da aplicação o papel **Storage Blob Data Contributor** limitado à Storage Account ou, preferencialmente, ao container. Configure:

```env
AZURE_STORAGE_AUTH_MODE=managed-identity
AZURE_STORAGE_ACCOUNT_NAME=nome-da-storage-account
AZURE_STORAGE_CONTAINER_NAME=user-profiles
```

`AZURE_STORAGE_CONNECTION_STRING` não é necessária no modo `managed-identity`. Nunca versione connection strings, chaves da conta ou URLs SAS. A configuração expõe `checkAzureStorageAvailability()` para que as rotas da feature possam informar indisponibilidade e a interface desabilite as ações de foto sem afetar o restante da aplicação.
