import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

type Post = {
  id: number;
  title: string;
  body: string;
};

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiFetch<Post[]>('/posts?_limit=5'),
  });
}
