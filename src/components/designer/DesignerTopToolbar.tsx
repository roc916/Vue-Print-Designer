import { useState, type ReactNode } from 'react';
import { Button, ColorPicker, Divider, Dropdown, InputNumber, Popover, Select, Slider, Space, Switch, Tooltip, type MenuProps } from 'antd';
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BgColorsOutlined,
  BoldOutlined,
  CodeOutlined,
  ColumnHeightOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  MinusOutlined,
  EyeOutlined,
  FileAddOutlined,
  FontColorsOutlined,
  ItalicOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  PrinterOutlined,
  RedoOutlined,
  RotateLeftOutlined,
  SaveOutlined,
  SaveTwoTone,
  SettingOutlined,
  UnderlineOutlined,
  UnlockOutlined,
  UndoOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined
} from '@ant-design/icons';
import { PAPER_SIZES, type PaperSizeKey } from '@/constants/paper';
import { ElementType, type ElementStyle } from '@/types';
import { getSelectedElement, useDesignerDispatch, useDesignerState } from '@/state/designer';
import type { PrintTemplate } from '@/state/templates';
import { pxToUnit, unitToPx, type Unit } from '@/utils/units';

interface DesignerTopToolbarProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  templates: PrintTemplate[];
  currentTemplateId: string | null;
  onCreateTemplate: () => void;
  onSaveTemplate: () => void;
  onSaveAsTemplate: () => void;
  onLoadTemplate: (id: string) => void;
  onPreview: () => void;
  onPrint: () => void;
  onViewJson: () => void;
  onExportJson: () => void;
}

const fontOptions = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' }
];

const colorToHex = (value?: string, fallback = '#000000') => {
  if (!value || value === 'transparent') return fallback;
  return value;
};

const units: Unit[] = ['mm', 'cm', 'in', 'pt', 'px'];

export const DesignerTopToolbar = ({
  t,
  templates,
  currentTemplateId,
  onCreateTemplate,
  onSaveTemplate,
  onSaveAsTemplate,
  onLoadTemplate,
  onPreview,
  onPrint,
  onViewJson,
  onExportJson
}: DesignerTopToolbarProps) => {
  const state = useDesignerState();
  const dispatch = useDesignerDispatch();
  const [zoomSettingsOpen, setZoomSettingsOpen] = useState(false);
  const element = getSelectedElement(state);
  const selectedElements = state.pages.flatMap((page) => page.elements).filter((item) => state.selectedElementIds.includes(item.id));
  const hasSelection = selectedElements.length > 0;
  const hasLockedSelection = selectedElements.some((item) => item.locked);
  const fontControlsDisabled = !element || hasLockedSelection || element.type === ElementType.IMAGE;
  const editDisabled = !element || hasLockedSelection;
  const fontSize = element?.style?.fontSize || 14;
  const isBold = element?.style?.fontWeight === '700' || element?.style?.fontWeight === 'bold';
  const isItalic = element?.style?.fontStyle === 'italic';
  const isUnderline = element?.style?.textDecoration === 'underline';
  const isVertical = element?.style?.writingMode === 'vertical-rl';
  const rotation = element?.style?.rotate || 0;
  const zoomPercent = Math.round(state.zoom * 100);
  const selectedPaper = (Object.entries(PAPER_SIZES).find(([, size]) => size.width === state.canvasSize.width && size.height === state.canvasSize.height)?.[0] || 'CUSTOM') as PaperSizeKey;
  const paperLabel = selectedPaper === 'CUSTOM' ? t('editor.custom') : selectedPaper;

  const setZoomPercent = (percent: number) => {
    const clamped = Math.max(20, Math.min(500, Math.round(percent)));
    dispatch({ type: 'set-zoom', zoom: clamped / 100 });
  };

  const handleZoomIn = () => setZoomPercent(Math.min(500, zoomPercent + 10));
  const handleZoomOut = () => setZoomPercent(Math.max(20, zoomPercent - 10));

  const updateSelectedStyle = (style: Partial<ElementStyle>) => {
    dispatch({ type: 'update-selected-elements-style', style });
  };

  const formatUnitValue = (px: number) => {
    const value = pxToUnit(px, state.unit);
    return state.unit === 'px' ? Math.round(value) : Number(value.toFixed(1));
  };

  const fromUnitValue = (value: number | null) => Math.max(0, Math.round(unitToPx(Number(value || 0), state.unit)));

  const paperOptions = [
    ...Object.entries(PAPER_SIZES).map(([key, size]) => ({
      label: `${key} (${formatUnitValue(size.width)}${state.unit} x ${formatUnitValue(size.height)}${state.unit})`,
      value: key
    })),
    { label: t('editor.custom'), value: 'CUSTOM' }
  ];

  const updateCanvasSize = (patch: Partial<typeof state.canvasSize>) => {
    dispatch({ type: 'set-canvas', patch: { canvasSize: { ...state.canvasSize, ...patch } } });
  };

  const handlePaperChange = (value: PaperSizeKey) => {
    if (value === 'CUSTOM') return;
    dispatch({ type: 'set-canvas', patch: { canvasSize: PAPER_SIZES[value] } });
  };

  const exportMenu: MenuProps = {
    items: [
      { key: 'saveAs', icon: <SaveTwoTone />, label: t('editor.saveAsTemplate') },
      { key: 'preview', icon: <EyeOutlined />, label: t('editor.preview') },
      { key: 'print', icon: <PrinterOutlined />, label: t('editor.print') },
      { key: 'exportJson', icon: <DownloadOutlined />, label: t('editor.exportJson') },
      { key: 'viewJson', icon: <CodeOutlined />, label: t('editor.viewJson') }
    ],
    onClick: ({ key }) => {
      if (key === 'saveAs') onSaveAsTemplate();
      if (key === 'preview') onPreview();
      if (key === 'print') onPrint();
      if (key === 'exportJson') onExportJson();
      if (key === 'viewJson') onViewJson();
    }
  };

  const zoomSettings = (
    <div className="designer-zoom-popover">
      <div className="designer-zoom-title">{t('editor.zoomLevel')}</div>
      <Slider min={20} max={500} step={10} value={zoomPercent} onChange={setZoomPercent} />
      <div className="designer-zoom-value">{zoomPercent}%</div>
    </div>
  );

  const paperSettings = (
    <div className="designer-paper-popover">
      <div className="designer-paper-title">{t('editor.paperSettings')}</div>
      <label className="designer-paper-field">
        <span>{t('editor.sizePreset')}</span>
        <Select size="small" value={selectedPaper} options={paperOptions} onChange={handlePaperChange} />
      </label>
      <label className="designer-paper-field">
        <span>{t('editor.unit')}</span>
        <Select size="small" value={state.unit} options={units.map((unit) => ({ label: unit, value: unit }))} onChange={(unit) => dispatch({ type: 'set-canvas', patch: { unit } })} />
      </label>
      <div className="designer-paper-grid">
        <label className="designer-paper-field">
          <span>{t('common.width')} ({state.unit})</span>
          <InputNumber size="small" min={1} value={formatUnitValue(state.canvasSize.width)} onChange={(value) => updateCanvasSize({ width: fromUnitValue(value) })} />
        </label>
        <label className="designer-paper-field">
          <span>{t('common.height')} ({state.unit})</span>
          <InputNumber size="small" min={1} value={formatUnitValue(state.canvasSize.height)} onChange={(value) => updateCanvasSize({ height: fromUnitValue(value) })} />
        </label>
      </div>
      <div className="designer-paper-grid">
        <label className="designer-paper-field">
          <span>{t('editor.spacingX')} ({state.unit})</span>
          <InputNumber size="small" min={0} value={formatUnitValue(state.pageSpacingX)} onChange={(value) => dispatch({ type: 'set-canvas', patch: { pageSpacingX: fromUnitValue(value) } })} />
        </label>
        <label className="designer-paper-field">
          <span>{t('editor.spacingY')} ({state.unit})</span>
          <InputNumber size="small" min={0} value={formatUnitValue(state.pageSpacingY)} onChange={(value) => dispatch({ type: 'set-canvas', patch: { pageSpacingY: fromUnitValue(value) } })} />
        </label>
      </div>
      <div className="designer-paper-row">
        <span>{t('editor.backgroundColor')}</span>
        <ColorPicker value={state.canvasBackground} onChange={(_, hex) => dispatch({ type: 'set-canvas', patch: { canvasBackground: hex } })} />
      </div>
      <div className="designer-paper-switches">
        <div className="designer-paper-row"><span>{t('editor.showGrid')}</span><Switch size="small" checked={state.showGrid} onChange={(checked) => dispatch({ type: 'set-canvas', patch: { showGrid: checked } })} /></div>
        <div className="designer-paper-row"><span>{t('editor.showMarginLines')}</span><Switch size="small" checked={state.showMarginLines} onChange={(checked) => dispatch({ type: 'set-canvas', patch: { showMarginLines: checked } })} /></div>
        <div className="designer-paper-row"><span>{t('editor.showCornerMarkers')}</span><Switch size="small" checked={state.showCornerMarkers} onChange={(checked) => dispatch({ type: 'set-canvas', patch: { showCornerMarkers: checked } })} /></div>
      </div>
      <div className="designer-paper-section-title">{t('editor.headerFooter')}</div>
      <div className="designer-paper-line-row">
        <Switch size="small" checked={state.showHeaderLine} onChange={(checked) => dispatch({ type: 'set-canvas', patch: { showHeaderLine: checked } })} />
        <span>{t('editor.headerLine')}</span>
        <InputNumber size="small" min={0} value={formatUnitValue(state.headerHeight)} onChange={(value) => dispatch({ type: 'set-canvas', patch: { headerHeight: fromUnitValue(value) } })} />
      </div>
      <div className="designer-paper-line-row">
        <Switch size="small" checked={state.showFooterLine} onChange={(checked) => dispatch({ type: 'set-canvas', patch: { showFooterLine: checked } })} />
        <span>{t('editor.footerLine')}</span>
        <InputNumber size="small" min={0} value={formatUnitValue(state.footerHeight)} onChange={(value) => dispatch({ type: 'set-canvas', patch: { footerHeight: fromUnitValue(value) } })} />
      </div>
      <Button block size="small" type="primary" icon={<PlusOutlined />} onClick={() => dispatch({ type: 'add-page' })}>{t('editor.addNewPage')}</Button>
    </div>
  );

  const ToolButton = ({ title, icon, active, disabled, onClick, danger }: { title: string; icon: ReactNode; active?: boolean; disabled?: boolean; onClick: () => void; danger?: boolean }) => (
    <Tooltip title={title}>
      <Button
        size="small"
        type={active ? 'primary' : 'default'}
        danger={danger}
        icon={icon}
        disabled={disabled}
        onClick={onClick}
      />
    </Tooltip>
  );

  return (
    <div className="designer-top-toolbar">
      <Space size={6} className="designer-template-switcher">
        <Select
          size="small"
          className="designer-template-select"
          placeholder={t('template.select')}
          value={currentTemplateId || undefined}
          options={templates.map((template) => ({ label: template.name, value: template.id }))}
          notFoundContent={t('template.noTemplates')}
          onChange={onLoadTemplate}
          popupRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: '6px 0' }} />
              <Button
                type="text"
                size="small"
                block
                className="designer-template-dropdown-action"
                icon={<FileAddOutlined />}
                onMouseDown={(event) => event.preventDefault()}
                onClick={onCreateTemplate}
              >
                {t('template.new')}
              </Button>
            </>
          )}
        />
      </Space>

      <Divider orientation="vertical" />

      <Space.Compact className="designer-toolbar-group">
        <ToolButton title={t('common.undo')} icon={<UndoOutlined />} disabled={state.historyPast.length === 0} onClick={() => dispatch({ type: 'undo' })} />
        <ToolButton title={t('common.redo')} icon={<RedoOutlined />} disabled={state.historyFuture.length === 0} onClick={() => dispatch({ type: 'redo' })} />
      </Space.Compact>

      <Space.Compact className="designer-toolbar-group designer-font-group">
        <Select
          size="small"
          className="designer-font-select"
          value={element?.style?.fontFamily || ''}
          options={fontOptions.map((option) => ({ ...option, label: option.value ? option.label : t('editor.fonts.default') }))}
          disabled={fontControlsDisabled}
          onChange={(fontFamily) => updateSelectedStyle({ fontFamily })}
        />
        <Button size="small" disabled={fontControlsDisabled} onClick={() => updateSelectedStyle({ fontSize: Math.max(1, fontSize - 1) })}>-</Button>
        <InputNumber
          size="small"
          className="designer-font-size-input"
          min={1}
          max={200}
          controls={false}
          disabled={fontControlsDisabled}
          value={fontSize}
          onChange={(value) => updateSelectedStyle({ fontSize: Number(value || 14) })}
        />
        <Button size="small" disabled={fontControlsDisabled} onClick={() => updateSelectedStyle({ fontSize: Math.min(200, fontSize + 1) })}>+</Button>
      </Space.Compact>

      <Space.Compact className="designer-toolbar-group">
        <ToolButton title={t('editor.bold')} icon={<BoldOutlined />} active={isBold} disabled={fontControlsDisabled} onClick={() => updateSelectedStyle({ fontWeight: isBold ? '400' : '700' })} />
        <ToolButton title={t('editor.italic')} icon={<ItalicOutlined />} active={isItalic} disabled={fontControlsDisabled} onClick={() => updateSelectedStyle({ fontStyle: isItalic ? 'normal' : 'italic' })} />
        <ToolButton title={t('editor.underline')} icon={<UnderlineOutlined />} active={isUnderline} disabled={fontControlsDisabled} onClick={() => updateSelectedStyle({ textDecoration: isUnderline ? 'none' : 'underline' })} />
        <ToolButton title={t('editor.verticalText')} icon={<ColumnHeightOutlined />} active={isVertical} disabled={fontControlsDisabled} onClick={() => updateSelectedStyle({ writingMode: isVertical ? 'horizontal-tb' : 'vertical-rl' })} />
        <ColorPicker
          disabled={fontControlsDisabled}
          value={colorToHex(element?.style?.color)}
          onChange={(_, hex) => updateSelectedStyle({ color: hex })}
        >
          <Tooltip title={t('editor.textColor')}>
            <Button size="small" icon={<FontColorsOutlined />} disabled={fontControlsDisabled} />
          </Tooltip>
        </ColorPicker>
        <ColorPicker
          disabled={fontControlsDisabled}
          value={colorToHex(element?.style?.backgroundColor, '#ffffff')}
          onChange={(_, hex) => updateSelectedStyle({ backgroundColor: hex })}
        >
          <Tooltip title={t('editor.backgroundColor')}>
            <Button size="small" icon={<BgColorsOutlined />} disabled={fontControlsDisabled} />
          </Tooltip>
        </ColorPicker>
        <Tooltip title={t('common.rotate')}>
          <InputNumber
            size="small"
            className="designer-rotation-input"
            min={-360}
            max={360}
            step={1}
            controls={false}
            disabled={editDisabled}
            value={rotation}
            suffix="°"
            onChange={(value) => updateSelectedStyle({ rotate: Number(value || 0) })}
          />
        </Tooltip>
        <ToolButton title={t('editor.resetRotation')} icon={<RotateLeftOutlined />} disabled={editDisabled} onClick={() => updateSelectedStyle({ rotate: 0 })} />
      </Space.Compact>

      <Space.Compact className="designer-toolbar-group">
        <ToolButton title={t('editor.alignLeft')} icon={<AlignLeftOutlined />} disabled={editDisabled} onClick={() => dispatch({ type: 'align-selected-elements', align: 'left' })} />
        <ToolButton title={t('editor.alignCenter')} icon={<AlignCenterOutlined />} disabled={editDisabled} onClick={() => dispatch({ type: 'align-selected-elements', align: 'center' })} />
        <ToolButton title={t('editor.alignRight')} icon={<AlignRightOutlined />} disabled={editDisabled} onClick={() => dispatch({ type: 'align-selected-elements', align: 'right' })} />
        <ToolButton title={t('editor.alignTop')} icon={<VerticalAlignTopOutlined />} disabled={editDisabled} onClick={() => dispatch({ type: 'align-selected-elements', align: 'top' })} />
        <ToolButton title={t('editor.alignMiddle')} icon={<VerticalAlignMiddleOutlined />} disabled={editDisabled} onClick={() => dispatch({ type: 'align-selected-elements', align: 'middle' })} />
        <ToolButton title={t('editor.alignBottom')} icon={<VerticalAlignBottomOutlined />} disabled={editDisabled} onClick={() => dispatch({ type: 'align-selected-elements', align: 'bottom' })} />
      </Space.Compact>

      <Space.Compact className="designer-toolbar-group">
        <ToolButton title={t('common.copy')} icon={<CopyOutlined />} disabled={!hasSelection || hasLockedSelection} onClick={() => dispatch({ type: 'copy-selected' })} />
        <ToolButton title={t('common.paste')} icon={<CopyOutlined rotate={180} />} disabled={state.clipboard.length === 0} onClick={() => dispatch({ type: 'paste-clipboard' })} />
        <ToolButton title={element?.locked ? t('editor.unlock') : t('editor.lock')} icon={element?.locked ? <UnlockOutlined /> : <LockOutlined />} disabled={!hasSelection} onClick={() => dispatch({ type: 'toggle-lock-selected' })} />
        <ToolButton title={t('common.delete')} icon={<DeleteOutlined />} danger disabled={!hasSelection || hasLockedSelection} onClick={() => dispatch({ type: 'delete-selected' })} />
      </Space.Compact>

      <Popover trigger="click" placement="bottom" content={paperSettings}>
        <Button size="small" className="designer-paper-button" icon={<SettingOutlined />}>
          <span>{paperLabel}</span>
          <DownOutlined />
        </Button>
      </Popover>

      <Space.Compact className="designer-zoom-control">
        <Tooltip title={t('editor.zoomOut')}>
          <Button size="small" icon={<MinusOutlined />} onClick={handleZoomOut} />
        </Tooltip>
        <Popover
          trigger="click"
          open={zoomSettingsOpen}
          onOpenChange={setZoomSettingsOpen}
          placement="bottom"
          content={zoomSettings}
        >
          <Button size="small" className="designer-zoom-percent" title={t('editor.zoomSettings')}>
            {zoomPercent}%
          </Button>
        </Popover>
        <Tooltip title={t('editor.zoomIn')}>
          <Button size="small" icon={<PlusOutlined />} onClick={handleZoomIn} />
        </Tooltip>
      </Space.Compact>

      <Divider orientation="vertical" />

      <Space.Compact className="designer-toolbar-group">
        <Button size="small" type="primary" icon={<SaveOutlined />} onClick={onSaveTemplate}>{t('common.save')}</Button>
        <Dropdown menu={exportMenu} trigger={['click']}>
          <Button size="small" icon={<MoreOutlined />} />
        </Dropdown>
      </Space.Compact>
    </div>
  );
};

export default DesignerTopToolbar;