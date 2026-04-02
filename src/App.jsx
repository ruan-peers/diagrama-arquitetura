import React, { useState, useLayoutEffect, useRef, useMemo } from 'react';
import { 
  Database, Zap, Activity, Layers, ShieldCheck, Server, 
  PieChart, FileSpreadsheet, Presentation, Info, Cpu, 
  Globe, Workflow, Webhook, MousePointer2, LayoutGrid, Share2, Maximize2
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
  const containerRef = useRef(null);

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
    const active = activeFlow === 'all' || flowHighlights[activeFlow].includes(data.name);
    return (
      <div id={`node-${data.id}`} onClick={() => setSelectedNode(data)}
        className={`relative w-full p-2.5 cursor-pointer transition-all duration-500 rounded-xl border-2 flex flex-col items-center justify-center text-center group min-h-[75px] z-20 ${active ? 'bg-[#011334] border-[#e1ff00] shadow-lg scale-100' : 'bg-white/5 border-transparent opacity-10 scale-90 grayscale'}`}>
        <div className={`mb-1.5 transition-colors ${active ? 'text-[#e1ff00]' : 'text-[#677185]'}`}>{data.icon}</div>
        <span className={`text-[8px] font-black uppercase tracking-widest leading-tight ${active ? 'text-white' : 'text-[#99a1ae]'}`}>{data.name}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans overflow-hidden bg-[#011334] text-white">
      <header className="px-10 py-5 flex justify-between items-center bg-[#011334] z-50 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#e1ff00] rounded-lg flex items-center justify-center shadow-lg shadow-[#e1ff00]/10"><Share2 size={22} color="#011334" strokeWidth={3} /></div>
          <div><h1 className="text-2xl font-black uppercase tracking-tighter text-[#e1ff00]">Data <span className="text-white">Lakehouse Flow</span></h1><p className="text-[10px] text-[#99a1ae] font-bold uppercase tracking-[0.25em]">Arquitetura Azure Interativa</p></div>
        </div>
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
          {Object.keys(flowHighlights).map((f) => (
            <button key={f} onClick={() => setActiveFlow(f)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeFlow === f ? 'bg-[#e1ff00] text-[#011334]' : 'text-[#ccd0d6] hover:text-white'}`}>{f === 'all' ? 'Vista Geral' : f}</button>
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
        <aside className="absolute right-10 top-8 w-[240px] z-40 transition-all duration-500">
          <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[75vh] overflow-hidden border border-gray-200">
            <div className="p-6 flex flex-col items-center text-center gap-3 border-b border-gray-100">
              <div className={`p-3 rounded-xl ${selectedNode ? 'bg-[#011334] text-[#e1ff00]' : 'bg-gray-100 text-gray-400'}`}>{selectedNode ? selectedNode.icon : <MousePointer2 size={20} />}</div>
              <div className="w-full">
                <h2 className="text-[#011334] font-black text-sm leading-tight uppercase truncate">{selectedNode ? selectedNode.name : 'Selecione'}</h2>
                <p className="text-gray-400 text-[8px] font-bold uppercase mt-1 tracking-widest">{selectedNode ? selectedNode.category : 'Componente'}</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar-white">
              {selectedNode ? <div className="space-y-4 text-[#011334]"><p className="text-[11px] font-semibold leading-relaxed border-l-2 border-[#e1ff00] pl-2">{selectedNode.description}</p></div> : <p className="text-gray-400 text-center text-[9px] uppercase font-bold">Clique no diagrama</p>}
            </div>
          </div>
        </aside>

        {/* Área do Diagrama */}
        <main ref={containerRef} className="flex-1 relative overflow-auto flex flex-col justify-center pb-20 pt-10 px-20">
          <div className="min-w-[1150px] grid grid-cols-5 gap-8 items-end relative z-20">
            <div className="space-y-4"><ColHeader text="Fontes" />{components.slice(0,3).map(c => <NodeCard key={c.id} data={c} />)}</div>
            <div className="space-y-5 flex flex-col items-center"><ColHeader text="Ingestão" />{components.slice(3,6).map(c => <NodeCard key={c.id} data={c} />)}</div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-[3rem] space-y-4 flex flex-col items-center relative">
              <div className="absolute -top-4 px-5 py-1.5 bg-[#e1ff00] rounded-full text-[#011334] text-[8px] font-black uppercase tracking-widest">Medallion Core</div>
              <NodeCard data={components[7]} /><div className="w-full h-px bg-white/10"></div><NodeCard data={components[8]} /><div className="w-11/12 scale-105"><NodeCard data={components[6]} /></div><NodeCard data={components[9]} /><NodeCard data={components[10]} />
            </div>
            <div className="space-y-12"><ColHeader text="Serving" />{components.slice(11,13).map(c => <NodeCard key={c.id} data={c} />)}</div>
            <div className="space-y-4"><ColHeader text="Consumo" />{components.slice(13,16).map(c => <NodeCard key={c.id} data={c} />)}</div>
          </div>
        </main>
      </div>

      <style>{`.animate-flow { stroke-dashoffset: 200; animation: dashflow 4s linear infinite; } @keyframes dashflow { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
};

const ColHeader = ({ text }) => <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] text-center mb-2">{text}</h3>;

export default App;