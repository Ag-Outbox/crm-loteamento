# ESPECIFICAÇÃO TÉCNICA — CRM PARA LOTEADORAS E INCORPORADORAS
> Documento de requisitos para construção de plataforma SaaS imobiliária.
> Leia cada seção integralmente antes de começar a construir.

---

## VISÃO GERAL

Construa uma plataforma SaaS (Software as a Service) de CRM especializado para empresas do setor imobiliário, com foco em **loteadoras e incorporadoras**. O sistema centraliza toda a operação de vendas: captação de leads, funil de vendas, reserva e proposta de unidades, gestão financeira de recebíveis e emissão de boletos.

- **Tipo:** Aplicação web SPA (Single Page Application), responsiva para desktop e mobile
- **Arquitetura:** Multi-tenant — cada empresa cliente tem conta própria com dados completamente isolados
- **Usuários-alvo:** Empresas imobiliárias (loteadoras, incorporadoras) e seus corretores
- **Idioma da interface:** Português Brasileiro (pt-BR)
- **Design:** Moderno, limpo, com sidebar de navegação lateral, cor primária azul (#1A56DB)

---

## STACK TECNOLÓGICA RECOMENDADA

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React.js + TypeScript + Tailwind CSS |
| Backend | Node.js (NestJS) ou Python (FastAPI) |
| Banco de dados | PostgreSQL com campo `tenant_id` em todas as tabelas |
| Cache | Redis |
| Armazenamento de arquivos | S3 / DigitalOcean Spaces |
| Autenticação | JWT com refresh token + 2FA opcional |
| WebSockets | Para notificações e atualizações em tempo real |
| Kanban drag-and-drop | react-beautiful-dnd ou dnd-kit |
| Mapas | Leaflet.js (com suporte a overlay de imagem customizada) |
| Filas de processamento | BullMQ |
| Infraestrutura | DigitalOcean (Droplet ou App Platform), Docker |

---

## MÓDULOS DO SISTEMA

A plataforma é composta por **5 módulos principais** que se integram entre si:

1. **CRM de Vendas** — Gestão de leads e funil de vendas
2. **Gestão de Unidades** — Espelho de vendas, mapa interativo e tabelas de preço
3. **Financeiro** — Recebíveis, boletos bancários, contas a pagar/receber
4. **Atendimento Omnichannel** — WhatsApp, VOIP, vídeo chamada e IA
5. **Stand Online** — Vitrine digital pública do empreendimento

---

## MÓDULO 1 — CRM DE VENDAS

### 1.1 Funil de Vendas (Kanban)

A tela principal do CRM é um quadro **Kanban** (estilo Trello) com colunas representando etapas da jornada de compra. Os leads são exibidos como cards em cada coluna.

**Etapas padrão do funil (configuráveis pelo admin):**
- Oportunidades
- Em Atendimento
- Apresentação
- Reserva
- Proposta
- Contrato
- Venda Concluída

**Cada card de lead exibe:**
- Nome completo do lead
- Produto/Empreendimento de interesse
- Corretor responsável
- Data de cadastro
- Tag de temperatura (ex: Lead Frio, Lead Quente, Empresário) — personalizáveis
- Contador de dias desde o último contato (ex: "64d")
- Alerta visual (ícone de sino + número) para tarefas atrasadas
- Score numérico do lead (pontuação de interesse)
- Ícones de ação rápida: duplicar, arquivar, histórico, abrir WhatsApp

**Comportamento do Kanban:**
- Arrastar e soltar (drag-and-drop) cards entre colunas muda a etapa do lead
- Clicar no card abre a página de detalhes do lead
- Contador de leads por coluna no topo de cada coluna
- Filtros: por corretor, por empreendimento, por tag, por período
- Barra de pesquisa global por nome, telefone ou e-mail
- Contagem total de leads ativos exibida no título do funil

---

### 1.2 Detalhes do Lead

Ao clicar em um card, abre página completa com todas as informações do lead.

**Cabeçalho:**
- Número sequencial do lead (ex: Nº 865)
- Nome completo
- Barra visual de progresso mostrando todas as etapas, com a atual destacada
- Botão "Alterar Etapa"

**Informações de contato:**
- Produto/Empreendimento de interesse
- Origem (Facebook Ads, Site, WhatsApp, Indicação, etc.)
- Telefone (com botão de discagem VOIP)
- E-mail
- Data/hora de cadastro
- Data/hora da última atualização

**Seção: Unidades**
- Lista de unidades vinculadas ao lead (torre + número da unidade)
- Botões: Remover unidade, Alterar unidade
- Botão para adicionar nova unidade

**Seção: Proposta**
- Botão "Simular" — abre simulador financeiro no contexto deste lead
- Lista de propostas já geradas para este lead

**Seção: Proponentes**
- Adicionar compradores adicionais (cônjuge, sócio)
- Campos: nome, CPF, telefone, e-mail, estado civil

**Seção: Documentos da Negociação**
- Upload de documentos (RG, CPF, comprovante de renda, comprovante de endereço)
- Integração com assinatura eletrônica (ClickSign / DocuSign)
- Status de cada documento: Pendente, Enviado, Assinado

**Painel Lateral — Equipe e Responsável:**
- Exibe equipe de vendas e corretor responsável
- Botão "Alterar Responsável" para transferir o lead

**Painel Lateral — Histórico e Tarefas:**
- **Aba Histórico:** linha do tempo cronológica de todas as interações (mudanças de etapa, ligações, mensagens, notas, documentos)
- **Aba Tarefas:** lista de tarefas vinculadas ao lead
- Campo de registro de novo evento: tipo (ligação, e-mail, visita, nota, WhatsApp, etc.), descrição em texto livre, botão Salvar
- Cada entrada no histórico exibe: data/hora, tipo de evento, usuário que registrou e descrição

---

### 1.3 Gestão de Tarefas

Tela global que lista todas as tarefas de todos os leads do sistema.

**Colunas da tabela:**
- Responsável (usuário)
- Tipo (Telefone, E-mail, Chat, Visita)
- Lead (link clicável para os detalhes do lead)
- Status: "Em Andamento" (amarelo) ou "Concluído" (verde)
- Início (data e hora)
- Término (data e hora)

**Funcionalidades:**
- Filtrar por responsável, tipo, status, período
- Pesquisa por nome do lead
- Paginação configurável (10, 25, 50 itens por página)
- Marcar tarefa como concluída direto na lista

---

### 1.4 Distribuição Automática de Leads

Sistema de fila automática que distribui leads recém-chegados para corretores.

**Regras configuráveis:**
- **Round-robin sequencial:** cada lead vai para o próximo corretor da fila
- **Por equipe:** leads de determinada origem vão para equipe específica
- **Por empreendimento:** leads de produto específico vão para corretores especializados
- **Por horário:** respeita horário de trabalho configurado por corretor
- **Capacidade máxima:** corretor para de receber leads ao atingir limite configurado

---

## MÓDULO 2 — GESTÃO DE UNIDADES

### 2.1 Espelho de Vendas (Visão por Blocos/Torres)

Tela de gestão visual das unidades organizada em grade por bloco/torre e andar.

**Indicadores no topo (com cor e percentual):**

| Status | Cor |
|--------|-----|
| Vendido | Vermelho |
| Disponível | Verde |
| Reservado | Laranja |
| Pré-Reserva | Roxo/Lilás |
| Res. Permanente | Amarelo |
| Bloqueado | Preto |
| Indisponível | Cinza |

**Grade de unidades:**
- Organizada por bloco/torre e por andar
- Cada unidade é um botão clicável colorido com o número da unidade
- Cor reflete o status em tempo real
- Clicar em uma unidade abre modal com: status atual, área em m², valor, histórico de reservas, botão para alterar status manualmente

**Abas disponíveis:**
- **Unidades** — exibe a grade visual descrita acima
- **Lista de Unidades** — exibe as mesmas unidades em formato de tabela
- **Configuração** — configurações do empreendimento

---

### 2.2 Mapa Interativo do Loteamento

Para loteamentos, substituir a grade por um **mapa interativo** com imagem aérea real do terreno.

**Configuração pelo admin:**
1. Admin faz upload de imagem aérea ou planta do loteamento (JPG/PNG de alta resolução)
2. No modo de edição, admin clica sobre a imagem para posicionar marcadores (pins) em cada lote
3. Para cada marcador, admin associa o número do lote e o registro da unidade no sistema

**Visualização:**
- Mapa exibido em tela com marcadores coloridos sobrepostos em cada lote
- Cor do marcador = status da unidade (mesmo padrão de cores do espelho de vendas)
- Clicar em um marcador abre popup com: número do lote, quadra, área em m², valor, status atual
- Botão "Tela Cheia" para apresentação ao cliente
- Contadores no topo (total, vendido, disponível, reservado, bloqueado, indisponível)
- Link público compartilhável (sem necessidade de login) para exibir o mapa ao cliente

---

### 2.3 Tabela de Vendas

Configuração de tabelas de preço e condições de pagamento por empreendimento.

**Campos da tabela:**
- Nome da tabela (ex: "Lançamento OUT-2024 Parcelado")
- Data de vigência (início e fim)
- Índice de reajuste padrão (INCC, IPCA, IGPM, ou nenhum)

**Configuração de parcelas permitidas na tabela:**
Cada tabela define quais tipos de parcela existem e suas regras:

| Campo | Descrição |
|-------|-----------|
| Tipo de parcela | Entrada, Mensal, Semestral, Trimestral, Anual, Financiamento |
| Quantidade máxima | Número máximo de parcelas deste tipo (ex: 60 mensais) |
| Taxa de juros | Percentual de juros, ou "Sem Juros" |
| % ao período | Percentual de correção ao período |
| Índice de reajuste | INCC, IPCA, IGPM, ou Nenhum |
| Mínimo % | Percentual mínimo do valor total que este tipo pode representar |
| Máximo % | Percentual máximo do valor total |
| Frequência (meses) | Intervalo entre cobranças |
| Prazo de vencimento | Meses após assinatura para início das cobranças |

---

### 2.4 Fluxo de Pagamento

Combinação específica de parcelas que compõe uma forma de pagamento. Cada tabela pode ter múltiplos fluxos.

**Exemplo de fluxo "ENTRADA 10% + SALDO EM 24X":**
- Parcela tipo Entrada: 1x, 10% do valor total
- Parcela tipo Mensal: 24x, 50% do valor total
- Parcela tipo Financiamento: 1x, 40% do valor total

**Simulação de unidade:**
- Selecionar torre e número da unidade
- Sistema busca o valor da unidade automaticamente
- Calcula os valores monetários de cada parcela com base nos percentuais configurados
- Resultado exibe valor calculado de cada parcela

---

### 2.5 Simulador Financeiro

Ferramenta integrada ao lead para simular o pagamento de uma unidade em tempo real.

**Acesso:** Botão "Simular" na página de detalhes do lead.

**Funcionamento:**
1. Tela exibe: nome do lead, empreendimento, equipe e corretor
2. Unidade já vem pré-selecionada (vinculada ao lead)
3. Usuário seleciona a tabela de preços
4. Usuário seleciona o fluxo de pagamento
5. Sistema exibe automaticamente: valor total da unidade, percentual e valor calculado da proposta
6. Lista de parcelas da proposta: tipo, quantidade, porcentagem, valor calculado, data de vencimento, forma de cobrança
7. Usuário pode ajustar manualmente percentuais e quantidades
8. Campo para definir data de vencimento por tipo de parcela
9. Campo para selecionar forma de cobrança por parcela (Boleto, PIX, Cartão)
10. Botão para adicionar parcelas customizadas
11. Botão "Gerar Proposta" — cria PDF da proposta e registra no sistema

---

## MÓDULO 3 — CENTRAL DE RESERVAS E PROPOSTAS

### 3.1 Central de Reservas

Tela única com todas as reservas de todos os empreendimentos.

**Indicadores no topo:**
- Ativas: contador + percentual (fundo verde)
- Canceladas: contador + percentual (fundo cinza)

**Colunas da tabela:**
- Lead (link para detalhes do lead)
- Produto (empreendimento)
- Unidade (identificação)
- Equipe
- Responsável (corretor)
- Status: Ativa (verde) ou Cancelada (cinza)
- Data da Reserva (data e hora)

**Comportamento:**
- Reserva é criada automaticamente quando lead avança para etapa "Reserva" no Kanban
- Reserva tem prazo de validade configurável pelo admin (ex: 48 horas)
- Sistema envia notificação automática quando reserva está próxima de expirar
- Cancelar reserva devolve unidade ao status "Disponível" no mapa e espelho de vendas
- Histórico de reservas por unidade

---

### 3.2 Central de Propostas

Tela com todas as propostas com controle de aprovação.

**Indicadores:**
- Aprovadas: contador + percentual (verde)
- Aguardando: contador + percentual (amarelo)
- Pendência: contador + percentual (laranja)
- Reprovadas: contador + percentual (vermelho)

**Colunas da tabela:**
- Lead (link)
- Produto
- Unidades
- Responsável (corretor + equipe)
- Status: Aprovada, Cancelada, Aguardando, Pendência, Reprovada
- Data de Envio
- Opções: botão visualizar proposta (PDF)

**Fluxo de aprovação:**
1. Corretor gera proposta pelo simulador → status "Aguardando"
2. Gestor aprova ou solicita ajustes / reprova
3. Após aprovação → sistema pode disparar contrato para assinatura eletrônica
4. Após assinatura → lead vai para "Venda Concluída" e unidade vira "Vendida"

---

## MÓDULO 4 — FINANCEIRO

### 4.1 Contas a Receber (Gestão de Recebíveis)

Módulo completo de gestão de todas as parcelas a receber de todas as unidades vendidas.

**Indicadores no topo:**
- Vencidos: quantidade + valor total em vermelho
- Pendentes: quantidade + valor total em azul/cinza
- Baixados: quantidade + valor total em verde

**Colunas da tabela:**
- Cliente/Credor
- Descrição (ex: "Proposta nº 1")
- Proposta (link)
- Unidades
- Cobrança (PIX, Boleto, Cartão de Crédito)
- Tipo de Parcela (Entrada, Mensal, Financiamento, etc.)
- Nº Parcela (ex: 1/6)
- Data de Vencimento (ordenável)
- Valor Atualizado (com índice e juros)
- Valor Original
- Data de Baixa
- Valor Recebido
- Status do Título: Não Emitido, Emitido, Pago, Vencido

**Ações por título (menu de contexto por linha):**
- Histórico do título
- Editar título
- Desdobrar título (dividir em mais parcelas)
- Amortizar título (pagamento parcial)
- Baixar título (pagamento total)
- Gerar Boleto

---

### 4.2 Emissão de Boletos

Integração com API bancária para emissão de boletos diretamente pelo sistema.

**Bancos integrados:** Itaú, Santander, Bradesco, Banco do Brasil, Inter, Sicoob, e +30 bancos via API padrão CNAB/Open Banking.

**Funcionalidades:**
- Emissão unitária ou em lote
- Envio automático do boleto por e-mail ao comprador após emissão
- Envio de 2ª via de boleto pelo WhatsApp direto do sistema (botão na tela)
- Juros automáticos configuráveis para boletos vencidos (% ao dia)
- Índice de reajuste automático (INCC, IPCA, etc.) aplicado no vencimento
- Liquidação automática via webhook do banco (baixa automática ao identificar pagamento)
- Relatório de inadimplência

---

### 4.3 Contas a Pagar

- Cadastro de fornecedores e credores
- Lançamento de contas com categoria, valor e data de vencimento
- Baixa de pagamentos
- Relatório de fluxo de caixa (entradas vs saídas por período)
- Conciliação bancária

---

### 4.4 SPLIT de Pagamentos

Divisão automática de pagamentos para distribuição de comissões.

- Configurar % de comissão por empreendimento, por equipe e por corretor
- Ao registrar recebimento de parcela, sistema calcula e distribui comissões automaticamente
- Relatório de comissões: por período, por corretor, por empreendimento
- Histórico de repasses realizados

---

## MÓDULO 5 — ATENDIMENTO OMNICHANNEL

### 5.1 WhatsApp Integrado

Integração com WhatsApp Business API.

- Inbox centralizado de todas as mensagens recebidas de todos os leads
- Histórico completo de conversa vinculado ao lead no CRM
- Envio de texto, áudio, imagens, documentos e vídeos
- Templates de mensagem pré-cadastrados e aprovados (boas-vindas, lembrete, proposta, etc.)
- Botão de acesso rápido ao WhatsApp em cada card do Kanban
- Notificação em tempo real de nova mensagem (badge no menu lateral)
- Resposta rápida pelo sistema sem abrir o app do WhatsApp

---

### 5.2 VOIP (Chamadas por Internet)

- Discagem com um clique no telefone do lead
- Interface de chamada dentro do sistema (sem app externo)
- Gravação automática de chamadas (opt-in)
- Registro automático da chamada (data, hora, duração) no histórico do lead
- Histórico de chamadas com filtro por usuário e período

---

### 5.3 Vídeo Chamada

- Agendamento e início de videochamada direto pela página do lead
- Link gerado automaticamente e enviado ao cliente (e-mail ou WhatsApp)
- Integração com Google Meet ou Jitsi Meet
- Registro de reunião no histórico do lead

---

### 5.4 Inteligência Artificial — Assistente IA

Chatbot com IA para atendimento automático inicial.

- Responde automaticamente perguntas sobre empreendimentos disponíveis
- Qualifica o lead via conversa (pergunta sobre interesse, orçamento, prazo de compra)
- Sugere unidades disponíveis com base nas respostas do cliente
- Agenda visitas automaticamente
- Transfere para corretor humano quando o lead está qualificado ou solicita atendimento humano
- Botão "Gerar Mensagem" no histórico do lead: IA sugere próxima mensagem com base no contexto da conversa

---

## STAND ONLINE — VITRINE DIGITAL PÚBLICA

Página pública (sem necessidade de login) do empreendimento para apresentação e venda online.

**Conteúdo da página:**
- Nome e logo do empreendimento
- Galeria de fotos e vídeos
- Descrição, localização (mapa Google Maps)
- Plantas dos tipos de unidade disponíveis
- Mapa interativo de disponibilidade em tempo real (lotes/unidades com cores por status)
- Simulador financeiro público: visitante seleciona unidade, escolhe forma de pagamento, vê parcelas
- Formulário de interesse que cadastra o lead automaticamente no CRM (com origem = "Site")
- Popup de atendimento via vídeo para chamada imediata com corretor
- Botão de WhatsApp direto com o corretor responsável
- Link compartilhável por WhatsApp ou e-mail

---

## DASHBOARD — PAINEL DE CONTROLE

Tela inicial do sistema com visão gerencial consolidada.

**Métricas exibidas:**
- Total de leads no período (com comparativo ao período anterior)
- Leads por origem em gráfico de pizza (Facebook Ads, Site, WhatsApp, Indicação, etc.)
- Taxa de conversão por etapa do funil (gráfico de barras)
- Ranking de performance por corretor (leads trabalhados, propostas geradas, vendas fechadas)
- Por empreendimento: total de unidades, vendidas %, disponíveis %, reservadas %
- Receita do período: total recebido, a receber, vencido
- Gráfico de vendas por período (semanal / mensal / anual)
- Alertas: leads sem atendimento há X dias, reservas prestes a expirar, boletos vencidos

**Filtros do dashboard:**
- Por período (hoje, semana, mês, trimestre, ano, personalizado)
- Por empreendimento
- Por equipe / corretor

---

## INTEGRAÇÕES

### Portais Imobiliários
- **ZAP Imóveis** — exportação automática de anúncios de unidades disponíveis
- **Viva Real** — exportação automática de anúncios
- **OLX Imóveis** — integração para publicação de anúncios

### Marketing Digital
- **Facebook / Meta Ads** — webhook que captura leads do formulário de anúncios e insere automaticamente no funil
- **Google Ads** — captura via webhook
- **RD Station** — sincronização bidirecional de leads e estágios do funil
- **Formulários web / Landing Pages** — script embed ou integração via API

### Assinatura Eletrônica
- **ClickSign** — envio de contratos, monitoramento de status de assinatura
- **DocuSign** — alternativa de assinatura com validade jurídica

### ERP
- **Sienge** — sincronização de unidades, tabelas e propostas via API
- **UAU** — integração via API
- Suporte a qualquer ERP com API REST

### Chatbots
- **Lais IA** — bot conversacional integrado ao WhatsApp
- **Conversa.ai** — plataforma de chatbot alternativa

### API e Webhooks
- **API REST aberta** para integração com sistemas externos
- **Webhooks** configuráveis por evento: novo lead, lead mudou de etapa, proposta aprovada, pagamento recebido
- **Painel de Integrações visual:** admin ativa/desativa cada integração com toggle on/off, configura credenciais, nomeia a integração

---

## GESTÃO DE USUÁRIOS E PERMISSÕES

### Perfis de Acesso

| Perfil | Permissões |
|--------|-----------|
| Super Admin | Acesso total à plataforma. Gerencia todos os tenants |
| Admin da Empresa | Acesso total à conta: configurações, empreendimentos, usuários, relatórios |
| Gerente | Acesso a todos os leads, todos os corretores, relatórios, aprovação de propostas |
| Corretor | Acesso apenas aos seus leads e leads da sua equipe |
| Financeiro | Acesso ao módulo financeiro sem acesso ao CRM de vendas |

### Configurações da Conta (Admin)
- Cadastro e edição de empreendimentos
- Cadastro de equipes de vendas
- Cadastro de corretores e definição de equipe
- Personalização das etapas do funil de vendas
- Criação e edição de tags de lead
- Configuração das regras de distribuição automática de leads
- Upload de logo da empresa
- Configuração de horário de atendimento por corretor

---

## SEGURANÇA E INFRAESTRUTURA

| Requisito | Especificação |
|-----------|--------------|
| Conformidade legal | LGPD (Lei Geral de Proteção de Dados — Brasil) |
| Hospedagem | DigitalOcean |
| Backup | Automático diário de todos os dados |
| Isolamento de dados | Multi-tenant: cada empresa acessa apenas seus dados |
| Autenticação | E-mail + senha. 2FA opcional via TOTP |
| Criptografia | HTTPS/TLS em todas as rotas. Dados sensíveis criptografados em repouso |
| Auditoria | Log de todas as ações dos usuários com data, hora e IP |

---

## FLUXO COMPLETO DE VENDA (passo a passo de integração entre módulos)

Este é o fluxo que demonstra como todos os módulos se conectam:

1. Lead entra pelo **Facebook ADS** → integração captura automaticamente → cria card no funil na etapa **Oportunidades**
2. Sistema distribui o lead para o próximo corretor da fila (round-robin)
3. Corretor recebe notificação e acessa o lead. Registra tentativas de contato no histórico
4. Corretor entra em contato via **WhatsApp integrado** → conversa registrada no histórico do lead
5. Lead avança para **"Em Atendimento"** → corretor agenda apresentação e cria tarefa
6. Após apresentação, corretor vincula unidade de interesse ao lead no espelho de vendas
7. Corretor abre o **simulador financeiro** → simula pagamento → ajusta condições
8. Lead avança para **"Reserva"** → unidade muda automaticamente para laranja no mapa e no espelho
9. **Proposta gerada em PDF** com dados do comprador, unidade e condições de pagamento
10. Proposta entra em status **"Aguardando"** → gestor aprova no painel de propostas
11. Contrato enviado via **ClickSign/DocuSign** para assinatura eletrônica
12. Após assinatura → lead vai para **"Venda Concluída"** → unidade vira vermelha (Vendida)
13. Módulo financeiro cria automaticamente todos os **títulos a receber** (parcelas) da proposta
14. **Boletos emitidos** e enviados ao comprador. Sistema registra pagamentos automaticamente via webhook do banco
15. **SPLIT** distribui comissões automaticamente para corretor e equipe

---

## PLANOS E PRECIFICAÇÃO (para exibição na plataforma)

### Plano Profissional — CRM de Vendas
- Implantação: R$ 3.689,90 (parcelável em 2x)
- Licença mensal: R$ 1.899,90 | Promocional: R$ 1.759,90
- Empreendimentos: até 5
- Base de leads: até 5.000
- Usuários ADM: até 10 | Corretores: até 1.500
- Todas as funcionalidades de CRM incluídas
- Contrato de 12 meses

### Plano Advanced — CRM de Vendas
- Implantação: R$ 3.689,90 (parcelável em 2x)
- Licença mensal: R$ 2.689,90 | Promocional: R$ 2.389,90
- Empreendimentos: até 10
- Base de leads: até 15.000
- Usuários ADM: até 18 | Corretores: até 2.500
- Todas as funcionalidades de CRM incluídas
- Contrato de 12 meses

### Plano Gestão de Carteira — Financeiro
- Implantação: R$ 1.690,90 (parcelável em 2x)
- Licença mensal: R$ 1.569,90 | Promocional: R$ 1.189,90
- Imóveis cadastrados: até 2
- Contas a pagar: sim | Contas a receber: sim
- Emissão de boletos: sim | Integração bancária: sim
- SPLIT de pagamento: não incluído
- Consultoria de implementação: 8 horas incluídas
- Contrato de 12 meses

---

## REQUISITOS TÉCNICOS ADICIONAIS

- **Notificações em tempo real:** usar WebSockets para notificar corretores de novo lead, nova mensagem, tarefa atrasada
- **Responsividade:** interface deve funcionar em tablets e smartphones, especialmente para corretores em campo
- **Performance:** listagens com paginação obrigatória, queries otimizadas com índices no banco
- **Internacionalização:** moeda em BRL (R$), datas no formato DD/MM/AAAA, fuso horário configurável por conta
- **Exportação de dados:** todas as listagens devem ter botão de exportar para Excel/CSV
- **Relatórios:** módulo de relatórios com filtros avançados e exportação para PDF
- **Multi-idioma:** estruturar o código com suporte a i18n desde o início (foco em pt-BR)
- **Acessibilidade:** seguir diretrizes WCAG 2.1 nível AA
- **Logs de auditoria:** registrar todas as ações com usuário, data, hora, IP e dados alterados

---

*Fim da especificação. Versão 1.0 — Baseada na proposta Imobmeet para AJ Loteamentos — 11/03/2026*
