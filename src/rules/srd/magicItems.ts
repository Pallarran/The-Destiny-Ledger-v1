import type { MagicItem } from '../types'

export const magicItems: Record<string, MagicItem> = {
  // Common Magic Items (No Attunement)
  healing_potion: {
    id: 'healing_potion',
    name: 'Potion of Healing',
    rarity: 'common',
    attunement: false,
    description: 'You regain 2d4 + 2 hit points when you drink this potion.',
    category: 'potion'
  },

  // Uncommon Magic Items
  bag_of_holding: {
    id: 'bag_of_holding',
    name: 'Bag of Holding',
    rarity: 'uncommon',
    attunement: false,
    description: 'This bag has an interior space considerably larger than its outside dimensions.',
    category: 'wondrous'
  },

  cloak_of_protection: {
    id: 'cloak_of_protection',
    name: 'Cloak of Protection',
    rarity: 'uncommon',
    attunement: true,
    description: 'You gain a +1 bonus to AC and saving throws while you wear this cloak.',
    category: 'wondrous',
    effects: {
      acBonus: 1,
      savingThrowBonus: 1
    }
  },

  bracers_of_archery: {
    id: 'bracers_of_archery',
    name: 'Bracers of Archery',
    rarity: 'uncommon',
    attunement: true,
    description: 'While wearing these bracers, you have proficiency with the longbow and shortbow, and you gain a +2 bonus to damage rolls on ranged attacks made with such weapons.',
    category: 'wondrous',
    effects: {
      rangedDamageBonus: 2
    }
  },

  gauntlets_of_ogre_power: {
    id: 'gauntlets_of_ogre_power',
    name: 'Gauntlets of Ogre Power',
    rarity: 'uncommon',
    attunement: true,
    description: 'Your Strength score is 19 while you wear these gauntlets. They have no effect on you if your Strength is already 19 or higher.',
    category: 'wondrous',
    effects: {
      abilityScoreOverride: { STR: 19 }
    }
  },

  // Rare Magic Items
  flame_tongue: {
    id: 'flame_tongue',
    name: 'Flame Tongue',
    rarity: 'rare',
    attunement: true,
    description: 'You can use a bonus action to speak this magic sword\'s command word, causing flames to erupt from the blade. These flames shed bright light in a 40-foot radius and dim light for an additional 40 feet. While the sword is ablaze, it deals an extra 2d6 fire damage to any target it hits.',
    category: 'weapon',
    effects: {
      onHitDamage: [{
        count: 2,
        die: 6,
        bonus: 0,
        type: 'fire'
      }]
    }
  },

  belt_of_giant_strength_hill: {
    id: 'belt_of_giant_strength_hill',
    name: 'Belt of Hill Giant Strength',
    rarity: 'rare',
    attunement: true,
    description: 'Your Strength score is 21 while you wear this belt. It has no effect on you if your Strength is already 21 or higher.',
    category: 'wondrous',
    effects: {
      abilityScoreOverride: { STR: 21 }
    }
  },

  cloak_of_elvenkind: {
    id: 'cloak_of_elvenkind',
    name: 'Cloak of Elvenkind',
    rarity: 'uncommon',
    attunement: true,
    description: 'While you wear this cloak with its hood up, Wisdom (Perception) checks made to see you have disadvantage, and you have advantage on Dexterity (Stealth) checks.',
    category: 'wondrous'
  },

  // Very Rare Magic Items
  belt_of_giant_strength_stone: {
    id: 'belt_of_giant_strength_stone',
    name: 'Belt of Stone Giant Strength',
    rarity: 'very_rare',
    attunement: true,
    description: 'Your Strength score is 23 while you wear this belt. It has no effect on you if your Strength is already 23 or higher.',
    category: 'wondrous',
    effects: {
      abilityScoreOverride: { STR: 23 }
    }
  },

  // Legendary Magic Items
  belt_of_giant_strength_storm: {
    id: 'belt_of_giant_strength_storm',
    name: 'Belt of Storm Giant Strength',
    rarity: 'legendary',
    attunement: true,
    description: 'Your Strength score is 29 while you wear this belt. It has no effect on you if your Strength is already 29 or higher.',
    category: 'wondrous',
    effects: {
      abilityScoreOverride: { STR: 29 }
    }
  },

  // Artifacts
  deck_of_many_things: {
    id: 'deck_of_many_things',
    name: 'Deck of Many Things',
    rarity: 'legendary',
    attunement: false,
    description: 'Usually found in a box or pouch, this deck contains a number of cards made of ivory or vellum.',
    category: 'wondrous'
  }
}