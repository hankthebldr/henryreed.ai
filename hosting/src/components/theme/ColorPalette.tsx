'use client';

import React from 'react';

interface ColorSwatchProps {
  color: string;
  name: string;
  className?: string;
}

function ColorSwatch({ color, name, className }: ColorSwatchProps) {
  return (
    <div className=\"flex flex-col items-center space-y-2\">
      <div 
        className={`w-16 h-16 rounded-lg border border-border-default shadow-sm ${className}`}
        style={{ backgroundColor: `var(${color})` }}
      />
      <div className=\"text-center\">
        <div className=\"text-sm font-mono text-fg-default\">{name}</div>
        <div className=\"text-xs text-fg-muted\">{color}</div>
      </div>
    </div>
  );
}

interface ColorGroupProps {
  title: string;
  colors: Array<{ name: string; variable: string; className?: string }>;
}

function ColorGroup({ title, colors }: ColorGroupProps) {
  return (
    <div className=\"space-y-4\">
      <h3 className=\"text-lg font-semibold text-fg-default\">{title}</h3>
      <div className=\"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4\">
        {colors.map((color) => (
          <ColorSwatch
            key={color.name}
            color={color.variable}
            name={color.name}
            className={color.className}
          />
        ))}
      </div>
    </div>
  );
}

export function ColorPalette() {
  const canvasColors = [
    { name: 'Default', variable: '--color-canvas-default' },
    { name: 'Overlay', variable: '--color-canvas-overlay' },
    { name: 'Inset', variable: '--color-canvas-inset' },
    { name: 'Subtle', variable: '--color-canvas-subtle' },
  ];

  const foregroundColors = [
    { name: 'Default', variable: '--color-fg-default' },
    { name: 'Muted', variable: '--color-fg-muted' },
    { name: 'Subtle', variable: '--color-fg-subtle' },
    { name: 'On Emphasis', variable: '--color-fg-on-emphasis' },
  ];

  const borderColors = [
    { name: 'Default', variable: '--color-border-default' },
    { name: 'Muted', variable: '--color-border-muted' },
    { name: 'Subtle', variable: '--color-border-subtle' },
  ];

  const accentColors = [
    { name: 'Foreground', variable: '--color-accent-fg' },
    { name: 'Emphasis', variable: '--color-accent-emphasis' },
    { name: 'Muted', variable: '--color-accent-muted' },
    { name: 'Subtle', variable: '--color-accent-subtle' },
  ];

  const successColors = [
    { name: 'Foreground', variable: '--color-success-fg' },
    { name: 'Emphasis', variable: '--color-success-emphasis' },
    { name: 'Muted', variable: '--color-success-muted' },
    { name: 'Subtle', variable: '--color-success-subtle' },
  ];

  const attentionColors = [
    { name: 'Foreground', variable: '--color-attention-fg' },
    { name: 'Emphasis', variable: '--color-attention-emphasis' },
    { name: 'Muted', variable: '--color-attention-muted' },
    { name: 'Subtle', variable: '--color-attention-subtle' },
  ];

  const dangerColors = [
    { name: 'Foreground', variable: '--color-danger-fg' },
    { name: 'Emphasis', variable: '--color-danger-emphasis' },
    { name: 'Muted', variable: '--color-danger-muted' },
    { name: 'Subtle', variable: '--color-danger-subtle' },
  ];

  const terminalColors = [
    { name: 'Green', variable: '--color-terminal-green' },
    { name: 'Amber', variable: '--color-terminal-amber' },
    { name: 'Cyan', variable: '--color-terminal-cyan' },
    { name: 'Red', variable: '--color-terminal-red' },
    { name: 'Blue', variable: '--color-terminal-blue' },
    { name: 'Purple', variable: '--color-terminal-purple' },
  ];

  return (
    <div className=\"space-y-8 p-6 bg-canvas-default min-h-screen\">
      <div className=\"space-y-2\">
        <h1 className=\"text-3xl font-bold text-fg-default\">Theme Color Palette</h1>
        <p className=\"text-fg-muted\">
          Complete color system based on GitHub-dark with accessible contrast ratios
        </p>
      </div>

      <ColorGroup title=\"Canvas (Backgrounds)\" colors={canvasColors} />
      <ColorGroup title=\"Foreground (Text)\" colors={foregroundColors} />
      <ColorGroup title=\"Borders\" colors={borderColors} />
      <ColorGroup title=\"Accent\" colors={accentColors} />
      <ColorGroup title=\"Success\" colors={successColors} />
      <ColorGroup title=\"Attention\" colors={attentionColors} />
      <ColorGroup title=\"Danger\" colors={dangerColors} />
      <ColorGroup title=\"Terminal\" colors={terminalColors} />
    </div>
  );
}
