import Papa from 'papaparse';

export type RapidQuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'url';

export interface RapidQuestion {
  id: string;
  label: string;
  category: string;
  type: RapidQuestionType;
  options?: string[];
  helpText?: string;
}

export type RapidResponseValue = string | string[];

export type RapidResponses = Record<string, RapidResponseValue>;

export interface RapidSavedReport {
  id: string;
  name: string;
  savedAt: string;
  responses: RapidResponses;
}

export interface RapidCsvItem {
  trrId: string;
  createdDate: string;
  status: string;
  accountName: string;
  link?: string;
  responses: RapidResponses;
  duplicate?: boolean;
  duplicateReason?: string;
  raw: Record<string, string>;
}

export interface RapidCsvImportResult {
  items: RapidCsvItem[];
  duplicates: RapidCsvItem[];
  warnings: string[];
  errors: string[];
}

const STORAGE_PREFIX = 'rapid_trr_report_';
const STORAGE_INDEX_KEY = 'rapid_trr_report_index';
const STORAGE_LIMIT = 50;
const MAX_CSV_ROWS = 1000;

export const rapidQuestions: RapidQuestion[] = [
  { id: 'trr', label: 'TRR', category: 'Project Information', type: 'text' },
  { id: 'date', label: 'Date', category: 'Project Information', type: 'date' },
  { id: 'account_name', label: 'Account Name', category: 'Project Information', type: 'text' },
  {
    id: 'overall_status',
    label: 'Overall Project Status',
    category: 'Project Information',
    type: 'select',
    options: ['🟢 On Track', '🟡 At Risk', '🔴 Delayed', '⚪ Not Started', '🟤 Parked'],
  },
  {
    id: 'accomplishments',
    label: 'What has been accomplished since last update?',
    category: 'Progress',
    type: 'textarea',
  },
  {
    id: 'current_focus',
    label: 'What is the team currently working on?',
    category: 'Progress',
    type: 'textarea',
  },
  {
    id: 'next_steps',
    label: 'What are the next steps?',
    category: 'Planning',
    type: 'textarea',
  },
  {
    id: 'blockers',
    label: 'Are there any blockers or issues?',
    category: 'Challenges',
    type: 'textarea',
  },
  {
    id: 'risk_areas',
    label: 'Current Risk Areas',
    category: 'Challenges',
    type: 'multiselect',
    options: ['Schedule', 'Budget', 'Scope', 'Resources', 'Technical', 'External Dependencies', 'None'],
  },
  {
    id: 'help_needed',
    label: 'Is any help needed from other teams?',
    category: 'Challenges',
    type: 'textarea',
  },
  {
    id: 'key_metrics',
    label: 'Key Metrics/KPIs',
    category: 'Measurements',
    type: 'textarea',
  },
  {
    id: 'salesforce_trr_url',
    label: 'Salesforce TRR URL',
    category: 'Quick Links',
    type: 'url',
  },
  {
    id: 'slack_channel_url',
    label: 'Slack Channel URL',
    category: 'Quick Links',
    type: 'url',
  },
  {
    id: 'additional_notes',
    label: 'Additional Notes',
    category: 'Other',
    type: 'textarea',
  },
];

export const createEmptyRapidResponses = (): RapidResponses => {
  const initial: RapidResponses = {};
  rapidQuestions.forEach((question) => {
    initial[question.id] = question.type === 'multiselect' ? [] : '';
  });
  return initial;
};

const ensureString = (value: RapidResponseValue | undefined): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value || '';
};

const ensureStringArray = (value: RapidResponseValue | undefined): string[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : value.split(',').map((item) => item.trim()).filter(Boolean);
};

export const generateRapidIdentifier = (dateInput?: string): string => {
  const now = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(now.getTime())) {
    return `TRR-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TRR-${yyyy}${mm}${dd}-${random}`;
};

const formatSection = (label: string, content?: string): string => {
  if (!content) {
    return '';
  }
  return `${label}\n${content.trim()}\n`;
};

export const generateRapidMarkdown = (responses: RapidResponses): string => {
  const dateValue = ensureString(responses.date) || new Date().toISOString().slice(0, 10);
  const statusValue = ensureString(responses.overall_status);
  const trrValue = ensureString(responses.trr);
  const accomplishments = ensureString(responses.accomplishments);
  const currentFocus = ensureString(responses.current_focus);
  const nextSteps = ensureString(responses.next_steps);
  const blockers = ensureString(responses.blockers);
  const risks = ensureStringArray(responses.risk_areas);
  const helpNeeded = ensureString(responses.help_needed);
  const metrics = ensureString(responses.key_metrics);
  const additionalNotes = ensureString(responses.additional_notes);

  let markdown = `📝 Project Status – ${dateValue}\n`;

  if (statusValue.includes('🟢')) {
    markdown += '🟢 Status: On Track\n';
  } else if (statusValue.includes('🟡')) {
    markdown += '🟡 Status: At Risk\n';
  } else if (statusValue.includes('🔴')) {
    markdown += '🔴 Status: Delayed\n';
  } else if (statusValue.includes('⚪')) {
    markdown += '⚪ Status: Not Started\n';
  } else if (statusValue) {
    markdown += `Status: ${statusValue}\n`;
  }

  if (trrValue) {
    markdown += `🔧 TRR: ${trrValue}\n`;
  }

  markdown += formatSection('✅ Done:', accomplishments);
  markdown += formatSection('🔄 In Progress:', currentFocus);
  markdown += formatSection('📍 Next Steps:', nextSteps);
  markdown += formatSection('⛔ Blockers:', blockers);

  if (risks.length > 0 && !risks.includes('None')) {
    markdown += `⚠️ Risks:\n${risks.join(', ')}\n`;
  }

  markdown += formatSection('🙋 Help Needed:', helpNeeded);
  markdown += formatSection('📊 Key Metrics:', metrics);
  markdown += formatSection('📌 Notes:', additionalNotes);

  return markdown.trim();
};

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const storage = window.localStorage;
    const testKey = '__rapid_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
};

const readIndex = (): string[] => {
  const storage = getLocalStorage();
  if (!storage) {
    return [];
  }
  const raw = storage.getItem(STORAGE_INDEX_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeIndex = (ids: string[]) => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  storage.setItem(STORAGE_INDEX_KEY, JSON.stringify(ids.slice(0, STORAGE_LIMIT)));
};

const buildReportId = () => `rapid_${Date.now()}`;

export const listRapidReports = (): RapidSavedReport[] => {
  const storage = getLocalStorage();
  if (!storage) {
    return [];
  }

  const ids = readIndex();
  const reports: RapidSavedReport[] = [];

  ids.forEach((id) => {
    const raw = storage.getItem(STORAGE_PREFIX + id);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        reports.push(parsed as RapidSavedReport);
      }
    } catch {
      /* ignore corrupted entry */
    }
  });

  return reports.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
};

export const saveRapidReport = (
  responses: RapidResponses,
  name?: string,
): { success: boolean; item?: RapidSavedReport; error?: string } => {
  const storage = getLocalStorage();
  if (!storage) {
    return { success: false, error: 'Local storage unavailable' };
  }

  const id = buildReportId();
  const savedAt = new Date().toISOString();
  const reportName = name || ensureString(responses.trr) || generateRapidIdentifier(ensureString(responses.date));

  const item: RapidSavedReport = {
    id,
    name: reportName,
    savedAt,
    responses,
  };

  try {
    storage.setItem(STORAGE_PREFIX + id, JSON.stringify(item));
    const ids = readIndex();
    ids.unshift(id);
    writeIndex(ids);
    return { success: true, item };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save report' };
  }
};

export const loadRapidReport = (id: string): RapidSavedReport | null => {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(STORAGE_PREFIX + id);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as RapidSavedReport;
  } catch {
    return null;
  }
};

export const deleteRapidReport = (id: string) => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(STORAGE_PREFIX + id);
  const ids = readIndex().filter((existingId) => existingId !== id);
  writeIndex(ids);
};

const sanitizeCsvCell = (input: unknown): string => {
  if (input === null || input === undefined) {
    return '';
  }
  let content = String(input).trim();
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  dangerousPrefixes.forEach((prefix) => {
    if (content.startsWith(prefix)) {
      content = content.slice(1);
    }
  });
  content = Array.from(content)
    .filter((char) => char === '\n' || char === '\t' || char >= ' ')
    .join('');
  content = content.replace(/\t/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ');
  if (content.length > 500) {
    content = content.slice(0, 500).trim();
  }
  return content;
};

const parseUsDate = (value: string): string => {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  const trimmed = value.trim();
  if (!trimmed.includes('/')) {
    return trimmed;
  }

  const [month, day, year] = trimmed.split('/');
  if (!month || !day || !year) {
    return new Date().toISOString().slice(0, 10);
  }
  let resolvedYear = year;
  if (year.length === 2) {
    const yearInt = Number(year);
    resolvedYear = yearInt <= 30 ? `20${year}` : `19${year}`;
  }

  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');
  return `${resolvedYear}-${mm}-${dd}`;
};

const headerCandidates: Record<string, string[]> = {
  trrId: ['TRR Id', 'TRR ID', 'Trr Id', 'TRR'],
  createdDate: ['TRR Created Date', 'TRR Created', 'Created Date'],
  status: ['TRR Request Status', 'TRR Status', 'Status'],
  link: ['trr_link', 'TRR Link', 'Trr Link', 'Link'],
  account: ['Account Name', 'Customer', 'Customer Name', 'Account'],
};

const findValue = (row: Record<string, string>, keys: string[]): string => {
  for (const key of keys) {
    const value = row[key];
    if (value) {
      return sanitizeCsvCell(value);
    }
  }
  return '';
};

const statusToEmoji = (status: string): string => {
  const normalized = status.trim().toLowerCase();
  if (!normalized) {
    return '';
  }
  if (normalized.includes('open') || normalized.includes('active')) {
    return '🟢 On Track';
  }
  if (normalized.includes('progress') || normalized.includes('hold')) {
    return '🟡 At Risk';
  }
  if (normalized.includes('closed') || normalized.includes('cancel')) {
    return '🔴 Delayed';
  }
  return '🟡 At Risk';
};

export const parseRapidCsvFile = async (
  file: File,
  existingIds: Set<string>,
): Promise<RapidCsvImportResult> => {
  const text = await file.text();
  const { data, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const warnings: string[] = [];
  const parseErrors: string[] = errors.map((error) => error.message);
  const items: RapidCsvItem[] = [];
  const duplicates: RapidCsvItem[] = [];
  const seen = new Set<string>();

  if (data.length > MAX_CSV_ROWS) {
    warnings.push(
      `CSV contained ${data.length} rows. Only the first ${MAX_CSV_ROWS} rows were processed.`,
    );
  }

  data.slice(0, MAX_CSV_ROWS).forEach((row, index) => {
    const trrIdRaw = findValue(row, headerCandidates.trrId);
    if (!trrIdRaw) {
      warnings.push(`Row ${index + 2}: Missing TRR Id. Row skipped.`);
      return;
    }

    const trrId = trrIdRaw.toUpperCase();
    const createdDate = parseUsDate(findValue(row, headerCandidates.createdDate));
    const status = findValue(row, headerCandidates.status);
    const accountName = findValue(row, headerCandidates.account);
    const link = findValue(row, headerCandidates.link);

    const responses = createEmptyRapidResponses();
    responses.trr = trrId;
    responses.date = createdDate;
    responses.account_name = accountName;
    responses.overall_status = statusToEmoji(status);
    responses.salesforce_trr_url = link;

    const item: RapidCsvItem = {
      trrId,
      createdDate,
      status,
      accountName,
      link,
      responses,
      raw: Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, sanitizeCsvCell(value)]),
      ),
    };

    const lowerId = trrId.toLowerCase();
    if (seen.has(lowerId) || existingIds.has(lowerId)) {
      duplicates.push({
        ...item,
        duplicate: true,
        duplicateReason: existingIds.has(lowerId)
          ? 'Existing TRR in workspace'
          : 'Duplicate within CSV import',
      });
      return;
    }

    seen.add(lowerId);
    items.push(item);
  });

  return {
    items,
    duplicates,
    warnings,
    errors: parseErrors,
  };
};

export const buildRapidSummaryNotes = (responses: RapidResponses): string[] => {
  const notes: string[] = [];

  const accomplishment = ensureString(responses.accomplishments);
  if (accomplishment) {
    notes.push(`Accomplishments: ${accomplishment}`);
  }

  const focus = ensureString(responses.current_focus);
  if (focus) {
    notes.push(`Current Focus: ${focus}`);
  }

  const blockers = ensureString(responses.blockers);
  if (blockers) {
    notes.push(`Blockers: ${blockers}`);
  }

  const help = ensureString(responses.help_needed);
  if (help) {
    notes.push(`Help Needed: ${help}`);
  }

  const metrics = ensureString(responses.key_metrics);
  if (metrics) {
    notes.push(`Metrics: ${metrics}`);
  }

  const additional = ensureString(responses.additional_notes);
  if (additional) {
    notes.push(`Notes: ${additional}`);
  }

  return notes;
};

export const inferRiskLevelFromResponses = (responses: RapidResponses): 'low' | 'medium' | 'high' => {
  const status = ensureString(responses.overall_status);
  if (status.includes('🔴')) {
    return 'high';
  }
  if (status.includes('🟡')) {
    return 'medium';
  }

  const risks = ensureStringArray(responses.risk_areas);
  if (risks.length > 0 && !risks.includes('None')) {
    return 'medium';
  }

  return 'low';
};

