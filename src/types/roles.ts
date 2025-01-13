import { LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Workflow {
  title: string;
  steps: string[];
}

export interface RoleData {
  title: string;
  icon: LucideIcon;
  description: string;
  features: Feature[];
  workflows: Workflow[];
  responsibilities: string[];
  permissions: string[];
}

export type RoleDataMap = {
  [key: string]: RoleData;
};