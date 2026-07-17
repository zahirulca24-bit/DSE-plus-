import { ReactNode } from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string; // We'll map string names to Lucide icons dynamically
}

export type MarketStatus = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET';

export type ConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'SANDBOX';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface StatusBadgeProps {
  status: 'positive' | 'negative' | 'warning' | 'accent' | string;
  label: string;
  id?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
  id?: string;
}

export interface PageContainerProps {
  children: ReactNode;
  id?: string;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  id?: string;
}
