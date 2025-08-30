import type { Armor } from '../types'

export const armor: Record<string, Armor> = {
  // Light Armor
  leather: {
    id: 'leather',
    name: 'Leather',
    type: 'light',
    ac: 11,
    dexModifier: 'full',
    stealthDisadvantage: false,
    cost: 10,
    weight: 10
  },
  studded_leather: {
    id: 'studded_leather',
    name: 'Studded Leather',
    type: 'light',
    ac: 12,
    dexModifier: 'full',
    stealthDisadvantage: false,
    cost: 45,
    weight: 13
  },

  // Medium Armor
  hide: {
    id: 'hide',
    name: 'Hide',
    type: 'medium',
    ac: 12,
    dexModifier: 'limited',
    dexMax: 2,
    stealthDisadvantage: false,
    cost: 10,
    weight: 12
  },
  chain_shirt: {
    id: 'chain_shirt',
    name: 'Chain Shirt',
    type: 'medium',
    ac: 13,
    dexModifier: 'limited',
    dexMax: 2,
    stealthDisadvantage: false,
    cost: 50,
    weight: 20
  },
  scale_mail: {
    id: 'scale_mail',
    name: 'Scale Mail',
    type: 'medium',
    ac: 14,
    dexModifier: 'limited',
    dexMax: 2,
    stealthDisadvantage: true,
    cost: 50,
    weight: 45
  },
  breastplate: {
    id: 'breastplate',
    name: 'Breastplate',
    type: 'medium',
    ac: 14,
    dexModifier: 'limited',
    dexMax: 2,
    stealthDisadvantage: false,
    cost: 400,
    weight: 20
  },
  half_plate: {
    id: 'half_plate',
    name: 'Half Plate',
    type: 'medium',
    ac: 15,
    dexModifier: 'limited',
    dexMax: 2,
    stealthDisadvantage: true,
    cost: 750,
    weight: 40
  },

  // Heavy Armor
  ring_mail: {
    id: 'ring_mail',
    name: 'Ring Mail',
    type: 'heavy',
    ac: 14,
    dexModifier: 'none',
    stealthDisadvantage: true,
    cost: 30,
    weight: 40,
    strengthRequirement: 0
  },
  chain_mail: {
    id: 'chain_mail',
    name: 'Chain Mail',
    type: 'heavy',
    ac: 16,
    dexModifier: 'none',
    stealthDisadvantage: true,
    cost: 75,
    weight: 55,
    strengthRequirement: 13
  },
  splint: {
    id: 'splint',
    name: 'Splint',
    type: 'heavy',
    ac: 17,
    dexModifier: 'none',
    stealthDisadvantage: true,
    cost: 200,
    weight: 60,
    strengthRequirement: 15
  },
  plate: {
    id: 'plate',
    name: 'Plate',
    type: 'heavy',
    ac: 18,
    dexModifier: 'none',
    stealthDisadvantage: true,
    cost: 1500,
    weight: 65,
    strengthRequirement: 15
  }
}

export const shields: Record<string, Armor> = {
  shield: {
    id: 'shield',
    name: 'Shield',
    type: 'shield',
    ac: 2,
    dexModifier: 'none',
    stealthDisadvantage: false,
    cost: 10,
    weight: 6
  }
}