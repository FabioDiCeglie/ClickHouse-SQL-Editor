import { render } from '@testing-library/react'
import { describe, it } from 'vitest'
import App from './App'

describe('Main entry point', () => {
  it('should render App component without crashing', () => {
    render(<App />)
  })
})