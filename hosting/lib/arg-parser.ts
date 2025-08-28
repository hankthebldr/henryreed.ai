export type ArgType = 'boolean' | 'string' | 'enum';

export interface ArgSpecItem {
  flag: string;          // e.g. --scenario-type
  type: ArgType;
  enumValues?: string[];
  default?: any;
}

export type ArgSpec = ArgSpecItem[];

export interface ParsedArgs {
  _: string[]; // positional
  [key: string]: any;
}

export function parseArgs(spec: ArgSpec, argv: string[]): ParsedArgs {
  const out: ParsedArgs = { _: [] };
  const indexByFlag = new Map(spec.map(s => [s.flag, s] as const));

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const item = indexByFlag.get(token);
    if (!item) {
      out._.push(token);
      continue;
    }

    if (item.type === 'boolean') {
      out[item.flag] = true;
    } else {
      const val = argv[i + 1];
      if (val === undefined || val.startsWith('--')) {
        // missing value, use default or undefined
        out[item.flag] = item.default;
      } else {
        if (item.type === 'enum' && item.enumValues && !item.enumValues.includes(val)) {
          out[item.flag] = item.default ?? item.enumValues[0];
        } else {
          out[item.flag] = val;
        }
        i++;
      }
    }
  }

  // fill defaults
  for (const s of spec) {
    const k = s.flag;
    if (!(k in out) && s.default !== undefined) out[k] = s.default;
  }

  return out;
}

