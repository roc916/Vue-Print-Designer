import { Button, ColorPicker, Descriptions, Empty, Input, InputNumber, Slider, Space, Tabs, Typography, App } from 'antd';
import { ProCard, ProForm, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { ElementType, type PrintElement } from '@/types';
import { getCurrentPage, getSelectedElement, useDesignerDispatch, useDesignerState } from '@/state/designer';

interface PropertiesPanelProps {
  t: (key: string, params?: Record<string, string | number>) => string;
}

const fontOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Inter', value: 'Inter, Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' }
];

const textAlignOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' }
];

const borderStyleOptions = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
  { label: 'Double', value: 'double' },
  { label: 'None', value: 'none' }
];

const barcodeFormatOptions = [
  'CODE128',
  'CODE128A',
  'CODE128B',
  'CODE128C',
  'EAN13',
  'EAN8',
  'UPC',
  'CODE39',
  'ITF14',
  'ITF',
  'MSI',
  'MSI10',
  'MSI11',
  'MSI1010',
  'MSI1110',
  'pharmacode',
  'codabar'
].map((value) => ({ label: value, value }));

const typographyElementTypes = new Set<ElementType>([ElementType.TEXT, ElementType.PAGE_NUMBER, ElementType.TABLE]);
const colorElementTypes = new Set<ElementType>([ElementType.TEXT, ElementType.PAGE_NUMBER, ElementType.TABLE, ElementType.BARCODE]);
const defaultBorderElementTypes = new Set<ElementType>([ElementType.LINE, ElementType.RECT, ElementType.CIRCLE, ElementType.TABLE]);

const toJson = (value: unknown) => JSON.stringify(value ?? [], null, 2);

const FieldLabel = ({ label }: { label: string }) => <Typography.Text className="designer-field-label">{label}</Typography.Text>;

const NumberField = ({ label, value, min, max, step, onChange }: { label: string; value?: number; min?: number; max?: number; step?: number; onChange: (value: number) => void }) => (
  <ProFormDigit
    label={label}
    fieldProps={{
      value,
      min,
      max,
      step,
      onChange: (next) => onChange(Number(next ?? 0))
    }}
  />
);

const ColorField = ({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) => (
  <div className="designer-color-field">
    <FieldLabel label={label} />
    <ColorPicker value={value || '#000000'} showText onChange={(color) => onChange(color.toHexString())} />
  </div>
);

const RotationField = ({ label, value, onChange }: { label: string; value?: number; onChange: (value: number) => void }) => {
  const rotation = Number(value || 0);
  return (
    <div className="designer-rotation-field">
      <div className="designer-rotation-field-header">
        <FieldLabel label={label} />
        <InputNumber value={rotation} min={-360} max={360} step={1} suffix="°" onChange={(next) => onChange(Number(next ?? 0))} />
      </div>
      <Slider min={-360} max={360} step={1} value={rotation} onChange={onChange} />
    </div>
  );
};

export const PropertiesPanel = ({ t }: PropertiesPanelProps) => {
  const { message } = App.useApp();
  const state = useDesignerState();
  const dispatch = useDesignerDispatch();
  const element = getSelectedElement(state);
  const currentPage = getCurrentPage(state);

  const updateElement = (patch: Partial<PrintElement>) => {
    if (!element) return;
    dispatch({ type: 'update-element', id: element.id, patch });
  };

  const updateStyle = (style: Partial<PrintElement['style']>) => {
    if (!element) return;
    dispatch({ type: 'update-element-style', id: element.id, style });
  };

  const updateJsonField = (field: 'columns' | 'data' | 'footerData', raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      updateElement({ [field]: parsed } as Partial<PrintElement>);
    } catch {
      message.error(t('common.invalidJson'));
    }
  };

  if (!element) {
    return (
      <aside className="designer-properties">
        <ProCard title={t('properties.title')} size="small" className="designer-property-card">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('properties.empty.selectInstruction')} />
        </ProCard>
      </aside>
    );
  }

  const maxLayer = Math.max(1, ...currentPage.elements.map((item) => item.style?.zIndex || 1));
  const supportsTypography = typographyElementTypes.has(element.type);
  const supportsColor = colorElementTypes.has(element.type);
  const supportsFill = element.type !== ElementType.LINE;
  const supportsCornerRadius = element.type !== ElementType.LINE && element.type !== ElementType.CIRCLE;
  const colorLabel = element.type === ElementType.TEXT ? t('properties.label.textColor') : t('properties.label.color');
  const borderWidth = element.style?.borderWidth ?? (defaultBorderElementTypes.has(element.type) ? 1 : 0);
  const borderColor = element.style?.borderColor && element.style.borderColor !== 'transparent' ? element.style.borderColor : '#111827';
  const updateBorderWidth = (value: number) => {
    updateStyle({
      borderWidth: value,
      ...(value > 0 && (!element.style?.borderColor || element.style.borderColor === 'transparent') ? { borderColor } : {})
    });
  };

  return (
    <aside className="designer-properties">
      <ProCard
        title={t('properties.title')}
        subTitle={t(`elements.${element.type}`)}
        size="small"
        className="designer-property-card"
        extra={
          <Space size={4}>
            <Button icon={<CopyOutlined />} onClick={() => dispatch({ type: 'duplicate-selected' })} />
            <Button danger icon={<DeleteOutlined />} onClick={() => dispatch({ type: 'delete-selected' })} />
          </Space>
        }
      >
        <Tabs
          size="small"
          items={[
            {
              key: 'layout',
              label: t('properties.tab.properties'),
              children: (
                <ProForm key={`layout-${element.id}`} submitter={false} layout="vertical">
                  <div className="designer-form-grid two">
                    <NumberField label={t('properties.label.x')} value={element.x} onChange={(value) => updateElement({ x: value })} />
                    <NumberField label={t('properties.label.y')} value={element.y} onChange={(value) => updateElement({ y: value })} />
                    <NumberField label={t('common.width')} value={element.width} min={1} onChange={(value) => updateElement({ width: value })} />
                    <NumberField label={t('common.height')} value={element.height} min={1} onChange={(value) => updateElement({ height: value })} />
                  </div>
                  <RotationField label={t('common.rotate')} value={element.style?.rotate || 0} onChange={(value) => updateStyle({ rotate: value })} />
                  <div className="designer-form-grid two">
                    <NumberField label={t('properties.label.zIndex')} value={element.style?.zIndex || 1} min={1} onChange={(value) => updateStyle({ zIndex: value })} />
                  </div>
                  <Space.Compact block>
                    <Button block onClick={() => updateStyle({ zIndex: maxLayer + 1 })}>{t('properties.action.bringToFront')}</Button>
                    <Button block onClick={() => updateStyle({ zIndex: 1 })}>{t('properties.action.sendToBack')}</Button>
                  </Space.Compact>
                </ProForm>
              )
            },
            {
              key: 'content',
              label: t('properties.section.content'),
              children: (
                <ProForm key={`content-${element.id}`} submitter={false} layout="vertical">
                  {element.type !== ElementType.LINE && element.type !== ElementType.RECT && element.type !== ElementType.CIRCLE && element.type !== ElementType.TABLE && (
                    <ProFormTextArea label={element.type === ElementType.IMAGE ? t('properties.label.imageSource') : t('properties.label.content')} fieldProps={{ value: element.content, rows: 3, onChange: (event) => updateElement({ content: event.target.value }) }} />
                  )}
                  {[ElementType.TEXT, ElementType.BARCODE, ElementType.QRCODE, ElementType.TABLE].includes(element.type) && (
                    <ProFormText label={t('properties.label.variable')} fieldProps={{ value: element.variable, onChange: (event) => updateElement({ variable: event.target.value }) }} />
                  )}
                  {element.type === ElementType.TABLE && (
                    <>
                      <ProFormText label={t('properties.label.columnsVariable')} fieldProps={{ value: element.columnsVariable, onChange: (event) => updateElement({ columnsVariable: event.target.value }) }} />
                      <ProFormText label={t('properties.label.footerDataVariable')} fieldProps={{ value: element.footerDataVariable, onChange: (event) => updateElement({ footerDataVariable: event.target.value }) }} />
                      <ProFormSwitch label={t('properties.label.showFooter')} fieldProps={{ checked: Boolean(element.showFooter), onChange: (checked) => updateElement({ showFooter: checked }) }} />
                      <FieldLabel label="Columns JSON" />
                      <Input.TextArea rows={5} defaultValue={toJson(element.columns)} onBlur={(event) => updateJsonField('columns', event.target.value)} />
                      <FieldLabel label="Data JSON" />
                      <Input.TextArea rows={6} defaultValue={toJson(element.data)} onBlur={(event) => updateJsonField('data', event.target.value)} />
                      <FieldLabel label="Footer JSON" />
                      <Input.TextArea rows={4} defaultValue={toJson(element.footerData)} onBlur={(event) => updateJsonField('footerData', event.target.value)} />
                    </>
                  )}
                  {element.type === ElementType.PAGE_NUMBER && (
                    <>
                      <ProFormText label={t('properties.label.format')} fieldProps={{ value: element.format, onChange: (event) => updateElement({ format: event.target.value }) }} />
                      <ProFormText label={t('properties.label.labelText')} fieldProps={{ value: element.labelText, onChange: (event) => updateElement({ labelText: event.target.value }) }} />
                      <ProFormSelect label={t('properties.label.labelPosition')} options={[{ label: 'Before', value: 'before' }, { label: 'After', value: 'after' }]} fieldProps={{ value: element.labelPosition || 'before', onChange: (value) => updateElement({ labelPosition: value }) }} />
                    </>
                  )}
                </ProForm>
              )
            },
            {
              key: 'style',
              label: t('properties.tab.style'),
              children: (
                <ProForm key={`style-${element.id}`} submitter={false} layout="vertical">
                  {supportsTypography && (
                    <div className="designer-property-section">
                      <Typography.Text className="designer-property-section-title">{t('properties.section.typography')}</Typography.Text>
                      <div className="designer-form-grid two">
                        <NumberField label={t('properties.label.fontSize')} value={element.style?.fontSize || 14} min={6} max={96} onChange={(value) => updateStyle({ fontSize: value })} />
                        <ProFormSelect label={t('properties.label.fontFamily')} options={fontOptions} fieldProps={{ value: element.style?.fontFamily, onChange: (value) => updateStyle({ fontFamily: value }) }} />
                      </div>
                      <ProFormSelect label={t('properties.label.textAlign')} options={textAlignOptions} fieldProps={{ value: element.style?.textAlign || 'left', onChange: (value) => updateStyle({ textAlign: value }) }} />
                    </div>
                  )}
                  {(supportsColor || supportsFill) && (
                    <div className="designer-property-section">
                      <Typography.Text className="designer-property-section-title">{t('properties.section.appearance')}</Typography.Text>
                      <div className="designer-form-grid two compact">
                        {supportsColor && <ColorField label={colorLabel} value={element.style?.color} onChange={(value) => updateStyle({ color: value })} />}
                        {supportsFill && <ColorField label={t('properties.label.backgroundColor')} value={element.style?.backgroundColor || '#ffffff'} onChange={(value) => updateStyle({ backgroundColor: value })} />}
                      </div>
                    </div>
                  )}
                  <div className="designer-property-section">
                    <Typography.Text className="designer-property-section-title">{element.type === ElementType.LINE ? t('properties.section.lineStyle') : t('properties.section.border')}</Typography.Text>
                    <div className="designer-form-grid two">
                      <NumberField label={t('properties.label.borderWidth')} value={borderWidth} min={0} max={20} onChange={updateBorderWidth} />
                      <ProFormSelect label={t('properties.label.borderStyle')} options={borderStyleOptions} fieldProps={{ value: element.style?.borderStyle || 'solid', onChange: (value) => updateStyle({ borderStyle: value }) }} />
                    </div>
                    <div className="designer-form-grid two compact">
                      <ColorField label={t('properties.label.borderColor')} value={borderColor} onChange={(value) => updateStyle({ borderColor: value })} />
                      {supportsCornerRadius && <NumberField label={t('properties.label.cornerRadius')} value={element.style?.borderRadius || 0} min={0} max={999} onChange={(value) => updateStyle({ borderRadius: value })} />}
                    </div>
                  </div>
                  {element.type === ElementType.BARCODE && (
                    <div className="designer-property-section">
                      <Typography.Text className="designer-property-section-title">{t('properties.section.barcodeSettings')}</Typography.Text>
                      <div className="designer-form-grid two">
                        <ProFormSelect label={t('properties.label.barcodeFormat')} options={barcodeFormatOptions} fieldProps={{ value: element.style?.barcodeFormat || 'CODE128', showSearch: true, optionFilterProp: 'label', onChange: (value) => updateStyle({ barcodeFormat: value }) }} />
                        <ProFormSwitch label={t('properties.label.showText')} fieldProps={{ checked: element.style?.showText ?? true, onChange: (checked) => updateStyle({ showText: checked }) }} />
                      </div>
                    </div>
                  )}
                  {element.type === ElementType.QRCODE && (
                    <div className="designer-property-section">
                      <Typography.Text className="designer-property-section-title">{t('properties.section.qrSettings')}</Typography.Text>
                      <ProFormSelect label={t('properties.label.errorCorrection')} options={['L', 'M', 'Q', 'H'].map((value) => ({ label: value, value }))} fieldProps={{ value: element.style?.qrErrorCorrection || 'M', onChange: (value) => updateStyle({ qrErrorCorrection: value }) }} />
                    </div>
                  )}
                </ProForm>
              )
            },
            {
              key: 'advanced',
              label: t('properties.tab.advanced'),
              children: (
                <Descriptions
                  className="designer-element-summary"
                  column={1}
                  size="small"
                  bordered
                  items={[
                    { key: 'type', label: t('properties.label.type'), children: t(`elements.${element.type}`) },
                    { key: 'id', label: 'ID', children: <Typography.Text copyable ellipsis>{element.id}</Typography.Text> },
                    { key: 'zIndex', label: t('properties.label.zIndex'), children: element.style?.zIndex || 1 }
                  ]}
                />
              )
            }
          ]}
        />
      </ProCard>
    </aside>
  );
};

export default PropertiesPanel;