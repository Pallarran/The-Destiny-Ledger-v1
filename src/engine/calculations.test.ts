import { describe, it, expect } from 'vitest'
import {
  calculateHitProbability,
  calculateDiceExpectedValue,
  calculateDamageRoll,
  calculateSingleAttackDPR,
  shouldUsePowerAttack
} from './calculations'
import type { DamageRoll, DiceRoll } from './types'

describe('DPR Calculations', () => {
  describe('calculateHitProbability', () => {
    it('should calculate basic hit probability correctly', () => {
      // +5 to hit vs AC 15 = need to roll 10+ = 55% hit chance
      const result = calculateHitProbability(5, 15, 'normal')
      expect(result.hit).toBeCloseTo(0.50) // 50% normal hit
      expect(result.crit).toBeCloseTo(0.05) // 5% crit
      expect(result.miss).toBeCloseTo(0.45) // 45% miss
    })
    
    it('should handle advantage correctly', () => {
      const result = calculateHitProbability(5, 15, 'advantage')
      // With advantage, hit chance = 1 - (miss chance)^2
      // Miss chance = 0.45, so hit = 1 - 0.45^2 = 0.7975
      expect(result.hit + result.crit).toBeCloseTo(0.7975)
      // Crit with advantage = 1 - 0.95^2 = 0.0975
      expect(result.crit).toBeCloseTo(0.0975)
    })
    
    it('should handle disadvantage correctly', () => {
      const result = calculateHitProbability(5, 15, 'disadvantage')
      // With disadvantage, hit chance = (base hit)^2
      // Base hit = 0.55, so hit = 0.55^2 = 0.3025
      expect(result.hit + result.crit).toBeCloseTo(0.3025)
      // Crit with disadvantage = 0.05^2 = 0.0025
      expect(result.crit).toBeCloseTo(0.0025)
    })
    
    it('should cap at 95% hit chance', () => {
      const result = calculateHitProbability(20, 10, 'normal')
      expect(result.hit + result.crit).toBeLessThanOrEqual(0.95)
    })
    
    it('should have minimum 5% hit chance', () => {
      const result = calculateHitProbability(0, 30, 'normal')
      expect(result.hit + result.crit).toBeGreaterThanOrEqual(0.05)
    })
  })
  
  describe('calculateDiceExpectedValue', () => {
    it('should calculate d6 average correctly', () => {
      const dice: DiceRoll = { count: 1, die: 6 }
      expect(calculateDiceExpectedValue(dice)).toBe(3.5)
    })
    
    it('should calculate 2d6 average correctly', () => {
      const dice: DiceRoll = { count: 2, die: 6 }
      expect(calculateDiceExpectedValue(dice)).toBe(7)
    })
    
    it('should handle Great Weapon Fighting rerolls', () => {
      const dice: DiceRoll = { count: 2, die: 6, rerollOnes: true, rerollTwos: true }
      // With GWF, 1s and 2s become 3.5 average
      // Expected value = (3.5 + 3.5 + 3 + 4 + 5 + 6) / 6 = 4.167
      expect(calculateDiceExpectedValue(dice)).toBeCloseTo(8.33, 1)
    })
    
    it('should calculate d12 with reroll 1s correctly', () => {
      const dice: DiceRoll = { count: 1, die: 12, rerollOnes: true, rerollTwos: false }
      // 1 becomes 6.5, so (6.5 + 2 + 3 + ... + 12) / 12
      expect(calculateDiceExpectedValue(dice)).toBeCloseTo(6.96, 1)
    })
  })
  
  describe('calculateDamageRoll', () => {
    it('should calculate simple damage correctly', () => {
      const damage: DamageRoll = {
        baseDice: [{ count: 1, die: 8 }],
        bonusDamage: 5,
        additionalDice: []
      }
      // 1d8 (4.5 average) + 5 = 9.5
      expect(calculateDamageRoll(damage)).toBe(9.5)
    })
    
    it('should include additional dice', () => {
      const damage: DamageRoll = {
        baseDice: [{ count: 1, die: 8 }],
        bonusDamage: 5,
        additionalDice: [{ count: 2, die: 6 }] // Sneak Attack 2d6
      }
      // 1d8 (4.5) + 5 + 2d6 (7) = 16.5
      expect(calculateDamageRoll(damage)).toBe(16.5)
    })
    
    it('should handle multiple base dice', () => {
      const damage: DamageRoll = {
        baseDice: [
          { count: 2, die: 6 }, // Greatsword
          { count: 1, die: 4 }  // Elemental damage
        ],
        bonusDamage: 3,
        additionalDice: []
      }
      // 2d6 (7) + 1d4 (2.5) + 3 = 12.5
      expect(calculateDamageRoll(damage)).toBe(12.5)
    })
  })
  
  describe('calculateSingleAttackDPR', () => {
    it('should calculate basic attack DPR', () => {
      const damage: DamageRoll = {
        baseDice: [{ count: 1, die: 8 }],
        bonusDamage: 5,
        additionalDice: []
      }
      
      // +5 to hit vs AC 15, 1d8+5 damage
      // 50% hit * 9.5 damage + 5% crit * (9.5 + 4.5) damage
      const dpr = calculateSingleAttackDPR(5, damage, 15, 'normal')
      expect(dpr).toBeCloseTo(5.45)
    })
    
    it('should handle advantage correctly', () => {
      const damage: DamageRoll = {
        baseDice: [{ count: 1, die: 8 }],
        bonusDamage: 5,
        additionalDice: []
      }
      
      const normalDPR = calculateSingleAttackDPR(5, damage, 15, 'normal')
      const advantageDPR = calculateSingleAttackDPR(5, damage, 15, 'advantage')
      
      // Advantage should increase DPR
      expect(advantageDPR).toBeGreaterThan(normalDPR)
    })
  })
  
  describe('shouldUsePowerAttack', () => {
    it('should recommend power attack against low AC', () => {
      // High attack bonus vs low AC = use power attack
      const result = shouldUsePowerAttack(10, 10, 12, 'normal')
      expect(result).toBe(true)
    })
    
    it('should not recommend power attack against high AC', () => {
      // Low attack bonus vs high AC = don't use power attack
      const result = shouldUsePowerAttack(5, 10, 20, 'normal')
      expect(result).toBe(false)
    })
    
    it('should find correct GWM threshold', () => {
      // Test various AC values to find threshold
      const attackBonus = 8
      const baseDamage = 10
      
      let threshold = 0
      for (let ac = 10; ac <= 25; ac++) {
        const usePA = shouldUsePowerAttack(attackBonus, baseDamage, ac, 'normal')
        if (threshold === 0 && !usePA) {
          threshold = ac - 1
          break
        }
      }
      
      // Threshold should be around AC 16-17 for these stats
      expect(threshold).toBeGreaterThan(14)
      expect(threshold).toBeLessThan(19)
    })
  })
})

describe('Edge Cases', () => {
  it('should handle zero dice correctly', () => {
    const damage: DamageRoll = {
      baseDice: [],
      bonusDamage: 5,
      additionalDice: []
    }
    expect(calculateDamageRoll(damage)).toBe(5)
  })
  
  it('should handle negative attack bonus', () => {
    const result = calculateHitProbability(-5, 15, 'normal')
    expect(result.hit + result.crit).toBeGreaterThanOrEqual(0.05)
  })
  
  it('should handle very high AC', () => {
    const result = calculateHitProbability(10, 35, 'normal')
    expect(result.hit + result.crit).toBe(0.05) // Minimum hit chance
  })
})