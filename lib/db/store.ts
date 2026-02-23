import bcrypt from 'bcryptjs'

export interface DBUsuario {
    id: string; nome: string; username: string; senha_hash: string
    funcao: 'TI' | 'Marketing' | 'Admin'; is_admin_matriz: boolean; created_at: string
    capacidade_semanal_horas: number
}
export interface DBCliente {
    id: string; nome: string; email: string | null; telefone: string | null
    servico: string | null; valor_mensal: number | null
    tipo_contrato: 'fixo' | 'freelance'; data_inicio: string | null
    status: 'ativo' | 'pausado' | 'encerrado'; observacoes: string | null; created_at: string
    portal_hash: string | null; portal_ativo: boolean; ultimo_acesso_portal: string | null
    horas_semanais_planejadas: number | null
}
export interface DBTarefa {
    id: string; titulo: string; descricao: string | null; cliente_id: string | null
    usuario_id: string | null; status: 'a_fazer' | 'em_andamento' | 'concluida'
    prioridade: 'baixa' | 'media' | 'alta'; prazo: string | null; created_at: string
    recorrencia: 'nenhuma' | 'semanal' | 'quinzenal' | 'mensal' | null
    recorrencia_pai_id: string | null
    visivel_portal: boolean
}
export interface DBTemplate {
    id: string; nome: string; descricao: string | null; created_at: string
}
export interface DBTemplateTarefa {
    id: string; template_id: string; titulo: string; descricao: string | null
    prazo_dias: number; prioridade: 'baixa' | 'media' | 'alta'
}
export interface DBEquipe {
    id: string; nome: string; descricao: string | null; criador_id: string | null; created_at: string
}
export interface DBMembroEquipe {
    id: string; equipe_id: string; usuario_id: string; funcao: string | null; created_at: string
}
export interface DBCusto {
    id: string; descricao: string; valor: number; categoria: string | null
    data: string; recorrente: boolean; created_at: string
}
export interface DBAnotacao {
    id: string; cliente_id: string; titulo: string; conteudo: string
    usuario_id: string; created_at: string; updated_at: string
}
export interface DBSenha {
    id: string; cliente_id: string; titulo: string; login: string
    senha: string; url: string | null; notas: string | null; created_at: string
}
export interface DBArquivo {
    id: string; cliente_id: string; nome: string; tamanho: number
    tipo: string; dados_base64: string | null; created_at: string
    visivel_portal: boolean
}
export interface DBHistoricoFinanceiro {
    mes: string; receita: number; custos: number; lucro: number
}
export interface DBAtividade {
    id: string; cliente_id: string; tipo: string; descricao: string
    usuario_id: string; usuario_nome: string; created_at: string
}
export interface DBHora {
    id: string; cliente_id: string; descricao: string
    horas: number; data: string; tarefa_id: string | null; created_at: string
}
export interface DBMensagemPortal {
    id: string; cliente_id: string; mensagem: string; lida: boolean; created_at: string
}
export interface DBIdeia {
    id: string; usuario_id: string; texto: string; status: 'pendente' | 'convertida'; created_at: string
}

function uuid() { return Math.random().toString(36).slice(2, 11) + Date.now().toString(36) }
function now() { return new Date().toISOString() }

const ADMIN_HASH = bcrypt.hashSync('admin123', 10)
const MARIA_HASH = bcrypt.hashSync('maria123', 10)

const store = {
    usuarios: [
        { id: 'usr-1', nome: 'Admin Sistema', username: 'admin', senha_hash: ADMIN_HASH, funcao: 'Admin' as const, is_admin_matriz: true, created_at: now(), capacidade_semanal_horas: 40 },
        { id: 'usr-2', nome: 'Maria TI', username: 'maria.ti', senha_hash: MARIA_HASH, funcao: 'TI' as const, is_admin_matriz: false, created_at: now(), capacidade_semanal_horas: 40 },
    ] as DBUsuario[],

    clientes: [
        { id: 'cli-1', nome: 'TechNova Ltda', email: 'contato@technova.com', telefone: '(11) 99999-0001', servico: 'Gestão de Redes Sociais', valor_mensal: 3500, tipo_contrato: 'fixo' as const, data_inicio: '2024-01-15', status: 'ativo' as const, observacoes: 'Cliente desde o início da empresa.', created_at: now(), portal_hash: 'abc123hash', portal_ativo: true, ultimo_acesso_portal: null, horas_semanais_planejadas: 10 },
        { id: 'cli-2', nome: 'Agência Bloom', email: 'bloom@agencia.com', telefone: '(21) 98888-0002', servico: 'Criação de Conteúdo', valor_mensal: 2200, tipo_contrato: 'fixo' as const, data_inicio: '2024-03-01', status: 'ativo' as const, observacoes: null, created_at: now(), portal_hash: null, portal_ativo: false, ultimo_acesso_portal: null, horas_semanais_planejadas: 5 },
        { id: 'cli-3', nome: 'StartupX', email: 'hi@startupx.io', telefone: null, servico: 'Desenvolvimento Web', valor_mensal: 5000, tipo_contrato: 'freelance' as const, data_inicio: '2024-06-10', status: 'pausado' as const, observacoes: 'Projeto pausado por férias do cliente.', created_at: now(), portal_hash: null, portal_ativo: false, ultimo_acesso_portal: null, horas_semanais_planejadas: 0 },
        { id: 'cli-4', nome: 'Loja Verde', email: 'contato@lojaverde.com', telefone: '(11) 91234-5678', servico: 'Gestão de Redes Sociais', valor_mensal: 1800, tipo_contrato: 'fixo' as const, data_inicio: '2024-09-01', status: 'ativo' as const, observacoes: null, created_at: now(), portal_hash: null, portal_ativo: false, ultimo_acesso_portal: null, horas_semanais_planejadas: 8 },
        { id: 'cli-5', nome: 'Construtech', email: 'adm@construtech.com.br', telefone: '(31) 97777-8888', servico: 'Tráfego Pago', valor_mensal: 4200, tipo_contrato: 'fixo' as const, data_inicio: '2023-11-20', status: 'ativo' as const, observacoes: 'Foco em campanhas Google e Meta.', created_at: now(), portal_hash: null, portal_ativo: false, ultimo_acesso_portal: null, horas_semanais_planejadas: 12 },
        { id: 'cli-6', nome: 'Estúdio Forma', email: 'forma@studio.io', telefone: null, servico: 'Criação de Conteúdo', valor_mensal: 1500, tipo_contrato: 'freelance' as const, data_inicio: '2025-01-10', status: 'ativo' as const, observacoes: null, created_at: now(), portal_hash: null, portal_ativo: false, ultimo_acesso_portal: null, horas_semanais_planejadas: null },
    ] as DBCliente[],

    tarefas: [
        { id: 'tar-1', titulo: 'Criar posts para Instagram – TechNova', descricao: '10 posts temáticos para março', cliente_id: 'cli-1', usuario_id: 'usr-2', status: 'em_andamento' as const, prioridade: 'alta' as const, prazo: '2025-03-10', created_at: now(), recorrencia: null, recorrencia_pai_id: null, visivel_portal: true },
        { id: 'tar-2', titulo: 'Relatório mensal de métricas', descricao: 'Compilar dados de alcance e engajamento', cliente_id: 'cli-1', usuario_id: 'usr-1', status: 'a_fazer' as const, prioridade: 'media' as const, prazo: '2025-03-15', created_at: now(), recorrencia: 'mensal' as const, recorrencia_pai_id: null, visivel_portal: true },
        { id: 'tar-3', titulo: 'Identidade visual – Bloom', descricao: 'Definir paleta de cores e tipografia', cliente_id: 'cli-2', usuario_id: 'usr-2', status: 'concluida' as const, prioridade: 'baixa' as const, prazo: '2025-02-28', created_at: now(), recorrencia: null, recorrencia_pai_id: null, visivel_portal: false },
        { id: 'tar-4', titulo: 'Campanha Google Ads – Construtech', descricao: 'Configurar campanha de PPC para leads', cliente_id: 'cli-5', usuario_id: 'usr-1', status: 'a_fazer' as const, prioridade: 'alta' as const, prazo: '2025-03-05', created_at: now(), recorrencia: null, recorrencia_pai_id: null, visivel_portal: false },
        { id: 'tar-5', titulo: 'Produção de reels mensais – Loja Verde', descricao: '4 reels com produtos em destaque', cliente_id: 'cli-4', usuario_id: 'usr-2', status: 'em_andamento' as const, prioridade: 'media' as const, prazo: '2025-03-20', created_at: now(), recorrencia: 'mensal' as const, recorrencia_pai_id: null, visivel_portal: false },
    ] as DBTarefa[],

    equipes: [
        { id: 'eqp-1', nome: 'Equipe de Conteúdo', descricao: 'Responsável por criação e gestão de conteúdo', criador_id: 'usr-1', created_at: now() },
    ] as DBEquipe[],

    membros_equipe: [
        { id: 'mem-1', equipe_id: 'eqp-1', usuario_id: 'usr-1', funcao: 'Admin', created_at: now() },
        { id: 'mem-2', equipe_id: 'eqp-1', usuario_id: 'usr-2', funcao: 'TI', created_at: now() },
    ] as DBMembroEquipe[],

    custos: [
        { id: 'cst-1', descricao: 'Adobe Creative Cloud', valor: 350, categoria: 'Software', data: '2025-02-01', recorrente: true, created_at: now() },
        { id: 'cst-2', descricao: 'Servidor VPS', valor: 120, categoria: 'Infraestrutura', data: '2025-02-01', recorrente: true, created_at: now() },
        { id: 'cst-3', descricao: 'Curso de Marketing Digital', valor: 497, categoria: 'Educação', data: '2025-01-20', recorrente: false, created_at: now() },
        { id: 'cst-4', descricao: 'Meta Ads (gerenciamento)', valor: 800, categoria: 'Marketing', data: '2025-02-01', recorrente: true, created_at: now() },
    ] as DBCusto[],

    anotacoes: [
        { id: 'ano-1', cliente_id: 'cli-1', titulo: 'Briefing inicial', conteudo: 'Cliente prefere posts com tons azuis. Evitar cores muito vibrantes. Aprovação sempre via WhatsApp.', usuario_id: 'usr-1', created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z' },
    ] as DBAnotacao[],

    senhas: [
        { id: 'sen-1', cliente_id: 'cli-1', titulo: 'Instagram TechNova', login: '@technova_oficial', senha: 'TechN0va@2024', url: 'https://instagram.com', notas: 'Acesso somente para agendamento', created_at: now() },
    ] as DBSenha[],

    arquivos: [] as DBArquivo[],

    atividades: [
        { id: 'atv-1', cliente_id: 'cli-1', tipo: 'cliente_criado', descricao: 'Cliente criado no sistema', usuario_id: 'usr-1', usuario_nome: 'Admin Sistema', created_at: '2025-01-15T09:00:00Z' },
        { id: 'atv-2', cliente_id: 'cli-1', tipo: 'anotacao_criada', descricao: 'Anotação adicionada: Briefing inicial', usuario_id: 'usr-1', usuario_nome: 'Admin Sistema', created_at: '2025-01-15T10:00:00Z' },
        { id: 'atv-3', cliente_id: 'cli-1', tipo: 'tarefa_criada', descricao: 'Tarefa criada: Criar posts para Instagram', usuario_id: 'usr-1', usuario_nome: 'Admin Sistema', created_at: '2025-02-01T11:00:00Z' },
        { id: 'atv-4', cliente_id: 'cli-2', tipo: 'cliente_criado', descricao: 'Cliente criado no sistema', usuario_id: 'usr-1', usuario_nome: 'Admin Sistema', created_at: '2024-12-01T09:00:00Z' },
        { id: 'atv-5', cliente_id: 'cli-2', tipo: 'tarefa_concluida', descricao: 'Tarefa concluída: Identidade visual – Bloom', usuario_id: 'usr-2', usuario_nome: 'Maria TI', created_at: '2025-02-28T16:00:00Z' },
    ] as DBAtividade[],

    horas: [
        { id: 'hor-1', cliente_id: 'cli-1', descricao: 'Criação de posts para Instagram', horas: 3.5, data: '2025-02-10', tarefa_id: 'tar-1', created_at: '2025-02-10T14:00:00Z' },
        { id: 'hor-2', cliente_id: 'cli-1', descricao: 'Reunião de alinhamento mensal', horas: 1.0, data: '2025-02-15', tarefa_id: null, created_at: '2025-02-15T10:00:00Z' },
        { id: 'hor-3', cliente_id: 'cli-2', descricao: 'Definição de paleta de cores', horas: 2.5, data: '2025-02-20', tarefa_id: 'tar-3', created_at: '2025-02-20T09:00:00Z' },
    ] as DBHora[],

    historico_financeiro: [
        { mes: '2024-09', receita: 8200, custos: 3100, lucro: 5100 },
        { mes: '2024-10', receita: 9400, custos: 3300, lucro: 6100 },
        { mes: '2024-11', receita: 10200, custos: 3500, lucro: 6700 },
        { mes: '2024-12', receita: 11800, custos: 4200, lucro: 7600 },
        { mes: '2025-01', receita: 12000, custos: 3900, lucro: 8100 },
        { mes: '2025-02', receita: 13200, custos: 4100, lucro: 9100 },
    ] as DBHistoricoFinanceiro[],

    config: {
        valor_hora: 50,
    },

    templates: [
        { id: 'tpl-1', nome: 'Onboarding Social Media', descricao: 'Etapas padrão para novos clientes de redes sociais', created_at: now() },
        { id: 'tpl-2', nome: 'Lançamento de Site', descricao: 'Checklist de entrega para projetos web', created_at: now() },
    ] as DBTemplate[],

    templates_tarefas: [
        { id: 'ttf-1', template_id: 'tpl-1', titulo: 'Briefing inicial', descricao: 'Reunião de alinhamento e coleta de referências', prazo_dias: 3, prioridade: 'alta' as const },
        { id: 'ttf-2', template_id: 'tpl-1', titulo: 'Criação de identidade visual', descricao: 'Definir paleta, fontes e elementos gráficos', prazo_dias: 10, prioridade: 'alta' as const },
        { id: 'ttf-3', template_id: 'tpl-1', titulo: 'Planejamento de conteúdo – Mês 1', descricao: 'Grade editorial do primeiro mês', prazo_dias: 15, prioridade: 'media' as const },
        { id: 'ttf-4', template_id: 'tpl-1', titulo: 'Configurar ferramentas de agendamento', descricao: 'Conectar contas e configurar Buffer/Meta', prazo_dias: 7, prioridade: 'baixa' as const },
        { id: 'ttf-5', template_id: 'tpl-2', titulo: 'Reunião de escopo', descricao: 'Definir páginas, funcionalidades e prazo', prazo_dias: 5, prioridade: 'alta' as const },
        { id: 'ttf-6', template_id: 'tpl-2', titulo: 'Design do wireframe', descricao: 'Wireframe de todas as páginas principais', prazo_dias: 14, prioridade: 'alta' as const },
        { id: 'ttf-7', template_id: 'tpl-2', titulo: 'Desenvolvimento front-end', descricao: 'Implementação do layout responsivo', prazo_dias: 30, prioridade: 'alta' as const },
        { id: 'ttf-8', template_id: 'tpl-2', titulo: 'Testes e revisão final', descricao: 'QA em múltiplos dispositivos e correções', prazo_dias: 40, prioridade: 'media' as const },
    ] as DBTemplateTarefa[],

    mensagens_portal: [] as DBMensagemPortal[],
    ideias: [] as DBIdeia[],
}

export default store
export { uuid, now }
