import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { ElementType, type ElementStyle, type PrintElement, type TableColumn } from '@/types';
import { normalizeVariableKey } from '@/utils/variables';
import type { ReactDesignerState } from '@/state/designer';

interface ElementRendererProps {
  element: PrintElement;
  state: ReactDesignerState;
  pageIndex: number;
}

const getVariableValue = (state: ReactDesignerState, variable?: string) => {
  const key = normalizeVariableKey(variable || '');
  if (!key) return undefined;
  if (Object.prototype.hasOwnProperty.call(state.variables, key)) return state.variables[key];
  if (Object.prototype.hasOwnProperty.call(state.testData, key)) return state.testData[key];
  return undefined;
};

const getTextValue = (element: PrintElement, state: ReactDesignerState) => {
  const value = getVariableValue(state, element.variable);
  if (value === undefined || value === null) return element.content || '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getFlexAlign = (value?: string) => {
  if (value === 'middle') return 'center';
  if (value === 'bottom') return 'flex-end';
  return 'flex-start';
};

const defaultBorderElementTypes = new Set<ElementType>([ElementType.LINE, ElementType.RECT, ElementType.CIRCLE, ElementType.TABLE]);

const getDefaultBorderWidth = (element: PrintElement) => defaultBorderElementTypes.has(element.type) ? 1 : 0;

const getBorderParts = (element: PrintElement, defaultBorderWidth = getDefaultBorderWidth(element)) => ({
  width: element.style?.borderWidth ?? defaultBorderWidth,
  style: element.style?.borderStyle || 'solid',
  color: element.style?.borderColor || '#111827',
  radius: element.style?.borderRadius ?? 0
});

const buildBorderStyle = (element: PrintElement, defaultBorderWidth = getDefaultBorderWidth(element)): CSSProperties => {
  const border = getBorderParts(element, defaultBorderWidth);
  const legacyBorder = element.style?.border && element.style.borderWidth === undefined;

  return {
    ...(legacyBorder
      ? { border: element.style?.border }
      : {
          borderWidth: border.width,
          borderStyle: border.style,
          borderColor: border.color
        }),
    borderRadius: border.radius,
    boxSizing: 'border-box'
  };
};

const buildBoxStyle = (element: PrintElement, defaultBorderWidth = getDefaultBorderWidth(element)): CSSProperties => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: element.style?.backgroundColor || 'transparent',
  ...buildBorderStyle(element, defaultBorderWidth)
});

const buildTableCellBorderStyle = (element: PrintElement): CSSProperties => {
  const border = getBorderParts(element, 1);
  return {
    borderWidth: border.width,
    borderStyle: border.style,
    borderColor: border.color
  };
};

const getHeaderColor = (style?: ElementStyle) => style?.headerColor || style?.color || '#111827';
const getFooterColor = (style?: ElementStyle) => style?.footerColor || style?.color || '#111827';

const buildTextStyle = (element: PrintElement): CSSProperties => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: getFlexAlign(element.style?.verticalAlign),
  justifyContent: element.style?.textAlign === 'center' ? 'center' : element.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
  padding: element.style?.padding ?? 4,
  color: element.style?.color || '#111827',
  backgroundColor: element.style?.backgroundColor || 'transparent',
  fontSize: element.style?.fontSize || 14,
  fontFamily: element.style?.fontFamily,
  fontWeight: element.style?.fontWeight,
  fontStyle: element.style?.fontStyle,
  textDecoration: element.style?.textDecoration,
  textAlign: element.style?.textAlign || 'left',
  writingMode: element.style?.writingMode,
  ...buildBorderStyle(element, 0),
  whiteSpace: 'pre-wrap',
  overflow: 'hidden',
  wordBreak: 'break-word'
});

const normalizeColumns = (value: unknown, fallback: TableColumn[] | undefined) => {
  if (Array.isArray(value)) return value as TableColumn[];
  return fallback || [];
};

const normalizeRows = (value: unknown, fallback: unknown[] | undefined) => {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  return (fallback || []) as Record<string, unknown>[];
};

const readCell = (row: Record<string, unknown>, field: string) => {
  const raw = row[field];
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    if (record.result !== undefined) return record.result;
    if (record.value !== undefined) return record.value;
    if (record.field !== undefined) return record.field;
  }
  return raw ?? '';
};

const TableView = ({ element, state }: { element: PrintElement; state: ReactDesignerState }) => {
  const columns = normalizeColumns(getVariableValue(state, element.columnsVariable), element.columns);
  const rows = normalizeRows(getVariableValue(state, element.variable), element.data);
  const footerRows = normalizeRows(getVariableValue(state, element.footerDataVariable), element.footerData);
  const cellBorderStyle = buildTableCellBorderStyle(element);

  return (
    <div className="designer-element-box designer-table-box" style={buildBoxStyle(element, 1)}>
      <table className="designer-table" style={{ fontSize: element.style?.fontSize || 12, color: element.style?.color || '#111827', backgroundColor: element.style?.backgroundColor || '#ffffff' }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                style={{
                  ...cellBorderStyle,
                  width: column.width,
                  height: element.style?.headerHeight,
                  textAlign: element.style?.headerTextAlign || 'left',
                  color: getHeaderColor(element.style),
                  backgroundColor: element.style?.headerBackgroundColor || '#f3f4f6'
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.field} style={{ ...cellBorderStyle, height: element.style?.rowHeight, textAlign: element.style?.textAlign || 'left' }}>
                  {String(readCell(row, column.field))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {element.showFooter && footerRows.length > 0 && (
          <tfoot>
            {footerRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td
                    key={column.field}
                    style={{
                      ...cellBorderStyle,
                      height: element.style?.footerHeight,
                      textAlign: element.style?.footerTextAlign || 'left',
                      color: getFooterColor(element.style),
                      backgroundColor: element.style?.footerBackgroundColor || '#f8fafc'
                    }}
                  >
                    {String(readCell(row, column.field))}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>
    </div>
  );
};

const BarcodeView = ({ element, state }: { element: PrintElement; state: ReactDesignerState }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const text = getTextValue(element, state) || '12345678';

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, text, {
        format: element.style?.barcodeFormat || 'CODE128',
        displayValue: element.style?.showText ?? true,
        lineColor: element.style?.color || '#111827',
        margin: 0,
        width: 1.4,
        height: Math.max(24, element.height - 20)
      });
    } catch {
      svgRef.current.innerHTML = '';
    }
  }, [element.height, element.style?.barcodeFormat, element.style?.color, element.style?.showText, text]);

  return <div className="designer-element-box" style={buildBoxStyle(element)}><svg ref={svgRef} className="designer-barcode" /></div>;
};

const QRCodeView = ({ element, state }: { element: PrintElement; state: ReactDesignerState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const text = getTextValue(element, state) || 'https://example.com';

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, text, {
      width: Math.max(40, Math.min(element.width, element.height)),
      margin: 1,
      errorCorrectionLevel: element.style?.qrErrorCorrection || 'M'
    }).catch(() => undefined);
  }, [element.height, element.width, element.style?.qrErrorCorrection, text]);

  return <div className="designer-element-box" style={buildBoxStyle(element)}><canvas ref={canvasRef} className="designer-qrcode" /></div>;
};

export const ElementRenderer = ({ element, state, pageIndex }: ElementRendererProps) => {
  const textValue = useMemo(() => getTextValue(element, state), [element, state]);

  if (element.type === ElementType.IMAGE) {
    return (
      <div className="designer-element-box" style={buildBoxStyle(element)}>
        {element.content ? <img className="designer-image" src={element.content} alt="" /> : <div className="designer-placeholder">Image</div>}
      </div>
    );
  }

  if (element.type === ElementType.TABLE) return <TableView element={element} state={state} />;
  if (element.type === ElementType.BARCODE) return <BarcodeView element={element} state={state} />;
  if (element.type === ElementType.QRCODE) return <QRCodeView element={element} state={state} />;

  if (element.type === ElementType.LINE) {
    const border = getBorderParts(element, 1);
    return <div className="designer-line" style={{ borderColor: border.color, borderTopWidth: border.width, borderTopStyle: border.style as CSSProperties['borderTopStyle'] }} />;
  }

  if (element.type === ElementType.RECT || element.type === ElementType.CIRCLE) {
    return (
      <div
        className="designer-shape"
        style={{
          ...buildBorderStyle(element, 1),
          backgroundColor: element.style?.backgroundColor || 'transparent',
          borderRadius: element.type === ElementType.CIRCLE ? '50%' : element.style?.borderRadius || 0
        }}
      />
    );
  }

  if (element.type === ElementType.PAGE_NUMBER) {
    const value = `${pageIndex + 1}/${state.pages.length}`;
    return <div style={buildTextStyle(element)}>{element.labelPosition === 'after' ? `${value}${element.labelText || ''}` : `${element.labelText || ''}${value}`}</div>;
  }

  return <div style={buildTextStyle(element)}>{textValue}</div>;
};

export default ElementRenderer;