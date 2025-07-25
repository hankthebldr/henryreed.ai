import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

// Base component props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// Size variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color variants
export type ColorVariant = 'default' | 'accent' | 'success' | 'attention' | 'danger';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

// Input states
export type InputState = 'default' | 'error' | 'success' | 'disabled';

// Animation preferences
export interface MotionSafeProps {
  /** Respect user's prefers-reduced-motion setting */
  respectMotionPreference?: boolean;
}

// Extended button props
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>, BaseProps, MotionSafeProps {
  variant?: ButtonVariant;
  size?: Size;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isFullWidth?: boolean;
}

// Extended input props
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseProps {
  size?: Size;
  state?: InputState;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isRequired?: boolean;
}

// Extended textarea props
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, BaseProps {
  size?: Size;
  state?: InputState;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// Extended select props
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>, BaseProps {
  size?: Size;
  state?: InputState;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  placeholder?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

// Modal props
export interface ModalProps extends BaseProps, MotionSafeProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

// Toast props
export interface ToastProps extends BaseProps, MotionSafeProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number | null; // null means persistent
  isClosable?: boolean;
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tag props
export interface TagProps extends BaseProps {
  variant?: ColorVariant;
  size?: Size;
  isClosable?: boolean;
  onClose?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Badge props
export interface BadgeProps extends BaseProps {
  variant?: ColorVariant;
  size?: Size;
  isPill?: boolean;
  isDot?: boolean;
}

// Grid props
export interface GridProps extends BaseProps {
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: Size;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

// Container props
export interface ContainerProps extends BaseProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  centerContent?: boolean;
  px?: Size;
  py?: Size;
}

// Section props
export interface SectionProps extends BaseProps {
  as?: 'section' | 'div' | 'article' | 'aside' | 'main' | 'header' | 'footer';
  py?: Size;
  px?: Size;
  bg?: string;
}

// Navigation props
export interface NavbarProps extends BaseProps {
  brand?: ReactNode;
  items?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    icon?: ReactNode;
  }>;
  actions?: ReactNode;
  isFixed?: boolean;
  position?: 'top' | 'bottom';
  variant?: 'default' | 'glass' | 'solid';
}

// Mobile drawer props
export interface MobileDrawerProps extends BaseProps, MotionSafeProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Breadcrumb props
export interface BreadcrumbProps extends BaseProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    isCurrentPage?: boolean;
    icon?: ReactNode;
  }>;
  separator?: ReactNode;
  maxItems?: number;
}

// Footer props
export interface FooterProps extends BaseProps {
  links?: Array<{
    label: string;
    href: string;
    isExternal?: boolean;
  }>;
  socialLinks?: Array<{
    label: string;
    href: string;
    icon: ReactNode;
  }>;
  copyright?: string;
  logo?: ReactNode;
}

// Code block props
export interface CodeBlockProps extends BaseProps {
  code: string;
  language?: string;
  theme?: 'dark' | 'light';
  showLineNumbers?: boolean;
  highlightLines?: number[];
  copyable?: boolean;
  filename?: string;
  maxHeight?: string;
}

// Markdown renderer props
export interface MarkdownRendererProps extends BaseProps {
  content: string;
  components?: Record<string, React.ComponentType<any>>;
  allowedElements?: string[];
  disallowedElements?: string[];
}
