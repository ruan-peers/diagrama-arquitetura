import React, { useState, useLayoutEffect, useRef, useMemo, useEffect } from 'react';
import { 
  Database, Zap, Activity, Layers, ShieldCheck, Server, 
  PieChart, FileSpreadsheet, Presentation, Info, Cpu, 
  Globe, Workflow, Webhook, MousePointer2, LayoutGrid, Share2, Maximize2,
  Trophy, X, Lightbulb, Users, Pencil, CheckCircle2
} from 'lucide-react';

const COLORS = {
  deepBlue: '#011334',
  green: '#e1ff00',
  white: '#ffffff',
  lightBlue: '#d8e8ee',
  sec1: '#eff6f8',
  sec6: '#99a1ae',
  sec7: '#677185'
};

const App = () => {
  const [activeFlow, setActiveFlow] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodePositions, setNodePositions] = useState({});
  const [toggledNodes, setToggledNodes] = useState({});
  const [showChallenge, setShowChallenge] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setToggledNodes({});
  }, [activeFlow]);

  // Mapeamento dos elementos que devem "acender" em cada fluxo
  const flowHighlights = {
    api: ['API/Webhook', 'Azure Functions', 'ADLS Bronze', 'Databricks', 'Unity Catalog', 'ADLS Silver', 'ADLS Gold', 'Synapse', 'Power BI'],
    stream: ['Streaming', 'Event Hubs', 'Databricks', 'Unity Catalog', 'ADLS Bronze', 'ADLS Silver', 'Cosmos DB', 'Power BI'],
    webhook: ['Web Hook', 'Azure Functions', 'ADLS Bronze', 'Databricks', 'Unity Catalog', 'ADLS Silver', 'Excel'],
    batch: ['Data Factory', 'ADLS Bronze', 'Databricks', 'Unity Catalog', 'ADLS Silver', 'ADLS Gold', 'Synapse', 'Excel', 'PowerPoint'],
    all: []
  };

  // Ordem dos IDs para o desenho da linha animada
  const orderedPathIds = {
    api: ['I1', 'F1', 'S1', 'D1', 'S2', 'S3', 'V1', 'C1'],
    stream: ['I2', 'B1', 'D1', 'S1', 'S2', 'V2', 'C1'],
    webhook: ['I3', 'F1', 'S1', 'D1', 'S2', 'C2'],
    batch: ['O1', 'S1', 'D1', 'S2', 'S3', 'V1', 'C3'],
    all: []
  };

  const components = [
    { id: 'I1', name: 'API/Webhook', category: 'Ingestão', icon: <Globe size={20} />, description: 'Entrada de dados via requisições REST externas.' },
    { id: 'I2', name: 'Streaming', category: 'Ingestão', icon: <Activity size={20} />, description: 'Fluxo contínuo de eventos em tempo real.' },
    { id: 'I3', name: 'Web Hook', category: 'Ingestão', icon: <Webhook size={20} />, description: 'Gatilhos de sistemas externos disparando fluxos.' },
    { id: 'B1', name: 'Event Hubs', category: 'Buffer', icon: <Zap size={20} />, description: 'Ingestão massiva com baixa latência.' },
    { id: 'F1', name: 'Azure Functions', category: 'Serverless', icon: <Cpu size={20} />, description: 'Validação e limpeza inicial de dados.' },
    { id: 'O1', name: 'Data Factory', category: 'Orquestração', icon: <Workflow size={20} />, description: 'Orquestrador de cargas históricas e complexas.' },
    { id: 'D1', name: 'Databricks', category: 'Compute', icon: <Zap size={20} />, description: 'Motor Spark para transformações Delta Lake.' },
    { id: 'U1', name: 'Unity Catalog', category: 'Governança', icon: <ShieldCheck size={20} />, description: 'Segurança e linhagem centralizada.' },
    { id: 'S1', name: 'ADLS Bronze', category: 'Storage', icon: <Database size={20} />, description: 'Dados brutos em formato Parquet.' },
    { id: 'S2', name: 'ADLS Silver', category: 'Storage', icon: <Database size={20} />, description: 'Dados limpos e padronizados.' },
    { id: 'S3', name: 'ADLS Gold', category: 'Storage', icon: <Database size={20} />, description: 'Tabelas agregadas prontas para consumo.' },
    { id: 'V1', name: 'Synapse', category: 'Serving', icon: <Layers size={20} />, description: 'Warehouse analítico de alta performance.' },
    { id: 'V2', name: 'Cosmos DB', category: 'Serving', icon: <Server size={20} />, description: 'Base NoSQL para baixa latência global.' },
    { id: 'C1', name: 'Power BI', category: 'Consumo', icon: <PieChart size={20} />, description: 'Dashboards interativos para decisão.' },
    { id: 'C2', name: 'Excel', category: 'Consumo', icon: <FileSpreadsheet size={20} />, description: 'Consultas flexíveis para analistas.' },
    { id: 'C3', name: 'PowerPoint', category: 'Consumo', icon: <Presentation size={20} />, description: 'Apresentações com dados vivos.' }
  ];

  useLayoutEffect(() => {
    const calculatePositions = () => {
      if (!containerRef.current || activeFlow === 'all') return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPositions = {};
      const currentPathIds = orderedPathIds[activeFlow] || [];
      currentPathIds.forEach(id => {
        const element = document.getElementById(`node-${id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          newPositions[id] = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
          };
        }
      });
      setNodePositions(newPositions);
    };
    calculatePositions();
    window.addEventListener('resize', calculatePositions);
    return () => window.removeEventListener('resize', calculatePositions);
  }, [activeFlow]);

  const pathString = useMemo(() => {
    if (activeFlow === 'all' || !orderedPathIds[activeFlow]) return '';
    let path = '';
    orderedPathIds[activeFlow].forEach((id, index) => {
      const pos = nodePositions[id];
      if (!pos) return;
      path += `${index === 0 ? 'M' : 'L'} ${pos.x},${pos.y} `;
    });
    return path;
  }, [activeFlow, nodePositions]);

  const NodeCard = ({ data }) => {
    const defaultActive = activeFlow === 'all' || flowHighlights[activeFlow].includes(data.name);
    const active = toggledNodes[data.id] !== undefined ? toggledNodes[data.id] : defaultActive;

    const handleDoubleClick = (e) => {
      e.stopPropagation();
      setToggledNodes(prev => ({
        ...prev,
        [data.id]: prev[data.id] !== undefined ? !prev[data.id] : !defaultActive
      }));
    };

    return (
      <div id={`node-${data.id}`} onClick={() => setSelectedNode(data)} onDoubleClick={handleDoubleClick}
        className={`relative w-full p-2.5 cursor-pointer transition-all duration-500 rounded-xl border-2 flex flex-col items-center justify-center text-center group min-h-[90px] z-20 ${active ? 'bg-[#011334] border-[#e1ff00] shadow-lg scale-100' : 'bg-white/5 border-transparent opacity-10 scale-90 grayscale'}`}>
        <div className={`mb-1.5 transition-colors ${active ? 'text-[#e1ff00]' : 'text-[#677185]'}`}>{data.icon}</div>
        <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${active ? 'text-white' : 'text-[#99a1ae]'}`}>{data.name}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans overflow-hidden bg-[#011334] text-white">
      <header className="px-10 py-5 flex justify-between items-start bg-[#011334] z-50 shrink-0 border-b border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#e1ff00] rounded-lg flex items-center justify-center shadow-lg shadow-[#e1ff00]/10 mt-1"><Share2 size={22} color="#011334" strokeWidth={3} /></div>
          <div>
            <h1 className="text-[28px] font-black uppercase tracking-tighter text-[#e1ff00]">Data <span className="text-white">Lakehouse Flow</span></h1>
            <p className="text-[12px] text-[#99a1ae] font-bold uppercase tracking-[0.25em]">Arquitetura Azure Interativa</p>
            <button onClick={() => setShowChallenge(true)} className="mt-3 flex items-center gap-3 px-9 py-4.5 rounded-2xl bg-gradient-to-r from-[#e1ff00] to-[#a8bf00] text-[#011334] text-[20px] font-black uppercase tracking-widest transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#e1ff00]/20 active:scale-95">
              <Trophy size={28} strokeWidth={3} />
              Desafio
            </button>
          </div>
        </div>
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 mt-1">
          {Object.keys(flowHighlights).map((f) => (
            <button key={f} onClick={() => setActiveFlow(f)} className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeFlow === f ? 'bg-[#e1ff00] text-[#011334]' : 'text-[#ccd0d6] hover:text-white'}`}>{f === 'all' ? 'Vista Geral' : f}</button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Linhas de Conexão Animadas */}
        <svg className="absolute inset-0 pointer-events-none z-10 overflow-visible" width="100%" height="100%">
          <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          {pathString && <path d={pathString} fill="none" stroke="#e1ff00" strokeWidth="3" strokeDasharray="10,10" className="animate-flow" filter="url(#glow)" />}
        </svg>

        {/* Quadro de Informações (Direita) */}
        <aside className="absolute right-10 top-8 w-[605px] z-40 transition-all duration-500">
          <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="p-6 flex flex-col items-center text-center gap-3 border-b border-gray-100">
              <div className={`p-3 rounded-xl ${selectedNode ? 'bg-[#011334] text-[#e1ff00]' : 'bg-gray-100 text-gray-400'}`}>{selectedNode ? selectedNode.icon : <MousePointer2 size={20} />}</div>
              <div className="w-full">
                <h2 className="text-[#011334] font-black text-base leading-tight uppercase truncate">{selectedNode ? selectedNode.name : 'Selecione'}</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">{selectedNode ? selectedNode.category : 'Componente'}</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar-white">
              {selectedNode ? <div className="space-y-4 text-[#011334]"><p className="text-[13px] font-semibold leading-relaxed border-l-2 border-[#e1ff00] pl-2">{selectedNode.description}</p></div> : <p className="text-gray-400 text-center text-[11px] uppercase font-bold">Clique no diagrama</p>}
            </div>
          </div>
        </aside>

        {/* Área do Diagrama */}
        <main ref={containerRef} className="flex-1 relative overflow-auto flex flex-col justify-center pb-20 pt-10 px-20">
          <div className="min-w-[1150px] grid grid-cols-5 gap-8 items-end relative z-20">
            <div className="space-y-4"><ColHeader text="Fontes" />{components.slice(0,3).map(c => <NodeCard key={c.id} data={c} />)}</div>
            <div className="space-y-5 flex flex-col items-center"><ColHeader text="Ingestão" />{components.slice(3,6).map(c => <NodeCard key={c.id} data={c} />)}</div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-[3rem] space-y-4 flex flex-col items-center relative">
              <div className="absolute -top-5 px-5 py-1.5 bg-[#e1ff00] rounded-full text-[#011334] text-[10px] font-black uppercase tracking-widest">Medallion Core</div>
              <NodeCard data={components[7]} /><div className="w-full h-px bg-white/10"></div><NodeCard data={components[8]} /><div className="w-11/12 scale-105"><NodeCard data={components[6]} /></div><NodeCard data={components[9]} /><NodeCard data={components[10]} />
            </div>
            <div className="space-y-12"><ColHeader text="Serving" />{components.slice(11,13).map(c => <NodeCard key={c.id} data={c} />)}</div>
            <div className="space-y-4"><ColHeader text="Consumo" />{components.slice(13,16).map(c => <NodeCard key={c.id} data={c} />)}</div>
          </div>
        </main>
      </div>

      {/* Modal do Desafio */}
      {showChallenge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setShowChallenge(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" />
          {/* Modal */}
          <div className="relative w-full max-w-[640px] bg-[#0a1e3d] border border-[#e1ff00]/30 rounded-3xl shadow-2xl shadow-[#e1ff00]/10 animate-modalIn overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Glow accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#e1ff00] to-transparent rounded-b-full" />
            {/* Close button */}
            <button onClick={() => setShowChallenge(false)} className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-10">
              <X size={18} />
            </button>
            {/* Header */}
            <div className="px-10 pt-10 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e1ff00]/10 border border-[#e1ff00]/20 mb-5">
                <Trophy size={32} className="text-[#e1ff00]" strokeWidth={2.5} />
              </div>
              <h2 className="text-[26px] font-black uppercase tracking-tight text-white leading-tight">Desafio <span className="text-[#e1ff00]">Arquitetura</span></h2>
              <p className="text-[13px] text-[#99a1ae] mt-2 font-medium">Coloque em prática o que aprendemos sobre o ecossistema Azure</p>
            </div>
            {/* Content */}
            <div className="px-10 pb-10 space-y-5">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p className="text-[14px] text-white/90 leading-relaxed">
                  Agora é a vez de vocês! Cada grupo deverá criar o seu próprio <strong className="text-[#e1ff00]">case de negócio</strong> e desenhar uma arquitetura de dados completa utilizando as ferramentas da plataforma Azure.
                </p>
              </div>
              {/* Steps */}
              <div className="space-y-3">
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#e1ff00]/10 flex items-center justify-center mt-0.5">
                    <Users size={20} className="text-[#e1ff00]" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-wide">1. Formem Grupos</h4>
                    <p className="text-[12px] text-white/50 mt-1 leading-relaxed">Reúnam-se em equipes. Cada grupo irá trabalhar de forma colaborativa para construir a sua solução.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#e1ff00]/10 flex items-center justify-center mt-0.5">
                    <Lightbulb size={20} className="text-[#e1ff00]" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-wide">2. Pensem num Case</h4>
                    <p className="text-[12px] text-white/50 mt-1 leading-relaxed">Definam um problema de negócio real ou fictício — pode ser um e-commerce, uma plataforma IoT, um sistema financeiro, etc. Usem a criatividade!</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#e1ff00]/10 flex items-center justify-center mt-0.5">
                    <Pencil size={20} className="text-[#e1ff00]" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-wide">3. Desenhem a Arquitetura</h4>
                    <p className="text-[12px] text-white/50 mt-1 leading-relaxed">Com base nas ferramentas Azure que exploramos neste diagrama e nos exemplos da página compartilhada, montem o fluxo completo da infraestrutura de dados — da ingestão ao consumo final.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#e1ff00]/10 flex items-center justify-center mt-0.5">
                    <CheckCircle2 size={20} className="text-[#e1ff00]" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-wide">4. Apresentem a Solução</h4>
                    <p className="text-[12px] text-white/50 mt-1 leading-relaxed">Cada grupo apresentará o seu case e a arquitetura proposta, justificando as escolhas de cada componente utilizado.</p>
                  </div>
                </div>
              </div>
              {/* CTA */}
              <button onClick={() => setShowChallenge(false)} className="w-full py-3.5 rounded-xl bg-[#e1ff00] text-[#011334] text-[13px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98]">
                Bora lá! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-flow { stroke-dashoffset: 200; animation: dashflow 4s linear infinite; }
        @keyframes dashflow { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-modalIn { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

const ColHeader = ({ text }) => <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center mb-2">{text}</h3>;

export default App;