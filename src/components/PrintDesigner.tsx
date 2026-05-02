import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { App, Button, Modal, Typography } from 'antd';
import { ModalForm, PageContainer, ProFormText, ProLayout } from '@ant-design/pro-components';
import { PrinterOutlined } from '@ant-design/icons';
import { ElementType } from '@/types';
import { createTranslator, type AppLocale } from '@/locales';
import {
  createElementForCanvas,
  serializeDesignerState,
  useDesignerDispatch,
  useDesignerState,
  type DesignerTemplateData
} from '@/state/designer';
import { deleteTemplate, readTemplates, upsertTemplate, type PrintTemplate } from '@/state/templates';
import DesignerSidebar from './designer/DesignerSidebar';
import DesignerTopToolbar from './designer/DesignerTopToolbar';
import DesignerCanvas from './designer/DesignerCanvas';
import PropertiesPanel from './designer/PropertiesPanel';
import PrintableDocument from './print/PrintableDocument';

export type DesignerExportRequest = {
  type: 'json' | 'html' | 'pdf' | 'images' | 'pdfBlob' | 'imageBlob';
  filename?: string;
};

export type DesignerPrintRequest = {
  mode?: 'browser';
};

export type DesignerPrintDefaults = {
  printMode?: 'browser';
};

export interface PrintDesignerHandle {
  print(request?: DesignerPrintRequest): Promise<void>;
  export(request: DesignerExportRequest): Promise<void | Blob>;
  getTemplateData(): DesignerTemplateData;
  loadTemplateData(data: Partial<DesignerTemplateData>): boolean;
  getTestData(): Record<string, unknown>;
  setTestData(data: Record<string, unknown>, options?: { merge?: boolean }): Promise<void>;
  getVariables(): Record<string, unknown>;
  setVariables(data: Record<string, unknown>, options?: { merge?: boolean }): Promise<void>;
}

export interface PrintDesignerProps {
  locale: AppLocale;
  embedded?: boolean;
}

const currentTemplateStorageKey = 'react-print-designer-current-template-id';

const readCurrentTemplateId = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(currentTemplateStorageKey);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export const PrintDesigner = forwardRef<PrintDesignerHandle, PrintDesignerProps>(({ locale, embedded = false }, ref) => {
  const { message, modal } = App.useApp();
  const t = useMemo(() => createTranslator(locale), [locale]);
  const state = useDesignerState();
  const dispatch = useDesignerDispatch();
  const [templates, setTemplates] = useState<PrintTemplate[]>(() => readTemplates());
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(() => readCurrentTemplateId());
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newTemplateModalOpen, setNewTemplateModalOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

  const templateData = useMemo(() => serializeDesignerState(state), [state]);
  const activeTemplate = currentTemplateId ? templates.find((item) => item.id === currentTemplateId) || null : null;

  useEffect(() => {
    if (!currentTemplateId) {
      localStorage.removeItem(currentTemplateStorageKey);
      return;
    }
    localStorage.setItem(currentTemplateStorageKey, currentTemplateId);
  }, [currentTemplateId]);

  useEffect(() => {
    if (!currentTemplateId) return;
    const template = templates.find((item) => item.id === currentTemplateId);
    if (!template) {
      setCurrentTemplateId(null);
      setTemplateName('');
      return;
    }
    setTemplateName(template.name);
  }, [currentTemplateId, templates]);

  const saveTemplate = (name?: string) => {
    const trimmed = (name || activeTemplate?.name || templateName || '').trim();
    if (!trimmed) {
      setTemplateName(activeTemplate?.name || 'Untitled Template');
      setSaveModalOpen(true);
      return;
    }
    const result = upsertTemplate(templates, {
      id: saveAsMode ? undefined : currentTemplateId || undefined,
      name: trimmed,
      data: templateData
    });
    setTemplates(result.templates);
    setCurrentTemplateId(result.id);
    setTemplateName(trimmed);
    setSaveAsMode(false);
    setSaveModalOpen(false);
    message.success(t('common.success'));
  };

  const createTemplateWithName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    let nextTemplates = templates;
    if (currentTemplateId) {
      const current = templates.find((item) => item.id === currentTemplateId);
      if (current) {
        const saved = upsertTemplate(templates, {
          id: currentTemplateId,
          name: current.name,
          data: templateData
        });
        nextTemplates = saved.templates;
      }
    }

    const blankTemplate: DesignerTemplateData = {
      pages: [],
      currentPageIndex: 0,
      canvasSize: { width: 794, height: 1123 }
    };
    const result = upsertTemplate(nextTemplates, {
      name: trimmed,
      data: blankTemplate
    });
    setTemplates(result.templates);
    setCurrentTemplateId(result.id);
    setTemplateName(trimmed);
    dispatch({ type: 'load-template-data', data: blankTemplate });
    setNewTemplateModalOpen(false);
    message.success(t('common.success'));
    return true;
  };

  const loadTemplate = (id: string) => {
    let nextTemplates = templates;
    if (currentTemplateId && currentTemplateId !== id) {
      const current = templates.find((item) => item.id === currentTemplateId);
      if (current) {
        const result = upsertTemplate(templates, {
          id: currentTemplateId,
          name: current.name,
          data: templateData
        });
        nextTemplates = result.templates;
        setTemplates(nextTemplates);
      }
    }

    const template = nextTemplates.find((item) => item.id === id);
    if (!template) return;
    dispatch({ type: 'load-template-data', data: template.data });
    setCurrentTemplateId(id);
    setTemplateName(template.name);
  };

  const confirmDeleteTemplate = (id: string) => {
    const template = templates.find((item) => item.id === id);
    modal.confirm({
      title: t('template.confirmDelete', { name: template?.name || '' }),
      okButtonProps: { danger: true },
      onOk: () => {
        const next = deleteTemplate(templates, id);
        setTemplates(next);
        if (currentTemplateId === id) setCurrentTemplateId(null);
      }
    });
  };

  const renameTemplate = (id: string, name: string) => {
    const trimmed = name.trim();
    const template = templates.find((item) => item.id === id);
    if (!template || !trimmed) return;

    const result = upsertTemplate(templates, {
      ...template,
      id,
      name: trimmed,
      data: template.data
    });
    setTemplates(result.templates);
    if (currentTemplateId === id) setTemplateName(trimmed);
    message.success(t('common.success'));
  };

  const duplicateTemplate = (id: string) => {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    const name = `${template.name} Copy`;
    const result = upsertTemplate(templates, {
      name,
      data: template.data
    });
    setTemplates(result.templates);
    setCurrentTemplateId(result.id);
    setTemplateName(name);
    dispatch({ type: 'load-template-data', data: template.data });
    message.success(t('common.success'));
  };

  const createTemplate = () => {
    setNewTemplateModalOpen(true);
  };

  const openSaveAsTemplate = () => {
    setTemplateName(activeTemplate?.name ? `${activeTemplate.name} Copy` : 'Untitled Template');
    setSaveAsMode(true);
    setSaveModalOpen(true);
  };

  const quickAdd = (type: ElementType) => {
    dispatch({
      type: 'insert-element',
      element: createElementForCanvas(type, Math.max(24, Math.round(state.canvasSize.width / 2 - 80)), Math.max(24, Math.round(state.canvasSize.height / 2 - 30)), t)
    });
  };

  const printDocument = async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    window.print();
  };

  const exportTemplate = async (request: DesignerExportRequest): Promise<void | Blob> => {
    const filename = request.filename || `${activeTemplate?.name || 'print-template'}.${request.type === 'html' ? 'html' : 'json'}`;
    const data = serializeDesignerState(state);
    const blob = request.type === 'html'
      ? new Blob([
          `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(activeTemplate?.name || 'Print Template')}</title></head><body><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre></body></html>`
        ], { type: 'text/html;charset=utf-8' })
      : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });

    if (request.type === 'pdfBlob' || request.type === 'imageBlob') return blob;
    downloadBlob(blob, filename);
    return undefined;
  };

  useImperativeHandle(ref, () => ({
    print: printDocument,
    export: exportTemplate,
    getTemplateData: () => serializeDesignerState(state),
    loadTemplateData: (data) => {
      dispatch({ type: 'load-template-data', data });
      return true;
    },
    getTestData: () => ({ ...state.testData }),
    setTestData: async (data, options) => dispatch({ type: 'set-test-data', data, merge: options?.merge }),
    getVariables: () => ({ ...state.variables }),
    setVariables: async (data, options) => dispatch({ type: 'set-variables', data, merge: options?.merge })
  }), [dispatch, exportTemplate, printDocument, state]);

  const header = (
    <div className="designer-header-actions">
      <DesignerTopToolbar
        t={t}
        templates={templates}
        currentTemplateId={currentTemplateId}
        onCreateTemplate={createTemplate}
        onSaveTemplate={() => saveTemplate()}
        onSaveAsTemplate={openSaveAsTemplate}
        onLoadTemplate={loadTemplate}
        onPreview={() => setPreviewOpen(true)}
        onPrint={printDocument}
        onViewJson={() => setJsonOpen(true)}
        onExportJson={() => exportTemplate({ type: 'json' })}
      />
    </div>
  );

  return (
    <div className={embedded ? 'designer-app is-embedded' : 'designer-app'}>
      <ProLayout
        layout="top"
        fixedHeader
        menuRender={false}
        actionsRender={false}
        headerTitleRender={false}
        headerContentRender={() => header}
      >
        <PageContainer ghost header={{ title: false, breadcrumb: {} }}>
          <div className="designer-workspace">
            <DesignerSidebar
              t={t}
              onQuickAdd={quickAdd}
            />
            <DesignerCanvas t={t} />
            <PropertiesPanel t={t} />
          </div>
        </PageContainer>
      </ProLayout>
      <div className="print-root" aria-hidden="true">
        <PrintableDocument state={state} />
      </div>
      <ModalForm<{ name: string }>
        title={t('editor.saveTemplate')}
        open={saveModalOpen}
        onOpenChange={(open) => {
          setSaveModalOpen(open);
          if (!open) setSaveAsMode(false);
        }}
        initialValues={{ name: templateName }}
        modalProps={{ destroyOnHidden: true }}
        onFinish={async ({ name }) => {
          saveTemplate(name);
          return true;
        }}
      >
        <ProFormText
          name="name"
          label={t('template.name')}
          placeholder={t('template.new')}
          rules={[{ required: true, message: t('template.nameRequired') }]}
        />
      </ModalForm>
      <ModalForm<{ name: string }>
        title={t('template.new')}
        open={newTemplateModalOpen}
        onOpenChange={setNewTemplateModalOpen}
        modalProps={{ destroyOnHidden: true }}
        onFinish={async ({ name }) => createTemplateWithName(name)}
      >
        <ProFormText
          name="name"
          label={t('template.name')}
          placeholder={t('template.new')}
          rules={[{ required: true, message: t('template.nameRequired') }]}
        />
      </ModalForm>
      <Modal title={t('editor.preview')} open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={<Button type="primary" icon={<PrinterOutlined />} onClick={printDocument}>{t('editor.print')}</Button>} width="min(1040px, calc(100vw - 32px))" destroyOnHidden>
        <div className="designer-preview-shell">
          <PrintableDocument state={state} />
        </div>
      </Modal>
      <Modal title={t('editor.viewJson')} open={jsonOpen} onCancel={() => setJsonOpen(false)} footer={null} width={760} destroyOnHidden>
        <Typography.Paragraph copyable className="designer-json-block">
          {JSON.stringify(templateData, null, 2)}
        </Typography.Paragraph>
      </Modal>
    </div>
  );
});

PrintDesigner.displayName = 'PrintDesigner';

export default PrintDesigner;