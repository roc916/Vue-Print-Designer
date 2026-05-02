import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Button, Empty, Space, Tooltip } from 'antd';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ElementType, type PrintElement } from '@/types';
import { createElementForCanvas, getCurrentPage, useDesignerDispatch, useDesignerState } from '@/state/designer';
import { pxToUnit, type Unit } from '@/utils/units';
import CanvasRuler from './CanvasRuler';
import ElementRenderer from './ElementRenderer';

interface DesignerCanvasProps {
  t: (key: string) => string;
}

type Interaction = {
  id: string;
  mode: 'move' | 'resize';
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

type RulerMetrics = {
  scrollX: number;
  scrollY: number;
  offsetX: number;
  offsetY: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollWidth: number;
  scrollHeight: number;
};

type CursorGuide = {
  visible: boolean;
  x: number;
  y: number;
  visualX: number;
  visualY: number;
};

const parseElementType = (value: string): ElementType | null => {
  return Object.values(ElementType).includes(value as ElementType) ? value as ElementType : null;
};

const elementFrameStyle = (element: PrintElement, selected: boolean, zoom: number) => ({
  left: element.x,
  top: element.y,
  width: element.width,
  height: element.height,
  transform: `rotate(${element.style?.rotate || 0}deg)`,
  zIndex: element.style?.zIndex || 1,
  '--frame-scale': `${1 / zoom}`,
  '--frame-outline': selected ? 'var(--designer-primary)' : 'transparent'
} as CSSProperties);

const ResizeHandle = () => <span className="designer-resize-handle" data-resize="true" />;

const initialRulerMetrics: RulerMetrics = {
  scrollX: 0,
  scrollY: 0,
  offsetX: 0,
  offsetY: 0,
  viewportWidth: 0,
  viewportHeight: 0,
  scrollWidth: 0,
  scrollHeight: 0
};

const formatCoordinate = (value: number, unit: Unit) => {
  const converted = pxToUnit(value, unit);
  if (unit === 'px') return `${Math.round(converted)}px`;
  return `${Number(converted.toFixed(1))}${unit}`;
};

export const DesignerCanvas = ({ t }: DesignerCanvasProps) => {
  const state = useDesignerState();
  const dispatch = useDesignerDispatch();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const pagesRef = useRef<HTMLDivElement | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [rulerMetrics, setRulerMetrics] = useState<RulerMetrics>(initialRulerMetrics);
  const [cursorGuide, setCursorGuide] = useState<CursorGuide>({ visible: false, x: 0, y: 0, visualX: 0, visualY: 0 });
  const currentPage = getCurrentPage(state);

  const selectedIds = useMemo(() => new Set(state.selectedElementIds), [state.selectedElementIds]);

  const updateRulerMetrics = useCallback(() => {
    const scrollNode = canvasRef.current;
    const firstPageNode = scrollNode?.querySelector('[data-page-index="0"]') as HTMLElement | null;
    if (!scrollNode || !firstPageNode) return;

    const scrollRect = scrollNode.getBoundingClientRect();
    const pageRect = firstPageNode.getBoundingClientRect();
    const offsetX = pageRect.left - scrollRect.left + scrollNode.scrollLeft - (scrollNode.clientLeft || 0);
    const offsetY = pageRect.top - scrollRect.top + scrollNode.scrollTop - (scrollNode.clientTop || 0);

    setRulerMetrics({
      scrollX: scrollNode.scrollLeft,
      scrollY: scrollNode.scrollTop,
      offsetX,
      offsetY,
      viewportWidth: scrollNode.clientWidth,
      viewportHeight: scrollNode.clientHeight,
      scrollWidth: scrollNode.scrollWidth,
      scrollHeight: scrollNode.scrollHeight
    });
  }, []);

  useEffect(() => {
    const scrollNode = canvasRef.current;
    if (!scrollNode) return undefined;

    const resizeObserver = new ResizeObserver(updateRulerMetrics);
    resizeObserver.observe(scrollNode);
    if (pagesRef.current) resizeObserver.observe(pagesRef.current);

    const animationFrame = window.requestAnimationFrame(updateRulerMetrics);
    window.addEventListener('resize', updateRulerMetrics);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateRulerMetrics);
      resizeObserver.disconnect();
    };
  }, [state.canvasSize.height, state.canvasSize.width, state.pages.length, state.zoom, updateRulerMetrics]);

  const handleCanvasScroll = () => {
    updateRulerMetrics();
  };

  const handleCanvasPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scrollNode = canvasRef.current;
    if (!scrollNode) return;
    const rect = scrollNode.getBoundingClientRect();
    const visualX = event.clientX - rect.left + scrollNode.scrollLeft;
    const visualY = event.clientY - rect.top + scrollNode.scrollTop;

    setCursorGuide({
      visible: true,
      x: (visualX - rulerMetrics.offsetX) / state.zoom,
      y: (visualY - rulerMetrics.offsetY) / state.zoom,
      visualX,
      visualY
    });
  };

  const hideCursorGuide = () => {
    setCursorGuide((current) => ({ ...current, visible: false }));
  };

  useEffect(() => {
    if (!interaction) return;

    const handleMove = (event: globalThis.PointerEvent) => {
      const dx = (event.clientX - interaction.startClientX) / state.zoom;
      const dy = (event.clientY - interaction.startClientY) / state.zoom;
      if (interaction.mode === 'move') {
        dispatch({
          type: 'update-element',
          id: interaction.id,
          transient: true,
          patch: {
            x: Math.round(interaction.startX + dx),
            y: Math.round(interaction.startY + dy)
          }
        });
      } else {
        dispatch({
          type: 'update-element',
          id: interaction.id,
          transient: true,
          patch: {
            width: Math.max(16, Math.round(interaction.startWidth + dx)),
            height: Math.max(12, Math.round(interaction.startHeight + dy))
          }
        });
      }
    };

    const handleUp = () => setInteraction(null);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dispatch, interaction, state.zoom]);

  const handleElementPointerDown = (event: PointerEvent<HTMLDivElement>, element: PrintElement) => {
    event.stopPropagation();
    dispatch({ type: 'select-elements', ids: event.shiftKey ? Array.from(new Set([...state.selectedElementIds, element.id])) : [element.id] });
    if (element.locked) return;
    const target = event.target as HTMLElement;
    setInteraction({
      id: element.id,
      mode: target.dataset.resize ? 'resize' : 'move',
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: element.x,
      startY: element.y,
      startWidth: element.width,
      startHeight: element.height
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = parseElementType(event.dataTransfer.getData('application/x-print-element'));
    if (!type) return;
    const pageNode = (event.target as HTMLElement).closest('[data-page-index]') as HTMLElement | null;
    if (!pageNode) return;
    const pageIndex = Number(pageNode.dataset.pageIndex || 0);
    const rect = pageNode.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / state.zoom);
    const y = Math.round((event.clientY - rect.top) / state.zoom);
    dispatch({ type: 'set-page-index', index: pageIndex });
    dispatch({ type: 'insert-element', element: createElementForCanvas(type, x, y, t) });
  };

  const cursorIndicators = cursorGuide.visible ? [{ position: cursorGuide.x, color: 'rgba(22, 119, 255, 0.72)' }] : [];
  const cursorVerticalIndicators = cursorGuide.visible ? [{ position: cursorGuide.y, color: 'rgba(22, 119, 255, 0.72)' }] : [];

  return (
    <div className="designer-canvas-panel">
      <div className="designer-canvas-workspace">
        <div className="designer-ruler-corner" />
        <CanvasRuler
          type="horizontal"
          zoom={state.zoom}
          scroll={rulerMetrics.scrollX}
          offset={rulerMetrics.offsetX}
          unit={state.unit}
          indicators={cursorIndicators}
        />
        <CanvasRuler
          type="vertical"
          zoom={state.zoom}
          scroll={rulerMetrics.scrollY}
          offset={rulerMetrics.offsetY}
          unit={state.unit}
          indicators={cursorVerticalIndicators}
        />
        <div
          ref={canvasRef}
          className="designer-canvas-scroll"
          onScroll={handleCanvasScroll}
          onPointerMove={handleCanvasPointerMove}
          onPointerLeave={hideCursorGuide}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <div ref={pagesRef} className="designer-pages" style={{ transform: `scale(${state.zoom})`, transformOrigin: 'top center' }}>
            {state.pages.length === 0 && <Empty />}
            {state.pages.map((page, pageIndex) => (
              <section
                key={page.id}
                data-page-index={pageIndex}
                className={`designer-page-sheet ${pageIndex === state.currentPageIndex ? 'is-active' : ''}`}
                style={{ width: state.canvasSize.width, height: state.canvasSize.height, backgroundColor: state.canvasBackground }}
                onPointerDown={() => {
                  dispatch({ type: 'set-page-index', index: pageIndex });
                  dispatch({ type: 'select-elements', ids: [] });
                }}
              >
                {state.showGrid && <div className="designer-grid" />}
                {state.showMarginLines && <div className="designer-margin-lines" style={{ inset: `${state.pageSpacingY}px ${state.pageSpacingX}px` }} />}
                {state.showCornerMarkers && (
                  <>
                    <span className="designer-corner-marker top-left" />
                    <span className="designer-corner-marker top-right" />
                    <span className="designer-corner-marker bottom-left" />
                    <span className="designer-corner-marker bottom-right" />
                  </>
                )}
                {state.showHeaderLine && <div className="designer-header-line" style={{ top: state.headerHeight }}><span>{t('canvas.headerLabel')}</span></div>}
                {state.showFooterLine && <div className="designer-footer-line" style={{ bottom: state.footerHeight }}><span>{t('canvas.footerLabel')}</span></div>}
                {page.elements.map((element) => {
                  const selected = selectedIds.has(element.id);
                  return (
                    <div
                      key={element.id}
                      className={`designer-element-frame ${selected ? 'is-selected' : ''} ${element.locked ? 'is-locked' : ''}`}
                      style={elementFrameStyle(element, selected, state.zoom)}
                      onPointerDown={(event) => handleElementPointerDown(event, element)}
                    >
                      <ElementRenderer element={element} state={state} pageIndex={pageIndex} />
                      {selected && !element.locked && <ResizeHandle />}
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
          {cursorGuide.visible && (
            <div
              className="designer-cursor-overlay"
              style={{ width: Math.max(rulerMetrics.scrollWidth, rulerMetrics.viewportWidth), height: Math.max(rulerMetrics.scrollHeight, rulerMetrics.viewportHeight) }}
            >
              <span className="designer-cursor-guide designer-cursor-guide-horizontal" style={{ top: cursorGuide.visualY }} />
              <span className="designer-cursor-guide designer-cursor-guide-vertical" style={{ left: cursorGuide.visualX }} />
              <span className="designer-cursor-coordinate" style={{ left: cursorGuide.visualX, top: cursorGuide.visualY }}>
                {formatCoordinate(cursorGuide.x, state.unit)}, {formatCoordinate(cursorGuide.y, state.unit)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="designer-canvas-status">
        <span>
          {t('template.select')}: {state.currentPageIndex + 1}/{state.pages.length} · {Math.round(state.zoom * 100)}% · {currentPage.elements.length} {t('elements.layers')}
        </span>
        <Space size={4}>
          <Tooltip title={t('canvas.addPage')}>
            <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => dispatch({ type: 'add-page' })} />
          </Tooltip>
          <Tooltip title={t('canvas.copyPage')}>
            <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => dispatch({ type: 'duplicate-page', index: state.currentPageIndex })} />
          </Tooltip>
          <Tooltip title={t('canvas.deletePage')}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} disabled={state.pages.length <= 1} onClick={() => dispatch({ type: 'delete-page', index: state.currentPageIndex })} />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};

export default DesignerCanvas;