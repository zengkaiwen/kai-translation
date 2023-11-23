import { defineConfig } from 'unocss';
import PresetIcons from '@unocss/preset-icons';

export default defineConfig({
  rules: [
    ['flex', { display: 'flex' }],
    ['flex-row', { 'flex-direction': 'row' }],
    ['flex-col', { 'flex-direction': 'column' }],
    ['items-start', { 'align-items': 'flex-start' }],
    ['items-end', { 'align-items': 'flex-end' }],
    ['items-center', { 'align-items': 'center' }],
    ['items-stretch', { 'align-items': 'stretch' }],
    ['items-baseline', { 'align-items': 'baseline' }],
    ['justify-start', { 'justify-content': 'flex-start' }],
    ['justify-end', { 'justify-content': 'flex-end' }],
    ['justify-center', { 'justify-content': 'center' }],
    ['justify-between', { 'justify-content': 'space-between' }],
  ],
  presets: [
    PresetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        cursor: 'pointer',
      },
    }),
  ],
});
