import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/recorder')
  }, [navigate])

  return null
}
