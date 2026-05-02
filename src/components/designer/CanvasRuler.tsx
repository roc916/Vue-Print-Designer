import { useEffect, useRef, useState } from 'react';
import { CM_TO_PX, IN_TO_PX, MM_TO_PX, PT_TO_PX, type Unit } from '@/utils/units';

export interface RulerIndicator {
  position: number;
  color: string;
}

interface CanvasRulerProps {
  type: 'horizontal' | 'vertical';
  zoom: number;
  scroll: number;
  offset: number;
  unit: Unit;
  thickness?: number;
  indicators?: RulerIndicator[];
}

const rulerSteps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

const getPxPerUnit = (unit: Unit) => {
  if (unit === 'mm') return MM_TO_PX;
  if (unit === 'pt') return PT_TO_PX;
  if (unit === 'in') return IN_TO_PX;
  if (unit === 'cm') return CM_TO_PX;
  return 1;
};

const getStep = (unit: Unit, zoom: number) => {
  const visualPxPerUnit = getPxPerUnit(unit) * zoom;
  const targetUnitGap = 54 / Math.max(visualPxPerUnit, 0.0001);
  return rulerSteps.find((step) => step >= targetUnitGap - 0.001) || rulerSteps[rulerSteps.length - 1];
};

const cleanLabel = (value: number) => Number(value.toFixed(2)).toString();

const CanvasRuler = ({ type, zoom, scroll, offset, unit, thickness = 20, indicators = [] }: CanvasRulerProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    resizeObserver.observe(root);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width <= 0 || size.height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(size.width * dpr));
    canvas.height = Math.max(1, Math.round(size.height * dpr));
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size.width, size.height);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, size.width, size.height);

    for (const indicator of indicators) {
      const position = offset + indicator.position * zoom - scroll;
      context.fillStyle = indicator.color;
      if (type === 'horizontal') {
        context.fillRect(position - 1, 0, 2, thickness);
      } else {
        context.fillRect(0, position - 1, thickness, 2);
      }
    }

    const pxPerUnit = getPxPerUnit(unit);
    const stepUnit = getStep(unit, zoom);
    const length = type === 'horizontal' ? size.width : size.height;
    const startUnit = (-offset + scroll) / (zoom * pxPerUnit);
    const endUnit = (length - offset + scroll) / (zoom * pxPerUnit);
    const firstMark = Math.floor(startUnit / stepUnit) * stepUnit;
    const subStep = stepUnit / 5;

    context.strokeStyle = '#94a3b8';
    context.fillStyle = '#64748b';
    context.lineWidth = 1;
    context.font = '10px sans-serif';
    context.beginPath();

    for (let value = firstMark; value <= endUnit + stepUnit; value += stepUnit) {
      const position = offset + value * pxPerUnit * zoom - scroll;
      const crispPosition = Math.round(position) + 0.5;
      const label = cleanLabel(value);

      if (type === 'horizontal') {
        context.moveTo(crispPosition, 0);
        context.lineTo(crispPosition, thickness);
        context.fillText(label, position + 3, 10);
      } else {
        context.moveTo(0, crispPosition);
        context.lineTo(thickness, crispPosition);
        context.save();
        context.translate(10, position + 3);
        context.rotate(-Math.PI / 2);
        context.fillText(label, 4, 0);
        context.restore();
      }

      for (let index = 1; index < 5; index += 1) {
        const subPosition = offset + (value + subStep * index) * pxPerUnit * zoom - scroll;
        const crispSubPosition = Math.round(subPosition) + 0.5;
        if (type === 'horizontal') {
          context.moveTo(crispSubPosition, thickness - 5);
          context.lineTo(crispSubPosition, thickness);
        } else {
          context.moveTo(thickness - 5, crispSubPosition);
          context.lineTo(thickness, crispSubPosition);
        }
      }
    }

    context.stroke();
  }, [indicators, offset, scroll, size.height, size.width, thickness, type, unit, zoom]);

  return (
    <div ref={rootRef} className={`designer-ruler designer-ruler-${type}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CanvasRuler;