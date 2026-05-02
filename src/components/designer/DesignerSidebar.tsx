import { Tabs, Typography } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import {
  AppstoreAddOutlined,
  BarChartOutlined,
  BorderOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  MinusOutlined,
  PictureOutlined,
  QrcodeOutlined,
  TableOutlined
} from '@ant-design/icons';
import { ElementType } from '@/types';

interface DesignerSidebarProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  onQuickAdd: (type: ElementType) => void;
}

const elementItems = [
  { type: ElementType.TEXT, icon: <FontSizeOutlined />, group: 'sidebar.general' },
  { type: ElementType.IMAGE, icon: <PictureOutlined />, group: 'sidebar.general' },
  { type: ElementType.TABLE, icon: <TableOutlined />, group: 'sidebar.general' },
  { type: ElementType.PAGE_NUMBER, icon: <FileTextOutlined />, group: 'sidebar.general' },
  { type: ElementType.BARCODE, icon: <BarChartOutlined />, group: 'sidebar.dataCodes' },
  { type: ElementType.QRCODE, icon: <QrcodeOutlined />, group: 'sidebar.dataCodes' },
  { type: ElementType.LINE, icon: <MinusOutlined />, group: 'sidebar.shapes' },
  { type: ElementType.RECT, icon: <BorderOutlined />, group: 'sidebar.shapes' },
  { type: ElementType.CIRCLE, icon: <AppstoreAddOutlined />, group: 'sidebar.shapes' }
];

export const DesignerSidebar = ({
  t,
  onQuickAdd
}: DesignerSidebarProps) => {
  return (
    <aside className="designer-sidebar">
      <Tabs
        size="small"
        defaultActiveKey="elements"
        items={[
          {
            key: 'elements',
            label: t('sidebar.elements'),
            children: (
              <ProCard ghost gutter={[8, 8]} direction="column">
                <Typography.Text type="secondary" className="designer-panel-hint">
                  {t('sidebar.dragToCanvas')}
                </Typography.Text>
                {['sidebar.general', 'sidebar.dataCodes', 'sidebar.shapes'].map((group) => (
                  <ProCard key={group} title={t(group)} size="small" className="designer-tool-card">
                    <div className="designer-element-grid">
                      {elementItems.filter((item) => item.group === group).map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          className="designer-element-tile"
                          draggable
                          onClick={() => onQuickAdd(item.type)}
                          onDragStart={(event) => event.dataTransfer.setData('application/x-print-element', item.type)}
                        >
                          <span className="designer-element-icon">{item.icon}</span>
                          <span>{t(`elements.${item.type}`)}</span>
                        </button>
                      ))}
                    </div>
                  </ProCard>
                ))}
              </ProCard>
            )
          }
        ]}
      />
    </aside>
  );
};

export default DesignerSidebar;