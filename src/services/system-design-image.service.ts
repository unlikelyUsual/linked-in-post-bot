import sharp from "sharp";
import type {
  SystemDesignComponent,
  SystemDesignDiagram,
} from "../types/systemDesign.ts";

const WIDTH = 1200;
const HEIGHT = 675;
const CARD_HEIGHT = 62;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const wrapText = (value: string, maxLength: number): string[] => {
  const words = value.split(/\s+/).flatMap((word) => {
    if (word.length <= maxLength) {
      return [word];
    }

    return Array.from(
      { length: Math.ceil(word.length / maxLength) },
      (_, index) => word.slice(index * maxLength, (index + 1) * maxLength),
    );
  });
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.slice(0, 2);
};

const getComponentLevels = (diagram: SystemDesignDiagram): number[] => {
  const levels = diagram.components.map(() => -1);
  const incoming = new Set(diagram.connections.map(({ to }) => to));
  const queue = diagram.components
    .map((component, index) => ({ component, index }))
    .filter(({ component }) => !incoming.has(component.id))
    .map(({ index }) => index);

  if (queue.length === 0) {
    queue.push(0);
  }

  for (const index of queue) {
    levels[index] = 0;
  }

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const sourceIndex = queue[cursor];
    const sourceId = diagram.components[sourceIndex].id;

    for (const connection of diagram.connections) {
      if (connection.from !== sourceId) {
        continue;
      }

      const targetIndex = diagram.components.findIndex(
        ({ id }) => id === connection.to,
      );
      if (levels[targetIndex] === -1) {
        levels[targetIndex] = levels[sourceIndex] + 1;
        queue.push(targetIndex);
      }
    }
  }

  let lastLevel = Math.max(0, ...levels);
  for (let index = 0; index < levels.length; index++) {
    if (levels[index] === -1) {
      levels[index] = ++lastLevel;
    }
  }

  return levels;
};

const renderComponent = (
  component: SystemDesignComponent,
  x: number,
  y: number,
  width: number,
): string => {
  const colors: Record<SystemDesignComponent["type"], string> = {
    client: "#60a5fa",
    service: "#a78bfa",
    data: "#34d399",
    queue: "#fbbf24",
    external: "#fb7185",
  };
  const color = colors[component.type];
  const lines = wrapText(component.name, Math.max(9, Math.floor(width / 9)));
  const nameMarkup = lines
    .map(
      (line, index) =>
        `<tspan x="${x + width / 2}" dy="${index === 0 ? 0 : 17}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${CARD_HEIGHT}" rx="12" fill="#111d31" stroke="${color}" stroke-width="2"/>
    <text x="${x + width / 2}" y="${y + 22}" fill="#91a4be" font-size="10" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="1">${escapeXml(component.type.toUpperCase())}</text>
    <text x="${x + width / 2}" y="${y + 42}" fill="#f3f6fb" font-size="13" font-weight="600" font-family="Arial, sans-serif" text-anchor="middle">${nameMarkup}</text>
  </g>`;
};

export const renderSystemDesignImage = async (
  diagram: SystemDesignDiagram,
): Promise<Buffer> => {
  const levels = getComponentLevels(diagram);
  const maxLevel = Math.max(...levels);
  const columnCount = maxLevel + 1;
  const cardWidth = Math.max(
    100,
    Math.min(176, (1100 - 20 * (columnCount - 1)) / columnCount),
  );
  const horizontalStep =
    columnCount > 1 ? (1100 - cardWidth) / maxLevel : 0;
  const layerMembers = new Map<number, number[]>();

  levels.forEach((level, index) => {
    const members = layerMembers.get(level) ?? [];
    members.push(index);
    layerMembers.set(level, members);
  });

  const positions = diagram.components.map((component, index) => {
    const level = levels[index];
    const members = layerMembers.get(level)!;
    const row = members.indexOf(index);
    const centerX = 50 + cardWidth / 2 + level * horizontalStep;
    const centerY = 155 + ((row + 1) * 405) / (members.length + 1);
    return {
      component,
      x: centerX - cardWidth / 2,
      y: centerY - CARD_HEIGHT / 2,
      centerX,
      centerY,
    };
  });

  const paths = diagram.connections
    .map((connection, index) => {
      const source = positions.find(
        ({ component }) => component.id === connection.from,
      )!;
      const target = positions.find(
        ({ component }) => component.id === connection.to,
      )!;
      const forward = target.centerX >= source.centerX;
      const startX = source.centerX + (forward ? cardWidth / 2 : -cardWidth / 2);
      const endX = target.centerX + (forward ? -cardWidth / 2 : cardWidth / 2);
      const controlX = (startX + endX) / 2;
      const path =
        source.centerX === target.centerX
          ? `M ${startX} ${source.centerY} C ${startX + 42} ${source.centerY}, ${startX + 42} ${target.centerY}, ${startX} ${target.centerY}`
          : `M ${startX} ${source.centerY} C ${controlX} ${source.centerY}, ${controlX} ${target.centerY}, ${endX} ${target.centerY}`;
      const labelX = (startX + endX) / 2;
      const labelY =
        (source.centerY + target.centerY) / 2 - (index % 2 === 0 ? 9 : -12);

      return `<g>
        <path d="${path}" fill="none" stroke="#71839e" stroke-width="2" marker-end="url(#arrow)"/>
        <text x="${labelX}" y="${labelY}" fill="#c6d1e0" font-size="10" font-family="Arial, sans-serif" text-anchor="middle" stroke="#0a1220" stroke-width="5" paint-order="stroke">${escapeXml(connection.label.slice(0, 32))}</text>
      </g>`;
    })
    .join("");

  const nodes = positions
    .map(({ component, x, y }) =>
      renderComponent(component, x, y, cardWidth),
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111d31"/>
        <stop offset="100%" stop-color="#080e19"/>
      </linearGradient>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#91a4be"/>
      </marker>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#background)"/>
    <circle cx="1090" cy="70" r="180" fill="#4f46e5" opacity="0.08"/>
    <text x="54" y="58" fill="#91a4be" font-size="13" font-family="Arial, sans-serif" letter-spacing="3">SYSTEM DESIGN · INTERVIEW HLD</text>
    <text x="54" y="112" fill="#f3f6fb" font-size="32" font-weight="700" font-family="Arial, sans-serif">${escapeXml(diagram.title.slice(0, 72))}</text>
    <line x1="54" y1="132" x2="1146" y2="132" stroke="#28364b"/>
    ${paths}
    ${nodes}
    <g font-family="Arial, sans-serif" font-size="11" fill="#a9b8cb">
      <circle cx="72" cy="632" r="5" fill="#60a5fa"/><text x="84" y="636">Client</text>
      <circle cx="164" cy="632" r="5" fill="#a78bfa"/><text x="176" y="636">Service</text>
      <circle cx="266" cy="632" r="5" fill="#34d399"/><text x="278" y="636">Data</text>
      <circle cx="346" cy="632" r="5" fill="#fbbf24"/><text x="358" y="636">Queue</text>
      <circle cx="442" cy="632" r="5" fill="#fb7185"/><text x="454" y="636">External</text>
      <text x="1146" y="636" text-anchor="end">High-level architecture</text>
    </g>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
};
