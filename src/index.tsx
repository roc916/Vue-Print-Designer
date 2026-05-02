import { forwardRef } from 'react';
import './style.css';
import PrintDesigner, {
  type DesignerExportRequest,
  type DesignerPrintDefaults,
  type DesignerPrintRequest,
  type PrintDesignerHandle,
  type PrintDesignerProps,
} from './components/PrintDesigner';
import { DesignerProvider, type DesignerTemplateData } from './state/designer';

export type {
  DesignerExportRequest,
  DesignerPrintDefaults,
  DesignerPrintRequest,
  DesignerTemplateData,
  PrintDesignerHandle,
  PrintDesignerProps,
};

export type ReactPrintDesignerProps = PrintDesignerProps & {
  initialData?: Partial<DesignerTemplateData>;
};

export const ReactPrintDesigner = forwardRef<PrintDesignerHandle, ReactPrintDesignerProps>(
  ({ initialData, ...props }, ref) => (
    <DesignerProvider initialData={initialData}>
      <PrintDesigner ref={ref} {...props} />
    </DesignerProvider>
  )
);

ReactPrintDesigner.displayName = 'ReactPrintDesigner';

export { PrintDesigner };
export { DesignerProvider, useDesignerDispatch, useDesignerState } from './state/designer';
export { deleteTemplate, readTemplates, upsertTemplate, writeTemplates, type PrintTemplate } from './state/templates';
export { PrintableDocument } from './components/print/PrintableDocument';
export { default } from './components/PrintDesigner';