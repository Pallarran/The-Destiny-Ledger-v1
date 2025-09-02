/**
 * Sorcerer Metamagic Options for D&D 5e (2014 rules)
 * These are the magical techniques available to Sorcerers to modify their spells
 */

export interface MetamagicOption {
  id: string
  name: string
  description: string
  effect: string // Mechanical effect description
  sorceryPointCost: string // When and how many sorcery points are spent
  tags: string[] // For categorization (utility, damage, defense, etc.)
}

export const metamagicOptions: Record<string, MetamagicOption> = {
  careful_spell: {
    id: 'careful_spell',
    name: 'Careful Spell',
    description: 'When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell\'s full force.',
    effect: 'Choose creatures equal to your CHA modifier. They automatically succeed on their saving throw.',
    sorceryPointCost: '1 sorcery point',
    tags: ['utility', 'protection', 'aoe']
  },
  
  distant_spell: {
    id: 'distant_spell',
    name: 'Distant Spell',
    description: 'When you cast a spell that has a range of 5 feet or greater, you can spend 1 sorcery point to double the range of the spell.',
    effect: 'Double the range of spells with range 5+ feet. Touch spells become 30 feet range.',
    sorceryPointCost: '1 sorcery point',
    tags: ['utility', 'range', 'tactical']
  },
  
  empowered_spell: {
    id: 'empowered_spell',
    name: 'Empowered Spell',
    description: 'When you roll damage for a spell, you can spend 1 sorcery point to reroll a number of damage dice up to your Charisma modifier (minimum of one).',
    effect: 'Reroll damage dice up to CHA modifier, must use new rolls',
    sorceryPointCost: '1 sorcery point',
    tags: ['damage', 'reroll', 'enhancement']
  },
  
  extended_spell: {
    id: 'extended_spell',
    name: 'Extended Spell',
    description: 'When you cast a spell that has a duration of 1 minute or longer, you can spend 1 sorcery point to double its duration, to a maximum of 24 hours.',
    effect: 'Double spell duration (max 24 hours) for spells lasting 1+ minutes',
    sorceryPointCost: '1 sorcery point',
    tags: ['utility', 'duration', 'enhancement']
  },
  
  heightened_spell: {
    id: 'heightened_spell',
    name: 'Heightened Spell',
    description: 'When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery points to give one target of the spell disadvantage on its first saving throw.',
    effect: 'One target has disadvantage on their first saving throw against the spell',
    sorceryPointCost: '3 sorcery points',
    tags: ['control', 'disadvantage', 'save-or-suck']
  },
  
  quickened_spell: {
    id: 'quickened_spell',
    name: 'Quickened Spell',
    description: 'When you cast a spell that has a casting time of 1 action, you can spend 2 sorcery points to change the casting time to 1 bonus action for this casting.',
    effect: 'Cast 1 action spell as bonus action instead',
    sorceryPointCost: '2 sorcery points',
    tags: ['action-economy', 'tactical', 'bonus-action']
  },
  
  subtle_spell: {
    id: 'subtle_spell',
    name: 'Subtle Spell',
    description: 'When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components.',
    effect: 'Spell requires no verbal or somatic components (cannot be counterspelled)',
    sorceryPointCost: '1 sorcery point',
    tags: ['utility', 'stealth', 'counterspell-proof']
  },
  
  twinned_spell: {
    id: 'twinned_spell',
    name: 'Twinned Spell',
    description: 'When you cast a spell that targets only one creature and doesn\'t have a range of self, you can spend sorcery points to target a second creature in range with the same spell.',
    effect: 'Target an additional creature with single-target spells',
    sorceryPointCost: 'Sorcery points equal to spell level (1 for cantrips)',
    tags: ['utility', 'multi-target', 'efficiency']
  }
}

// Metamagic progression for Sorcerers
export const METAMAGIC_PROGRESSION = {
  3: 2,  // Level 3: Choose 2 metamagic options
  10: 3, // Level 10: Choose 1 more (3 total)
  17: 4  // Level 17: Choose 1 more (4 total)
}

export function getMetamagicProgression(level: number): { count: number } | null {
  if (level >= 17) return { count: 4 }
  if (level >= 10) return { count: 3 }
  if (level >= 3) return { count: 2 }
  return null
}

export function getAvailableMetamagicOptions(): MetamagicOption[] {
  return Object.values(metamagicOptions)
}