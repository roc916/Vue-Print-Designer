import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import type { DesignerTemplateData } from './designer';
import { normalizeEntityConstraints } from '@/utils/entityConstraints';

export interface PrintTemplate {
  id: string;
  name: string;
  data: DesignerTemplateData;
  updatedAt: number;
  permissions?: {
    system?: boolean;
    editable?: boolean;
    deletable?: boolean;
    copyable?: boolean;
  };
  ext?: Record<string, unknown>;
  [key: string]: unknown;
}

export const templateStorageKey = 'print-designer-templates';

const isTemplate = (value: unknown): value is PrintTemplate => {
  return Boolean(value && typeof value === 'object' && typeof (value as PrintTemplate).id === 'string' && typeof (value as PrintTemplate).name === 'string');
};

export const readTemplates = (): PrintTemplate[] => {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem(templateStorageKey);
  if (!stored) return [];
  try {
    const list = JSON.parse(stored) as unknown;
    return Array.isArray(list)
      ? list.filter(isTemplate).map((item) => normalizeEntityConstraints(item) as PrintTemplate)
      : [];
  } catch {
    return [];
  }
};

export const writeTemplates = (templates: PrintTemplate[]) => {
  localStorage.setItem(templateStorageKey, JSON.stringify(templates));
};

export const upsertTemplate = (
  templates: PrintTemplate[],
  template: Partial<PrintTemplate> & { name: string; data: DesignerTemplateData }
) => {
  const id = template.id || uuidv4();
  const nextTemplate = normalizeEntityConstraints({
    ...template,
    id,
    data: cloneDeep(template.data),
    updatedAt: Date.now()
  }) as PrintTemplate;

  const next = templates.some((item) => item.id === id)
    ? templates.map((item) => (item.id === id ? nextTemplate : item))
    : [nextTemplate, ...templates];

  writeTemplates(next);
  return { templates: next, id };
};

export const deleteTemplate = (templates: PrintTemplate[], id: string) => {
  const next = templates.filter((item) => item.id !== id);
  writeTemplates(next);
  return next;
};