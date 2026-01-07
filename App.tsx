
import React, { useState, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  Lightbulb, 
  History, 
  Zap, 
  ChevronRight, 
  Loader2, 
  Copy, 
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Download,
  FileText
} from 'lucide-react';
import { generateContentIdeas } from './geminiService';
import { Series, Episode } from './types';

// Initial data based on user input
const INITIAL_SERIES: Series = {
  title: "OS 10 DESASTRES QUE MOLDARAM O DINHEIRO",
  description: "Uma jornada dramática pelos momentos em que o sistema financeiro tremeu e o que aprendemos com isso.",
  episodes: [
    { title: "A TULIPAMANIA (1637)", hook: "Como bulbos de tulipa valeram 10 anos de salário?", narrative: "Febre coletiva holandesa em tavernas.", keyScene: "Leilão de bulbo por uma mansão.", modernLesson: "Psicologia de NFTs/Cripto." },
    { title: "A COMPANHIA DOS MARES DO SUL (1720)", hook: "A empresa que prometeu riquezas sem navios.", narrative: "Isaac Newton perdendo fortuna e subornos.", keyScene: "Diretor fugindo com livros falsos.", modernLesson: "Due diligence em IPOs." },
    { title: "O PÂNICO DE 1873", hook: "Como quebras criaram os Rockefellers.", narrative: "Expansão ferroviária e quebra bancária.", keyScene: "Magnatas comprando assets a centavos.", modernLesson: "Oportunidades nas crises." },
    { title: "1929 - QUINTA-FEIRA NEGRA", hook: "Pânico programado em cascata.", narrative: "Alavancagem de 10% e caos no NYSE.", keyScene: "Ticker tape atrasado horas.", modernLesson: "Reserva de emergência." },
    { title: "1987 - SEGUNDA-FEIRA NEGRA", hook: "Algoritmos e o crash em cascata.", narrative: "Falta de circuit breakers no trading programado.", keyScene: "Telas ficando vermelhas no mundo todo.", modernLesson: "Riscos do trading automatizado." },
    { title: "1998 - LTCM", hook: "Gênios que quase quebraram o mundo.", narrative: "Modelo matemático infalível com alavancagem 25:1.", keyScene: "Reunião de emergência no Fed.", modernLesson: "Modelos têm limites." },
    { title: "2000 - BOLHA PONTOCOM", hook: "Empresas sem lucro valiam bilhões.", narrative: "A febre dos domínios .com.", keyScene: "IPO da VA Linux subindo 698%.", modernLesson: "Avaliar fundamentos." },
    { title: "2008 - LEHMAN BROTHERS", hook: "Hipotecas podres quebraram a Islândia.", narrative: "CDOs e ratings AAA fraudulentos.", keyScene: "Funcionários saindo com caixas.", modernLesson: "Risco sistêmico existe." },
    { title: "2015 - SABRA E SARLIN", hook: "O hedge fund que apostou contra o país.", narrative: "Estratégia de juros e crise política.", keyScene: "Carta anunciando perda de 97%.", modernLesson: "Risco país e humildade." },
    { title: "2020 - COVID CRASH", hook: "A queda mais rápida da história.", narrative: "Recuperação em V e Robinhood traders.", keyScene: "Petróleo negativo e GameStop.", modernLesson: "Mercado ≠ economia." },
  ]
};

const EpisodeCard: React.FC<{ episode: Episode; index: number }> = ({ episode, index }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all group">
    <div className="flex items-start justify-between mb-3">
      <span className="text-emerald-500 font-mono text-xs font-bold uppercase tracking-wider">Episódio {index + 1}</span>
      <Zap className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
    </div>
    <h4 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">{episode.title}</h4>
    <p className="text-zinc-400 text-sm mb-4 italic">"{episode.hook}"</p>
    
    <div className="space-y-3">
      <div className="flex gap-2">
        <span className="text-xs text-zinc-500 font-semibold uppercase min-w-[80px]">Narrativa:</span>
        <span className="text-xs text-zinc-300">{episode.narrative}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-xs text-zinc-500 font-semibold uppercase min-w-[80px]">Cena:</span>
        <span className="text-xs text-zinc-300">{episode.keyScene}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
        <span className="text-xs text-emerald-500 font-bold uppercase min-w-[80px]">Lição:</span>
        <span className="text-xs text-emerald-100/80 font-medium">{episode.modernLesson}</span>
      </div>
    </div>
  </div>
);

const SeriesSection: React.FC<{ series: Series }> = ({ series }) => {
  const [isCopied, setIsCopied] = useState(false);

  const formatSeriesText = useCallback(() => {
    return `SÉRIE: ${series.title}\nDESCRIÇÃO: ${series.description}\n\n` + 
      series.episodes.map((ep, i) => 
        `------------------------------------------\n` +
        `EPISÓDIO ${i+1}: ${ep.title}\n` +
        `GANCHO: ${ep.hook}\n` +
        `NARRATIVA: ${ep.narrative}\n` +
        `CENA-CHAVE: ${ep.keyScene}\n` +
        `LIÇÃO MODERNA: ${ep.modernLesson}`
      ).join('\n\n');
  }, [series]);

  const copyToClipboard = () => {
    const text = formatSeriesText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadAsFile = () => {
    const text = formatSeriesText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${series.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roteiro.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-zinc-800 pb-4 gap-4">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-emerald-500 w-6 h-6 shrink-0" />
            {series.title}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">{series.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors border border-zinc-700"
            title="Copiar roteiro"
          >
            {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {isCopied ? 'Copiado!' : 'Copiar'}
          </button>
          <button 
            onClick={downloadAsFile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 text-xs font-medium transition-colors border border-emerald-500/20"
            title="Baixar roteiro .txt"
          >
            <Download className="w-4 h-4" />
            Baixar .txt
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.episodes.map((ep, idx) => (
          <EpisodeCard key={idx} episode={ep} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSeries, setGeneratedSeries] = useState<Series[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateContentIdeas(INITIAL_SERIES);
      setGeneratedSeries(prev => [...result.newSeries, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar ideias. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadAllGenerated = useCallback(() => {
    const allText = generatedSeries.map(s => {
      return `SÉRIE: ${s.title}\nDESCRIÇÃO: ${s.description}\n\n` + 
        s.episodes.map((ep, i) => 
          `EPISÓDIO ${i+1}: ${ep.title}\nGANCHO: ${ep.hook}\nNARRATIVA: ${ep.narrative}\nLIÇÃO: ${ep.modernLesson}`
        ).join('\n\n')
    }).join('\n\n==========================================\n\n');

    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todas_ideias_geradas.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedSeries]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-zinc-950 w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">FinanceArchitect <span className="text-emerald-500">AI</span></h1>
            <h1 className="text-lg font-bold tracking-tight sm:hidden">FA <span className="text-emerald-500">AI</span></h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {generatedSeries.length > 0 && (
              <button 
                onClick={downloadAllGenerated}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all border border-zinc-700"
              >
                <FileText className="w-4 h-4" />
                Baixar Todas
              </button>
            )}
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? 'Arquitetando...' : 'Gerar Ideias'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/20 p-8 md:p-12 mb-12">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-6 border border-emerald-500/20">
              <Lightbulb className="w-3 h-3" />
              CONTEÚDO ESTRATÉGICO PARA FINANÇAS
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Transforme dados em <span className="text-emerald-500">Narrativas Virais</span>.
            </h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Use inteligência artificial para converter eventos históricos complexos em séries de alto engajamento. Gere roteiros completos com ganchos, cenas e lições práticas.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
            <TrendingUp className="w-full h-full text-emerald-500" />
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm flex items-center gap-3">
            <RefreshCw className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Generated Content */}
        {generatedSeries.length > 0 && (
          <div className="space-y-16 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-emerald-500 font-mono text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                NOVAS SUGESTÕES DA IA
              </div>
              <button 
                onClick={downloadAllGenerated}
                className="md:hidden flex items-center gap-1 text-emerald-400 underline decoration-emerald-500/30 underline-offset-4"
              >
                Baixar todas as sugestões
              </button>
            </h3>
            {generatedSeries.map((series, idx) => (
              <SeriesSection key={`gen-${idx}`} series={series} />
            ))}
          </div>
        )}

        {/* Base Series Section */}
        <div className="pt-8 border-t border-zinc-900">
          <h3 className="text-zinc-500 font-mono text-sm font-bold mb-10 flex items-center gap-2 uppercase tracking-widest">
            Série Base do Canal
          </h3>
          <SeriesSection series={INITIAL_SERIES} />
        </div>

        {/* Action Bottom Bar */}
        {!isGenerating && generatedSeries.length === 0 && (
          <div className="text-center py-12 border-t border-zinc-800 mt-20">
            <p className="text-zinc-500 mb-6">Precisa de mais inspiração estratégica?</p>
            <button 
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-colors group"
            >
              Arquitetar Novas Séries
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="py-10 text-center border-t border-zinc-900 bg-zinc-950/50">
        <p className="text-zinc-600 text-sm">
          &copy; 2024 FinanceArchitect AI - Exportação de Roteiros Habilitada.
        </p>
      </footer>
    </div>
  );
}
