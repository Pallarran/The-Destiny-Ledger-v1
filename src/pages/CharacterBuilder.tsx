import { CharacterBuilder as Phase3CharacterBuilder } from '../components/builder/CharacterBuilder'
import ErrorBoundary from '../components/ErrorBoundary'

export function CharacterBuilder() {
  return (
    <ErrorBoundary>
      <Phase3CharacterBuilder />
    </ErrorBoundary>
  )
}