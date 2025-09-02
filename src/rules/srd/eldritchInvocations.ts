export interface EldritchInvocation {
  id: string
  name: string
  description: string
  effect: string
  prerequisites?: string
  tags: string[]
}

export const eldritchInvocations: Record<string, EldritchInvocation> = {
  agonizing_blast: {
    id: 'agonizing_blast',
    name: 'Agonizing Blast',
    description: 'When you cast eldritch blast, add your Charisma modifier to the damage it deals on a hit.',
    effect: 'Add CHA modifier to eldritch blast damage',
    prerequisites: 'eldritch blast cantrip',
    tags: ['damage', 'cantrip-enhancement']
  },
  armor_of_shadows: {
    id: 'armor_of_shadows',
    name: 'Armor of Shadows',
    description: 'You can cast mage armor on yourself at will, without expending a spell slot.',
    effect: 'Mage armor at will',
    tags: ['defense', 'utility', 'at-will']
  },
  beast_speech: {
    id: 'beast_speech',
    name: 'Beast Speech',
    description: 'You can cast speak with animals at will, without expending a spell slot.',
    effect: 'Speak with animals at will',
    tags: ['utility', 'social', 'at-will']
  },
  beguiling_influence: {
    id: 'beguiling_influence',
    name: 'Beguiling Influence',
    description: 'You gain proficiency in the Deception and Persuasion skills.',
    effect: 'Proficiency in Deception and Persuasion',
    tags: ['social', 'proficiency']
  },
  book_of_ancient_secrets: {
    id: 'book_of_ancient_secrets',
    name: 'Book of Ancient Secrets',
    description: 'You can now inscribe magical rituals in a Book of Shadows. Choose two 1st-level spells that have the ritual tag from any class\'s spell list. You can cast those spells as rituals.',
    effect: 'Learn 2 ritual spells, can learn more',
    prerequisites: 'Pact of the Tome feature',
    tags: ['utility', 'spells', 'ritual', 'pact-tome']
  },
  chains_of_carceri: {
    id: 'chains_of_carceri',
    name: 'Chains of Carceri',
    description: 'You can cast hold monster at will—targeting a celestial, fiend, or elemental—without expending a spell slot. You must finish a long rest before you can use this invocation on the same creature again.',
    effect: 'Hold monster at will vs celestial/fiend/elemental',
    prerequisites: '15th level, Pact of the Chain feature',
    tags: ['control', 'at-will', 'pact-chain']
  },
  devil_sight: {
    id: 'devil_sight',
    name: 'Devil\'s Sight',
    description: 'You can see normally in darkness, both magical and nonmagical, to a distance of 120 feet.',
    effect: 'See in magical/nonmagical darkness 120 ft',
    tags: ['utility', 'vision', 'exploration']
  },
  eldritch_sight: {
    id: 'eldritch_sight',
    name: 'Eldritch Sight',
    description: 'You can cast detect magic at will, without expending a spell slot.',
    effect: 'Detect magic at will',
    tags: ['utility', 'detection', 'at-will']
  },
  eldritch_spear: {
    id: 'eldritch_spear',
    name: 'Eldritch Spear',
    description: 'When you cast eldritch blast, its range is 300 feet.',
    effect: 'Eldritch blast range increased to 300 ft',
    prerequisites: 'eldritch blast cantrip',
    tags: ['damage', 'cantrip-enhancement', 'range']
  },
  eyes_of_the_rune_keeper: {
    id: 'eyes_of_the_rune_keeper',
    name: 'Eyes of the Rune Keeper',
    description: 'You can read all writing.',
    effect: 'Read all writing',
    tags: ['utility', 'exploration']
  },
  fiendish_vigor: {
    id: 'fiendish_vigor',
    name: 'Fiendish Vigor',
    description: 'You can cast false life on yourself at will as a 1st-level spell, without expending a spell slot.',
    effect: 'False life at will (1st level)',
    tags: ['defense', 'temp-hp', 'at-will']
  },
  gaze_of_two_minds: {
    id: 'gaze_of_two_minds',
    name: 'Gaze of Two Minds',
    description: 'You can use your action to touch a willing humanoid and perceive through its senses until the end of your next turn.',
    effect: 'Perceive through willing humanoid\'s senses',
    tags: ['utility', 'exploration']
  },
  lifedrinker: {
    id: 'lifedrinker',
    name: 'Lifedrinker',
    description: 'When you hit a creature with your pact weapon, the creature takes extra necrotic damage equal to your Charisma modifier.',
    effect: 'Pact weapon deals +CHA necrotic damage',
    prerequisites: '12th level, Pact of the Blade feature',
    tags: ['damage', 'pact-blade', 'necrotic']
  },
  mask_of_many_faces: {
    id: 'mask_of_many_faces',
    name: 'Mask of Many Faces',
    description: 'You can cast disguise self at will, without expending a spell slot.',
    effect: 'Disguise self at will',
    tags: ['utility', 'stealth', 'at-will']
  },
  master_of_myriad_forms: {
    id: 'master_of_myriad_forms',
    name: 'Master of Myriad Forms',
    description: 'You can cast alter self at will, without expending a spell slot.',
    effect: 'Alter self at will',
    prerequisites: '15th level',
    tags: ['utility', 'transformation', 'at-will']
  },
  misty_visions: {
    id: 'misty_visions',
    name: 'Misty Visions',
    description: 'You can cast silent image at will, without expending a spell slot.',
    effect: 'Silent image at will',
    tags: ['utility', 'illusion', 'at-will']
  },
  one_with_shadows: {
    id: 'one_with_shadows',
    name: 'One with Shadows',
    description: 'When you are in an area of dim light or darkness, you can use your action to become invisible until you move or take an action or a reaction.',
    effect: 'Become invisible in dim light/darkness',
    prerequisites: '5th level',
    tags: ['stealth', 'invisibility']
  },
  otherworldly_leap: {
    id: 'otherworldly_leap',
    name: 'Otherworldly Leap',
    description: 'You can cast jump on yourself at will, without expending a spell slot.',
    effect: 'Jump on self at will',
    prerequisites: '9th level',
    tags: ['utility', 'mobility', 'at-will']
  },
  repelling_blast: {
    id: 'repelling_blast',
    name: 'Repelling Blast',
    description: 'When you hit a creature with eldritch blast, you can push the creature up to 10 feet away from you in a straight line.',
    effect: 'Eldritch blast pushes targets 10 ft',
    prerequisites: 'eldritch blast cantrip',
    tags: ['control', 'cantrip-enhancement', 'forced-movement']
  },
  sculptor_of_flesh: {
    id: 'sculptor_of_flesh',
    name: 'Sculptor of Flesh',
    description: 'You can cast polymorph once using a warlock spell slot. You can\'t do so again until you finish a long rest.',
    effect: 'Polymorph 1/long rest',
    prerequisites: '7th level',
    tags: ['utility', 'transformation']
  },
  sign_of_ill_omen: {
    id: 'sign_of_ill_omen',
    name: 'Sign of Ill Omen',
    description: 'You can cast bestow curse once using a warlock spell slot. You can\'t do so again until you finish a long rest.',
    effect: 'Bestow curse 1/long rest',
    prerequisites: '5th level',
    tags: ['debuff', 'control']
  },
  thief_of_five_fates: {
    id: 'thief_of_five_fates',
    name: 'Thief of Five Fates',
    description: 'You can cast bane once using a warlock spell slot. You can\'t do so again until you finish a long rest.',
    effect: 'Bane 1/long rest',
    tags: ['debuff', 'control']
  },
  thirsting_blade: {
    id: 'thirsting_blade',
    name: 'Thirsting Blade',
    description: 'You can attack with your pact weapon twice, instead of once, whenever you take the Attack action on your turn.',
    effect: 'Extra Attack with pact weapon',
    prerequisites: '5th level, Pact of the Blade feature',
    tags: ['damage', 'pact-blade', 'extra-attack']
  },
  visions_of_distant_realms: {
    id: 'visions_of_distant_realms',
    name: 'Visions of Distant Realms',
    description: 'You can cast arcane eye at will, without expending a spell slot.',
    effect: 'Arcane eye at will',
    prerequisites: '15th level',
    tags: ['utility', 'exploration', 'at-will']
  },
  voice_of_the_chain_master: {
    id: 'voice_of_the_chain_master',
    name: 'Voice of the Chain Master',
    description: 'You can communicate telepathically with your familiar and perceive through your familiar\'s senses as long as you are on the same plane of existence.',
    effect: 'Telepathic communication with familiar, perceive through senses',
    prerequisites: 'Pact of the Chain feature',
    tags: ['utility', 'pact-chain', 'communication']
  },
  whispers_of_the_grave: {
    id: 'whispers_of_the_grave',
    name: 'Whispers of the Grave',
    description: 'You can cast speak with dead at will, without expending a spell slot.',
    effect: 'Speak with dead at will',
    prerequisites: '9th level',
    tags: ['utility', 'exploration', 'at-will']
  }
}

export function getInvocationProgression(level: number): number {
  if (level < 2) return 0
  if (level < 5) return 2
  if (level < 7) return 3
  if (level < 9) return 4
  if (level < 12) return 5
  if (level < 15) return 6
  if (level < 18) return 7
  return 8
}

export function isInvocationAvailable(invocation: EldritchInvocation, level: number, pactBoon?: string): boolean {
  if (!invocation.prerequisites) return true
  
  const prereqs = invocation.prerequisites.toLowerCase()
  
  // Check level prerequisites
  if (prereqs.includes('5th level') && level < 5) return false
  if (prereqs.includes('7th level') && level < 7) return false
  if (prereqs.includes('9th level') && level < 9) return false
  if (prereqs.includes('12th level') && level < 12) return false
  if (prereqs.includes('15th level') && level < 15) return false
  
  // Check pact boon prerequisites
  if (prereqs.includes('pact of the blade') && pactBoon !== 'blade') return false
  if (prereqs.includes('pact of the chain') && pactBoon !== 'chain') return false
  if (prereqs.includes('pact of the tome') && pactBoon !== 'tome') return false
  
  // Note: eldritch blast cantrip prerequisite is assumed to be met for all warlocks
  
  return true
}