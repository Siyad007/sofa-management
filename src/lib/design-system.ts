import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const theme = {
  colors: {
    primary: {
      DEFAULT: '#0A84FF',
      dark: '#0070DD',
      light: '#5AC8FA',
    },
    system: {
      black: '#000000',
      darkGray: '#1C1C1E',
      gray: '#2C2C2E',
      lightGray: '#3A3A3C',
    },
    success: '#32D74B',
    warning: '#FF9F0A',
    danger: '#FF453A',
  },
  animation: {
    spring: {
      type: "spring",
      stiffness: 300,
      damping: 25
    },
    heavy: {
      type: "spring",
      stiffness: 150,
      damping: 20
    }
  }
};

export const haptic = {
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  heavy: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 20, 50]);
    }
  }
};
