import { createInitialDesignerState } from '@/state/designer';
import PrintableDocument from './PrintableDocument';

export const PrintRenderer = () => {
  const state = createInitialDesignerState();
  return <PrintableDocument state={state} />;
};

export default PrintRenderer;