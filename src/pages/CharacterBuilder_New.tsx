import { CharacterBuilder } from '../components/builder/CharacterBuilder'

export function CharacterBuilderNew() {
  console.log('CharacterBuilderNew rendering')
  return (
    <div>
      <h1>DEBUG: CharacterBuilderNew Component</h1>
      <CharacterBuilder />
    </div>
  )
}