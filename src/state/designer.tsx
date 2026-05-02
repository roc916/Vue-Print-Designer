import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuidv4 } from 'uuid';
import { createNewElement } from '@/utils/elementFactory';
import { buildTestDataFromPages } from '@/utils/variables';
import { ElementType, type ElementStyle, type Page, type PrintElement, type Size, type WatermarkSettings } from '@/types';
import type { Unit } from '@/utils/units';

export const designerStorageKey = 'react-print-designer-state';

export interface DesignerTemplateData {
  pages: Page[];
  currentPageIndex?: number;
  canvasSize: Size;
  zoom?: number;
  unit?: Unit;
  showGrid?: boolean;
  showMarginLines?: boolean;
  showCornerMarkers?: boolean;
  headerHeight?: number;
  footerHeight?: number;
  showHeaderLine?: boolean;
  showFooterLine?: boolean;
  canvasBackground?: string;
  pageSpacingX?: number;
  pageSpacingY?: number;
  watermark?: WatermarkSettings;
  testData?: Record<string, unknown>;
  variables?: Record<string, unknown>;
}

interface DesignerSnapshot extends DesignerTemplateData {
  selectedElementIds: string[];
}

export interface ReactDesignerState extends Required<Omit<DesignerTemplateData, 'testData' | 'variables' | 'watermark'>> {
  watermark: WatermarkSettings;
  testData: Record<string, unknown>;
  variables: Record<string, unknown>;
  selectedElementIds: string[];
  historyPast: DesignerSnapshot[];
  historyFuture: DesignerSnapshot[];
  clipboard: PrintElement[];
}

export type DesignerAction =
  | { type: 'select-elements'; ids: string[] }
  | { type: 'set-page-index'; index: number }
  | { type: 'insert-element'; element: PrintElement }
  | { type: 'update-element'; id: string; patch: Partial<PrintElement>; transient?: boolean }
  | { type: 'update-element-style'; id: string; style: Partial<PrintElement['style']>; transient?: boolean }
  | { type: 'update-selected-elements-style'; style: Partial<ElementStyle>; transient?: boolean }
  | { type: 'align-selected-elements'; align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' }
  | { type: 'copy-selected' }
  | { type: 'paste-clipboard' }
  | { type: 'toggle-lock-selected' }
  | { type: 'delete-selected' }
  | { type: 'duplicate-selected' }
  | { type: 'set-canvas'; patch: Partial<Pick<ReactDesignerState, 'canvasSize' | 'canvasBackground' | 'pageSpacingX' | 'pageSpacingY' | 'headerHeight' | 'footerHeight' | 'showHeaderLine' | 'showFooterLine' | 'showGrid' | 'showMarginLines' | 'showCornerMarkers' | 'unit'>> }
  | { type: 'set-zoom'; zoom: number }
  | { type: 'add-page' }
  | { type: 'delete-page'; index: number }
  | { type: 'duplicate-page'; index: number }
  | { type: 'load-template-data'; data: Partial<DesignerTemplateData> }
  | { type: 'set-test-data'; data: Record<string, unknown>; merge?: boolean }
  | { type: 'set-variables'; data: Record<string, unknown>; merge?: boolean }
  | { type: 'undo' }
  | { type: 'redo' };

const defaultWatermark: WatermarkSettings = {
  enabled: false,
  text: '',
  angle: -30,
  color: '#000000',
  opacity: 0.1,
  size: 24,
  density: 160
};

const createPage = (elements: PrintElement[] = []): Page => ({
  id: uuidv4(),
  elements
});

const sanitizePages = (pages: unknown): Page[] => {
  if (!Array.isArray(pages)) return [createPage()];
  const normalized = pages
    .filter((page): page is Page => Boolean(page && typeof page === 'object'))
    .map((page, index) => ({
      id: typeof page.id === 'string' && page.id ? page.id : `page-${index + 1}`,
      elements: Array.isArray(page.elements)
        ? page.elements
            .filter((element): element is PrintElement => Boolean(element && typeof element === 'object' && typeof element.id === 'string'))
            .map((element) => ({ ...element, style: element.style || {} }))
        : []
    }));
  return normalized.length > 0 ? normalized : [createPage()];
};

const readStoredData = (): Partial<DesignerTemplateData> | undefined => {
  if (typeof localStorage === 'undefined') return undefined;
  const stored = localStorage.getItem(designerStorageKey);
  if (!stored) return undefined;
  try {
    return JSON.parse(stored) as Partial<DesignerTemplateData>;
  } catch {
    return undefined;
  }
};

const clampPageIndex = (index: number | undefined, pages: Page[]) => {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Number(index), 0), Math.max(pages.length - 1, 0));
};

export const serializeDesignerState = (state: ReactDesignerState): DesignerTemplateData => ({
  pages: cloneDeep(state.pages),
  currentPageIndex: state.currentPageIndex,
  canvasSize: cloneDeep(state.canvasSize),
  zoom: state.zoom,
  unit: state.unit,
  showGrid: state.showGrid,
  showMarginLines: state.showMarginLines,
  showCornerMarkers: state.showCornerMarkers,
  headerHeight: state.headerHeight,
  footerHeight: state.footerHeight,
  showHeaderLine: state.showHeaderLine,
  showFooterLine: state.showFooterLine,
  canvasBackground: state.canvasBackground,
  pageSpacingX: state.pageSpacingX,
  pageSpacingY: state.pageSpacingY,
  watermark: cloneDeep(state.watermark),
  testData: cloneDeep(state.testData),
  variables: cloneDeep(state.variables)
});

const toSnapshot = (state: ReactDesignerState): DesignerSnapshot => ({
  ...serializeDesignerState(state),
  selectedElementIds: [...state.selectedElementIds]
});

const fromTemplateData = (data?: Partial<DesignerTemplateData>): ReactDesignerState => {
  const source = data || {};
  const pages = sanitizePages(source.pages);
  return {
    pages,
    currentPageIndex: clampPageIndex(source.currentPageIndex, pages),
    canvasSize: source.canvasSize || { width: 794, height: 1123 },
    zoom: source.zoom || 1,
    unit: source.unit || 'mm',
    showGrid: source.showGrid ?? true,
    showMarginLines: source.showMarginLines ?? true,
    showCornerMarkers: source.showCornerMarkers ?? true,
    headerHeight: source.headerHeight ?? 80,
    footerHeight: source.footerHeight ?? 80,
    showHeaderLine: source.showHeaderLine ?? false,
    showFooterLine: source.showFooterLine ?? false,
    canvasBackground: source.canvasBackground || '#ffffff',
    pageSpacingX: source.pageSpacingX ?? 0,
    pageSpacingY: source.pageSpacingY ?? 0,
    watermark: { ...defaultWatermark, ...(source.watermark || {}) },
    testData: source.testData || buildTestDataFromPages(pages),
    variables: source.variables || {},
    selectedElementIds: [],
    historyPast: [],
    historyFuture: [],
    clipboard: []
  };
};

export const createInitialDesignerState = (initialData?: Partial<DesignerTemplateData>) => {
  return fromTemplateData(initialData || readStoredData());
};

const restoreSnapshot = (state: ReactDesignerState, snapshot: DesignerSnapshot): ReactDesignerState => ({
  ...fromTemplateData(snapshot),
  selectedElementIds: snapshot.selectedElementIds,
  historyPast: state.historyPast,
  historyFuture: state.historyFuture,
  clipboard: state.clipboard
});

const withHistory = (previous: ReactDesignerState, next: ReactDesignerState, enabled = true): ReactDesignerState => {
  if (!enabled) return next;
  return {
    ...next,
    historyPast: [...previous.historyPast.slice(-49), toSnapshot(previous)],
    historyFuture: []
  };
};

export const getCurrentPage = (state: ReactDesignerState) => state.pages[state.currentPageIndex] || state.pages[0];

export const getSelectedElement = (state: ReactDesignerState) => {
  const selectedId = state.selectedElementIds[0];
  if (!selectedId) return null;
  return state.pages.flatMap((page) => page.elements).find((element) => element.id === selectedId) || null;
};

const updatePages = (
  pages: Page[],
  id: string,
  updater: (element: PrintElement) => PrintElement
) => pages.map((page) => ({
  ...page,
  elements: page.elements.map((element) => (element.id === id ? updater(element) : element))
}));

const getSelectedElements = (state: ReactDesignerState) => {
  const selected = new Set(state.selectedElementIds);
  return state.pages.flatMap((page) => page.elements).filter((element) => selected.has(element.id));
};

const updateSelectedElements = (
  state: ReactDesignerState,
  updater: (element: PrintElement) => PrintElement
) => {
  const selected = new Set(state.selectedElementIds);
  return state.pages.map((page) => ({
    ...page,
    elements: page.elements.map((element) => selected.has(element.id) && !element.locked ? updater(element) : element)
  }));
};

const alignElements = (
  state: ReactDesignerState,
  elements: PrintElement[],
  align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
) => {
  const updates = new Map<string, Partial<Pick<PrintElement, 'x' | 'y'>>>();

  if (elements.length === 1) {
    const [element] = elements;
    const contentX = state.pageSpacingX || 0;
    const contentY = state.pageSpacingY || 0;
    const contentWidth = Math.max(0, state.canvasSize.width - contentX * 2);
    const contentHeight = Math.max(0, state.canvasSize.height - contentY * 2);

    if (align === 'left') updates.set(element.id, { x: contentX });
    if (align === 'center') updates.set(element.id, { x: Math.round(contentX + (contentWidth - element.width) / 2) });
    if (align === 'right') updates.set(element.id, { x: Math.round(contentX + contentWidth - element.width) });
    if (align === 'top') updates.set(element.id, { y: contentY });
    if (align === 'middle') updates.set(element.id, { y: Math.round(contentY + (contentHeight - element.height) / 2) });
    if (align === 'bottom') updates.set(element.id, { y: Math.round(contentY + contentHeight - element.height) });
  } else {
    const minX = Math.min(...elements.map((element) => element.x));
    const maxX = Math.max(...elements.map((element) => element.x + element.width));
    const minY = Math.min(...elements.map((element) => element.y));
    const maxY = Math.max(...elements.map((element) => element.y + element.height));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    elements.forEach((element) => {
      if (align === 'left') updates.set(element.id, { x: minX });
      if (align === 'center') updates.set(element.id, { x: Math.round(centerX - element.width / 2) });
      if (align === 'right') updates.set(element.id, { x: maxX - element.width });
      if (align === 'top') updates.set(element.id, { y: minY });
      if (align === 'middle') updates.set(element.id, { y: Math.round(centerY - element.height / 2) });
      if (align === 'bottom') updates.set(element.id, { y: maxY - element.height });
    });
  }

  return state.pages.map((page) => ({
    ...page,
    elements: page.elements.map((element) => updates.has(element.id) ? { ...element, ...updates.get(element.id) } : element)
  }));
};

const getMaxZIndex = (page: Page) => Math.max(0, ...page.elements.map((element) => element.style?.zIndex || 0));

export const createElementForCanvas = (
  type: ElementType,
  x: number,
  y: number,
  t: (key: string) => string
): PrintElement => ({
  id: uuidv4(),
  ...createNewElement(type, x, y, t)
});

const reducer = (state: ReactDesignerState, action: DesignerAction): ReactDesignerState => {
  switch (action.type) {
    case 'select-elements':
      return { ...state, selectedElementIds: action.ids };
    case 'set-page-index':
      return { ...state, currentPageIndex: clampPageIndex(action.index, state.pages), selectedElementIds: [] };
    case 'insert-element': {
      const page = getCurrentPage(state);
      const element = {
        ...action.element,
        style: {
          ...action.element.style,
          zIndex: action.element.style?.zIndex || getMaxZIndex(page) + 1
        }
      };
      const pages = state.pages.map((item, index) => index === state.currentPageIndex
        ? { ...item, elements: [...item.elements, element] }
        : item);
      return withHistory(state, { ...state, pages, selectedElementIds: [element.id] });
    }
    case 'update-element': {
      const pages = updatePages(state.pages, action.id, (element) => ({
        ...element,
        ...action.patch,
        style: action.patch.style ? { ...element.style, ...action.patch.style } : element.style
      }));
      return withHistory(state, { ...state, pages }, !action.transient);
    }
    case 'update-element-style': {
      const pages = updatePages(state.pages, action.id, (element) => ({
        ...element,
        style: { ...element.style, ...action.style }
      }));
      return withHistory(state, { ...state, pages }, !action.transient);
    }
    case 'update-selected-elements-style': {
      if (state.selectedElementIds.length === 0) return state;
      const pages = updateSelectedElements(state, (element) => ({
        ...element,
        style: { ...element.style, ...action.style }
      }));
      return withHistory(state, { ...state, pages }, !action.transient);
    }
    case 'align-selected-elements': {
      const elements = getSelectedElements(state).filter((element) => !element.locked);
      if (elements.length === 0) return state;
      return withHistory(state, { ...state, pages: alignElements(state, elements, action.align) });
    }
    case 'copy-selected': {
      const elements = getSelectedElements(state).filter((element) => !element.locked).map((element) => cloneDeep(element));
      return { ...state, clipboard: elements };
    }
    case 'paste-clipboard': {
      if (state.clipboard.length === 0) return state;
      const page = getCurrentPage(state);
      const newIds: string[] = [];
      const maxZIndex = getMaxZIndex(page);
      const copies = state.clipboard.map((element, index) => {
        const copy = cloneDeep(element);
        copy.id = uuidv4();
        copy.x = Math.max(0, Math.min(state.canvasSize.width - copy.width, copy.x + 20));
        copy.y = Math.max(0, Math.min(state.canvasSize.height - copy.height, copy.y + 20));
        copy.locked = false;
        copy.style = { ...copy.style, zIndex: maxZIndex + index + 1 };
        newIds.push(copy.id);
        return copy;
      });
      const pages = state.pages.map((item, index) => index === state.currentPageIndex
        ? { ...item, elements: [...item.elements, ...copies] }
        : item);
      return withHistory(state, { ...state, pages, selectedElementIds: newIds });
    }
    case 'toggle-lock-selected': {
      if (state.selectedElementIds.length === 0) return state;
      const primary = getSelectedElement(state);
      const locked = !(primary?.locked || false);
      const selected = new Set(state.selectedElementIds);
      const pages = state.pages.map((page) => ({
        ...page,
        elements: page.elements.map((element) => selected.has(element.id) ? { ...element, locked } : element)
      }));
      return withHistory(state, { ...state, pages });
    }
    case 'delete-selected': {
      if (state.selectedElementIds.length === 0) return state;
      const selected = new Set(state.selectedElementIds);
      const pages = state.pages.map((page) => ({
        ...page,
        elements: page.elements.filter((element) => !selected.has(element.id))
      }));
      return withHistory(state, { ...state, pages, selectedElementIds: [] });
    }
    case 'duplicate-selected': {
      const selected = new Set(state.selectedElementIds);
      if (selected.size === 0) return state;
      const newIds: string[] = [];
      const pages = state.pages.map((page, index) => {
        if (index !== state.currentPageIndex) return page;
        const copies = page.elements
          .filter((element) => selected.has(element.id))
          .map((element) => {
            const id = uuidv4();
            newIds.push(id);
            return { ...cloneDeep(element), id, x: element.x + 16, y: element.y + 16 };
          });
        return { ...page, elements: [...page.elements, ...copies] };
      });
      return withHistory(state, { ...state, pages, selectedElementIds: newIds });
    }
    case 'set-canvas':
      return withHistory(state, { ...state, ...action.patch });
    case 'set-zoom':
      return { ...state, zoom: Math.min(Math.max(action.zoom, 0.2), 5) };
    case 'add-page':
      return withHistory(state, {
        ...state,
        pages: [...state.pages, createPage()],
        currentPageIndex: state.pages.length,
        selectedElementIds: []
      });
    case 'delete-page': {
      if (state.pages.length <= 1) return state;
      const pages = state.pages.filter((_, index) => index !== action.index);
      return withHistory(state, {
        ...state,
        pages,
        currentPageIndex: clampPageIndex(state.currentPageIndex, pages),
        selectedElementIds: []
      });
    }
    case 'duplicate-page': {
      const page = state.pages[action.index];
      if (!page) return state;
      const copy = {
        ...cloneDeep(page),
        id: uuidv4(),
        elements: page.elements.map((element) => ({ ...cloneDeep(element), id: uuidv4() }))
      };
      const pages = [...state.pages];
      pages.splice(action.index + 1, 0, copy);
      return withHistory(state, { ...state, pages, currentPageIndex: action.index + 1, selectedElementIds: [] });
    }
    case 'load-template-data':
      return { ...fromTemplateData(action.data), historyPast: [...state.historyPast, toSnapshot(state)].slice(-50) };
    case 'set-test-data':
      return { ...state, testData: action.merge ? { ...state.testData, ...action.data } : action.data };
    case 'set-variables':
      return { ...state, variables: action.merge ? { ...state.variables, ...action.data } : action.data };
    case 'undo': {
      const snapshot = state.historyPast[state.historyPast.length - 1];
      if (!snapshot) return state;
      return {
        ...restoreSnapshot(state, snapshot),
        historyPast: state.historyPast.slice(0, -1),
        historyFuture: [toSnapshot(state), ...state.historyFuture]
      };
    }
    case 'redo': {
      const snapshot = state.historyFuture[0];
      if (!snapshot) return state;
      return {
        ...restoreSnapshot(state, snapshot),
        historyPast: [...state.historyPast, toSnapshot(state)].slice(-50),
        historyFuture: state.historyFuture.slice(1)
      };
    }
    default:
      return state;
  }
};

const DesignerStateContext = createContext<ReactDesignerState | null>(null);
const DesignerDispatchContext = createContext<Dispatch<DesignerAction> | null>(null);

export const DesignerProvider = ({ children, initialData }: { children: ReactNode; initialData?: Partial<DesignerTemplateData> }) => {
  const [state, dispatch] = useReducer(reducer, initialData, createInitialDesignerState);

  useEffect(() => {
    localStorage.setItem(designerStorageKey, JSON.stringify(serializeDesignerState(state)));
  }, [state.pages, state.currentPageIndex, state.canvasSize, state.zoom, state.unit, state.showGrid, state.showMarginLines, state.showCornerMarkers, state.headerHeight, state.footerHeight, state.showHeaderLine, state.showFooterLine, state.canvasBackground, state.pageSpacingX, state.pageSpacingY, state.watermark, state.testData, state.variables]);

  const stableState = useMemo(() => state, [state]);

  return (
    <DesignerStateContext.Provider value={stableState}>
      <DesignerDispatchContext.Provider value={dispatch}>{children}</DesignerDispatchContext.Provider>
    </DesignerStateContext.Provider>
  );
};

export const useDesignerState = () => {
  const state = useContext(DesignerStateContext);
  if (!state) throw new Error('useDesignerState must be used inside DesignerProvider');
  return state;
};

export const useDesignerDispatch = () => {
  const dispatch = useContext(DesignerDispatchContext);
  if (!dispatch) throw new Error('useDesignerDispatch must be used inside DesignerProvider');
  return dispatch;
};