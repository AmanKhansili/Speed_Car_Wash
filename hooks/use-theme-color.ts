/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import Colors from '@/constants/colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // App currently uses a single flat color palette (no light/dark variants),
  // so we just fall back to the prop override if given, else the base color.
  const colorFromProps = props.light ?? props.dark;

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[colorName];
}