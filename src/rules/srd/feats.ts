import type { Feat } from '../types'

export const feats: Record<string, Feat> = {
  great_weapon_master: {
    id: 'great_weapon_master',
    name: 'Great Weapon Master',
    description: 'You have learned to put the weight of a weapon to your advantage, letting its momentum empower your strikes.',
    features: [
      {
        id: 'gwm_bonus_attack',
        name: 'Bonus Attack',
        description: 'On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action.',
        source: 'Great Weapon Master'
      },
      {
        id: 'gwm_power_attack',
        name: 'Power Attack',
        description: 'Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attacks damage roll.',
        source: 'Great Weapon Master',
        rulesKey: 'gwm_power_attack'
      }
    ]
  },
  sharpshooter: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'You have mastered ranged weapons and can make shots that others find impossible.',
    features: [
      {
        id: 'ss_long_range',
        name: 'Long Range',
        description: 'Attacking at long range doesn\'t impose disadvantage on your ranged weapon attack rolls.',
        source: 'Sharpshooter'
      },
      {
        id: 'ss_cover',
        name: 'Ignore Cover',
        description: 'Your ranged weapon attacks ignore half cover and three-quarters cover.',
        source: 'Sharpshooter'
      },
      {
        id: 'ss_power_attack',
        name: 'Power Attack',
        description: 'Before you make an attack with a ranged weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage roll.',
        source: 'Sharpshooter',
        rulesKey: 'ss_power_attack'
      }
    ]
  },
  crossbow_expert: {
    id: 'crossbow_expert',
    name: 'Crossbow Expert',
    description: 'Thanks to extensive practice with the crossbow, you gain the following benefits.',
    features: [
      {
        id: 'ce_ignore_loading',
        name: 'Ignore Loading',
        description: 'You ignore the loading quality of crossbows with which you are proficient.',
        source: 'Crossbow Expert'
      },
      {
        id: 'ce_point_blank',
        name: 'Point Blank',
        description: 'Being within 5 feet of a hostile creature doesn\'t impose disadvantage on your ranged attack rolls.',
        source: 'Crossbow Expert'
      },
      {
        id: 'ce_bonus_attack',
        name: 'Hand Crossbow Bonus Attack',
        description: 'When you use the Attack action and attack with a one-handed weapon, you can use a bonus action to attack with a hand crossbow you are holding.',
        source: 'Crossbow Expert',
        rulesKey: 'crossbow_expert_bonus'
      }
    ]
  },
  polearm_master: {
    id: 'polearm_master',
    name: 'Polearm Master',
    description: 'You can keep your enemies at bay with reach weapons.',
    features: [
      {
        id: 'pam_bonus_attack',
        name: 'Bonus Attack',
        description: 'When you take the Attack action and attack with only a glaive, halberd, quarterstaff, or spear, you can use a bonus action to make a melee attack with the opposite end of the weapon.',
        source: 'Polearm Master',
        rulesKey: 'polearm_master_bonus'
      },
      {
        id: 'pam_opportunity_attack',
        name: 'Opportunity Attack',
        description: 'While you are wielding a glaive, halberd, pike, or quarterstaff, other creatures provoke an opportunity attack from you when they enter your reach.',
        source: 'Polearm Master'
      }
    ]
  },
  lucky: {
    id: 'lucky',
    name: 'Lucky',
    description: 'You have inexplicable luck that seems to kick in at just the right moment.',
    features: [
      {
        id: 'lucky_points',
        name: 'Lucky Points',
        description: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend one luck point to roll an additional d20.',
        source: 'Lucky'
      }
    ]
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    description: 'You have mastered techniques to take advantage of every drop in any enemy\'s guard.',
    features: [
      {
        id: 'sentinel_opportunity_stop',
        name: 'Stop Movement',
        description: 'When you hit a creature with an opportunity attack, the creature\'s speed becomes 0 for the rest of the turn.',
        source: 'Sentinel'
      },
      {
        id: 'sentinel_disengage_ignore',
        name: 'Ignore Disengage',
        description: 'Creatures provoke opportunity attacks from you even if they take the Disengage action before leaving your reach.',
        source: 'Sentinel'
      },
      {
        id: 'sentinel_ally_protection',
        name: 'Protect Allies',
        description: 'When a creature within 5 feet of you is targeted by an attack from a creature other than you, you can use your reaction to make a melee weapon attack against the attacking creature.',
        source: 'Sentinel'
      }
    ]
  },
  // Half-feats (provide ability score increases)
  resilient: {
    id: 'resilient',
    name: 'Resilient',
    description: 'Choose one ability score. You gain proficiency in saving throws using the chosen ability.',
    abilityScoreIncrease: {
      choices: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
      count: 1
    },
    features: [
      {
        id: 'resilient_save_prof',
        name: 'Saving Throw Proficiency',
        description: 'You gain proficiency in saving throws using the chosen ability.',
        source: 'Resilient'
      }
    ]
  },
  fey_touched: {
    id: 'fey_touched',
    name: 'Fey Touched',
    description: 'Your exposure to the Feywild\'s magic has changed you.',
    abilityScoreIncrease: {
      choices: ['INT', 'WIS', 'CHA'],
      count: 1
    },
    features: [
      {
        id: 'fey_touched_spells',
        name: 'Fey Magic',
        description: 'You learn the misty step spell and one 1st-level spell of your choice from the divination or enchantment school of magic.',
        source: 'Fey Touched'
      }
    ]
  },
  elven_accuracy: {
    id: 'elven_accuracy',
    name: 'Elven Accuracy',
    description: 'The accuracy of elves is legendary among other races.',
    prerequisites: ['Elf or half-elf'],
    abilityScoreIncrease: {
      choices: ['DEX', 'INT', 'WIS', 'CHA'],
      count: 1
    },
    features: [
      {
        id: 'elven_accuracy_reroll',
        name: 'Elven Accuracy',
        description: 'Whenever you have advantage on an attack roll using Dexterity, Intelligence, Wisdom, or Charisma, you can reroll one of the dice once.',
        source: 'Elven Accuracy',
        rulesKey: 'elven_accuracy'
      }
    ]
  },
  piercer: {
    id: 'piercer',
    name: 'Piercer',
    description: 'You have achieved a penetrating precision in combat.',
    abilityScoreIncrease: {
      choices: ['STR', 'DEX'],
      count: 1
    },
    features: [
      {
        id: 'piercer_reroll',
        name: 'Pierce Deeper',
        description: 'Once per turn, when you hit a creature with an attack that deals piercing damage, you can reroll one of the attack\'s damage dice.',
        source: 'Piercer'
      },
      {
        id: 'piercer_crit',
        name: 'Critical Pierce',
        description: 'When you score a critical hit that deals piercing damage to a creature, you can roll one additional damage die when determining the extra piercing damage the target takes.',
        source: 'Piercer'
      }
    ]
  },
  alert: {
    id: 'alert',
    name: 'Alert',
    description: 'Always on the lookout for danger, you gain the following benefits.',
    features: [
      {
        id: 'alert_initiative',
        name: 'Initiative Bonus',
        description: 'You gain a +5 bonus to initiative.',
        source: 'Alert'
      },
      {
        id: 'alert_surprise',
        name: 'Can\'t Be Surprised',
        description: 'You can\'t be surprised while you are conscious.',
        source: 'Alert'
      },
      {
        id: 'alert_hidden',
        name: 'No Advantage From Hidden',
        description: 'Other creatures don\'t gain advantage on attack rolls against you as a result of being unseen by you.',
        source: 'Alert'
      }
    ]
  },
  athlete: {
    id: 'athlete',
    name: 'Athlete',
    description: 'You have undergone extensive physical training.',
    features: [
      {
        id: 'athlete_asi',
        name: 'Ability Score Increase',
        description: 'Increase your Strength or Dexterity by 1, to a maximum of 20.',
        source: 'Athlete'
      },
      {
        id: 'athlete_standing',
        name: 'Quick Stand',
        description: 'When you are prone, standing up uses only 5 feet of your movement.',
        source: 'Athlete'
      },
      {
        id: 'athlete_climbing',
        name: 'Climbing',
        description: 'Climbing doesn\'t cost you extra movement.',
        source: 'Athlete'
      },
      {
        id: 'athlete_jumping',
        name: 'Running Jump',
        description: 'You can make a running long jump or running high jump after moving only 5 feet on foot.',
        source: 'Athlete'
      }
    ]
  },
  actor: {
    id: 'actor',
    name: 'Actor',
    description: 'Skilled at mimicry and dramatics.',
    features: [
      {
        id: 'actor_charisma',
        name: 'Charisma Increase',
        description: 'Increase your Charisma score by 1, to a maximum of 20.',
        source: 'Actor'
      },
      {
        id: 'actor_advantage',
        name: 'Performance Advantage',
        description: 'You have advantage on Charisma (Deception) and Charisma (Performance) checks when trying to pass yourself off as a different person.',
        source: 'Actor'
      },
      {
        id: 'actor_mimic',
        name: 'Mimic Speech',
        description: 'You can mimic the speech of another person or the sounds made by other creatures.',
        source: 'Actor'
      }
    ]
  },
  charger: {
    id: 'charger',
    name: 'Charger',
    description: 'When you use your action to Dash, you can use a bonus action to make one melee weapon attack or to shove a creature.',
    features: [
      {
        id: 'charger_attack',
        name: 'Charge Attack',
        description: 'If you move at least 10 feet in a straight line immediately before taking this bonus action, you either gain a +5 bonus to the attack\'s damage roll or push the target up to 10 feet away from you.',
        source: 'Charger',
        rulesKey: 'charger'
      }
    ]
  },
  defensive_duelist: {
    id: 'defensive_duelist',
    name: 'Defensive Duelist',
    description: 'When you are wielding a finesse weapon with which you are proficient and another creature hits you with a melee attack, you can use your reaction to add your proficiency bonus to your AC for that attack.',
    features: [
      {
        id: 'defensive_duelist_reaction',
        name: 'Parry',
        description: 'Use your reaction to add your proficiency bonus to AC against one melee attack.',
        source: 'Defensive Duelist'
      }
    ]
  },
  dual_wielder: {
    id: 'dual_wielder',
    name: 'Dual Wielder',
    description: 'You master fighting with two weapons.',
    features: [
      {
        id: 'dual_wielder_ac',
        name: 'AC Bonus',
        description: 'You gain a +1 bonus to AC while you are wielding a separate melee weapon in each hand.',
        source: 'Dual Wielder'
      },
      {
        id: 'dual_wielder_non_light',
        name: 'Two-Weapon Fighting',
        description: 'You can use two-weapon fighting even when the one-handed melee weapons you are wielding aren\'t light.',
        source: 'Dual Wielder'
      },
      {
        id: 'dual_wielder_draw',
        name: 'Quick Draw',
        description: 'You can draw or stow two one-handed weapons when you would normally be able to draw or stow only one.',
        source: 'Dual Wielder'
      }
    ]
  },
  dungeon_delver: {
    id: 'dungeon_delver',
    name: 'Dungeon Delver',
    description: 'Alert to the hidden traps and secret doors found in many dungeons.',
    features: [
      {
        id: 'dungeon_delver_traps',
        name: 'Trap Sense',
        description: 'You have advantage on Wisdom (Perception) and Intelligence (Investigation) checks made to detect the presence of secret doors.',
        source: 'Dungeon Delver'
      },
      {
        id: 'dungeon_delver_saves',
        name: 'Trap Resistance',
        description: 'You have advantage on saving throws made to avoid or resist traps.',
        source: 'Dungeon Delver'
      },
      {
        id: 'dungeon_delver_resistance',
        name: 'Damage Resistance',
        description: 'You have resistance to damage dealt by traps.',
        source: 'Dungeon Delver'
      },
      {
        id: 'dungeon_delver_search',
        name: 'Travel Search',
        description: 'You can search for traps while traveling at a normal pace, instead of only at a slow pace.',
        source: 'Dungeon Delver'
      }
    ]
  },
  durable: {
    id: 'durable',
    name: 'Durable',
    description: 'Hardy and resilient.',
    features: [
      {
        id: 'durable_constitution',
        name: 'Constitution Increase',
        description: 'Increase your Constitution score by 1, to a maximum of 20.',
        source: 'Durable'
      },
      {
        id: 'durable_recovery',
        name: 'Enhanced Recovery',
        description: 'When you roll a Hit Die to regain hit points, the minimum number of hit points you regain equals twice your Constitution modifier.',
        source: 'Durable'
      }
    ]
  },
  elemental_adept: {
    id: 'elemental_adept',
    name: 'Elemental Adept',
    description: 'You have mastered one type of elemental damage.',
    features: [
      {
        id: 'elemental_adept_damage',
        name: 'Elemental Mastery',
        description: 'Spells you cast ignore resistance to damage of the chosen type. Treat any 1 on a damage die as a 2.',
        source: 'Elemental Adept'
      }
    ]
  },
  grappler: {
    id: 'grappler',
    name: 'Grappler',
    description: 'You\'ve developed the skills necessary to hold your own in close-quarters grappling.',
    features: [
      {
        id: 'grappler_advantage',
        name: 'Grappling Advantage',
        description: 'You have advantage on attack rolls against a creature you are grappling.',
        source: 'Grappler'
      },
      {
        id: 'grappler_pin',
        name: 'Pin',
        description: 'You can use your action to try to pin a creature grappled by you.',
        source: 'Grappler'
      }
    ]
  },
  heavily_armored: {
    id: 'heavily_armored',
    name: 'Heavily Armored',
    description: 'You have trained to master the use of heavy armor.',
    features: [
      {
        id: 'heavily_armored_str',
        name: 'Strength Increase',
        description: 'Increase your Strength score by 1, to a maximum of 20.',
        source: 'Heavily Armored'
      },
      {
        id: 'heavily_armored_proficiency',
        name: 'Heavy Armor Proficiency',
        description: 'You gain proficiency with heavy armor.',
        source: 'Heavily Armored'
      }
    ]
  },
  heavy_armor_master: {
    id: 'heavy_armor_master',
    name: 'Heavy Armor Master',
    description: 'You can use your armor to deflect strikes.',
    features: [
      {
        id: 'heavy_armor_master_str',
        name: 'Strength Increase',
        description: 'Increase your Strength score by 1, to a maximum of 20.',
        source: 'Heavy Armor Master'
      },
      {
        id: 'heavy_armor_master_reduction',
        name: 'Damage Reduction',
        description: 'While wearing heavy armor, bludgeoning, piercing, and slashing damage from nonmagical attacks is reduced by 3.',
        source: 'Heavy Armor Master'
      }
    ]
  },
  inspiring_leader: {
    id: 'inspiring_leader',
    name: 'Inspiring Leader',
    description: 'You can spend 10 minutes inspiring your companions.',
    features: [
      {
        id: 'inspiring_leader_hp',
        name: 'Temporary Hit Points',
        description: 'Up to six friendly creatures gain temporary hit points equal to your level + your Charisma modifier.',
        source: 'Inspiring Leader'
      }
    ]
  },
  keen_mind: {
    id: 'keen_mind',
    name: 'Keen Mind',
    description: 'You have a mind that can track time, direction, and detail.',
    features: [
      {
        id: 'keen_mind_int',
        name: 'Intelligence Increase',
        description: 'Increase your Intelligence score by 1, to a maximum of 20.',
        source: 'Keen Mind'
      },
      {
        id: 'keen_mind_direction',
        name: 'Perfect Direction',
        description: 'You always know which way is north.',
        source: 'Keen Mind'
      },
      {
        id: 'keen_mind_time',
        name: 'Perfect Time',
        description: 'You always know the number of hours left before the next sunrise or sunset.',
        source: 'Keen Mind'
      },
      {
        id: 'keen_mind_memory',
        name: 'Perfect Recall',
        description: 'You can accurately recall anything you have seen or heard within the past month.',
        source: 'Keen Mind'
      }
    ]
  },
  linguist: {
    id: 'linguist',
    name: 'Linguist',
    description: 'You have studied languages and codes.',
    features: [
      {
        id: 'linguist_int',
        name: 'Intelligence Increase',
        description: 'Increase your Intelligence score by 1, to a maximum of 20.',
        source: 'Linguist'
      },
      {
        id: 'linguist_languages',
        name: 'Languages',
        description: 'You learn three languages of your choice.',
        source: 'Linguist'
      },
      {
        id: 'linguist_ciphers',
        name: 'Ciphers',
        description: 'You can create written ciphers.',
        source: 'Linguist'
      }
    ]
  },
  mage_slayer: {
    id: 'mage_slayer',
    name: 'Mage Slayer',
    description: 'You have practiced techniques useful in melee combat against spellcasters.',
    features: [
      {
        id: 'mage_slayer_reaction',
        name: 'Opportunity Attack',
        description: 'When a creature within 5 feet of you casts a spell, you can use your reaction to make a melee weapon attack against that creature.',
        source: 'Mage Slayer'
      },
      {
        id: 'mage_slayer_concentration',
        name: 'Break Concentration',
        description: 'When you damage a creature that is concentrating on a spell, that creature has disadvantage on the saving throw it makes to maintain concentration.',
        source: 'Mage Slayer'
      },
      {
        id: 'mage_slayer_saves',
        name: 'Spell Resistance',
        description: 'You have advantage on saving throws against spells cast by creatures within 5 feet of you.',
        source: 'Mage Slayer'
      }
    ]
  },
  magic_initiate: {
    id: 'magic_initiate',
    name: 'Magic Initiate',
    description: 'You learn two cantrips and one 1st-level spell from a class of your choice.',
    features: [
      {
        id: 'magic_initiate_spells',
        name: 'Spells',
        description: 'Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips and one 1st-level spell from that class\'s spell list.',
        source: 'Magic Initiate'
      }
    ]
  },
  martial_adept: {
    id: 'martial_adept',
    name: 'Martial Adept',
    description: 'You have martial training that allows you to perform special combat maneuvers.',
    features: [
      {
        id: 'martial_adept_maneuvers',
        name: 'Combat Maneuvers',
        description: 'You learn two maneuvers from the Battle Master archetype. You gain one superiority die (d6).',
        source: 'Martial Adept'
      }
    ]
  },
  medium_armor_master: {
    id: 'medium_armor_master',
    name: 'Medium Armor Master',
    description: 'You have practiced moving in medium armor.',
    features: [
      {
        id: 'medium_armor_master_ac',
        name: 'AC Bonus',
        description: 'Wearing medium armor doesn\'t impose disadvantage on Dexterity (Stealth) checks. You can add 3, rather than 2, to your AC if you have a Dexterity of 16 or higher.',
        source: 'Medium Armor Master'
      }
    ]
  },
  mobile: {
    id: 'mobile',
    name: 'Mobile',
    description: 'You are exceptionally speedy and agile.',
    features: [
      {
        id: 'mobile_speed',
        name: 'Speed Increase',
        description: 'Your speed increases by 10 feet.',
        source: 'Mobile'
      },
      {
        id: 'mobile_dash',
        name: 'Dash Movement',
        description: 'When you use the Dash action, difficult terrain doesn\'t cost you extra movement on that turn.',
        source: 'Mobile'
      },
      {
        id: 'mobile_disengage',
        name: 'Hit and Run',
        description: 'When you make a melee attack against a creature, you don\'t provoke opportunity attacks from that creature for the rest of the turn.',
        source: 'Mobile'
      }
    ]
  },
  moderately_armored: {
    id: 'moderately_armored',
    name: 'Moderately Armored',
    description: 'You have trained to master the use of medium armor and shields.',
    features: [
      {
        id: 'moderately_armored_asi',
        name: 'Ability Score Increase',
        description: 'Increase your Strength or Dexterity by 1, to a maximum of 20.',
        source: 'Moderately Armored'
      },
      {
        id: 'moderately_armored_proficiency',
        name: 'Armor Proficiency',
        description: 'You gain proficiency with medium armor and shields.',
        source: 'Moderately Armored'
      }
    ]
  },
  mounted_combatant: {
    id: 'mounted_combatant',
    name: 'Mounted Combatant',
    description: 'You are a dangerous foe to face while mounted.',
    features: [
      {
        id: 'mounted_combatant_advantage',
        name: 'Mounted Advantage',
        description: 'You have advantage on melee attack rolls against unmounted creatures smaller than your mount.',
        source: 'Mounted Combatant'
      },
      {
        id: 'mounted_combatant_redirect',
        name: 'Redirect Attack',
        description: 'You can force an attack targeted at your mount to target you instead.',
        source: 'Mounted Combatant'
      },
      {
        id: 'mounted_combatant_evasion',
        name: 'Mounted Evasion',
        description: 'If your mount is subjected to an effect that allows a Dexterity saving throw for half damage, it takes no damage on success and half on failure.',
        source: 'Mounted Combatant'
      }
    ]
  },
  observant: {
    id: 'observant',
    name: 'Observant',
    description: 'Quick to notice details of your environment.',
    features: [
      {
        id: 'observant_asi',
        name: 'Ability Score Increase',
        description: 'Increase your Intelligence or Wisdom by 1, to a maximum of 20.',
        source: 'Observant'
      },
      {
        id: 'observant_passive',
        name: 'Passive Bonus',
        description: 'You have a +5 bonus to your passive Wisdom (Perception) and passive Intelligence (Investigation) scores.',
        source: 'Observant'
      },
      {
        id: 'observant_lip_reading',
        name: 'Lip Reading',
        description: 'You can read lips if you can see a creature\'s mouth and know the language.',
        source: 'Observant'
      }
    ]
  },
  ritual_caster: {
    id: 'ritual_caster',
    name: 'Ritual Caster',
    description: 'You have learned a number of spells that you can cast as rituals.',
    features: [
      {
        id: 'ritual_caster_spells',
        name: 'Ritual Spells',
        description: 'You acquire a ritual book holding two 1st-level spells with the ritual tag from one class.',
        source: 'Ritual Caster'
      }
    ]
  },
  savage_attacker: {
    id: 'savage_attacker',
    name: 'Savage Attacker',
    description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon\'s damage dice and use either total.',
    features: [
      {
        id: 'savage_attacker_reroll',
        name: 'Damage Reroll',
        description: 'Once per turn, reroll melee weapon damage and use either result.',
        source: 'Savage Attacker'
      }
    ]
  },
  shield_master: {
    id: 'shield_master',
    name: 'Shield Master',
    description: 'You use shields not just for protection but also for offense.',
    features: [
      {
        id: 'shield_master_shove',
        name: 'Shield Bash',
        description: 'If you take the Attack action, you can use a bonus action to shove with your shield.',
        source: 'Shield Master'
      },
      {
        id: 'shield_master_cover',
        name: 'Shield Cover',
        description: 'Add your shield\'s AC bonus to Dexterity saving throws against spells and harmful effects that target only you.',
        source: 'Shield Master'
      },
      {
        id: 'shield_master_evasion',
        name: 'Shield Evasion',
        description: 'If subjected to an effect allowing a Dexterity save for half damage, use your reaction to take no damage on success.',
        source: 'Shield Master'
      }
    ]
  },
  skilled: {
    id: 'skilled',
    name: 'Skilled',
    description: 'You gain proficiency in any three skills or tools of your choice.',
    features: [
      {
        id: 'skilled_proficiencies',
        name: 'Skill Proficiencies',
        description: 'You gain proficiency in any three skills or tools of your choice.',
        source: 'Skilled'
      }
    ]
  },
  skulker: {
    id: 'skulker',
    name: 'Skulker',
    description: 'You are expert at slinking through shadows.',
    features: [
      {
        id: 'skulker_hide',
        name: 'Hide in Dim Light',
        description: 'You can hide when you are lightly obscured from the creature from which you are hiding.',
        source: 'Skulker'
      },
      {
        id: 'skulker_miss',
        name: 'Stay Hidden',
        description: 'When you are hidden and miss with a ranged weapon attack, making the attack doesn\'t reveal your position.',
        source: 'Skulker'
      },
      {
        id: 'skulker_darkvision',
        name: 'No Disadvantage',
        description: 'Dim light doesn\'t impose disadvantage on Wisdom (Perception) checks relying on sight.',
        source: 'Skulker'
      }
    ]
  },
  spell_sniper: {
    id: 'spell_sniper',
    name: 'Spell Sniper',
    description: 'You have learned techniques to enhance your attacks with certain kinds of spells.',
    features: [
      {
        id: 'spell_sniper_range',
        name: 'Double Range',
        description: 'When you cast a spell that requires an attack roll, the spell\'s range is doubled.',
        source: 'Spell Sniper'
      },
      {
        id: 'spell_sniper_cover',
        name: 'Ignore Cover',
        description: 'Your ranged spell attacks ignore half cover and three-quarters cover.',
        source: 'Spell Sniper'
      },
      {
        id: 'spell_sniper_cantrip',
        name: 'Attack Cantrip',
        description: 'You learn one cantrip that requires an attack roll.',
        source: 'Spell Sniper'
      }
    ]
  },
  tavern_brawler: {
    id: 'tavern_brawler',
    name: 'Tavern Brawler',
    description: 'Accustomed to rough-and-tumble fighting.',
    features: [
      {
        id: 'tavern_brawler_asi',
        name: 'Ability Score Increase',
        description: 'Increase your Strength or Constitution by 1, to a maximum of 20.',
        source: 'Tavern Brawler'
      },
      {
        id: 'tavern_brawler_unarmed',
        name: 'Unarmed Strike',
        description: 'You are proficient with improvised weapons and unarmed strikes, which deal 1d4 damage.',
        source: 'Tavern Brawler'
      },
      {
        id: 'tavern_brawler_grapple',
        name: 'Grapple Bonus',
        description: 'When you hit with an unarmed strike or improvised weapon, you can use a bonus action to grapple.',
        source: 'Tavern Brawler'
      }
    ]
  },
  tough: {
    id: 'tough',
    name: 'Tough',
    description: 'Your hit point maximum increases by 2 for every level.',
    features: [
      {
        id: 'tough_hp',
        name: 'Hit Point Increase',
        description: 'Your hit point maximum increases by an amount equal to twice your level.',
        source: 'Tough'
      }
    ]
  },
  war_caster: {
    id: 'war_caster',
    name: 'War Caster',
    description: 'You have practiced casting spells in combat.',
    features: [
      {
        id: 'war_caster_concentration',
        name: 'Concentration Advantage',
        description: 'You have advantage on Constitution saving throws to maintain concentration.',
        source: 'War Caster'
      },
      {
        id: 'war_caster_somatic',
        name: 'Somatic Components',
        description: 'You can perform somatic components even with weapons or a shield in your hands.',
        source: 'War Caster'
      },
      {
        id: 'war_caster_opportunity',
        name: 'Spell Opportunity Attack',
        description: 'You can use your reaction to cast a spell instead of making an opportunity attack.',
        source: 'War Caster'
      }
    ]
  },
  weapon_master: {
    id: 'weapon_master',
    name: 'Weapon Master',
    description: 'You have practiced extensively with a variety of weapons.',
    features: [
      {
        id: 'weapon_master_asi',
        name: 'Ability Score Increase',
        description: 'Increase your Strength or Dexterity by 1, to a maximum of 20.',
        source: 'Weapon Master'
      },
      {
        id: 'weapon_master_proficiency',
        name: 'Weapon Proficiency',
        description: 'You gain proficiency with four weapons of your choice.',
        source: 'Weapon Master'
      }
    ]
  }
}