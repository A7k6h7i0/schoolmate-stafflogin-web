import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSectionsForClass, listClasses } from '@/lib/api/classes'
import type { ClassLevel } from '@/types/entities'

export const CLASSES_QUERY_KEY = ['classes'] as const

export function useClasses() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: async () => {
      const previous = queryClient.getQueryData<ClassLevel[]>(CLASSES_QUERY_KEY)
      return listClasses(previous)
    },
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useSectionsForClass(classId: string | undefined, classes: ClassLevel[]) {
  if (!classId) return []
  return getSectionsForClass(classId, classes)
}
