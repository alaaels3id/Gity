import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Sparkles, 
  Search, 
  Layers, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  CloudDownload, 
  CloudUpload, 
  Folder, 
  Server, 
  Code2, 
  Terminal, 
  Cpu, 
  Box, 
  Globe, 
  Database, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ProjectItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TECH_CONFIG, getTechMeta, TechMeta } from '../utils/projectType';

interface BadgesPageProps {
  projects: ProjectItem[];
  onBack: () => void;
  onSelectProject?: (project: ProjectItem) => void;
  onFilterByBadge?: (badgeKey: string) => void;
}

export const BadgesPage: React.FC<BadgesPageProps> = ({
  projects,
  onBack,
  onSelectProject,
  onFilterByBadge,
}) => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tech' | 'git' | 'env'>('all');
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);
  const [selectedBadgeProjects, setSelectedBadgeProjects] = useState<{
    title: string;
    projects: ProjectItem[];
  } | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBadge(text);
    setTimeout(() => setCopiedBadge(null), 1800);
  };

  // 1. Calculate live statistics for active tech badges in the user's workspace
  const activeTechBadges = useMemo(() => {
    const map = new Map<string, { label: string; count: number; meta: TechMeta; projects: ProjectItem[] }>();

    projects.forEach(p => {
      const type = p.projectType || (p.isLaravel ? 'laravel' : 'other');
      const meta = getTechMeta(type);
      const label = p.framework || p.projectTypeLabel || meta.label;
      const key = `${type}_${label}`.toLowerCase();

      if (!map.has(key)) {
        map.set(key, { label, count: 0, meta, projects: [] });
      }
      const item = map.get(key)!;
      item.count += 1;
      item.projects.push(p);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [projects]);

  // 2. Git status counts
  const gitStats = useMemo(() => {
    const cleanProjects = projects.filter(p => p.isGit && p.clean);
    const modifiedProjects = projects.filter(p => p.isGit && !p.clean);
    const behindProjects = projects.filter(p => p.isGit && p.behind > 0);
    const aheadProjects = projects.filter(p => p.isGit && p.ahead > 0);
    const nonGitProjects = projects.filter(p => !p.isGit);

    return {
      clean: cleanProjects,
      modified: modifiedProjects,
      behind: behindProjects,
      ahead: aheadProjects,
      nonGit: nonGitProjects,
    };
  }, [projects]);

  // 3. Complete catalog of supported frameworks and technologies
  const allCatalogBadges = [
    { name: 'Laravel', category: 'PHP Framework', color: '#ff4d79', led: 'toy-led-coral', pill: 'bg-[#ff4d79]/20 border-[#ff4d79]/40 text-[#ff4d79]', icon: Server, desc: 'Full-stack PHP web application framework' },
    { name: 'React', category: 'JavaScript / UI', color: '#00c8ff', led: 'toy-led-cyan', pill: 'bg-[#00c8ff]/20 border-[#00c8ff]/40 text-[#00c8ff]', icon: Code2, desc: 'Component-based frontend library' },
    { name: 'Next.js', category: 'React Framework', color: '#ffffff', led: 'toy-led-cyan', pill: 'bg-white/15 border-white/40 text-white', icon: Code2, desc: 'Full-stack React & Server Components' },
    { name: 'Vue', category: 'JavaScript / UI', color: '#00e699', led: 'toy-led-green', pill: 'bg-[#00e699]/20 border-[#00e699]/40 text-[#00e699]', icon: Code2, desc: 'Progressive JavaScript framework' },
    { name: 'Nuxt', category: 'Vue Framework', color: '#00dc82', led: 'toy-led-green', pill: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', icon: Code2, desc: 'Intuitive Vue full-stack framework' },
    { name: 'TypeScript', category: 'Language', color: '#00c8ff', led: 'toy-led-cyan', pill: 'bg-[#00c8ff]/20 border-[#00c8ff]/40 text-[#00c8ff]', icon: Code2, desc: 'Typed superset of JavaScript' },
    { name: 'JavaScript', category: 'Language', color: '#ffc01d', led: 'toy-led-amber', pill: 'bg-[#ffc01d]/20 border-[#ffc01d]/40 text-[#ffc01d]', icon: Code2, desc: 'Modern ECMAScript runtime & Node.js' },
    { name: 'Python', category: 'Language', color: '#00e699', led: 'toy-led-green', pill: 'bg-[#00e699]/20 border-[#00e699]/40 text-[#00e699]', icon: Terminal, desc: 'High-level language for backend, AI & data' },
    { name: 'Django', category: 'Python Framework', color: '#10b981', led: 'toy-led-green', pill: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300', icon: Terminal, desc: 'High-level Python web framework' },
    { name: 'FastAPI', category: 'Python Framework', color: '#06b6d4', led: 'toy-led-cyan', pill: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300', icon: Terminal, desc: 'Modern, fast (high-performance) API framework' },
    { name: 'Flask', category: 'Python Framework', color: '#94a3b8', led: 'toy-led-amber', pill: 'bg-slate-400/20 border-slate-400/40 text-slate-200', icon: Terminal, desc: 'Lightweight WSGI Python web framework' },
    { name: 'Vite', category: 'Build Tool', color: '#a855f7', led: 'toy-led-purple', pill: 'bg-purple-500/20 border-purple-500/40 text-purple-300', icon: Sparkles, desc: 'Next generation frontend tooling' },
    { name: 'Electron', category: 'Desktop Framework', color: '#38bdf8', led: 'toy-led-cyan', pill: 'bg-sky-500/20 border-sky-500/40 text-sky-300', icon: Box, desc: 'Cross-platform desktop application framework' },
    { name: 'Svelte', category: 'JavaScript / UI', color: '#ff3e00', led: 'toy-led-coral', pill: 'bg-orange-500/20 border-orange-500/40 text-orange-400', icon: Code2, desc: 'Cybernetically enhanced web apps' },
    { name: 'Express', category: 'Node Framework', color: '#cbd5e1', led: 'toy-led-amber', pill: 'bg-slate-500/20 border-slate-500/40 text-slate-300', icon: Server, desc: 'Fast, unopinionated, minimalist Node web framework' },
    { name: 'NestJS', category: 'Node Framework', color: '#ea2845', led: 'toy-led-coral', pill: 'bg-rose-500/20 border-rose-500/40 text-rose-300', icon: Server, desc: 'Progressive Node.js framework for scalable server-side apps' },
    { name: 'Go', category: 'Language', color: '#0284c7', led: 'toy-led-cyan', pill: 'bg-sky-500/20 border-sky-500/40 text-sky-400', icon: Box, desc: 'Fast, reliable, and efficient language by Google' },
    { name: 'Rust', category: 'Language', color: '#f97316', led: 'toy-led-coral', pill: 'bg-orange-500/20 border-orange-500/40 text-orange-400', icon: Cpu, desc: 'Empowering everyone to build reliable, efficient software' },
    { name: 'PHP', category: 'Language', color: '#a855f7', led: 'toy-led-purple', pill: 'bg-[#a855f7]/20 border-[#a855f7]/40 text-[#a855f7]', icon: Globe, desc: 'General-purpose web scripting language' },
  ];

  // 4. Git status badge items
  const gitStatusBadges = [
    {
      label: 'Clean Working Tree',
      pill: 'bg-[#00e699]/15 border-[#00e699]/40 text-[#00e699]',
      led: 'toy-led-green',
      icon: CheckCircle2,
      count: gitStats.clean.length,
      projects: gitStats.clean,
      desc: 'All changes committed, no modified or untracked files',
    },
    {
      label: 'Modified / Dirty Tree',
      pill: 'bg-[#ffc01d]/15 border-[#ffc01d]/40 text-[#ffc01d]',
      led: 'toy-led-amber',
      icon: AlertCircle,
      count: gitStats.modified.length,
      projects: gitStats.modified,
      desc: 'Unstaged modifications or staged files awaiting commit',
    },
    {
      label: 'Behind Remote',
      pill: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
      led: 'toy-led-cyan',
      icon: CloudDownload,
      count: gitStats.behind.length,
      projects: gitStats.behind,
      desc: 'Remote branch has commits ready to be pulled',
    },
    {
      label: 'Ahead of Remote',
      pill: 'bg-[#ff4d79]/15 border-[#ff4d79]/40 text-[#ff4d79]',
      led: 'toy-led-coral',
      icon: CloudUpload,
      count: gitStats.ahead.length,
      projects: gitStats.ahead,
      desc: 'Local commits ready to be pushed to remote',
    },
    {
      label: 'Git Branch Pill',
      pill: 'bg-[#0f1322] border-[#29365c] text-slate-200',
      led: 'toy-led-cyan',
      icon: GitBranch,
      count: projects.filter(p => p.isGit).length,
      projects: projects.filter(p => p.isGit),
      desc: 'Tactile branch checkout selector for instant switching',
    },
  ];

  // 5. Environment & System Pills
  const systemPills = [
    { label: 'local', type: 'Environment', pill: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', desc: 'Local development environment' },
    { label: 'production', type: 'Environment', pill: 'bg-rose-500/20 border-rose-500/40 text-rose-400', desc: 'Production live environment' },
    { label: 'staging', type: 'Environment', pill: 'bg-amber-500/20 border-amber-500/40 text-amber-400', desc: 'Staging preview environment' },
    { label: 'sqlite', type: 'Database', pill: 'bg-sky-500/20 border-sky-500/40 text-sky-400', desc: 'Embedded SQLite database' },
    { label: 'mysql', type: 'Database', pill: 'bg-orange-500/20 border-orange-500/40 text-orange-400', desc: 'MySQL relational engine' },
    { label: 'pgsql', type: 'Database', pill: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400', desc: 'PostgreSQL database' },
    { label: 'PHP ^8.2', type: 'Language Constraint', pill: 'bg-purple-500/20 border-purple-500/40 text-purple-300', desc: 'Composer PHP version requirement' },
    { label: 'Volume: code', type: 'Storage Root', pill: 'bg-[#0f1322] border-[#29365c] text-slate-300', desc: 'Project root workspace folder tag' },
  ];

  // Filter badges by search query
  const filteredCatalog = allCatalogBadges.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0d111d] text-slate-800 dark:text-slate-100 select-none overflow-hidden">
      {/* Titlebar macOS drag space */}
      <div className="titlebar-drag h-10 w-full flex-shrink-0" />

      {/* Top Header Bar */}
      <header className="no-drag bg-white/95 dark:bg-[#131929]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] px-8 py-4 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="studio-btn h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
            title="Back to Projects"
          >
            {isRTL ? <ArrowRight className="w-3.5 h-3.5 text-sky-500" /> : <ArrowLeft className="w-3.5 h-3.5 text-sky-500" />}
            <span>{t('backToProjects')}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded text-slate-400 font-mono">
              ESC
            </kbd>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08]" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.3)]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('badgeCollection')}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t('badgeCollectionSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter badges..."
            className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-medium focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Top Highlight Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="studio-card p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Projects
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="studio-card p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff2d20] to-transparent opacity-80" />
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Tech Stacks
              </span>
              <div className="text-xl font-bold text-[#ff2d20]">{activeTechBadges.length}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#ff2d20]/10 border border-[#ff2d20]/30 flex items-center justify-center text-[#ff2d20]">
              <Server className="w-4 h-4" />
            </div>
          </div>

          <div className="studio-card p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Clean Repositories
              </span>
              <div className="text-xl font-bold text-emerald-500">{gitStats.clean.length}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="studio-card p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Supported Badges
              </span>
              <div className="text-xl font-bold text-amber-500">{allCatalogBadges.length}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Section 1: Active Workspace Badges */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Active Badges In Your Workspace ({activeTechBadges.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Click any badge to inspect projects
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {activeTechBadges.map((badge) => {
              const Icon = badge.meta.icon;
              return (
                <div
                  key={badge.label}
                  onClick={() => setSelectedBadgeProjects({ title: badge.label, projects: badge.projects })}
                  className="studio-card p-4 flex flex-col justify-between gap-3 cursor-pointer hover:border-sky-500/50 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${badge.meta.ledClass}`} />
                      <span className={`studio-pill ${badge.meta.pillClass} text-xs font-semibold`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300">
                      {badge.count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                    <span className="font-medium">{badge.projects.length} {badge.projects.length === 1 ? 'project' : 'projects'}</span>
                    <span className="text-sky-500 dark:text-sky-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Git Status & Indicator Badges */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Git Status & Repository Indicators ({gitStatusBadges.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {gitStatusBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  onClick={() => badge.count > 0 && setSelectedBadgeProjects({ title: badge.label, projects: badge.projects })}
                  className={`studio-card p-4 flex flex-col justify-between gap-3 ${badge.count > 0 ? 'cursor-pointer hover:border-emerald-500/40' : 'opacity-80'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`studio-pill ${badge.pill} text-xs font-semibold flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.led}`} />
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300">
                      {badge.count}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Full Technology Catalog */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Full Technology Catalog ({filteredCatalog.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Click badge to copy name
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredCatalog.map((badge) => {
              const Icon = badge.icon;
              const isCopied = copiedBadge === badge.name;
              return (
                <div
                  key={badge.name}
                  onClick={() => handleCopy(badge.name)}
                  className="studio-card p-4 flex flex-col justify-between gap-3 cursor-pointer hover:border-sky-500/40 group relative"
                  title="Click to copy badge name"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`studio-pill ${badge.pill} text-xs font-semibold flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.led}`} />
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.name}</span>
                    </span>

                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                      {badge.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    {badge.desc}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                    <span className="font-mono text-xs">{badge.color}</span>
                    <span className="text-sky-500 dark:text-sky-400 flex items-center gap-1 font-medium">
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: System & Environment Badges */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Environment & Runtime Specs Pills ({systemPills.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {systemPills.map((pill) => (
              <div key={pill.label} className="studio-card p-4 flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between">
                  <span className={`studio-pill ${pill.pill} text-xs font-semibold`}>
                    {pill.label}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">
                    {pill.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  {pill.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal / Inspector Drawer for projects matching a selected badge */}
      {selectedBadgeProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="studio-card bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/[0.1] w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-sky-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedBadgeProjects.title} Projects ({selectedBadgeProjects.projects.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    All workspace repositories matching this badge
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadgeProjects(null)}
                className="studio-btn h-8 px-3 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Projects List */}
            <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
              {selectedBadgeProjects.projects.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-normal text-xs">
                  No projects currently tagged with this badge.
                </div>
              ) : (
                selectedBadgeProjects.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-sky-500/40 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="overflow-hidden min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${proj.clean ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'}`} />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{proj.name}</h4>
                        {proj.branch && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06]">
                            {proj.branch}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-1">
                        {proj.path}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBadgeProjects(null);
                        onSelectProject?.(proj);
                      }}
                      className="studio-btn h-8 px-3 text-xs text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
