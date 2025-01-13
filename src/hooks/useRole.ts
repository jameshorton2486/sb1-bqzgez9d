import { useParams } from 'react-router-dom';
import { roleData } from '../data/roleData';
import type { RoleData } from '../types/roles';

export function useRole(): { data: RoleData | null; error: string | null } {
  const { role } = useParams<{ role: string }>();

  if (!role) {
    return { data: null, error: 'No role specified' };
  }

  const data = roleData[role];

  if (!data) {
    return { data: null, error: `Invalid role: ${role}` };
  }

  return { data, error: null };
}