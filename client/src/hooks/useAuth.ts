import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { API_BASE_URL } from '@/lib/api';
import type { User } from '@shared/schema';

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: [`${API_BASE_URL}/auth/me`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `${API_BASE_URL}/auth/logout`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData([`${API_BASE_URL}/auth/me`], null);
      queryClient.clear();
      setLocation('/login');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    logout,
    error,
  };
}
