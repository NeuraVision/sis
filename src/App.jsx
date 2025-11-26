import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Activity, 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Save, 
  ChevronRight,
  BarChart3,
  PieChart,
  Layers,
  Search,
  Settings,
  Bell,
  Menu,
  X,
  Zap,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';

// --- Mock Data & Types ---

const MOCK_ANALYSIS = {
  score: 78,
  financials: {
    liquidity: 1.45,
    ebitda: 0.18,
    burnRate: "R$ 45.000/mês",
    roi: "22%",
    cac: "R$ 1.250",
    ltv: "R$ 15.000",
    grossMargin: "42%",
    turnover: "4.5x"
  },
  executionStrategy: {
    summary: "Para estancar a queima de caixa imediata, a prioridade zero é a renegociação de passivos de curto prazo e a liquidação de estoques obsoletos (Curva C). A operação deve focar exclusivamente em produtos com margem de contribuição positiva pelos próximos 90 dias, sacrificando crescimento por solvência.",
    nextSteps: [
      { id: 1, action: "Congelar contratações não essenciais e suspender investimentos em P&D temporariamente.", deadline: "Imediato", owner: "RH & Financeiro" },
      { id: 2, action: "Agendar reunião de emergência com os 3 maiores credores para alongamento de dívida.", deadline: "Até Sexta-feira", owner: "CFO" }
    ]
  },
  diagnosis: [
    {
      type: "risk",
      title: "Divergência de Fluxo de Caixa",
      description: "O Lucro Líquido aumentou 12%, mas o Caixa Operacional caiu. Isso indica baixa qualidade dos lucros e aumento de inadimplência ou estoques parados.",
      severity: "high"
    },
    {
      type: "opportunity",
      title: "Otimização de CMV",
      description: "A margem bruta está 4% abaixo da média do setor (Benchmarking MIT Sloan). Renegociação com fornecedores da Curva A pode liberar R$ 120k/ano.",
      severity: "medium"
    }
  ],
  actions: [
    { id: 1, title: "Renegociar Fornecedores Top-3", impact: "Alto", effort: "Médio", status: "pending" },
    { id: 2, title: "Implementar Política de Crédito Rigorosa", impact: "Alto", effort: "Baixo", status: "in_progress" },
    { id: 3, title: "Revisão de Despesas de Marketing (CAC)", impact: "Médio", effort: "Baixo", status: "pending" }
  ]
};

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: Activity },
    { id: 'upload', label: 'Nova Análise', icon: Upload },
    { id: 'reports', label: 'Relatórios Salvos', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Brain className="text-blue-500" />
            <span>Neuravision</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                RG
              </div>
              <div>
                <p className="text-sm font-medium">Ronnie Girardi</p>
                <p className="text-xs text-slate-500">Engenheiro Prompt Senior</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MetricCard = ({ title, value, subtext, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </div>
);

const UploadView = ({ onAnalyze }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles([...files, ...e.dataTransfer.files]);
    }
  };

  const startAnalysis = () => {
    setIsProcessing(true);
    // Simula processamento em etapas
    const stages = [10, 30, 60, 85, 100];
    let currentStage = 0;

    const interval = setInterval(() => {
      setProgress(stages[currentStage]);
      currentStage++;
      if (currentStage >= stages.length) {
        clearInterval(interval);
        setTimeout(() => onAnalyze(), 500);
      }
    }, 800);
  };

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <Brain className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Processando Documentos</h2>
            <p className="text-slate-500">
              {progress < 30 && "Extraindo dados via OCR..."}
              {progress >= 30 && progress < 60 && "Normalizando Plano de Contas..."}
              {progress >= 60 && progress < 85 && "Executando Motor Simbólico..."}
              {progress >= 85 && "Gerando Diagnóstico Estratégico com IA..."}
            </p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Nova Análise</h1>
        <p className="text-slate-500 mt-2">Faça upload de DREs, Balanços Patrimoniais ou relatórios gerenciais (PDF, XLSX, CSV).</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Arraste e solte seus arquivos aqui</h3>
        <p className="text-slate-500 mb-6">ou clique para selecionar do computador</p>
        <button className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Selecionar Arquivos
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-slate-700">Arquivos Selecionados</h4>
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          
          <div className="pt-4 flex justify-end">
            <button 
              onClick={startAnalysis}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
            >
              <Brain size={20} />
              Iniciar Processamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardView = () => {
  const [showNotification, setShowNotification] = useState(false);

  const handleExport = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resultado da Análise: TechCorp S.A.</h1>
          <p className="text-slate-500">Baseado em DRE 2024 e Balanço Patrimonial</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Download size={18} />
            Exportar PDF
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2"
          >
            <Save size={18} />
            Salvar Relatório
          </button>
        </div>
      </div>

      {/* KPI Grid Extended */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Liquidez Corrente" 
          value={MOCK_ANALYSIS.financials.liquidity} 
          trend={-5.2} 
          subtext="Alerta: Abaixo do ideal (1.5)"
          icon={Activity} 
          colorClass="text-blue-600"
        />
        <MetricCard 
          title="Margem EBITDA" 
          value={(MOCK_ANALYSIS.financials.ebitda * 100) + "%"} 
          trend={12.5} 
          subtext="Saudável para o setor"
          icon={BarChart3} 
          colorClass="text-purple-600"
        />
        <MetricCard 
          title="Burn Rate" 
          value={MOCK_ANALYSIS.financials.burnRate} 
          trend={2.1} 
          subtext="Runway estimado: 8 meses"
          icon={TrendingUp} 
          colorClass="text-orange-600"
        />
        <MetricCard 
          title="Score de Saúde" 
          value={MOCK_ANALYSIS.score + "/100"} 
          subtext="Baseado em metodologia Altman"
          icon={Target} 
          colorClass="text-emerald-600"
        />
        {/* New Metrics */}
        <MetricCard 
          title="CAC" 
          value={MOCK_ANALYSIS.financials.cac} 
          trend={-1.5} 
          subtext="Custo de Aquisição de Cliente"
          icon={Users} 
          colorClass="text-indigo-600"
        />
        <MetricCard 
          title="LTV" 
          value={MOCK_ANALYSIS.financials.ltv} 
          trend={5.0} 
          subtext="Lifetime Value Projetado"
          icon={DollarSign} 
          colorClass="text-green-600"
        />
        <MetricCard 
          title="Margem Bruta" 
          value={MOCK_ANALYSIS.financials.grossMargin} 
          trend={-2.3} 
          subtext="Impactada por custo de insumos"
          icon={PieChart} 
          colorClass="text-pink-600"
        />
        <MetricCard 
          title="Turnover" 
          value={MOCK_ANALYSIS.financials.turnover} 
          subtext="Giro de Ativo Total"
          icon={Clock} 
          colorClass="text-cyan-600"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: AI Diagnosis & Plans */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Diagnosis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <Brain className="text-purple-600" />
              <h2 className="text-lg font-bold text-slate-800">Diagnóstico Estratégico (IA)</h2>
            </div>
            <div className="p-6 space-y-6">
              {MOCK_ANALYSIS.diagnosis.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-l-4 ${item.type === 'risk' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${item.type === 'risk' ? 'text-red-800' : 'text-blue-800'}`}>
                      {item.title}
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white bg-opacity-50">
                      {item.severity === 'high' ? 'Alta Prioridade' : 'Média Prioridade'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Search size={16} /> Contexto de Mercado
                </h4>
                <p className="text-sm text-slate-600 italic">
                  "Comparado aos benchmarks do setor de SaaS B2B (Fonte: McKinsey Insights 2024), sua empresa apresenta custos administrativos 15% acima da média, mas retenção de clientes superior."
                </p>
              </div>
            </div>
          </div>

          {/* New: Execution Strategy (Immediate Steps) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg text-white overflow-hidden">
             <div className="p-6 border-b border-slate-700 flex items-center gap-3">
              <Zap className="text-yellow-400" />
              <h2 className="text-lg font-bold">Estratégia de Execução Imediata</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-300 mb-6 leading-relaxed">
                {MOCK_ANALYSIS.executionStrategy.summary}
              </p>
              
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2 Próximos Passos Críticos</h4>
              <div className="space-y-3">
                {MOCK_ANALYSIS.executionStrategy.nextSteps.map((step) => (
                  <div key={step.id} className="bg-white/10 p-4 rounded-lg border border-white/5 flex items-start gap-4 hover:bg-white/20 transition-colors">
                    <div className="bg-yellow-500/20 text-yellow-400 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {step.id}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">{step.action}</h5>
                      <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={12}/> Prazo: {step.deadline}</span>
                        <span className="flex items-center gap-1"><Users size={12}/> Owner: {step.owner}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">Plano de Recuperação (Gantt)</h2>
              </div>
              <button className="text-sm text-blue-600 font-medium hover:underline">Ver Detalhes</button>
            </div>
            <div className="divide-y divide-slate-100">
              {MOCK_ANALYSIS.actions.map((action) => (
                <div key={action.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      action.status === 'in_progress' ? 'border-blue-500' : 'border-slate-300'
                    }`}>
                      {action.status === 'in_progress' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">Impacto: <strong className="text-slate-700">{action.impact}</strong></span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 self-center" />
                        <span className="flex items-center gap-1">Esforço: <strong className="text-slate-700">{action.effort}</strong></span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Docs & Quick Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">Documentos da Análise</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer transition-colors">
                <FileText size={18} className="text-blue-300" />
                <span className="text-sm font-medium">DRE_2024_Consolidado.pdf</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer transition-colors">
                <FileText size={18} className="text-blue-300" />
                <span className="text-sm font-medium">BP_Q4_Final.xlsx</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors">
              Gerenciar Fontes
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Próxima Revisão</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-center min-w-[60px]">
                <span className="block text-xs font-bold uppercase">Dez</span>
                <span className="block text-xl font-bold">15</span>
              </div>
              <div>
                <p className="font-medium text-slate-800">Reunião de Diretoria</p>
                <p className="text-sm text-slate-500">Apresentação dos resultados do plano de ação.</p>
              </div>
            </div>
            <button className="w-full py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
              Adicionar ao Calendário
            </button>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in">
          <CheckCircle className="text-green-400" size={20} />
          <div>
            <p className="font-medium">Relatório Exportado!</p>
            <p className="text-xs text-slate-400">O PDF foi salvo em seus documentos.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Footer Component ---
const SystemFooter = () => (
  <div className="mt-12 border-t border-slate-200 pt-8 pb-8 px-6 lg:px-8">
    <div className="max-w-4xl mx-auto text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
        <Brain size={16} />
        <span className="text-xs font-bold tracking-widest uppercase">Neuravision • IA Neural Preditiva</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mx-auto">
        A Neuravision é o primeiro núcleo analítico concebido para ir além da modelagem estatística tradicional, operando sobre arquiteturas neurais profundas capazes de aprender estruturas complexas, dinâmicas ocultas e relações não lineares presentes nos dados empresariais. Primeiro, ela transforma informações brutas em representações internas de alta dimensionalidade. Depois identifica padrões latentes que conectam finanças, operações, comercial e comportamento de clientes de forma integrada. Por fim, produz previsões, diagnósticos e cenários com precisão ampliada, antecipando riscos e oportunidades com base em sinais que modelos convencionais não conseguem capturar.
      </p>
      <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mx-auto">
        O conceito posiciona a Neuravision como um mecanismo de análise e previsão adaptativa. Ela se ajusta continuamente a novas evidências, responde a mudanças de mercado e entrega inteligência acionável que sustenta decisões estratégicas, otimização de desempenho e planejamento empresarial de longo alcance.
      </p>
      <div className="pt-4 text-[10px] text-slate-400">
        © 2026 Neuravision Systems. All rights reserved.
      </div>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simple router logic based on state
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'upload':
        return <UploadView onAnalyze={() => setActiveTab('dashboard')} />;
      case 'reports':
        return (
          <div className="p-8 text-center text-slate-500">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold">Biblioteca de Relatórios</h2>
            <p>Seus relatórios salvos e PDFs exportados aparecerão aqui.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center text-slate-500">
            <Settings size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold">Configurações do Sistema</h2>
            <p>Gerencie integrações API e preferências de análise.</p>
          </div>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Trigger */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Brain className="text-blue-600" size={20} />
            Neuravision
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500">
            <Menu size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
          <SystemFooter />
        </div>
      </main>
    </div>
  );
};

export default App;