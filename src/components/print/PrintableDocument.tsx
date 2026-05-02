import type { ReactDesignerState } from '@/state/designer';
import ElementRenderer from '@/components/designer/ElementRenderer';

export const PrintableDocument = ({ state }: { state: ReactDesignerState }) => {
  return (
    <div className="printable-document">
      {state.pages.map((page, pageIndex) => (
        <section
          key={page.id}
          className="printable-page"
          style={{ width: state.canvasSize.width, height: state.canvasSize.height, backgroundColor: state.canvasBackground }}
        >
          {page.elements.map((element) => (
            <div
              key={element.id}
              className="printable-element"
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                zIndex: element.style?.zIndex || 1,
                transform: `rotate(${element.style?.rotate || 0}deg)`
              }}
            >
              <ElementRenderer element={element} state={state} pageIndex={pageIndex} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default PrintableDocument;