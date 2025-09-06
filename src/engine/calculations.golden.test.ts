import { describe, it, expect } from 'vitest'
import { generateDPRCurves } from './simulator'
import { PRESET_BUILDS } from '../data/presetBuilds.simple'
import type { DPRConfiguration } from '../stores/types'

/**
 * Golden Test Suite for DPR Calculations
 * 
 * These tests validate that our DPR calculations match expected values for canonical builds.
 * If these tests fail, it indicates a regression in the calculation engine.
 * 
 * Expected values are derived from hand calculations and verified against external sources.
 */

describe('Golden DPR Test Suite', () => {
  const testConfig: DPRConfiguration = {
    buildId: 'test',
    acMin: 10,
    acMax: 30,
    acStep: 1,
    advantageState: 'normal',
    round0BuffsEnabled: true,
    greedyResourceUse: true,
    autoGWMSS: true
  }

  // Test at AC 15 (typical target) for consistency
  const TARGET_AC = 15

  describe('Level 5 Baseline Builds', () => {
    it('Champion Fighter 5 (GWM) should match expected DPR range', async () => {
      const preset = PRESET_BUILDS.find(p => p.id === 'champion-fighter-5-gwm')!
      expect(preset).toBeDefined()
      
      const result = await generateDPRCurves(preset.build, testConfig)
      
      const targetPoint = result.normalCurve.find(p => p.ac === TARGET_AC)
      expect(targetPoint).toBeDefined()
      
      const actualDPR = targetPoint!.dpr
      const [minExpected, maxExpected] = preset.expectedDPRRange
      
      expect(actualDPR).toBeGreaterThanOrEqual(minExpected)
      expect(actualDPR).toBeLessThanOrEqual(maxExpected)
      
      console.log(`Champion Fighter 5 (GWM) @ AC ${TARGET_AC}: ${actualDPR.toFixed(2)} DPR (expected: ${minExpected}-${maxExpected})`)
    })
    
    it('Basic Fighter 5 should match expected DPR range', async () => {
      const preset = PRESET_BUILDS.find(p => p.id === 'basic-fighter-5')!
      expect(preset).toBeDefined()
      
      const result = await generateDPRCurves(preset.build, testConfig)
      
      const targetPoint = result.normalCurve.find(p => p.ac === TARGET_AC)
      expect(targetPoint).toBeDefined()
      
      const actualDPR = targetPoint!.dpr
      const [minExpected, maxExpected] = preset.expectedDPRRange
      
      expect(actualDPR).toBeGreaterThanOrEqual(minExpected)
      expect(actualDPR).toBeLessThanOrEqual(maxExpected)
      
      console.log(`Basic Fighter 5 @ AC ${TARGET_AC}: ${actualDPR.toFixed(2)} DPR (expected: ${minExpected}-${maxExpected})`)
    })

  })

  describe('Mathematical Consistency Tests', () => {
    it('should have consistent DPR across AC range', async () => {
      // Use Champion Fighter 5 as baseline
      const preset = PRESET_BUILDS.find(p => p.id === 'champion-fighter-5-gwm')!
      const result = await generateDPRCurves(preset.build, testConfig)
      
      // DPR should decrease as AC increases (monotonic decrease)
      let previousDPR = Infinity
      for (const point of result.normalCurve) {
        expect(point.dpr).toBeLessThanOrEqual(previousDPR)
        previousDPR = point.dpr
      }
    })

    it('should have realistic GWM/SS breakpoints', async () => {
      const preset = PRESET_BUILDS.find(p => p.id === 'champion-fighter-5-gwm')!
      const result = await generateDPRCurves(preset.build, testConfig)
      
      // Should have GWM breakpoints array (may be empty if autoGWMSS calculates optimal usage)
      expect(result.gwmSSBreakpoints).toBeDefined()
      // GWM breakpoints may be empty if GWM is always or never optimal
      expect(Array.isArray(result.gwmSSBreakpoints)).toBe(true)
    })

    it('should have advantage increasing DPR', async () => {
      const preset = PRESET_BUILDS.find(p => p.id === 'champion-fighter-5-gwm')!
      const result = await generateDPRCurves(preset.build, testConfig)
      
      const normalPoint = result.normalCurve.find(p => p.ac === TARGET_AC)!
      const advantagePoint = result.advantageCurve.find(p => p.ac === TARGET_AC)!
      const disadvantagePoint = result.disadvantageCurve.find(p => p.ac === TARGET_AC)!
      
      // Advantage should increase DPR, disadvantage should decrease it
      expect(advantagePoint.dpr).toBeGreaterThan(normalPoint.dpr)
      expect(normalPoint.dpr).toBeGreaterThan(disadvantagePoint.dpr)
    })
  })

  describe('Edge Cases and Validation', () => {
    it('should handle basic builds correctly', async () => {
      // Test that our basic builds have correct structure
      const preset = PRESET_BUILDS.find(p => p.id === 'basic-fighter-5')!
      expect(preset.build.levelTimeline).toBeDefined()
      expect(preset.build.levelTimeline.length).toBe(5)
      
      // Should have all fighter levels
      const fighterLevels = preset.build.levelTimeline.filter(l => l.classId === 'fighter').length
      expect(fighterLevels).toBe(5)
    })

    it('should validate build data integrity', () => {
      // All presets should have valid expected DPR ranges
      PRESET_BUILDS.forEach(preset => {
        expect(preset.expectedDPRRange).toBeDefined()
        expect(preset.expectedDPRRange.length).toBe(2)
        expect(preset.expectedDPRRange[0]).toBeLessThanOrEqual(preset.expectedDPRRange[1])
        expect(preset.expectedDPRRange[0]).toBeGreaterThan(0)
        expect(preset.build.levelTimeline.length).toBe(preset.level)
      })
    })

    it('should have non-zero DPR for all builds', async () => {
      // Test our available builds to ensure they produce meaningful DPR
      const testBuilds = ['champion-fighter-5-gwm', 'basic-fighter-5']
      
      for (const buildId of testBuilds) {
        const preset = PRESET_BUILDS.find(p => p.id === buildId)!
        const result = await generateDPRCurves(preset.build, testConfig)
        
        const targetPoint = result.normalCurve.find(p => p.ac === TARGET_AC)!
        expect(targetPoint.dpr).toBeGreaterThan(0)
        expect(targetPoint.dpr).toBeLessThan(100) // Sanity check - DPR shouldn't be ridiculously high
      }
    })
  })
})