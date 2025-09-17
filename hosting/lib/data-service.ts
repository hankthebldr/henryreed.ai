'use client';

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config';

export type AnalyticsFilters = {
  region?: string; // AMER | EMEA | APJ | GLOBAL
  theatre?: string | null;
  user?: string | null;
  sinceDays?: number; // default 90
};

export type EngagementRecord = {
  region: string;
  theatre: string;
  user: string;
  location: string;
  customer: string;
  createdAt: Date;
  completedAt?: Date | null;
  scenariosExecuted?: number;
  detectionsValidated?: number;
  trrOutcome?: 'win' | 'loss' | null;
  cycleDays?: number; // if missing, computed from dates
};

export type AnalyticsResult = {
  records: EngagementRecord[];
  okrs: { id: string; name: string; progress: number }[];
  source: 'firestore' | 'mock' | 'empty';
};

export async function fetchAnalytics(filters: AnalyticsFilters): Promise<AnalyticsResult> {
  const sinceDays = filters.sinceDays ?? 90;
  const since = new Date(Date.now() - sinceDays * 86400000);
  try {
    // Build base collection
    const col = collection(db as any, 'dc_engagements');
    const constraints: any[] = [];
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(since)));
    if (filters.region && filters.region !== 'GLOBAL') constraints.push(where('region', '==', filters.region));
    if (filters.theatre && filters.theatre !== 'all') constraints.push(where('theatre', '==', filters.theatre));
    if (filters.user && filters.user !== 'all') constraints.push(where('user', '==', filters.user));

    let q = query(col, ...constraints);
    let snap = await getDocs(q);
    // If query fails due to index or empty, try fallback (no constraints except date)
    if (snap.empty && constraints.length > 1) {
      q = query(col, where('createdAt', '>=', Timestamp.fromDate(since)));
      snap = await getDocs(q);
    }

    const records: EngagementRecord[] = snap.docs.map((d) => {
      const v: any = d.data();
      const createdAt = v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt || Date.now());
      const completedAt = v.completedAt?.toDate ? v.completedAt.toDate() : (v.completedAt ? new Date(v.completedAt) : null);
      const cycleDays = v.cycleDays ?? (completedAt ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 86400000)) : undefined);
      return {
        region: v.region || 'UNKNOWN',
        theatre: v.theatre || 'UNKNOWN',
        user: (v.user || 'unknown').toLowerCase(),
        location: v.location || 'N/A',
        customer: v.customer || 'unknown',
        createdAt,
        completedAt,
        scenariosExecuted: v.scenariosExecuted ?? 0,
        detectionsValidated: v.detectionsValidated ?? 0,
        trrOutcome: v.trrOutcome ?? null,
        cycleDays,
      };
    });

    // OKRs
    const okrSnap = await getDocs(collection(db as any, 'dc_okrs'));
    const okrs = okrSnap.docs.map((d) => {
      const v: any = d.data();
      return { id: d.id, name: v.name || d.id, progress: Number(v.progress ?? 0) };
    });

    return { records, okrs, source: records.length ? 'firestore' : 'empty' };
  } catch (e) {
    // Fall back to empty; higher-level code can inject mock
    return { records: [], okrs: [], source: 'mock' };
  }
}

export async function fetchBlueprintSummary(customer: string, sinceDays: number = 90): Promise<{
  engagements: number;
  scenariosExecuted: number;
  detectionsValidated: number;
  trrWins: number;
  trrLosses: number;
  avgCycleDays: number;
  source: 'firestore' | 'mock' | 'empty';
}> {
  const since = new Date(Date.now() - sinceDays * 86400000);
  try {
    const col = collection(db as any, 'dc_engagements');
    const q = query(
      col,
      where('customer', '==', customer),
      where('createdAt', '>=', Timestamp.fromDate(since))
    );
    const snap = await getDocs(q);
    const records: EngagementRecord[] = snap.docs.map((d) => {
      const v: any = d.data();
      const createdAt = v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt || Date.now());
      const completedAt = v.completedAt?.toDate ? v.completedAt.toDate() : (v.completedAt ? new Date(v.completedAt) : null);
      const cycleDays = v.cycleDays ?? (completedAt ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 86400000)) : undefined);
      return {
        region: v.region || 'UNKNOWN',
        theatre: v.theatre || 'UNKNOWN',
        user: (v.user || 'unknown').toLowerCase(),
        location: v.location || 'N/A',
        customer: v.customer || 'unknown',
        createdAt,
        completedAt,
        scenariosExecuted: v.scenariosExecuted ?? 0,
        detectionsValidated: v.detectionsValidated ?? 0,
        trrOutcome: v.trrOutcome ?? null,
        cycleDays,
      };
    });

    const sum = (a: number, b: number) => a + b;
    const engagements = records.length;
    const scenariosExecuted = records.map(r => r.scenariosExecuted ?? 0).reduce(sum, 0);
    const detectionsValidated = records.map(r => r.detectionsValidated ?? 0).reduce(sum, 0);
    const trrWins = records.filter(r => r.trrOutcome === 'win').length;
    const trrLosses = records.filter(r => r.trrOutcome === 'loss').length;
    const avgCycleDays = records.length
      ? Math.round(records.map(r => r.cycleDays ?? 0).reduce(sum, 0) / records.length)
      : 0;

    return { engagements, scenariosExecuted, detectionsValidated, trrWins, trrLosses, avgCycleDays, source: engagements ? 'firestore' : 'empty' };
  } catch (e) {
    return { engagements: 0, scenariosExecuted: 0, detectionsValidated: 0, trrWins: 0, trrLosses: 0, avgCycleDays: 0, source: 'mock' };
  }
}
