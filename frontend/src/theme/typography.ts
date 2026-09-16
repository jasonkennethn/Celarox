import { TextStyle, Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"',
    android: 'Roboto',
    web: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
  codeFont: Platform.select({
    ios: 'Menlo, "SF Mono", Courier',
    android: 'monospace',
    web: '"SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    default: 'monospace',
  }),

  // Font Sizes
  sizes: {
    xs: 11,
    sm: 13,
    md: 14,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 38,
    '5xl': 48,
  },

  // Font Weights
  weights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    heavy: '800' as TextStyle['fontWeight'],
  },
};
