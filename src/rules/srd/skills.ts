// D&D 5e SRD Skills

export interface Skill {
  name: string
  ability: string // STR, DEX, CON, INT, WIS, CHA
  description: string
}

export const skills: Record<string, Skill> = {
  acrobatics: {
    name: 'Acrobatics',
    ability: 'DEX',
    description: 'Balance, tumbling, and agile movement'
  },
  animalHandling: {
    name: 'Animal Handling',
    ability: 'WIS',
    description: 'Calming, understanding, and controlling animals'
  },
  arcana: {
    name: 'Arcana',
    ability: 'INT',
    description: 'Magic lore, spell identification, and magical knowledge'
  },
  athletics: {
    name: 'Athletics',
    ability: 'STR',
    description: 'Jumping, climbing, swimming, and physical exertion'
  },
  deception: {
    name: 'Deception',
    ability: 'CHA',
    description: 'Lying, misleading, and disguising the truth'
  },
  history: {
    name: 'History',
    ability: 'INT',
    description: 'Historical knowledge and lore'
  },
  insight: {
    name: 'Insight',
    ability: 'WIS',
    description: 'Reading people, detecting lies, and understanding motives'
  },
  intimidation: {
    name: 'Intimidation',
    ability: 'CHA',
    description: 'Threatening and coercing others'
  },
  investigation: {
    name: 'Investigation',
    ability: 'INT',
    description: 'Searching for clues, making deductions, and research'
  },
  medicine: {
    name: 'Medicine',
    ability: 'WIS',
    description: 'Stabilizing the dying, diagnosing illnesses, and medical knowledge'
  },
  nature: {
    name: 'Nature',
    ability: 'INT',
    description: 'Knowledge about terrain, plants, animals, and weather'
  },
  perception: {
    name: 'Perception',
    ability: 'WIS',
    description: 'Noticing things, general awareness, and spotting hidden objects'
  },
  performance: {
    name: 'Performance',
    ability: 'CHA',
    description: 'Entertaining through music, dance, acting, or storytelling'
  },
  persuasion: {
    name: 'Persuasion',
    ability: 'CHA',
    description: 'Influencing others through diplomacy and social grace'
  },
  religion: {
    name: 'Religion',
    ability: 'INT',
    description: 'Knowledge of deities, rites, prayers, and religious symbols'
  },
  sleightOfHand: {
    name: 'Sleight of Hand',
    ability: 'DEX',
    description: 'Pickpocketing, concealing objects, and manual trickery'
  },
  stealth: {
    name: 'Stealth',
    ability: 'DEX',
    description: 'Hiding, moving silently, and avoiding detection'
  },
  survival: {
    name: 'Survival',
    ability: 'WIS',
    description: 'Tracking, hunting, navigating, and surviving in the wild'
  }
}

// Helper to get all skills as an array
export const getAllSkills = (): (Skill & { id: string })[] => 
  Object.entries(skills).map(([id, skill]) => ({ ...skill, id }))

// Helper to get skill by name
export const getSkillByName = (name: string): Skill | undefined => {
  return Object.values(skills).find(skill => 
    skill.name.toLowerCase() === name.toLowerCase()
  )
}

// Proficiency bonus by character level
export const getProficiencyBonus = (level: number): number => {
  if (level <= 4) return 2
  if (level <= 8) return 3
  if (level <= 12) return 4
  if (level <= 16) return 5
  return 6
}