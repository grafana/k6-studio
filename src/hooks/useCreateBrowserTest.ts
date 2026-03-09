import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'

export function useCreateBrowserTest() {
  const navigate = useNavigate()

  return useCallback(() => {
    navigate(getRoutePath('newBrowserTest'))
  }, [navigate])
}
