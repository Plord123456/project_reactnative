/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0A84FF';
const tintColorDark = '#0A84FF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
// constants/Colors.ts

/**
 * Đây là nơi chúng ta định nghĩa màu nhấn (accent color) cho toàn bộ ứng dụng.
 * Bằng cách thay đổi hai hằng số này, bạn có thể dễ dàng "thay áo" cho toàn bộ ứng dụng
 * mà không cần chỉnh sửa ở nhiều nơi.
 */
// const tintColorLight = '#0A84FF'; // Một màu xanh dương hiện đại, rực rỡ nhưng không chói mắt (tương tự màu của Apple).
// const tintColorDark = '#0A84FF';  // Trong trường hợp này, ta có thể dùng chung màu tint cho cả hai theme vì nó đủ nổi bật trên nền tối.

export const AppColors = {
  primary: {
    50: '#EBF5FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // <-- Màu Primary chính
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // <-- Màu Accent chính
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
  success: "#10B981",   // Green  
error: "#EF4444",     // Red  
warning: "#F59E0B",   // Amber

text: {
  primary: "#1F2937",   // Dark gray for primary text  
  secondary: "#6B7280", // Medium gray for secondary text  
  tertiary: "#9CA3AF",  // Light gray for tertiary text  
  inverse: "#FFFFFF",   // White text for dark backgrounds  
},
background: {
  primary: "#FFFFFF",   // White  
  secondary: "#F5F5F7", // Very light gray  
  tertiary: "#EEEEEE",  // Light gray  
},

};
export default AppColors;