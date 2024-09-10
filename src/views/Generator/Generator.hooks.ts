import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { useToast } from '@/store/ui/useToast'
import { loadGenerator, saveGenerator } from './Generator.utils'
import { getRoutePath } from '@/routeMap'

export function useGeneratorParams() {
  const { fileName, ruleId } = useParams()
  invariant(fileName, 'fileName is required')

  return {
    fileName,
    ruleId,
  }
}

export function useGeneratorFile() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { fileName } = useGeneratorParams()
  const showToast = useToast()
  const navigate = useNavigate()

  useSetWindowTitle(fileName)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      try {
        await loadGenerator(fileName)
      } catch (error) {
        console.log('Failed to load generator', error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [fileName, showToast])

  useEffect(() => {
    if (!hasError) return

    showToast({
      title: 'Failed to load generator',
      status: 'error',
    })
    navigate(getRoutePath('home'))
  }, [hasError, navigate, showToast])

  const onSave = async () => {
    try {
      await saveGenerator(fileName)
      showToast({ title: 'Generator saved', status: 'success' })
    } catch (error) {
      showToast({
        title: 'Failed to save generator',
        status: 'error',
      })
      return
    }
  }

  return { isLoading, onSave }
}
