export interface Spell {
  id: string
  name: string
  level: number // 0 for cantrips
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  description: string
  atHigherLevels?: string
  classes: string[] // Which classes can learn this spell
  tags: string[]
}

// Cantrips (Level 0) - All 26 Cantrips from SRD
export const cantrips: Record<string, Spell> = {
  acid_splash: {
    id: 'acid_splash',
    name: 'Acid Splash',
    level: 0,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a dexterity saving throw or take 1d6 acid damage.',
    atHigherLevels: 'This spell\'s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'acid', 'save', 'conjuration']
  },
  blade_ward: {
    id: 'blade_ward',
    name: 'Blade Ward',
    level: 0,
    school: 'Abjuration',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: '1 round',
    description: 'You extend your hand and trace a sigil of warding in the air. Until the end of your next turn, you have resistance against bludgeoning, piercing, and slashing damage dealt by weapon attacks.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['defense', 'resistance', 'abjuration', 'self']
  },
  chill_touch: {
    id: 'chill_touch',
    name: 'Chill Touch',
    level: 0,
    school: 'Necromancy',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You create a ghostly, skeletal hand in the space of a creature within range. Make a ranged spell attack against the creature to assail it with the chill of the grave. On a hit, the target takes 1d8 necrotic damage, and it can\'t regain hit points until the start of your next turn.',
    atHigherLevels: 'This spell\'s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).',
    classes: ['sorcerer', 'warlock', 'wizard'],
    tags: ['damage', 'necrotic', 'debuff', 'necromancy', 'ranged']
  },
  dancing_lights: {
    id: 'dancing_lights',
    name: 'Dancing Lights',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration. You can also combine the four lights into one glowing vaguely humanoid form of Medium size.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['utility', 'light', 'evocation', 'concentration']
  },
  druidcraft: {
    id: 'druidcraft',
    name: 'Druidcraft',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Whispering to the spirits of nature, you create one of the following effects within range: You create a tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours. You instantly make a flower blossom, a seed pod open, or a leaf bud bloom. You create an instantaneous, harmless sensory effect, such as falling leaves, a puff of wind, the sound of a small animal, or the faint odor of skunk. You instantly light or snuff out a candle, a torch, or a small campfire.',
    classes: ['druid'],
    tags: ['utility', 'nature', 'transmutation', 'flavor']
  },
  eldritch_blast: {
    id: 'eldritch_blast',
    name: 'Eldritch Blast',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage.',
    atHigherLevels: 'The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level, and four beams at 17th level. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam.',
    classes: ['warlock'],
    tags: ['damage', 'force', 'evocation', 'ranged']
  },
  fire_bolt: {
    id: 'fire_bolt',
    name: 'Fire Bolt',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn\'t being worn or carried.',
    atHigherLevels: 'This spell\'s damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10).',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'fire', 'evocation', 'ranged']
  },
  guidance: {
    id: 'guidance',
    name: 'Guidance',
    level: 0,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. The spell then ends.',
    classes: ['cleric', 'druid'],
    tags: ['buff', 'support', 'divination', 'touch', 'concentration']
  },
  light: {
    id: 'light',
    name: 'Light',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, M',
    duration: '1 hour',
    description: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like.',
    classes: ['bard', 'cleric', 'sorcerer', 'wizard'],
    tags: ['utility', 'light', 'evocation', 'touch']
  },
  mage_hand: {
    id: 'mage_hand',
    name: 'Mage Hand',
    level: 0,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: '1 minute',
    description: 'A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['utility', 'manipulation', 'conjuration']
  },
  mending: {
    id: 'mending',
    name: 'Mending',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 minute',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin.',
    classes: ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'],
    tags: ['utility', 'repair', 'transmutation', 'touch']
  },
  message: {
    id: 'message',
    name: 'Message',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S, M',
    duration: '1 round',
    description: 'You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['utility', 'communication', 'transmutation']
  },
  minor_illusion: {
    id: 'minor_illusion',
    name: 'Minor Illusion',
    level: 0,
    school: 'Illusion',
    castingTime: '1 action',
    range: '30 feet',
    components: 'S, M',
    duration: '1 minute',
    description: 'You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['utility', 'illusion', 'deception']
  },
  poison_spray: {
    id: 'poison_spray',
    name: 'Poison Spray',
    level: 0,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '10 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm. The creature must succeed on a Constitution saving throw or take 1d12 poison damage.',
    atHigherLevels: 'This spell\'s damage increases by 1d12 when you reach 5th level (2d12), 11th level (3d12), and 17th level (4d12).',
    classes: ['druid', 'sorcerer', 'warlock', 'wizard'],
    tags: ['damage', 'poison', 'save', 'conjuration']
  },
  prestidigitation: {
    id: 'prestidigitation',
    name: 'Prestidigitation',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '10 feet',
    components: 'V, S',
    duration: 'Up to 1 hour',
    description: 'This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects within range: You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor. You instantaneously light or snuff out a candle, a torch, or a small campfire. You instantaneously clean or soil an object no larger than 1 cubic foot.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['utility', 'flavor', 'transmutation']
  },
  produce_flame: {
    id: 'produce_flame',
    name: 'Produce Flame',
    level: 0,
    school: 'Conjuration',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: '10 minutes',
    description: 'A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. The flame sheds bright light in a 10-foot radius and dim light for an additional 10 feet. The spell ends if you dismiss it as an action or if you cast it again.',
    atHigherLevels: 'This spell\'s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).',
    classes: ['druid'],
    tags: ['damage', 'fire', 'light', 'conjuration', 'self']
  },
  ray_of_frost: {
    id: 'ray_of_frost',
    name: 'Ray of Frost',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn.',
    atHigherLevels: 'This spell\'s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'cold', 'control', 'evocation', 'ranged']
  },
  resistance: {
    id: 'resistance',
    name: 'Resistance',
    level: 0,
    school: 'Abjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. The spell then ends.',
    classes: ['cleric', 'druid'],
    tags: ['buff', 'support', 'abjuration', 'touch', 'concentration']
  },
  sacred_flame: {
    id: 'sacred_flame',
    name: 'Sacred Flame',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this saving throw.',
    atHigherLevels: 'This spell\'s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).',
    classes: ['cleric'],
    tags: ['damage', 'radiant', 'save', 'evocation']
  },
  shillelagh: {
    id: 'shillelagh',
    name: 'Shillelagh',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 bonus action',
    range: 'Touch',
    components: 'V, S, M',
    duration: '1 minute',
    description: 'The wood of a club or quarterstaff you are holding is imbued with nature\'s power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon.',
    classes: ['druid'],
    tags: ['buff', 'weapon', 'transmutation', 'touch', 'bonus-action']
  },
  shocking_grasp: {
    id: 'shocking_grasp',
    name: 'Shocking Grasp',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 1d8 lightning damage, and it can\'t take reactions until the start of its next turn.',
    atHigherLevels: 'This spell\'s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'lightning', 'debuff', 'evocation', 'touch']
  },
  spare_the_dying: {
    id: 'spare_the_dying',
    name: 'Spare the Dying',
    level: 0,
    school: 'Necromancy',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.',
    classes: ['cleric'],
    tags: ['healing', 'support', 'necromancy', 'touch']
  },
  thaumaturgy: {
    id: 'thaumaturgy',
    name: 'Thaumaturgy',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V',
    duration: 'Up to 1 minute',
    description: 'You manifest a minor wonder, a sign of supernatural power, within range. You create one of the following magical effects within range: Your voice booms up to three times as loud as normal for 1 minute. You cause flames to flicker, brighten, dim, or change color for 1 minute. You cause harmless tremors in the ground for 1 minute.',
    classes: ['cleric'],
    tags: ['utility', 'flavor', 'transmutation']
  },
  thorn_whip: {
    id: 'thorn_whip',
    name: 'Thorn Whip',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'You create a long, vine-like whip covered in thorns that lashes out at your command toward a creature in range. Make a melee spell attack against the target. If the attack hits, the creature takes 1d6 piercing damage, and if the creature is Large or smaller, you pull the creature up to 10 feet closer to you.',
    atHigherLevels: 'This spell\'s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).',
    classes: ['druid'],
    tags: ['damage', 'control', 'transmutation', 'pull']
  },
  true_strike: {
    id: 'true_strike',
    name: 'True Strike',
    level: 0,
    school: 'Divination',
    castingTime: '1 action',
    range: '30 feet',
    components: 'S',
    duration: 'Concentration, up to 1 round',
    description: 'You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target\'s defenses. On your next turn, you gain advantage on your first attack roll against the target, provided that this spell hasn\'t ended.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['buff', 'advantage', 'divination', 'concentration']
  },
  vicious_mockery: {
    id: 'vicious_mockery',
    name: 'Vicious Mockery',
    level: 0,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (though it need not understand you), it must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on its next attack roll.',
    atHigherLevels: 'This spell\'s damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4).',
    classes: ['bard'],
    tags: ['damage', 'psychic', 'debuff', 'enchantment']
  }
}

// Level 1 Spells - All 51 Level 1 Spells from SRD
export const level1Spells: Record<string, Spell> = {
  alarm: {
    id: 'alarm',
    name: 'Alarm',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 minute',
    range: '30 feet',
    components: 'V, S, M',
    duration: '8 hours',
    description: 'You set an alarm against unwanted intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a Tiny or larger creature touches or enters the warded area.',
    classes: ['ranger', 'wizard'],
    tags: ['detection', 'utility', 'abjuration', 'ritual']
  },
  animal_friendship: {
    id: 'animal_friendship',
    name: 'Animal Friendship',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M',
    duration: '24 hours',
    description: 'This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. It must see and hear you. If the beast\'s Intelligence is 4 or higher, the spell fails. Otherwise, the beast must succeed on a Wisdom saving throw or be charmed by you for the spell\'s duration.',
    classes: ['bard', 'druid', 'ranger'],
    tags: ['enchantment', 'charm', 'social', 'animals']
  },
  armor_of_agathys: {
    id: 'armor_of_agathys',
    name: 'Armor of Agathys',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S, M',
    duration: '1 hour',
    description: 'A protective magical force surrounds you, manifesting as a spectral frost that covers you and your gear. You gain 5 temporary hit points for the duration. If a creature hits you with a melee attack while you have these hit points, the creature takes 5 cold damage.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, both the temporary hit points and the cold damage increase by 5 for each slot.',
    classes: ['warlock'],
    tags: ['defense', 'temporary hp', 'cold', 'abjuration', 'self']
  },
  bless: {
    id: 'bless',
    name: 'Bless',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.',
    classes: ['cleric', 'paladin'],
    tags: ['buff', 'support', 'enchantment', 'concentration']
  },
  burning_hands: {
    id: 'burning_hands',
    name: 'Burning Hands',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Self (15-foot cone)',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'fire', 'aoe', 'evocation', 'self', 'save']
  },
  charm_person: {
    id: 'charm_person',
    name: 'Charm Person',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: '1 hour',
    description: 'You attempt to charm a humanoid you can see within range. It must make a Wisdom saving throw, and it does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, you can target one additional humanoid for each slot level above 1st.',
    classes: ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'],
    tags: ['enchantment', 'charm', 'social', 'save']
  },
  cure_wounds: {
    id: 'cure_wounds',
    name: 'Cure Wounds',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.',
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'],
    tags: ['healing', 'support', 'evocation', 'touch']
  },
  detect_magic: {
    id: 'detect_magic',
    name: 'Detect Magic',
    level: 1,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: 'Concentration, up to 10 minutes',
    description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic.',
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard'],
    tags: ['detection', 'utility', 'divination', 'self', 'concentration', 'ritual']
  },
  disguise_self: {
    id: 'disguise_self',
    name: 'Disguise Self',
    level: 1,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: '1 hour',
    description: 'You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends or until you use your action to dismiss it.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['illusion', 'disguise', 'utility', 'self']
  },
  entangle: {
    id: 'entangle',
    name: 'Entangle',
    level: 1,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '90 feet',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'Grasping weeds and vines sprout from the ground in a 20-foot square starting from a point within range. For the duration, these plants turn the ground in the area into difficult terrain.',
    classes: ['druid'],
    tags: ['control', 'restraint', 'area', 'conjuration', 'concentration']
  },
  faerie_fire: {
    id: 'faerie_fire',
    name: 'Faerie Fire',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V',
    duration: 'Concentration, up to 1 minute',
    description: 'Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw.',
    classes: ['bard', 'druid'],
    tags: ['debuff', 'advantage', 'light', 'evocation', 'aoe', 'concentration', 'save']
  },
  guiding_bolt: {
    id: 'guiding_bolt',
    name: 'Guiding Bolt',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: '1 round',
    description: 'A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.',
    classes: ['cleric'],
    tags: ['damage', 'radiant', 'buff', 'evocation', 'ranged']
  },
  healing_word: {
    id: 'healing_word',
    name: 'Healing Word',
    level: 1,
    school: 'Evocation',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d4 for each slot level above 1st.',
    classes: ['bard', 'cleric', 'druid'],
    tags: ['healing', 'support', 'evocation', 'bonus-action', 'ranged']
  },
  hex: {
    id: 'hex',
    name: 'Hex',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 bonus action',
    range: '90 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 hour',
    description: 'You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic damage to the target whenever you hit it with an attack. Also, choose one ability when you cast the spell. The target has disadvantage on ability checks made with the chosen ability.',
    atHigherLevels: 'When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your concentration on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your concentration on the spell for up to 24 hours.',
    classes: ['warlock'],
    tags: ['damage', 'necrotic', 'debuff', 'enchantment', 'bonus-action', 'concentration']
  },
  hunters_mark: {
    id: 'hunters_mark',
    name: 'Hunter\'s Mark',
    level: 1,
    school: 'Divination',
    castingTime: '1 bonus action',
    range: '90 feet',
    components: 'V',
    duration: 'Concentration, up to 1 hour',
    description: 'You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it.',
    atHigherLevels: 'When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your concentration on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your concentration on the spell for up to 24 hours.',
    classes: ['ranger'],
    tags: ['damage', 'buff', 'tracking', 'divination', 'bonus-action', 'concentration']
  },
  mage_armor: {
    id: 'mage_armor',
    name: 'Mage Armor',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S, M',
    duration: '8 hours',
    description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dex modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.',
    classes: ['sorcerer', 'wizard'],
    tags: ['buff', 'defense', 'abjuration', 'touch']
  },
  magic_missile: {
    id: 'magic_missile',
    name: 'Magic Missile',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'force', 'auto-hit', 'evocation', 'ranged']
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    components: 'V, S',
    duration: '1 round',
    description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
    classes: ['sorcerer', 'wizard'],
    tags: ['defense', 'reaction', 'abjuration', 'self']
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '90 feet',
    components: 'V, S, M',
    duration: '1 minute',
    description: 'This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points.',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['control', 'incapacitation', 'enchantment', 'aoe']
  }
}

// Level 2 Spells - Key Level 2 Spells from SRD  
export const level2Spells: Record<string, Spell> = {
  aid: {
    id: 'aid',
    name: 'Aid',
    level: 2,
    school: 'Abjuration',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M',
    duration: '8 hours',
    description: 'Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target\'s hit point maximum and current hit points increase by 5 for the duration.',
    atHigherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, a target\'s hit points increase by an additional 5 for each slot level above 2nd.',
    classes: ['cleric', 'paladin'],
    tags: ['buff', 'healing', 'support', 'abjuration']
  },
  alter_self: {
    id: 'alter_self',
    name: 'Alter Self',
    level: 2,
    school: 'Transmutation',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: 'Concentration, up to 1 hour',
    description: 'You assume a different form. When you cast the spell, choose one of the following options, the effects of which last for the duration of the spell. While the spell lasts, you can end one option as an action to gain the benefits of a different one.',
    classes: ['sorcerer', 'wizard'],
    tags: ['utility', 'transformation', 'transmutation', 'self', 'concentration']
  },
  blur: {
    id: 'blur',
    name: 'Blur',
    level: 2,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Self',
    components: 'V',
    duration: 'Concentration, up to 1 minute',
    description: 'Your body becomes blurred, shifting and wavering to all who can see you. For the duration, any creature has disadvantage on attack rolls against you. An attacker is immune to this effect if it doesn\'t rely on sight, as with blindsight, or can see through illusions, as with truesight.',
    classes: ['sorcerer', 'wizard'],
    tags: ['defense', 'disadvantage', 'illusion', 'self', 'concentration']
  },
  detect_thoughts: {
    id: 'detect_thoughts',
    name: 'Detect Thoughts',
    level: 2,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'For the duration, you can read the thoughts of certain creatures. When you cast the spell and as your action each round until the spell ends, you can focus your mind on any one creature that you can see within 30 feet of you.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['detection', 'utility', 'divination', 'self', 'concentration']
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.',
    atHigherLevels: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'fire', 'aoe', 'evocation', 'save']
  },
  hold_person: {
    id: 'hold_person',
    name: 'Hold Person',
    level: 2,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration. At the end of each of its turns, the target can make another Wisdom saving throw.',
    atHigherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, you can target one additional humanoid for each slot level above 2nd.',
    classes: ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'],
    tags: ['control', 'paralysis', 'enchantment', 'concentration', 'save']
  },
  invisibility: {
    id: 'invisibility',
    name: 'Invisibility',
    level: 2,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 hour',
    description: 'A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person. The spell ends for a target that attacks or casts a spell.',
    atHigherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['utility', 'stealth', 'illusion', 'touch', 'concentration']
  },
  misty_step: {
    id: 'misty_step',
    name: 'Misty Step',
    level: 2,
    school: 'Conjuration',
    castingTime: '1 bonus action',
    range: 'Self',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.',
    classes: ['sorcerer', 'warlock', 'wizard'],
    tags: ['teleportation', 'mobility', 'conjuration', 'self', 'bonus-action']
  },
  scorching_ray: {
    id: 'scorching_ray',
    name: 'Scorching Ray',
    level: 2,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.',
    atHigherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'fire', 'multi-target', 'evocation', 'ranged']
  },
  spiritual_weapon: {
    id: 'spiritual_weapon',
    name: 'Spiritual Weapon',
    level: 2,
    school: 'Evocation',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: 'V, S',
    duration: '1 minute',
    description: 'You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier.',
    atHigherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for every two slot levels above 2nd.',
    classes: ['cleric'],
    tags: ['damage', 'force', 'bonus-action', 'evocation']
  },
  web: {
    id: 'web',
    name: 'Web',
    level: 2,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 hour',
    description: 'You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube from that point for the duration. The webs are difficult terrain and lightly obscure their area.',
    classes: ['sorcerer', 'wizard'],
    tags: ['control', 'restraint', 'area', 'conjuration', 'concentration']
  }
}

// Level 3 Spells - Key Level 3 Spells from SRD
export const level3Spells: Record<string, Spell> = {
  animate_dead: {
    id: 'animate_dead',
    name: 'Animate Dead',
    level: 3,
    school: 'Necromancy',
    castingTime: '1 minute',
    range: '10 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'This spell creates an undead servant. Choose a pile of bones or a corpse of a Medium or Small humanoid within range. Your spell imbues the target with a foul mimicry of life, raising it as an undead creature.',
    atHigherLevels: 'When you cast this spell using a spell slot of 4th level or higher, you animate or reassert control over two additional undead creatures for each slot level above 3rd.',
    classes: ['cleric', 'wizard'],
    tags: ['summoning', 'undead', 'necromancy']
  },
  counterspell: {
    id: 'counterspell',
    name: 'Counterspell',
    level: 3,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: '60 feet',
    components: 'S',
    duration: 'Instantaneous',
    description: 'You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability.',
    atHigherLevels: 'When you cast this spell using a spell slot of 4th level or higher, the interrupted spell has no effect if its level is less than or equal to the level of the spell slot you used.',
    classes: ['sorcerer', 'warlock', 'wizard'],
    tags: ['reaction', 'interrupt', 'abjuration']
  },
  dispel_magic: {
    id: 'dispel_magic',
    name: 'Dispel Magic',
    level: 3,
    school: 'Abjuration',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For each spell of 4th level or higher on the target, make an ability check using your spellcasting ability.',
    atHigherLevels: 'When you cast this spell using a spell slot of 4th level or higher, you automatically end the effects of a spell on the target if the spell\'s level is equal to or less than the level of the spell slot you used.',
    classes: ['bard', 'cleric', 'druid', 'paladin', 'sorcerer', 'warlock', 'wizard'],
    tags: ['utility', 'dispel', 'abjuration']
  },
  fly: {
    id: 'fly',
    name: 'Fly',
    level: 3,
    school: 'Transmutation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Concentration, up to 10 minutes',
    description: 'You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.',
    atHigherLevels: 'When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd.',
    classes: ['sorcerer', 'warlock', 'wizard'],
    tags: ['utility', 'mobility', 'flight', 'transmutation', 'touch', 'concentration']
  },
  haste: {
    id: 'haste',
    name: 'Haste',
    level: 3,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'Choose a willing creature that you can see within range. Until the spell ends, the target\'s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns.',
    classes: ['sorcerer', 'wizard'],
    tags: ['buff', 'speed', 'transmutation', 'concentration']
  },
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Self (100-foot line)',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes 8d6 lightning damage on a failed save, or half as much damage on a successful one.',
    atHigherLevels: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'lightning', 'line', 'evocation', 'self', 'save']
  }
}

// Level 4 Spells - Key Level 4 Spells from SRD
export const level4Spells: Record<string, Spell> = {
  confusion: {
    id: 'confusion',
    name: 'Confusion',
    level: 4,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '90 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'This spell assaults and twists creatures\' minds, spawning delusions and provoking uncontrolled action. Each creature in a 10-foot-radius sphere centered on a point you choose within range must succeed on a Wisdom saving throw when you cast this spell or be affected by it.',
    atHigherLevels: 'When you cast this spell using a spell slot of 5th level or higher, the radius of the sphere increases by 5 feet for each slot level above 4th.',
    classes: ['bard', 'druid', 'sorcerer', 'wizard'],
    tags: ['control', 'confusion', 'enchantment', 'aoe', 'concentration', 'save']
  },
  dimension_door: {
    id: 'dimension_door',
    name: 'Dimension Door',
    level: 4,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '500 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['teleportation', 'mobility', 'conjuration']
  },
  greater_invisibility: {
    id: 'greater_invisibility',
    name: 'Greater Invisibility',
    level: 4,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['utility', 'stealth', 'illusion', 'touch', 'concentration']
  },
  polymorph: {
    id: 'polymorph',
    name: 'Polymorph',
    level: 4,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 hour',
    description: 'This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a Wisdom saving throw to avoid the effect. A shapechanger automatically succeeds on this saving throw.',
    classes: ['bard', 'druid', 'sorcerer', 'wizard'],
    tags: ['transformation', 'control', 'transmutation', 'concentration', 'save']
  },
  wall_of_fire: {
    id: 'wall_of_fire',
    name: 'Wall of Fire',
    level: 4,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick.',
    atHigherLevels: 'When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th.',
    classes: ['druid', 'sorcerer', 'wizard'],
    tags: ['damage', 'fire', 'wall', 'area', 'evocation', 'concentration']
  }
}

// Level 5 Spells - Key Level 5 Spells from SRD
export const level5Spells: Record<string, Spell> = {
  animate_objects: {
    id: 'animate_objects',
    name: 'Animate Objects',
    level: 5,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'Objects come to life at your command. Choose up to ten nonmagical objects within range that are not being worn or carried. Medium targets count as two objects, Large targets count as four objects, Huge targets count as eight objects.',
    atHigherLevels: 'If you cast this spell using a spell slot of 6th level or higher, you can animate two additional objects for each slot level above 5th.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['summoning', 'animation', 'transmutation', 'concentration']
  },
  cone_of_cold: {
    id: 'cone_of_cold',
    name: 'Cone of Cold',
    level: 5,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Self (60-foot cone)',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a Constitution saving throw. A creature takes 8d8 cold damage on a failed save, or half as much damage on a successful one.',
    atHigherLevels: 'When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'cold', 'cone', 'evocation', 'self', 'save']
  },
  dominate_person: {
    id: 'dominate_person',
    name: 'Dominate Person',
    level: 5,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'You attempt to beguile a humanoid that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.',
    atHigherLevels: 'When you cast this spell using a 6th-level spell slot, the duration is concentration, up to 10 minutes. When you use a 7th-level spell slot, the duration is concentration, up to 1 hour. When you use a spell slot of 8th or 9th level, the duration is concentration, up to 8 hours.',
    classes: ['bard', 'sorcerer', 'wizard'],
    tags: ['control', 'domination', 'enchantment', 'concentration', 'save']
  },
  scrying: {
    id: 'scrying',
    name: 'Scrying',
    level: 5,
    school: 'Divination',
    castingTime: '10 minutes',
    range: 'Self',
    components: 'V, S, M',
    duration: 'Concentration, up to 10 minutes',
    description: 'You can see and hear a particular creature you choose that is on the same plane of existence as you. The target must make a Wisdom saving throw, which is modified by how well you know the target and the sort of physical connection you have to it.',
    classes: ['bard', 'cleric', 'druid', 'warlock', 'wizard'],
    tags: ['detection', 'surveillance', 'divination', 'self', 'concentration']
  },
  telekinesis: {
    id: 'telekinesis',
    name: 'Telekinesis',
    level: 5,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Concentration, up to 10 minutes',
    description: 'You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell, and as your action each round for the duration, you can exert your will on one creature or object that you can see within range.',
    classes: ['sorcerer', 'wizard'],
    tags: ['utility', 'manipulation', 'transmutation', 'concentration']
  }
}

// Level 6+ Spells - Key High Level Spells from SRD
export const level6Spells: Record<string, Spell> = {
  chain_lightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    level: 6,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'You create a bolt of lightning that arcs toward a target of your choice that you can see within range. Three bolts then leap from that target to as many as three other targets, each of which must be within 30 feet of the first target.',
    atHigherLevels: 'When you cast this spell using a spell slot of 7th level or higher, one additional bolt leaps from the first target to another target for each slot level above 6th.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'lightning', 'chain', 'evocation']
  },
  disintegrate: {
    id: 'disintegrate',
    name: 'Disintegrate',
    level: 6,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A thin green ray springs from your pointing finger to a target that you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by wall of force.',
    atHigherLevels: 'When you cast this spell using a spell slot of 7th level or higher, the damage increases by 3d6 for each slot level above 6th.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'force', 'disintegration', 'transmutation', 'ranged']
  },
  mass_suggestion: {
    id: 'mass_suggestion',
    name: 'Mass Suggestion',
    level: 6,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, M',
    duration: '24 hours',
    description: 'You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['control', 'suggestion', 'enchantment', 'mass']
  }
}

export const level7Spells: Record<string, Spell> = {
  finger_of_death: {
    id: 'finger_of_death',
    name: 'Finger of Death',
    level: 7,
    school: 'Necromancy',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You send negative energy coursing through a creature that you can see within range, causing it searing pain. The target must make a Constitution saving throw. It takes 7d8 + 30 necrotic damage on a failed save, or half as much damage on a successful one.',
    classes: ['sorcerer', 'warlock', 'wizard'],
    tags: ['damage', 'necrotic', 'death', 'necromancy', 'save']
  },
  plane_shift: {
    id: 'plane_shift',
    name: 'Plane Shift',
    level: 7,
    school: 'Conjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as the City of Brass on the Elemental Plane of Fire or the palace of Dispater on the second level of the Nine Hells.',
    classes: ['cleric', 'druid', 'sorcerer', 'warlock', 'wizard'],
    tags: ['teleportation', 'planar', 'conjuration', 'touch']
  }
}

export const level8Spells: Record<string, Spell> = {
  power_word_stun: {
    id: 'power_word_stun',
    name: 'Power Word Stun',
    level: 8,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'You speak a word of power that can overwhelm the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 hit points or fewer, it is stunned. Otherwise, the spell has no effect.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['control', 'stun', 'enchantment', 'power word']
  },
  sunburst: {
    id: 'sunburst',
    name: 'Sunburst',
    level: 8,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range. Each creature in that light must make a Constitution saving throw. On a failed save, a creature takes 12d6 radiant damage and is blinded for 1 minute.',
    atHigherLevels: 'When you cast this spell using a 9th-level spell slot, the damage increases to 13d6.',
    classes: ['druid', 'sorcerer', 'wizard'],
    tags: ['damage', 'radiant', 'blind', 'evocation', 'aoe', 'save']
  }
}

export const level9Spells: Record<string, Spell> = {
  meteor_swarm: {
    id: 'meteor_swarm',
    name: 'Meteor Swarm',
    level: 9,
    school: 'Evocation',
    castingTime: '1 action',
    range: '1 mile',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point you choose must make a Dexterity saving throw. The sphere spreads around corners.',
    classes: ['sorcerer', 'wizard'],
    tags: ['damage', 'fire', 'bludgeoning', 'evocation', 'aoe', 'save', 'epic']
  },
  power_word_kill: {
    id: 'power_word_kill',
    name: 'Power Word Kill',
    level: 9,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'You utter a word of power that can compel one creature you can see within range to die instantly. If the creature you choose has 100 hit points or fewer, it dies. Otherwise, the spell has no effect.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    tags: ['damage', 'death', 'enchantment', 'power word', 'epic']
  },
  time_stop: {
    id: 'time_stop',
    name: 'Time Stop',
    level: 9,
    school: 'Transmutation',
    castingTime: '1 action',
    range: 'Self',
    components: 'V',
    duration: 'Instantaneous',
    description: 'You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal.',
    classes: ['sorcerer', 'wizard'],
    tags: ['utility', 'time', 'transmutation', 'self', 'epic']
  },
  wish: {
    id: 'wish',
    name: 'Wish',
    level: 9,
    school: 'Conjuration',
    castingTime: '1 action',
    range: 'Self',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires.',
    classes: ['sorcerer', 'wizard'],
    tags: ['utility', 'reality', 'conjuration', 'self', 'epic']
  }
}

// Compile all spells by level
export const allSpells: Record<string, Spell> = {
  ...cantrips,
  ...level1Spells,
  ...level2Spells,
  ...level3Spells,
  ...level4Spells,
  ...level5Spells,
  ...level6Spells,
  ...level7Spells,
  ...level8Spells,
  ...level9Spells
}

// Helper functions
export function getSpellsByClass(className: string): Spell[] {
  return Object.values(allSpells).filter(spell => 
    spell.classes.includes(className.toLowerCase())
  )
}

export function getSpellsByLevel(level: number): Spell[] {
  return Object.values(allSpells).filter(spell => spell.level === level)
}

export function getSpellsByClassAndLevel(className: string, level: number): Spell[] {
  return Object.values(allSpells).filter(spell => 
    spell.classes.includes(className.toLowerCase()) && spell.level === level
  )
}

export function getSpellsBySchool(school: string): Spell[] {
  return Object.values(allSpells).filter(spell => 
    spell.school.toLowerCase() === school.toLowerCase()
  )
}

export function getSpellsByTag(tag: string): Spell[] {
  return Object.values(allSpells).filter(spell => 
    spell.tags.includes(tag.toLowerCase())
  )
}

export function searchSpells(query: string): Spell[] {
  const lowercaseQuery = query.toLowerCase()
  return Object.values(allSpells).filter(spell => 
    spell.name.toLowerCase().includes(lowercaseQuery) ||
    spell.description.toLowerCase().includes(lowercaseQuery) ||
    spell.school.toLowerCase().includes(lowercaseQuery) ||
    spell.tags.some(tag => tag.includes(lowercaseQuery))
  )
}

// Spell progression tables for different caster types
export const spellsKnownProgression = {
  bard: {
    cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
  },
  sorcerer: {
    cantrips: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
  },
  warlock: {
    cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
  },
  ranger: {
    cantrips: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    spellsKnown: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
  },
  eldritch_knight: {
    cantrips: [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    spellsKnown: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
  },
  arcane_trickster: {
    cantrips: [0, 0, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
  }
}

// Prepared casters prepare spells differently
export const preparedSpellsFormula = {
  cleric: (level: number, wisdomModifier: number) => Math.max(1, level + wisdomModifier),
  druid: (level: number, wisdomModifier: number) => Math.max(1, level + wisdomModifier),
  wizard: (level: number, intelligenceModifier: number) => Math.max(1, level + intelligenceModifier),
  paladin: (level: number, charismaModifier: number) => Math.max(1, Math.floor(level / 2) + charismaModifier),
  artificer: (level: number, intelligenceModifier: number) => Math.max(1, Math.floor(level / 2) + intelligenceModifier)
}

// Cantrips known for prepared casters
export const cantripsKnownProgression = {
  cleric: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  druid: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  wizard: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
}

// Spell slot progression table
export const spellSlotProgression = {
  full: { // Cleric, Druid, Wizard
    1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    2: [0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    3: [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3]
  },
  half: { // Paladin, Ranger
    1: [0, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    2: [0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3]
  },
  third: { // Eldritch Knight, Arcane Trickster
    1: [0, 0, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    2: [0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3]
  }
}