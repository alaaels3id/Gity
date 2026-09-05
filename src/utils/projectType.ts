import { LucideIcon, Server, Code2, Terminal, Box, Cpu, FileCode2, Globe } from 'lucide-react';
import { ProjectType } from '../types';

export interface TechMeta {
  type: ProjectType;
  label: string;
  color: string; // hex
  textColor: string;
  bgColor: string;
  borderColor: string;
  ledClass: string;
  pillClass: string;
  borderAccentClass: string;
  barColor: string;
  icon: LucideIcon;
}

export const TECH_CONFIG: Record<string, TechMeta> = {
  laravel: {
    type: 'laravel',
    label: 'Laravel',
    color: '#ff4d79',
    textColor: 'text-[#ff4d79]',
    bgColor: 'bg-[#ff4d79]/15',
    borderColor: 'border-[#ff4d79]/40',
    ledClass: 'toy-led-coral',
    pillClass: 'bg-[#ff4d79]/20 text-[#ff4d79] border-[#ff4d79]/40 shadow-[0_2px_0_rgba(255,77,121,0.15)]',
    borderAccentClass: 'before:bg-[#ff4d79] before:shadow-[0_0_10px_rgba(255,77,121,0.6)]',
    barColor: '#ff4d79',
    icon: Server,
  },
  javascript: {
    type: 'javascript',
    label: 'JavaScript',
    color: '#ffc01d',
    textColor: 'text-[#ffc01d]',
    bgColor: 'bg-[#ffc01d]/15',
    borderColor: 'border-[#ffc01d]/40',
    ledClass: 'toy-led-amber',
    pillClass: 'bg-[#ffc01d]/20 text-[#ffc01d] border-[#ffc01d]/40 shadow-[0_2px_0_rgba(255,192,29,0.15)]',
    borderAccentClass: 'before:bg-[#ffc01d] before:shadow-[0_0_10px_rgba(255,192,29,0.6)]',
    barColor: '#ffc01d',
    icon: Code2,
  },
  typescript: {
    type: 'typescript',
    label: 'TypeScript',
    color: '#00c8ff',
    textColor: 'text-[#00c8ff]',
    bgColor: 'bg-[#00c8ff]/15',
    borderColor: 'border-[#00c8ff]/40',
    ledClass: 'toy-led-cyan',
    pillClass: 'bg-[#00c8ff]/20 text-[#00c8ff] border-[#00c8ff]/40 shadow-[0_2px_0_rgba(0,200,255,0.15)]',
    borderAccentClass: 'before:bg-[#00c8ff] before:shadow-[0_0_10px_rgba(0,200,255,0.6)]',
    barColor: '#00c8ff',
    icon: FileCode2,
  },
  python: {
    type: 'python',
    label: 'Python',
    color: '#00e699',
    textColor: 'text-[#00e699]',
    bgColor: 'bg-[#00e699]/15',
    borderColor: 'border-[#00e699]/40',
    ledClass: 'toy-led-green',
    pillClass: 'bg-[#00e699]/20 text-[#00e699] border-[#00e699]/40 shadow-[0_2px_0_rgba(0,230,153,0.15)]',
    borderAccentClass: 'before:bg-[#00e699] before:shadow-[0_0_10px_rgba(0,230,153,0.6)]',
    barColor: '#00e699',
    icon: Terminal,
  },
  php: {
    type: 'php',
    label: 'PHP',
    color: '#a855f7',
    textColor: 'text-[#a855f7]',
    bgColor: 'bg-[#a855f7]/15',
    borderColor: 'border-[#a855f7]/40',
    ledClass: 'toy-led-purple',
    pillClass: 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/40 shadow-[0_2px_0_rgba(168,85,247,0.15)]',
    borderAccentClass: 'before:bg-[#a855f7] before:shadow-[0_0_10px_rgba(168,85,247,0.6)]',
    barColor: '#a855f7',
    icon: Globe,
  },
  go: {
    type: 'go',
    label: 'Go',
    color: '#0284c7',
    textColor: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/40',
    ledClass: 'toy-led-cyan',
    pillClass: 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-[0_2px_0_rgba(56,189,248,0.15)]',
    borderAccentClass: 'before:bg-sky-400 before:shadow-[0_0_10px_rgba(56,189,248,0.6)]',
    barColor: '#0284c7',
    icon: Box,
  },
  rust: {
    type: 'rust',
    label: 'Rust',
    color: '#f97316',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/40',
    ledClass: 'toy-led-coral',
    pillClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_2px_0_rgba(249,115,22,0.15)]',
    borderAccentClass: 'before:bg-orange-400 before:shadow-[0_0_10px_rgba(249,115,22,0.6)]',
    barColor: '#f97316',
    icon: Cpu,
  },
  other: {
    type: 'other',
    label: 'Other',
    color: '#64748b',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-500/15',
    borderColor: 'border-slate-500/40',
    ledClass: 'bg-slate-500',
    pillClass: 'bg-slate-800/60 text-slate-400 border-slate-700/60',
    borderAccentClass: 'before:bg-slate-600',
    barColor: '#64748b',
    icon: Code2,
  },
};

export function getTechMeta(type?: string): TechMeta {
  if (!type) return TECH_CONFIG.other;
  const key = type.toLowerCase();
  return TECH_CONFIG[key] || TECH_CONFIG.other;
}
