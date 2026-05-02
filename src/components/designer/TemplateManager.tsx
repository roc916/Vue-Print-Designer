import { useEffect, useRef, useState } from 'react';
import { Button, Space, Tag, Typography } from 'antd';
import {
  ModalForm,
  ProFormText,
  ProTable,
  TableDropdown,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { CopyOutlined, DeleteOutlined, FileAddOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons';
import type { PrintTemplate } from '@/state/templates';

interface TemplateManagerProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  templates: PrintTemplate[];
  currentTemplateId: string | null;
  onCreateTemplate: () => void;
  onSaveTemplate: () => void;
  onLoadTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  onRenameTemplate: (id: string, name: string) => void;
}

const getLayerCount = (template: PrintTemplate) => {
  return (template.data?.pages || []).reduce((total, page) => total + (page.elements?.length || 0), 0);
};

export const TemplateManager = ({
  t,
  templates,
  currentTemplateId,
  onCreateTemplate,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onRenameTemplate
}: TemplateManagerProps) => {
  const actionRef = useRef<ActionType>();
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    actionRef.current?.reload();
  }, [templates, currentTemplateId, keyword]);

  const columns: ProColumns<PrintTemplate>[] = [
    {
      title: t('template.name'),
      dataIndex: 'name',
      ellipsis: true,
      render: (_, template) => (
        <Space size={6} className="designer-template-name">
          <FolderOpenOutlined />
          <Typography.Link onClick={() => onLoadTemplate(template.id)}>{template.name}</Typography.Link>
          {currentTemplateId === template.id && <Tag color="processing">{t('template.active')}</Tag>}
        </Space>
      )
    },
    {
      title: t('template.pageCount'),
      key: 'pages',
      width: 72,
      align: 'right',
      search: false,
      renderText: (_, template) => template.data?.pages?.length || 0
    },
    {
      title: t('template.layerCount'),
      key: 'layers',
      width: 72,
      align: 'right',
      search: false,
      renderText: (_, template) => getLayerCount(template)
    },
    {
      title: t('template.updatedAt'),
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      width: 132,
      search: false,
      sorter: (a, b) => a.updatedAt - b.updatedAt
    },
    {
      title: t('common.actions'),
      valueType: 'option',
      fixed: 'right',
      width: 132,
      render: (_, template) => [
        <a key="load" onClick={() => onLoadTemplate(template.id)}>{t('template.select')}</a>,
        <ModalForm<{ name: string }>
          key="rename"
          title={t('template.rename')}
          trigger={<a>{t('common.edit')}</a>}
          modalProps={{ destroyOnHidden: true }}
          initialValues={{ name: template.name }}
          onFinish={async ({ name }) => {
            onRenameTemplate(template.id, name);
            return true;
          }}
        >
          <ProFormText
            name="name"
            label={t('template.name')}
            rules={[{ required: true, message: t('template.nameRequired') }]}
          />
        </ModalForm>,
        <TableDropdown
          key="more"
          onSelect={(key) => {
            if (key === 'copy') onDuplicateTemplate(template.id);
            if (key === 'delete') onDeleteTemplate(template.id);
          }}
          menus={[
            { key: 'copy', name: t('common.copy') },
            { key: 'delete', name: t('common.delete') }
          ]}
        />
      ]
    }
  ];

  return (
    <div className="designer-template-manager">
      <Space.Compact block className="designer-template-actions">
        <Button block icon={<FileAddOutlined />} onClick={onCreateTemplate}>{t('template.new')}</Button>
        <Button block type="primary" icon={<SaveOutlined />} onClick={onSaveTemplate}>{t('common.save')}</Button>
      </Space.Compact>
      <ProTable<PrintTemplate>
        actionRef={actionRef}
        rowKey="id"
        size="small"
        cardBordered
        search={false}
        options={false}
        pagination={false}
        scroll={{ x: 680 }}
        columns={columns}
        params={{ keyword, version: templates.map((item) => `${item.id}:${item.updatedAt}`).join('|') }}
        locale={{ emptyText: t('template.noTemplates') }}
        toolbar={{
          title: t('editor.templates'),
          search: {
            placeholder: t('template.searchPlaceholder'),
            onSearch: setKeyword
          },
          actions: [
            <Button key="copy" icon={<CopyOutlined />} disabled={!currentTemplateId} onClick={() => currentTemplateId && onDuplicateTemplate(currentTemplateId)}>
              {t('template.duplicate')}
            </Button>,
            <Button key="delete" danger icon={<DeleteOutlined />} disabled={!currentTemplateId} onClick={() => currentTemplateId && onDeleteTemplate(currentTemplateId)} />
          ]
        }}
        request={async (params) => {
          const query = String(params.keyword || '').trim().toLowerCase();
          const data = query
            ? templates.filter((template) => template.name.toLowerCase().includes(query))
            : templates;
          return {
            data,
            total: data.length,
            success: true
          };
        }}
      />
    </div>
  );
};

export default TemplateManager;