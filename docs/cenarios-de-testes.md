# Uork — Catálogo de cenários de teste

Data: 12/10/2026. Base: código do app mobile disponível neste workspace, suas rotas, contextos, serviços, componentes e testes existentes.

Este documento cobre os fluxos identificados e suas principais classes de variação. “Todos os cenários possíveis” não é um conjunto finito: combinações de dispositivos, dados e concorrência são ilimitadas. A cobertura aqui é organizada por fluxo, partições de entrada, limites, estados, falhas e autorização. Não foi executada homologação do app nem verificado o comportamento do backend em ambiente real.

## Como executar e registrar

Cada linha é um caso de teste. A pré-condição da seção vale para suas linhas; prepare a variação indicada, abra a rota citada, execute a ação e confira interface **e persistência/API** quando houver escrita. Linhas com várias entradas são casos parametrizados: execute separadamente cada valor, estado ou plataforma. IDs permanecem estáveis para rastreamento.

- **P0:** jornada central, isolamento de contas, autorização ou integridade de estado.
- **P1:** validações, falhas, recuperação e compatibilidade funcional.
- **P2:** consistência visual, interface auxiliar e funcionalidades incompletas.
- **PENDENTE:** integração/ação não existe no código ou depende de regra ainda não confirmada. Não marcar como aprovado ponta a ponta por exibir sucesso local.
- Resultado esperado descreve o critério de aceitação; onde houver indicação de lacuna, registrar o comportamento observado e abrir defeito/pendência. Um requisito de robustez não significa que já está implementado.

Modelo de registro: `ID | variante | plataforma/build | conta/fixture | resultado (não executado/aprovado/reprovado/bloqueado) | evidência | defeito | data/responsável`. Todos os casos começam **não executados**.

## Dados e ambiente

Usar ambiente de homologação e dados sintéticos. Preparar cliente A e B, prestador A e B, conta sem cadastro profissional, usuários sem foto/endereço/telefone e usuário Google. Criar demandas em ABERTA/EM_ANDAMENTO/CONCLUIDA/CANCELADA e solicitações em PENDENTE/ACEITA/AGUARDANDO_CONFIRMACAO/RECUSADA/CANCELADA/FINALIZADA. Preparar candidaturas nos estados retornados pela API, serviços avaliados e não avaliados, categorias vazias e listas com várias páginas.

Preparar JPEG, PNG, WebP, formato não suportado, arquivo vazio e arquivos de 5 × 1024 × 1024 bytes e um byte acima. Preparar CEP válido/inexistente, GPS permitido/negado, falhas de API, conta sem autorização e eventos de notificação duplicados. Ajustar token/cache por fixture ou mock em testes; não editar credenciais reais. Testes de push/Google nativos exigem build própria e configuração do ambiente; Expo Go não substitui essas verificações.

## Fluxos e estados

1. Cliente → perfil de profissional → solicitação direta → prestador aceita/recusa → WhatsApp → solicitação de conclusão → cliente confirma/não confirma → avaliação mútua → recontratação.
2. Cliente → publicar demanda → prestador consulta disponíveis → candidatura → cliente compara e seleciona → serviço em andamento → continuidade de conclusão/avaliação a confirmar pela integração.
3. Cliente → alternar para profissional → cadastro em duas etapas → dashboard → disponíveis/recebidas/notificações/perfil/relatório.
4. Autenticação/cadastro → sessão persistida → edição de dados/endereço/foto → logout; recuperação de senha atualmente apenas local.

| Entidade | Estados identificados | Observação |
|---|---|---|
| Demanda pública | ABERTA, EM_ANDAMENTO, CONCLUIDA, CANCELADA | Não confundir com status de proposta. |
| Proposta/serviço | PENDENTE, ACEITA, AGUARDANDO_CONFIRMACAO, RECUSADA, CANCELADA, FINALIZADA | Confirmar conclusão finaliza; não confirmar retorna ACEITA e limpa valorCobrado local. |
| Candidatura | PENDENTE, ACEITA, AGUARDANDO_CONFIRMACAO, RECUSADA, CANCELADA, FINALIZADA | Seleção exige demanda ABERTA e candidato PENDENTE; validar propagação no backend. |

## Catálogo

### 1. Inicialização, sessão e navegação

Referências: `app/index.tsx`; `app/(tabs)/_layout.tsx`; `contexts/auth-context.tsx`.

Pré-condição: App instalado; variar token e usuário em armazenamento.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-001 | P0 | Abrir o app sem sessão | Splash apresenta Criar conta e Já tenho conta; ações abrem cadastro/login; abas privadas bloqueadas. |
| CT-002 | P0 | Abrir com token válido e perfil em cache | Perfil em cache aparece e é atualizado pela API. |
| CT-003 | P0 | Abrir com token expirado ou ausente | Sessão local descartada; nenhuma operação autenticada liberada. |
| CT-004 | P0 | Restaurar token válido e receber 401 ou 403 no perfil | Usuário e token locais removidos. |
| CT-005 | P1 | Restaurar sessão com cache e API offline/500 | Falha temporária não apaga a sessão válida em cache. |
| CT-006 | P1 | Restaurar sessão sem cache com API indisponível | Não exibir dados de outra conta; permitir recuperação ao restabelecer conexão. |
| CT-007 | P1 | Simular armazenamento ilegível ou JSON corrompido | Inicialização termina sem travar nem expor dados indevidos. |
| CT-008 | P0 | Fazer logout durante login ou restauração pendente | Resposta tardia não reativa a conta encerrada. |
| CT-009 | P0 | Iniciar login da conta B enquanto existe sessão A | Dados e credenciais de A não aparecem como B. |
| CT-010 | P0 | Sair com API de remoção de push indisponível | Logout local conclui e limpa credenciais. |
| CT-011 | P0 | Reabrir após logout e usar botão Voltar | Nenhuma tela privada deve expor dados; verificar todas as rotas fora das abas também. |
| CT-012 | P1 | Navegar pelas quatro abas e menu profissional | Destino e item ativo correspondem à ação; sem duplicação inesperada de telas. |
| CT-013 | P1 | Abrir rotas de detalhes por link sem histórico | Voltar funciona ou oferece destino seguro. |
| CT-014 | P1 | Abrir cada rota privada sem autenticação por URL/deep link | Acesso protegido; se uma rota não tiver guarda, registrar defeito. |
| CT-015 | P1 | Suspender e reabrir o app em cada perfil | Sessão e navegação consistentes; atualização ao retomar. |

### 2. Login, cadastro e Google

Referências: `app/login/index.tsx`; `app/signup/index.tsx`; `hooks/useGoogleAuth.ts`; `hooks/useGoogleAuth.web.ts`; `services/api.ts`; `services/userService.ts`.

Pré-condição: Contas cliente e prestador válidas, e-mail/documento já cadastrados; build nativa com Google configurado.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-016 | P0 | Entrar com e-mail e senha válidos | Perfil autenticado e navegação para /home. |
| CT-017 | P0 | Entrar com credenciais incorretas | Erro apresentado; nenhum token ou perfil residual. |
| CT-018 | P1 | Informar e-mail vazio, espaços, sem @ ou sem domínio | Botão bloqueado e orientação de validação. |
| CT-019 | P1 | Informar senha vazia, 7 e 8 caracteres | Vazia/7 bloqueiam; 8 habilita se e-mail válido. |
| CT-020 | P1 | Informar e-mail com espaços nas extremidades | Registrar diferença entre validação da tela e normalização; não autenticar identidade incorreta. |
| CT-021 | P1 | Tocar repetidamente em Entrar durante requisição lenta | Botão bloqueado durante envio; uma autenticação ativa. |
| CT-022 | P1 | Falhar consulta do perfil após sucesso na autenticação | Login não fica parcialmente autenticado; erro recuperável. |
| CT-023 | P1 | Falhar persistência de token/perfil durante login | Nenhuma sessão inconsistente; erro comunicado. |
| CT-024 | P0 | Cadastrar todos os campos válidos | Conta criada com tipoPessoa CPF; login automático e abertura da home. |
| CT-025 | P1 | Omitir individualmente nome, sobrenome ou documento e usar só espaços | Campos obrigatórios impedem cadastro. |
| CT-026 | P1 | Cadastrar senha de 7/8 caracteres e confirmação diferente/vazia | Limite e igualdade respeitados. |
| CT-027 | P1 | Cadastrar e-mail ou documento já existente | Erro do backend visível; não duplicar conta. |
| CT-028 | P1 | Informar CPF inválido, curto, repetido, com máscara e CNPJ | Conferir validação no backend; tela só exige documento preenchido e envia CPF, apesar do placeholder CPF ou CNPJ. |
| CT-029 | P1 | Criar conta com sucesso e falhar login automático | Mensagem informa conta criada e orienta login; não tratar como falha de criação. |
| CT-030 | P1 | Cadastrar nome com acentos, hífen e espaços internos | Dados preservados; apenas espaços externos removidos. |
| CT-031 | P1 | Alternar login/cadastro/esqueci senha | Rotas corretas; campos de senha não expostos. |
| CT-032 | P0 | Autenticar ou cadastrar com Google em Android, iOS e web | Token de identidade enviado à API e perfil correto restaurado. |
| CT-033 | P1 | Cancelar seleção de conta Google | Sem sessão criada nem erro de credenciais indevido. |
| CT-034 | P1 | Usar Google sem credenciais configuradas ou no Expo Go | Mensagem específica; formulário de e-mail continua acessível. |
| CT-035 | P1 | Usar Android sem Play Services disponíveis | Mensagem orienta atualização/ativação. |
| CT-036 | P1 | Google retornar token ausente/inválido ou API rejeitar token | Erro recuperável; sem sessão parcial. |
| CT-037 | P1 | Tocar Google e login/cadastro simultaneamente | Botões impedem concorrência indevida. |
| CT-038 | P1 | Falhar popup/redirect Google na web | Sem loop de redirecionamento; usuário pode tentar novamente. |

### 3. Recuperação de senha — interface ainda sem integração

Referências: `app/forgot-password/index.tsx`; `app/reset-password/index.tsx`.

Pré-condição: Visitante; testes de interface executáveis. Envio real e troca de senha dependem de implementação.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-039 | P1 | Enviar link com e-mail vazio ou inválido | Botão bloqueado. |
| CT-040 | P1 | Enviar link com e-mail válido | Mensagem genérica exibida; comportamento atual apenas altera estado local, sem envio real. |
| CT-041 | P1 | Tocar Já tenho o código | Abre /reset-password; atualmente não solicita código/token. |
| CT-042 | P1 | Informar senha vazia, 7/8 caracteres e confirmação divergente | Botão segue validação de comprimento e igualdade. |
| CT-043 | P1 | Redefinir com campos válidos e voltar ao login | Mensagem local aparece; não considerar comprovação de mudança de senha. |
| CT-044 | P0 | Validar envio real, token expirado/usado/adulterado e login com nova senha | PENDENTE: faltam integração de recuperação e validação de token; não aprovar fluxo ponta a ponta. |

### 4. Home, descoberta, busca e perfil público

Referências: `app/(tabs)/home/index.tsx`; `app/(tabs)/explore/index.tsx`; `app/nearby-professionals.tsx`; `app/category-providers/index.tsx`; `app/profile/index.tsx`; `services/prestadorService.ts`.

Pré-condição: Prestadores com/sem foto, avaliações e distância; categorias com e sem resultados; mais de uma página.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-045 | P1 | Abrir home com usuário de nome longo e sem foto | Saudação correta; avatar de fallback e layout legível. |
| CT-046 | P1 | Carregar profissionais com sucesso, lista vazia e falha | Lista, estado vazio e erro distinguíveis. |
| CT-047 | P1 | Abrir Contratar/Ver perfil a partir de cada lista | ID do profissional correto chega a /profile. |
| CT-048 | P1 | Abrir Ver todos e carregar páginas sucessivas | Lista amplia, respeita última página e estados de carregamento. |
| CT-049 | P1 | Falhar página adicional e tentar novamente | Recuperação sem perder ou duplicar resultados já obtidos. |
| CT-050 | P1 | Atualizar lista de próximos após mudança de localização | Resultados correspondem à consulta atual. |
| CT-051 | P1 | Negar geolocalização na descoberta | Consulta sem coordenadas não trava; distância indisponível quando ausente. |
| CT-052 | P1 | Buscar por nome, serviço, categoria, cidade e termo inexistente | API consultada; resultados ou vazio coerentes com resposta. |
| CT-053 | P1 | Digitar rapidamente termos distintos na aba Buscar | Debounce de 350 ms; resposta antiga não substitui busca nova. |
| CT-054 | P1 | Limpar termo de busca | Consulta e contador retornam ao estado sem termo. |
| CT-055 | P1 | Selecionar avaliação com notas 4,79; 4,8; 4,9 | Filtro local inclui notas >= 4,8 e contador reflete itens filtrados. |
| CT-056 | P2 | Selecionar Categoria/Localização na aba Buscar | PENDENTE: seleção muda visual, mas código não aplica esses filtros. |
| CT-057 | P1 | Buscar com total da API maior que lista carregada | Contador total e itens carregados não são confundidos; avaliar necessidade de paginação. |
| CT-058 | P1 | Abrir categoria válida, vazia, inexistente e sem parâmetro | Sem spinner eterno; erros e vazio claros; ausência de tratamento deve ser registrada. |
| CT-059 | P1 | Abrir perfil existente e conferir categorias, avaliações e serviços | Conteúdo pertence ao ID solicitado e é consistente com API. |
| CT-060 | P1 | Abrir perfil com ID ausente, zero, negativo, texto ou não encontrado | Erro controlado; não carregar profissional arbitrário. |
| CT-061 | P1 | Falhar carregamento do perfil ou imagem remota | Sem crash; erro/fallback compreensível. |
| CT-062 | P1 | Contratar serviço pelo perfil público | Prestador, serviço e opções chegam corretamente a /send-proposal. |
| CT-063 | P1 | Abrir perfil no modo candidatura | Verificar comportamento específico do modo e impedir solicitação indevida. |
| CT-064 | P2 | Tocar cada chip de categoria na home | Comportamento atual abre /search estática sem carregar categoria selecionada; registrar limitação. |
| CT-065 | P1 | Comparar /search com aba Buscar | /search usa profissionais locais de exemplo; não validar esses resultados como dados reais. |

### 5. Editar perfil, foto e endereço

Referências: `app/edit-profile/index.tsx`; `app/address.tsx`; `contexts/auth-context.tsx`; `services/api.ts`; `utils/validar-telefone.ts`.

Pré-condição: Usuário autenticado com e sem endereço/foto/telefone; CEP válido e inexistente.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-066 | P0 | Salvar nome/sobrenome/documento/telefone válidos | API e cache atualizados; dados permanecem após reinício. |
| CT-067 | P1 | Omitir campos obrigatórios ou informar só espaços | Salvar bloqueado e mensagem do campo correspondente. |
| CT-068 | P1 | Alternar CPF/CNPJ e digitar letras/máscaras/documento longo | Somente dígitos; limites de 11/14; tipo enviado corresponde à seleção. |
| CT-069 | P1 | Salvar CPF/CNPJ com dígitos verificadores inválidos | API deve rejeitar; tela não comprova validade fiscal. |
| CT-070 | P0 | Alterar e-mail com sucesso | Logout obrigatório e instrução de entrar com novo e-mail. |
| CT-071 | P1 | Alterar e-mail para um já cadastrado | Erro da API; sessão e dados anteriores preservados. |
| CT-072 | P1 | Deixar nova senha e confirmação vazias | Atualização sem envio de nova senha. |
| CT-073 | P1 | Nova senha de 7/8 caracteres e confirmação diferente | 7/divergência bloqueiam; 8 e igualdade permitem. |
| CT-074 | P1 | Trocar senha e autenticar novamente | Nova credencial funciona; antiga deixa de funcionar conforme contrato do backend. |
| CT-075 | P1 | Telefone vazio na edição | Permitido pela validação atual; envio de proposta exigirá telefone válido. |
| CT-076 | P1 | Telefone válido com DDD, máscara e prefixo +55 | Aceito e persistido corretamente. |
| CT-077 | P1 | Telefone fixo, DDD inválido, letras, tamanho errado, blocos repetidos e sequência | Rejeitado com mensagem adequada. |
| CT-078 | P1 | Selecionar foto JPEG/PNG/WebP até 5 MiB | Upload e atualização de avatar em cliente/profissional. |
| CT-079 | P1 | Selecionar foto vazia, acima de 5 MiB ou formato não suportado | Rejeitada; avatar anterior preservado. |
| CT-080 | P1 | Foto sem tamanho informado pelo seletor | Edição mede blob; valida tamanho antes do upload. |
| CT-081 | P1 | Negar permissão ou cancelar galeria | Sem upload; tela permanece utilizável. |
| CT-082 | P1 | Remover foto e confirmar/cancelar diálogo | Confirmar remove e restaura iniciais; cancelar mantém foto. |
| CT-083 | P1 | Falhar upload/remoção ou expirar sessão | Erro e liberação de controles; sem sucesso falso. |
| CT-084 | P1 | Editar dados enquanto foto atualiza usuário no contexto | Detectar perda de alterações ainda não salvas causada por ressincronização do formulário. |
| CT-085 | P1 | Abrir endereço já salvo e salvar número/complemento | Dados corretos persistem e tela retorna. |
| CT-086 | P1 | Digitar CEP com menos de 8 dígitos, letras e mais de 8 | Normalização e limite; consulta somente com 8. |
| CT-087 | P1 | Digitar CEP válido e aguardar consulta | Após 400 ms, rua/bairro/cidade/UF preenchidos. |
| CT-088 | P1 | Trocar CEP rapidamente durante consulta | Resposta antiga não substitui endereço novo. |
| CT-089 | P1 | Consultar CEP inexistente ou com falha de rede | Erro visível; salvar não usa endereço antigo como válido. |
| CT-090 | P1 | CEP retornar campos incompletos e UF indisponível | Obrigatoriedade respeitada; avaliar recuperação já que campos de endereço são somente leitura na tela. |
| CT-091 | P1 | Deixar número, rua, bairro ou cidade vazio e UF diferente de 2 caracteres | Salvar bloqueado. |
| CT-092 | P1 | Salvar durante consulta de CEP ou requisição lenta | Envio bloqueado durante consulta; sem duplicação. |
| CT-093 | P1 | Falhar gravação do endereço | Dados preenchidos preservados e nova tentativa possível. |

### 6. Cadastro e home profissional

Referências: `app/professional-registration/index.tsx`; `app/professional-home/index.tsx`; `services/prestadorService.ts`.

Pré-condição: Cliente sem cadastro e prestador já cadastrado; categorias da API.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-094 | P0 | Alternar Cliente para Profissional sem cadastro | Estado de convite e acesso ao cadastro profissional. |
| CT-095 | P0 | Alternar para Profissional com cadastro | Dashboard carregado sem solicitar novo cadastro. |
| CT-096 | P1 | Falhar verificação do cadastro | Erro específico; não tratar falha como ausência de cadastro. |
| CT-097 | P1 | Carregar categorias e testar vazio/erro/repetição | Categorias ordenadas em pt-BR; feedback e tentativa quando disponível. |
| CT-098 | P1 | Avançar sem categoria ou sem descrição/descrição só de espaços | Alerta e permanência na etapa 1. |
| CT-099 | P1 | Escolher categoria e descrição válida | Etapa 2 apresentada. |
| CT-100 | P1 | Voltar da etapa 2 e avançar novamente | Categoria, descrição e endereço preservados; indicação de etapa correta. |
| CT-101 | P1 | Consultar CEP e variar campos inválidos como na edição de endereço | Consulta e validações iguais; envio não ocorre com endereço inválido. |
| CT-102 | P0 | Concluir cadastro com todos os dados válidos | Uma categoria enviada; UF em maiúsculas; sucesso e /professional-home. |
| CT-103 | P1 | Falhar cadastro, repetir envio ou cadastrar novamente | Erro recuperável; backend impede duplicidade. |
| CT-104 | P1 | Atualizar localização do prestador com GPS permitido | API recebe coordenadas e status indica atualização. |
| CT-105 | P1 | Negar localização ou falhar atualização no backend | Status de erro claro; dashboard ainda utilizável. |
| CT-106 | P1 | Carregar resumo com zero, valores positivos e resposta inválida | Indicadores reais formatados; erros não exibem números inventados. |
| CT-107 | P1 | Retornar ao dashboard após alteração de serviço | Resumo atualizado; resposta antiga não sobrescreve recente. |
| CT-108 | P1 | Tocar notificações, demandas e alternar para cliente | Rotas corretas e mesma identidade de usuário. |

### 7. Publicar demanda

Referências: `app/(tabs)/publicar/index.tsx`; `app/publish-demand/index.tsx`; `services/demandaService.ts`.

Pré-condição: Cliente autenticado; categorias válidas; imagens de teste; galeria e GPS disponíveis.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-109 | P0 | Publicar somente campos obrigatórios válidos | Demanda criada; opcionais omitidos; formulário limpo e retorno à home após OK. |
| CT-110 | P1 | Publicar com orçamento, coordenadas e 1 a 4 fotos | Multipart contém campos e anexos corretos; dados disponíveis depois. |
| CT-111 | P1 | Abrir /publish-demand e aba Publicar | Alias usa mesmo fluxo e mesmas validações. |
| CT-112 | P1 | Categorias carregando, vazias, com erro e tentar novamente | Sem publicação com categoria inválida; feedback recuperável. |
| CT-113 | P1 | Categoria ausente, removida da lista, zero ou ID inválido | Publicação bloqueada. |
| CT-114 | P1 | Título vazio/espaços e comprimentos 4, 5, 60, 61 | 5–60 após trim; limite de entrada e defesa contra payload adulterado. |
| CT-115 | P1 | Descrição vazia/espaços e comprimentos 9, 10, 2000, 2001 | 10–2000 após trim; excesso impedido. |
| CT-116 | P1 | Localização vazia/espaços e comprimentos 255/256 | Obrigatória; máximo 255. |
| CT-117 | P1 | Usar localização atual com permissão e endereço encontrado | Descrição e par latitude/longitude preenchidos. |
| CT-118 | P1 | Editar texto de localização depois de capturar GPS | Latitude e longitude são limpas ao editar o texto; publicação não associa endereço novo a coordenadas antigas. |
| CT-119 | P1 | Negar GPS ou falhar geocodificação reversa | Endereço manual possível; geocodificação falha usa coordenadas como descrição. |
| CT-120 | P1 | Enviar apenas uma coordenada ou valores fora de ±90/±180 | Bloqueado; testar limites exatos e além por unidade/API. |
| CT-121 | P1 | Selecionar cada urgência Normal/Urgente/Hoje | Envia NORMAL/URGENTE/HOJE respectivamente. |
| CT-122 | P1 | Publicar orçamento vazio, zero, negativo e texto sem números | Vazio omitido; entradas inválidas não devem virar valores positivos inadvertidamente. |
| CT-123 | P1 | Informar 150,50; 1.500,50; 150.50 e valor mínimo positivo | Conferir valor numérico enviado e apresentação em reais. |
| CT-124 | P1 | Adicionar 4 fotos e tentar quinta; remover e adicionar novamente | Máximo quatro e controle reabilitado após remoção. |
| CT-125 | P1 | Selecionar JPEG/PNG/WebP de 5 MiB e 5 MiB + 1 byte | Limite aceito; excedente rejeitado. |
| CT-126 | P1 | Selecionar lote com fotos válidas e inválidas | Válidas adicionadas até limite; alerta informa rejeições. |
| CT-127 | P1 | Selecionar MIME ausente, extensão maiúscula ou formato HEIC/GIF | Inferência suportada ou rejeição clara; sem crash. |
| CT-128 | P1 | Negar acesso à galeria ou cancelar seleção | Nenhuma foto adicionada; formulário mantido. |
| CT-129 | P1 | Falhar publicação por rede, validação da API ou sessão expirada | Erro visível e preenchimento preservado; sem falso sucesso. |
| CT-130 | P0 | Tocar Publicar várias vezes com rede lenta | Uma operação ativa; sem demanda duplicada. |
| CT-131 | P1 | Perder conexão após servidor criar demanda e reenviar | Verificar duplicidade e reconciliação; idempotência é requisito de robustez a validar. |

### 8. Minhas demandas e seleção de candidatos

Referências: `app/my-demands/index.tsx`; `app/demand-candidates/index.tsx`; `services/demandaService.ts`.

Pré-condição: Cliente com demandas em todos os estados e candidatos de diferentes prestadores.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-132 | P0 | Listar Minhas demandas em duas contas | Cada conta vê apenas suas publicações. |
| CT-133 | P1 | Exibir ABERTA, EM_ANDAMENTO, CONCLUIDA e CANCELADA | Rótulos/cores corretos; orçamento, urgência e fotos consistentes. |
| CT-134 | P1 | Lista vazia, erro e atualização | Estado apropriado; ação para publicar quando vazio. |
| CT-135 | P1 | Abrir demanda e consultar candidatos | ID correto; proposta, valor, mensagem e perfil pertencem à demanda. |
| CT-136 | P1 | Abrir demanda sem candidatos | Estado vazio compreensível; sem opção de seleção inexistente. |
| CT-137 | P1 | Abrir candidatos com ID inválido ou de outro cliente | Erro controlado e autorização no backend. |
| CT-138 | P0 | Selecionar candidato PENDENTE em demanda ABERTA | Demanda passa a EM_ANDAMENTO; candidatura selecionada confirmada na API e na interface. |
| CT-139 | P1 | Cancelar confirmação de seleção, se exibida | Nenhuma alteração no servidor. |
| CT-140 | P1 | Selecionar candidato com estado diferente de PENDENTE | Ação indisponível; API impede transição inválida. |
| CT-141 | P0 | Dois dispositivos selecionarem candidatos simultaneamente | Só um prestador selecionado; conflito informado e estado sincronizado. |
| CT-142 | P1 | Falhar seleção por rede ou demanda já encerrada | Não mostrar sucesso; permitir recarregar estado real. |
| CT-143 | P1 | Consultar candidatos de demanda em andamento/concluída/cancelada | Seleção indisponível; sem mensagem enganosa sobre prestador selecionado em demanda cancelada. |
| CT-144 | P1 | Abrir perfil do candidato | Prestador correto e modo candidatura preservado. |
| CT-145 | P0 | Abrir WhatsApp de candidatura ACEITA/AGUARDANDO_CONFIRMACAO | Contato autorizado pelo backend; link correto. |
| CT-146 | P1 | Tentar obter contato antes da seleção ou de demanda alheia | Contato não exposto. |

### 9. Demandas disponíveis, filtros e candidatura

Referências: `app/professional-demands/index.tsx`; `components/ui/demandas-disponiveis.tsx`; `hooks/use-demandas-disponiveis.ts`; `app/available-demand-details/index.tsx`.

Pré-condição: Prestador; demandas abertas de outros clientes, próprias, encerradas e mais de 20 resultados.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-147 | P0 | Abrir aba Disponíveis e comparar com dados de origem | Somente demandas abertas de outros clientes; próprias não aparecem. |
| CT-148 | P1 | Carregar lista inicial vazia/com erro e repetir | Feedback e ação de atualização corretos. |
| CT-149 | P1 | Carregar mais de 20 itens e última página | Contagem coerente; botão Carregar mais some no final. |
| CT-150 | P1 | API repetir ID em páginas diferentes | Deduplicação; nenhuma duplicação de card. |
| CT-151 | P1 | Falhar página seguinte e Tentar carregar mais | Itens anteriores preservados; próxima página não é pulada. |
| CT-152 | P1 | Atualizar durante paginação ou trocar filtro rapidamente | Consulta antiga abortada; só resposta atual modifica lista. |
| CT-153 | P1 | Sair e retornar à aba Disponíveis | Recarrega página inicial; demandas encerradas deixam de aparecer. |
| CT-154 | P1 | Abrir filtro, mudar temporários e fechar sem aplicar | Seleção ativa anterior mantida. |
| CT-155 | P1 | Aplicar categoria, limpar e ver todas as atividades | Consulta reinicia página zero e estado ativo corresponde ao filtro. |
| CT-156 | P1 | Ordenar RECENTES, MAIOR_ORCAMENTO e MENOR_ORCAMENTO | Ordenação enviada corretamente; comparar resultados da API. |
| CT-157 | P1 | Ordenar com orçamentos nulos e iguais | Confirmar regra de desempate/nulos com backend; não presumir regra ausente. |
| CT-158 | P1 | Falhar categorias do modal e repetir | Erro localizado; lista principal continua utilizável. |
| CT-159 | P1 | Aplicar filtro sem resultados | Estado identifica atividade e oferece ver todas. |
| CT-160 | P1 | Validar paginação com página -1/fracionária e tamanho 0/1/50/51 | Serviço aceita inteiros válidos e rejeita limites inválidos. |
| CT-161 | P1 | Abrir detalhes com ID inválido, inexistente ou demanda indisponível | Erro e retorno seguro; dados antigos removidos. |
| CT-162 | P1 | Atualizar detalhes ou sair enquanto consulta está em andamento | Abort/controle de foco impede atualização obsoleta. |
| CT-163 | P1 | Exibir fotos válidas, URL quebrada e URL assinada renovada | Imagem ou fallback; atualização não mantém imagem inacessível em cache. |
| CT-164 | P1 | Demanda sem orçamento, sem fotos ou com data inválida | A combinar, ausência de galeria e Data indisponível quando previsto. |
| CT-165 | P0 | Candidatar-se com valor positivo e mensagem opcional | Candidatura registrada; estado local indica candidatura e impede repetição indevida. |
| CT-166 | P1 | Valor vazio, zero, negativo, não numérico ou infinito | Rejeitado sem criar candidatura; verificar parser com sinal negativo e separadores. |
| CT-167 | P1 | Valor com vírgula decimal e separador de milhar | Valor enviado corresponde exatamente ao digitado. |
| CT-168 | P1 | Mensagem de 0/500/501 caracteres e só espaços | Opcional; máximo 500 após normalização; excesso impedido. |
| CT-169 | P0 | Candidatar duas vezes ou em dois dispositivos | Backend rejeita duplicidade; estado já candidatado respeitado. |
| CT-170 | P1 | Candidatar após demanda encerrar ou categoria mudar | Conflito/erro informado; sem candidatura inválida. |
| CT-171 | P1 | Candidatar a demanda própria ou sem cadastro profissional | Backend impede acesso/transição não autorizada. |
| CT-172 | P1 | Falhar candidatura ou expirar sessão | Erro visível, valor/mensagem preservados e botão liberado. |

### 10. Solicitação direta ao profissional

Referências: `app/send-proposal/index.tsx`; `services/propostaService.ts`.

Pré-condição: Cliente com e sem telefone válido; prestador identificado por parâmetro; serviços e imagens.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-173 | P0 | Enviar solicitação direta com campos válidos | Proposta PENDENTE criada para prestador correto; tela de sucesso. |
| CT-174 | P1 | Abrir por perfil e por Contratar novamente | Nome, serviço, opções, descrição, local e urgência pré-preenchidos corretamente. |
| CT-175 | P1 | Parâmetro serviceOptions ausente, JSON inválido ou lista vazia | Fallback sem crash; opção Outros permite informar serviço. |
| CT-176 | P1 | Selecionar Outros e deixar vazio ou usar 1/2/60/61 caracteres | Obrigatório; serviço entre 2 e 60. |
| CT-177 | P1 | Descrição vazia/espaços e 9/10/500/501 caracteres | Obrigatória; mínimo 10 e entrada limitada a 500. |
| CT-178 | P1 | Localização vazia/espaços e 255/256 caracteres | Obrigatória; máximo 255. |
| CT-179 | P1 | Selecionar cada urgência ou parâmetro inicial inválido | Mapeamento correto; valor inicial inválido usa Normal. |
| CT-180 | P1 | Prestador ausente, zero, negativo, decimal ou texto | Erro de identificação; envio bloqueado. |
| CT-181 | P1 | Enviar sem usuário autenticado | Mensagem para entrar; API não permite acesso anônimo. |
| CT-182 | P0 | Enviar com telefone ausente ou inválido | Modal solicita celular; proposta ainda não enviada. |
| CT-183 | P1 | Fechar modal por Agora não/Voltar | Nada enviado; formulário preservado. |
| CT-184 | P1 | Salvar telefone válido no modal | Atualiza perfil e então envia solicitação uma vez. |
| CT-185 | P1 | Salvar telefone vazio, DDD inválido ou sequência | Erro no modal; sem atualização nem proposta. |
| CT-186 | P1 | Falhar gravação do telefone | Modal permanece com erro; proposta não enviada. |
| CT-187 | P1 | Salvar telefone com sucesso e falhar envio da proposta | Telefone persiste; falha de envio visível e nova tentativa possível. |
| CT-188 | P1 | Adicionar/trocar/remover foto válida e cancelar galeria | No máximo uma foto; preview e payload correspondem à seleção final. |
| CT-189 | P1 | Foto acima de 5 MiB, formato inválido ou tamanho desconhecido | Rejeitar quando verificável; validar arquivo no servidor quando tamanho não informado. |
| CT-190 | P1 | Usar GPS permitido, negado e geocodificação falhando | Preenchimento/fallback conforme localização; endereço manual acessível. |
| CT-191 | P1 | Falhar envio ou tocar várias vezes durante carregamento | Erro recuperável; sem solicitação duplicada. |
| CT-192 | P1 | Enviar solicitação para si mesmo ou prestador indisponível | Validar rejeição/regra no backend; não pressupor suporte a auto contratação. |

### 11. Propostas recebidas, aceite, recusa e WhatsApp

Referências: `app/professional-demands/index.tsx`; `app/demand-details/index.tsx`; `app/my-proposals/index.tsx`; `services/propostaService.ts`.

Pré-condição: Solicitações PENDENTE, ACEITA, RECUSADA, CANCELADA, AGUARDANDO_CONFIRMACAO e FINALIZADA.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-193 | P0 | Prestador consultar Recebidas e cliente Minhas propostas | Itens corretos por papel; mesma proposta identificável nas duas contas. |
| CT-194 | P1 | Lista vazia/com erro e atualizar | Feedback correto; atualização ao retornar à tela. |
| CT-195 | P1 | Conferir contadores de pendentes/em andamento/concluídas | Correspondem aos estados, incluindo aguardando confirmação como em andamento. |
| CT-196 | P1 | Abrir detalhe de proposta PENDENTE | Busca status real antes de habilitar aceite/recusa; dados do cliente corretos. |
| CT-197 | P0 | Aceitar proposta PENDENTE | Estado ACEITA persistido; cliente vê atualização e recebe notificação conforme backend. |
| CT-198 | P0 | Recusar proposta PENDENTE | Estado RECUSADA persistido; nenhuma ação de contato liberada indevidamente. |
| CT-199 | P1 | Falhar aceite ou recusa | Estado não muda por sucesso falso; controles liberados. |
| CT-200 | P0 | Aceitar/recusar simultaneamente ou repetir em outro dispositivo | Uma transição válida; conflito reconciliado. |
| CT-201 | P1 | Abrir detalhe já aceito, recusado, cancelado, aguardando ou finalizado | Tela de resultado correta; sem ações exclusivas de pendente. |
| CT-202 | P1 | Falhar consulta de status/dados do cliente | Aceite/recusa indisponíveis sem estado confirmado; erro legível. |
| CT-203 | P1 | Abrir Minhas propostas e acessar perfil do prestador | Prestador correto; modo candidatura enviado pela tela atual deve ser avaliado. |
| CT-204 | P0 | Consultar WhatsApp nas telas autorizadas após aceite | API retorna contato da outra parte e mensagem referente ao serviço correto. |
| CT-205 | P1 | WhatsApp não instalado ou Linking.openURL rejeitar | Alerta controlado; controles reabilitados. |
| CT-206 | P1 | Falhar API de contato ou retornar URL malformada | Não abrir destino arbitrário; erro controlado. |
| CT-207 | P0 | Cliente/prestador terceiro consultar proposta ou contato alheio | Backend nega autorização e não revela telefone. |
| CT-208 | P1 | Retornar do WhatsApp ao app | Sessão e serviço preservados; notificações sincronizadas. |

### 12. Conclusão, histórico, avaliações e recontratação

Referências: `app/professional-demands/index.tsx`; `app/client-history.tsx`; `app/review/index.tsx`; `services/propostaService.ts`.

Pré-condição: Serviços ACEITA, AGUARDANDO_CONFIRMACAO e FINALIZADA; ambos os participantes autenticados.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-209 | P0 | Prestador solicitar conclusão de serviço ACEITA com valor válido | Estado AGUARDANDO_CONFIRMACAO; valorCobrado informado ao cliente. |
| CT-210 | P1 | Valor cobrado vazio, zero, negativo, letras ou mais de 2 casas decimais | Rejeitado; formato exige dígitos e até duas casas. |
| CT-211 | P1 | Valor cobrado 0,01; 150,50; 150.50 | Aceito como valor positivo, com moeda correta. |
| CT-212 | P1 | Cancelar modal de conclusão ou tentar fechá-lo durante envio | Cancelar antes do envio não altera serviço; processamento protegido. |
| CT-213 | P1 | Falhar solicitação de conclusão ou enviar duas vezes | Erro recuperável; não duplicar transição. |
| CT-214 | P0 | Cliente confirmar conclusão | FINALIZADA; valor cobrado preservado; avaliações habilitadas. |
| CT-215 | P0 | Cliente não confirmar conclusão | Retorna a ACEITA; valorCobrado local limpo; prestador pode solicitar novamente. |
| CT-216 | P0 | Confirmar e não confirmar simultaneamente | Uma decisão persistida; conflito comunicado e telas sincronizadas. |
| CT-217 | P1 | Consultar histórico Todos/Ativas/Concluídos/Encerrados | Ativas=PENDENTE/ACEITA/AGUARDANDO_CONFIRMACAO; concluídos=FINALIZADA; encerrados=RECUSADA/CANCELADA. |
| CT-218 | P1 | Histórico vazio, filtro sem itens, erro e atualização | Feedback apropriado e filtros utilizáveis. |
| CT-219 | P1 | Abrir histórico com propostaId destacado | Filtro Todos e posicionamento no serviço correto; destaque inexistente não trava. |
| CT-220 | P1 | Exibir valor inicial versus valorCobrado | Valor informado pelo prestador aparece nos estados aguardando/finalizado; sem confusão com pagamento realizado. |
| CT-221 | P1 | Avaliar prestador com notas 1 a 5 | Nota persistida no serviço correto e histórico atualizado ao voltar. |
| CT-222 | P1 | Enviar avaliação com nota 0 | Botão bloqueado. |
| CT-223 | P1 | Avaliar com/sem destaque e comentário vazio/espaços/500/501 caracteres | Opcionais vazios viram null; limite 500; um destaque válido enviado. |
| CT-224 | P1 | Abrir avaliação com ID ausente ou inválido | Erro de identificação; nenhuma avaliação enviada. |
| CT-225 | P0 | Avaliar serviço não finalizado, alheio ou já avaliado | Backend aplica autorização/estado/unicidade; erro recuperável. |
| CT-226 | P1 | Prestador avaliar cliente com cada nota 1 a 5 | Nota persistida; ação de avaliar substituída pelo resultado. |
| CT-227 | P1 | Cancelar avaliação do cliente ou falhar gravação | Sem nota gravada indevidamente; modal permite recuperação. |
| CT-228 | P1 | Serviço já avaliado por uma parte, mas não pela outra | Cada parte ainda pode fazer sua própria avaliação uma vez. |
| CT-229 | P1 | Contratar novamente a partir de histórico | Novo formulário pré-preenchido; cria nova proposta sem alterar a anterior. |
| CT-230 | P1 | Recontratar serviço com dados antigos acima dos limites atuais | Validações atuais aplicadas antes de novo envio. |
| CT-231 | P1 | Conferir médias e resumo após finalização/avaliação | Valores reais consistentes com API; distinguir dashboard integrado do relatório estático. |

### 13. Notificações, WebSocket e push

Referências: `contexts/notification-context.tsx`; `app/client-notifications.tsx`; `app/professional-notifications.tsx`; `services/notificacaoService.ts`; `services/push-notification-service*.ts`.

Pré-condição: Cliente e prestador em dois dispositivos; notificações lidas/não lidas e eventos duplicados.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-232 | P0 | Receber nova proposta, candidatura, aceite e solicitação de conclusão | Notificação entregue ao papel/destinatário correto conforme evento suportado pelo backend. |
| CT-233 | P1 | Consultar listas vazias, com itens, erro e repetir | Feedback correto e carregamento encerra. |
| CT-234 | P1 | Receber evento WebSocket válido em primeiro plano | Lista e contador atualizados sem reiniciar tela. |
| CT-235 | P1 | Receber evento repetido e atualização de mesmo ID | Item atualizado sem duplicação; contagem correta. |
| CT-236 | P1 | Receber JSON inválido, contexto inválido ou campos ausentes | Evento ignorado/erro controlado; conexão continua utilizável. |
| CT-237 | P1 | Cair conexão STOMP e restabelecer rede | Reconexão e ressincronização; sem múltiplas assinaturas. |
| CT-238 | P1 | Retomar app do background ou aba web visível | Sincroniza cliente e prestador; eventos perdidos recuperados. |
| CT-239 | P0 | Trocar de conta ou sair durante conexão e consultas | Assinaturas antigas encerradas; dados de A não aparecem em B. |
| CT-240 | P1 | Abrir item não lido e depois abrir novamente | Marca como lido uma vez; badge diminui sem ficar negativo. |
| CT-241 | P1 | Falhar marcação como lido | Estado não fica falsamente confirmado; erro tratado. |
| CT-242 | P1 | Badge com 0, 1, 99 e 100 notificações | Oculto em zero e 99+ acima de 99; label acessível correto. |
| CT-243 | P1 | Abrir notificação de candidatura/demanda no cliente | Abre candidatos da demanda correta. |
| CT-244 | P1 | Abrir Confirme a conclusão do serviço | Abre histórico com proposta correta destacada. |
| CT-245 | P1 | Abrir notificação do prestador de demanda pública ou proposta direta | Detalhe disponível ou detalhe de proposta correto conforme tipo/contexto. |
| CT-246 | P1 | Abrir notificação com recurso apagado/inacessível | Erro controlado; sem navegação para outro serviço. |
| CT-247 | P1 | Conceder, negar e revogar permissão push | App funciona; registro depende de permissão e plataforma. |
| CT-248 | P1 | Renovar token FCM ou reinstalar app | Backend recebe token atual; não manter entrega duplicada indevida. |
| CT-249 | P1 | Falhar registro/remoção de token push | Falha não bloqueia login, uso básico ou logout. |
| CT-250 | P1 | Receber push em foreground/background/app encerrado | Exibição e abertura conferidas em build real Android/iOS. |
| CT-251 | P1 | Tocar push com contexto CLIENTE/PRESTADOR ou desconhecido | Abre lista correta; payload inválido não abre rota arbitrária. |
| CT-252 | P0 | Sair e entrar com outra conta no mesmo aparelho | Push da conta anterior não expõe conteúdo à nova conta. |
| CT-253 | P1 | Executar versão web e implementação específica de iOS | Comportamento de cada serviço respeitado; sem exigir suporte nativo inexistente. |

### 14. Telas de exemplo e controles pendentes

Referências: `app/search/index.tsx`; `app/proposals/index.tsx`; `app/professional-report/index.tsx`; `app/professional-profile/index.tsx`; `app/modal/index.tsx`; `app/(tabs)/perfil/index.tsx`.

Pré-condição: Acesso às rotas, inclusive direto. Resultados atuais de interface não equivalem a integração aprovada.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-254 | P2 | Buscar em /search por texto e filtros locais | Filtragem do conjunto estático coerente; cards não contêm IDs reais para contratação. |
| CT-255 | P1 | Tocar Ver perfil em /search | PENDENTE: navegação sem ID não completa perfil real. |
| CT-256 | P2 | Alternar ordenação em /proposals | PENDENTE: seleção visual muda, mas array não é reordenado. |
| CT-257 | P1 | Aceitar ou abrir perfil em /proposals | PENDENTE: navega para /review ou /profile sem IDs; não efetiva seleção real. |
| CT-258 | P1 | Tocar Editar demanda em /proposals | Abre publicação; PENDENTE: não há edição persistente da demanda representada. |
| CT-259 | P2 | Abrir relatório profissional e conferir cartões/transações | Dados estáticos e barras baseadas no índice; PENDENTE para validar financeiro real. |
| CT-260 | P2 | Abrir perfil profissional com contas diferentes | Nome/foto reais, especialidade/métricas/serviços/reviews de exemplo; PENDENTE para dados profissionais completos. |
| CT-261 | P2 | Tocar Adicionar serviço, Certificações e Ajuda no perfil profissional | PENDENTE: ações não implementadas no handler. |
| CT-262 | P2 | Tocar Ajuda e suporte no perfil cliente | PENDENTE: item sem ação. |
| CT-263 | P2 | Abrir /modal e fechar | Tela auxiliar abre/fecha sem quebrar histórico; não tratar como fluxo de negócio. |
| CT-264 | P1 | Procurar pagamento, chat interno, cancelamento e exclusão de conta | Não identificados como fluxos completos de UI; não inventar cenários de execução. CANCELADA pode ser preparado via fixture/backend. |

### 15. Qualidade transversal, segurança e compatibilidade

Referências: `constants/theme.ts`; `components/ui/*`; `services/request.ts`; `services/token-storage.ts`; `services/storageService.ts`; `services/locationService.ts`.

Pré-condição: Repetir nos fluxos integrados; algumas condições exigem proxy, fixtures ou testes unitários/API.

| ID | Prioridade | Ação / variação | Resultado esperado |
|---|---|---|---|
| CT-265 | P0 | Repetir cada operação autenticada com token ausente/expirado e 401/403 | Sem acesso indevido; mensagem coerente; comparar caminhos fetch e request. |
| CT-266 | P0 | Adulterar IDs de usuário, prestador, demanda, proposta e candidatura | Autorização obrigatória no servidor; controles de UI não são barreira de segurança. |
| CT-267 | P1 | Simular HTTP 400/404/409/422/429/500/503 | Mensagem útil; não exibir sucesso nem deixar loading permanente; recuperar quando aplicável. |
| CT-268 | P1 | Simular JSON inválido, success=false, data=null e estrutura inesperada | Erro ou vazio conforme contrato de cada serviço; nenhuma quebra de renderização. |
| CT-269 | P1 | Simular resposta lenta, timeout e perda/restauração de rede | Indicador, fim do processamento e nova tentativa; verificar diferenças entre fetch e request. |
| CT-270 | P1 | Tocar repetidamente em todas as ações de escrita | Sem múltiplas operações concorrentes nem duplicações persistidas. |
| CT-271 | P1 | Navegar para trás/trocar conta enquanto requisição pendente | Resposta tardia não altera tela/conta errada. |
| CT-272 | P1 | Usar textos com acentos, emoji, quebras de linha e caracteres de marcação | Conteúdo tratado como texto; limites contados conforme implementação JS. |
| CT-273 | P1 | Abrir teclado em cada formulário/modal e tocar última ação | Campo ativo e botão acessíveis; scroll e dismiss funcionam. |
| CT-274 | P1 | Executar em Android, iOS e web | Navegação, uploads, permissões e armazenamento avaliados por implementação da plataforma. |
| CT-275 | P1 | Testar largura abaixo/acima de 700 px, tablet e rotação | Lista disponível muda 1/2 colunas sem perder filtro/estado; sem cortes ou sobreposição. |
| CT-276 | P1 | Testar notch, barra de gestos e botão Voltar Android | Safe areas respeitadas; modal e navegação previsíveis. |
| CT-277 | P1 | Usar leitor de tela e teclado na web | Labels, foco, ordem, estados selecionados/desabilitados e mensagens legíveis. |
| CT-278 | P1 | Aumentar fonte do sistema e usar nomes/valores longos | Conteúdo e ações legíveis sem perda funcional. |
| CT-279 | P2 | Comparar cores, erros, loading, cards e botões entre papéis | Tokens de theme consistentes; contraste verificado sem depender apenas de cor. |
| CT-280 | P2 | Alternar tema do dispositivo | Verificar tema efetivamente suportado; não presumir dark mode completo. |
| CT-281 | P1 | Formatar moeda/datas/nulos em todas as telas | pt-BR, valores corretos e ausência de NaN/undefined; conferir datas próximas da meia-noite em America/Bahia. |
| CT-282 | P1 | Carregar listas grandes e fotos de tamanho limite | Rolagem utilizável, sem crash/memória excessiva; medir e definir metas com equipe. |
| CT-283 | P1 | Usar cache de GPS aos 14m59s, 15m e após expiração | Cache reutilizado antes de 15 min; nova captura no limite e após. |
| CT-284 | P1 | Armazenar GPS corrompido/fora de faixa e falhar persistência | Cache inválido ignorado; captura válida não falha só por erro de gravação. |
| CT-285 | P0 | Inspecionar logs, armazenamento e troca de contas | Sem senhas/tokens em logs; isolamento de dados. Verificar armazenamento seguro nativo e diferenças web. |
| CT-286 | P1 | Revogar GPS/galeria/push nas configurações e retornar | App lida com nova permissão sem travar; verificar uso de GPS em cache após revogação. |

## Jornadas ponta a ponta prioritárias

Executar com dois participantes e conferir a API entre etapas. Estas jornadas combinam os casos do catálogo.

| ID | Jornada | Critério de aprovação |
|---|---|---|
| E2E-01 | Cadastro cliente → login → editar perfil/endereço → reiniciar → logout | Dados persistem e sessão encerra sem exposição ao reabrir. |
| E2E-02 | Cliente solicita diretamente → prestador aceita → cliente acessa WhatsApp → prestador solicita conclusão → cliente confirma → ambos avaliam | Mesmos IDs, estados e valor cobrado consistentes; avaliações únicas por parte. |
| E2E-03 | Solicitação direta → prestador recusa → cliente consulta propostas/histórico | RECUSADA persistida; contato não liberado. |
| E2E-04 | ACEITA → solicitar conclusão → cliente não confirma → prestador solicita novamente → cliente confirma | Retorno a ACEITA, limpeza do valor anterior e finalização com valor novo. |
| E2E-05 | Publicar demanda → outro prestador filtra/encontra → candidata → cliente seleciona | Demanda EM_ANDAMENTO e único candidato selecionado; publicação própria excluída da lista. |
| E2E-06 | Demanda selecionada → localizar serviço nos fluxos de conclusão → finalizar e avaliar | Confirmar ligação candidatura/proposta e IDs no backend; marcar bloqueado se essa continuidade não existir. |
| E2E-07 | Cliente sem telefone → solicitação → modal → salvar telefone → enviar → reabrir perfil | Telefone salvo e uma única proposta criada. |
| E2E-08 | Cliente → cadastro profissional → GPS → dashboard → alternar para cliente | Cadastro persistido, identidade preservada e métricas reais. |
| E2E-09 | Serviço finalizado → histórico → contratar novamente → nova proposta | Pré-preenchimento correto; serviço anterior permanece intacto. |
| E2E-10 | Conta A recebe push → logout → conta B → novos eventos/background | B não recebe nem visualiza conteúdo privado de A. |
| E2E-11 | Dois dispositivos selecionam/aceitam/confirmam simultaneamente | Uma transição válida, sem múltiplos selecionados nem estado divergente permanente. |
| E2E-12 | Recuperação de senha real → login com nova senha | PENDENTE: interface atual não envia link nem redefine senha no backend. |

## Cobertura existente e automação sugerida

O repositório contém testes Jest de serviços, autenticação, notificações, armazenamento, localização, hooks e componentes em `tests/`. A existência de teste não comprova que todos os casos acima são cobertos nem que a suíte passou nesta análise.

Os quatro fluxos Maestro encontrados são `.maestro/smoke/launch.yaml`, `.maestro/auth/login-success.yaml`, `.maestro/auth/login-failure.yaml` e `.maestro/demands/view-demand-list.yaml`. Eles cobrem partes de inicialização/login/listagem; não substituem as jornadas completas.

- **Jest:** limites de formulário e parsers, normalização, tratamento de erro, cache, concorrência de respostas, payloads e transições locais.
- **Maestro em Android/iOS:** jornadas P0, navegação, teclado, modais, formulários e persistência após reinício.
- **API/integração:** propriedade de recursos, transições ilegais, concorrência entre usuários, unicidade e validação de arquivos/documentos. Essas regras não podem ser comprovadas só por mocks do app.
- **Manual em dispositivo real:** Google, push, GPS, permissões, WhatsApp, acessibilidade, fontes e condições de rede.

Comandos existentes: `npm test -- --runInBand`, `npm run test:coverage`, `npm run e2e:smoke`, `npm run e2e:android`, `npm run e2e:ios`. Não foram executados porque a entrega é documental e nenhuma implementação foi alterada.

## Critério para encerrar homologação

Todos os P0 dos fluxos integrados devem passar nas plataformas previstas para lançamento; P1 devem estar aprovados ou ter decisão explícita documentada. Confirmar ausência de vazamento entre contas, duplicações e transições inválidas. Anexar evidências e defeitos. Manter recuperação de senha, dados estáticos e controles sem ação como pendências; não declarar esses fluxos completos.

Revisar este catálogo quando novas rotas, contratos de API, regras de negócio ou funcionalidades forem implementados. Pagamento real, chat interno e outras funcionalidades sem fluxo implementado precisam de catálogo próprio ao entrarem no escopo.
