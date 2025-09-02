export interface PactBoon {
  id: string
  name: string
  description: string
  benefits: string[]
  relatedInvocations: string[]
  tags: string[]
}

export const pactBoons: Record<string, PactBoon> = {
  blade: {
    id: 'blade',
    name: 'Pact of the Blade',
    description: 'Your patron gives you a supernatural weapon that takes the form of any melee weapon of your choice.',
    benefits: [
      'Create a pact weapon as an action',
      'Weapon counts as magical for overcoming resistance',
      'Cannot be disarmed of the weapon unless incapacitated',
      'Can perform bonding ritual with magic weapon (1 hour)'
    ],
    relatedInvocations: [
      'thirsting_blade',
      'lifedrinker',
      'improved_pact_weapon'
    ],
    tags: ['martial', 'weapon', 'melee']
  },
  chain: {
    id: 'chain',
    name: 'Pact of the Chain',
    description: 'You learn the find familiar spell and can cast it as a ritual without it counting against your number of spells known.',
    benefits: [
      'Learn find familiar spell (ritual)',
      'Familiar can be imp, pseudodragon, quasit, or sprite',
      'Can attack through familiar using your action',
      'Familiar can take Attack action',
      'When familiar dies, it reappears after 1 hour without material components'
    ],
    relatedInvocations: [
      'voice_of_the_chain_master',
      'chains_of_carceri',
      'gift_of_the_ever_living_ones'
    ],
    tags: ['familiar', 'summoning', 'utility']
  },
  tome: {
    id: 'tome',
    name: 'Pact of the Tome',
    description: 'Your patron gives you a grimoire called a Book of Shadows containing mystical knowledge.',
    benefits: [
      'Gain Book of Shadows grimoire',
      'Choose 3 cantrips from any class spell lists',
      'Cantrips count as warlock spells for you',
      'Can inscribe ritual spells in the book'
    ],
    relatedInvocations: [
      'book_of_ancient_secrets',
      'aspect_of_the_moon',
      'far_scribe'
    ],
    tags: ['spells', 'cantrips', 'ritual', 'knowledge']
  }
}

export function getPactBoonLevel(): number {
  return 3
}

export function isPactBoonAvailable(warlockLevel: number): boolean {
  return warlockLevel >= 3
}