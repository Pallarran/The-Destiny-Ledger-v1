# LudicSavant’s DPR Calculator
Version 2.0
Concept, Original Version, Mathematics, UI, Proofreading, and Testing by LudicSavant
Additional Mathematics, Programming, and Documentation by AureusFulgens
If you enjoy our work and want to help us to make more of it, you can support us on Patreon!
## Using the Calculator
The Calculator is formatted as a Google spreadsheet, augmented with JavaScript code through Google Apps Script. The version we have posted is view-only, so to use it, you will want to make a copy local to your own Google Drive.
To operate, simply edit the white fields in the Inputs column. The tooltips should explain any finicky details. You are not advised to edit the Outputs fields, or the calculation tables at the bottom of the sheet, unless you know what you’re doing.
## The Formulas
This section will document the formulas used in our DPR calculator. Herein, I assume minimal background in probability theory, and so I explain as much as possible; if this is background you already have, you may skim some parts.
### Hit & Save Probabilities
Basic Probability of Hitting/Making a Save
The probability of hitting a given AC with a given attack bonus is
.
We force the minimum value to be 0.05 (since a natural 20 is always a hit) and the maximum to be 0.95 (since a natural 1 is always a miss).
The same formula can be used to compute the probability of making a save against a given DC with a given bonus:

In this case, however, the thresholds are 0 and 1, since there are no critical effects on rolls other than attacks. Also note that from the perspective of the person imposing the save, “success” is when the target fails their save, so that the probability of caster success is

Advantage, Disadvantage, and Elven Accuracy
Succeeding on a roll with advantage consists of succeeding on one, the other, or both of two rolls (or, rather, not failing both), and succeeding on a roll with disadvantage consists of succeeding on both of two rolls. So if our probability of success on a single die roll is P, computed as above, we have
.
Xanathar’s Guide to Everything also provides the Elven Accuracy feat, which can turn advantage into a sort of super-advantage that boils down to succeeding on at least one of three rolls (or, rather, not failing all of three). So we can compute this as
.
Halfling Luck
A halfling has a racial feature, Lucky, which gives them the ability to reroll one d20 (very specifically one d20 - the rule is on PHB 173) if they roll a 1. Success with this feature amounts to either succeeding without it, or failing but also rolling a 1, and then succeeding on the additional roll. This feature interacts with advantage and disadvantage, so we get the following formulas, which you may think of as adding a small bonus to the normal probability:

There is also a formula for applying Halfling Luck and Elven Accuracy together, and yes, if you click both checkboxes on our calculator, this formula will be applied. However, this is obviously lunacy, and cannot be applied to any actual character, unless you have some strange way of both being an elf and a halfling, in which case we would like a word with your DM.
These formulas, once again, also work to compute a halfling’s probability of succeeding on a save, with one modification. These formulas depend on the fact that the reroll condition (rolling a 1) is always a critical failure by itself. This is not true for saves, and with a high enough save bonus, a natural 1 can be a success. However, in these cases, the halfling’s probability of success is 100%, and having Luck does not change that.
Bonus and Penalty Dice
Ludic’s note:  Some people mistakenly think that Bless is equivalent to +2.5 to your attack bonus.  This isn’t actually true, for reasons explained in detail here:   .  Aureus’s calculation is the correct one.
This section is mathematically pretty technical compared to the rest of the document.
Certain effects can allow you to roll additional dice and add them to an attack roll, with the cleric spell Bless, which adds 1d4 to attacks and saving throws, being the archetypal example. Similarly, effects like Bane and Synaptic Static (XGE) subtract dice from attacks and saves.
Computing how this changes the probability is a nasty, fiddly thing, and is one of the reasons that we used scripts. However, we can summarize the process as follows.
First, compute the probability of bonus dice granting you a particular bonus to your hit. This is best done using something like a table. For example, suppose that we are a Fighter whose Cleric buddy has cast Bless on us, and whose first-level Bard friend has given us Inspiration. Then the total bonus we get will be:

So we may enjoy a bonus anywhere between 2 and 10, and the total probability of getting a given bonus is the number of cells in the table with that bonus, divided by the total number of cells in the table. For example, the probability that our bard and cleric together give us +4 to hit is 3/24. Similarly, we may compute another table to account for the enemy Bard using Cutting Words on us and the enemy Vengeance Paladin casting Bane on us. This is onerous on paper, but a short computer program can compute it easily.
Now, with this computed, we will abbreviate as H(AC, attack) the probability of getting a hit against a given AC with a given bonus, taking into account all of the other features we’ve already discussed. Then
.
Where we take the sum over all possible combinations of a bonus and a penalty from the additional dice. So, in the simple case where we only have Bless on ourselves, are attacking an AC of 15, and have a normal attack bonus of 4, we would compute

Clear as mud, right?
Critical Hits
The math we’ve already done enables us to compute the probability of a Critical Hit: if T is our threshold (20 for most characters, but 19 and later 18 for Champion fighters), then the probability of a critical hit is just the probability of hitting an AC of T with no attack bonus.

We can then apply our modifying formulas for advantage, disadvantage, Elven Accuracy, and Halfling Luck.

Bonus and penalty dice have no effect: all that matters are effects that change how likely we are to see a high enough number on the d20 itself.
### Computing Damage
In general, computing average damage is mercifully simple in comparison with the hoops we have to jump through to compute hit probabilities.
Average Damage
The average roll, or expected value, from a single dN (for some, usually even, number N) is just

We can compute this more explicitly by adding up all the different possible outcomes - the numbers 1 through N - and dividing by N:

From this point on, we assume all damage dice are d4, d6, d8, d10, or d12.
The average of multiple of the same size of die, or KdN (add up K rolls of a dN) is just the average of 1dN times K. For example,

Then we can simply add together different kinds of dice, and static bonuses:

Rerolling/Substituting Dice
The Great Weapon Fighting style allows the player to reroll any 1’s or 2’s that they roll. So, to compute the average damage, we modify our computation from above:

To explain more prosaically, we again add together all of the possible outcomes, depending on which of the six sides of the die come up. But a 1 or a 2 gives us another (normal) d6 roll, so the value of either of those is the average of 1d6, or 3.5.
In a similar vein, the Elemental Adept feat allows any 1’s rolled on damage dice to be treated as 2’s. So we may compute, for example,

Theoretically, we can compute the result if both take place. That is, if we somehow have a Great Weapon made out of fire. I don’t know, your DM might make it happen, and if they do, then our calculator can compute it for you. This would give us the computation:

That is, we treat either the 1 or the 2 face of the d6 as having a value equal to a roll of 1d6 with Elemental Adept.
Ludic’s note: The Flames of Phlegethos feat’s effect on fire damage is calculated the same way -- essentially changing the average result of, say, a d6 from 3.5 to (3.5+2+3+4+5+6)/6 = 3.916666 repeating.  Interestingly, different die sizes nearly balance out, since a larger die size means you gain more each time you reroll a 1, but that you reroll 1s less… so you can kind of think of it in your head as approximately +.5 damage per die.  If you want to stack it with other reroll effects like Elemental Adept, you would simply replace the “3.5” in that equation with whatever the average produced by that *other* reroll is (for example:  Elemental Adept 1d6 is 3.6666 repeating, so FoP + EA would be (3.6667 + 2 + 3 + 4 + 5 + 6)/6.
Critical Hits
Recall that a Critical Hit allows you to roll all damage dice twice. You might also have bonus dice on such an attack, as the Barbarian’s class features or the Orc’s racial features might offer.
Minimum and Maximum Damage
To compute the minimum damage a set of dice can give us, we just add up a roll of 1 from each die, and add our damage bonus. So the result is just the number of dice, plus the bonus.
To compute the maximum damage, we add up the maximum roll from each die, and add the bonus. So the result is the sum of the sizes of all the dice, plus the bonus.
### Damage Per Round: Attack Rolls
At this point, we can compute how likely we are to land a hit against a given AC, how likely we are to crit, and how much damage we will deal on average. Now we’re ready to put it all together.
Basic DPR
Let P be the probability of a hit, C be the probability of a crit, DPH be the average damage done on a hit, and DPC be the average damage done on a crit. Then the average damage done by a single attack is

That is, the probability of getting a regular hit (not a crit) times DPH, plus the probability of getting a crit times DPC.
If we get multiple attacks in a round, we just add up the expected damage for each one. Multiple instances of the same attack can be computed by multiplying E(damage) by the number of attacks.
Once-Per-Turn Effects
This section is also pretty technical. We assume that you will use a once-per-turn effect like Sneak Attack or Divine Strike on the first hit you land.
First, the probability of scoring at least one hit. As when we computed advantage, we may think of this as the probability that we don’t miss on every attack in a single round. So, if P is our chance to hit, then
.
If we also have a separate bonus action attack(s), with hit chance B, then this becomes

We also need the probability that, if we have at least one hit, then the first is a crit. We have to do this in two stages, splitting between “crit on regular attacks” and “crit on bonus attacks.” To do this, we use the following formula. We’ll be using the simplifying assumption that all regular attacks take place before all bonus action attacks; for a further discussion of the assumptions of this type that we make, see The Role of Player Choice below.

What’s going on here: We are computing the probability that the first hit is a crit, given that we have at least one hit. To do this, we split into the case that the first hit is among the normal attacks: P(one norm. hit), and the case that there are no normal hits but there is at least one attack among the bonus action attacks: P(no norm. hits)*P(one bon. hit).
In each case, then, we multiply by the probability of a crit given that we are known to have a hit. That is, the proportion of crits among hits. This is just C/P or C/B. (The fact that these values could be different is why we have to split the two cases.)
So, if the damage from our once-per-turn effects is DS and the additional damage this effect yields on a crit is DSC (the average of the damage dice without static bonuses), then we get three additional damage terms:





Power Attacks
The feats Sharpshooter and Great Weapon Master both offer the option to take a -5 penalty to hit in return for a +10 bonus to damage. We can compute the resulting damage easily: just subtract 5 from the attack bonus used in each calculation, and then add 10 to the DPH and DPC values.
GWM Crit Bonus
Great Weapon Master also offers a sort of cleave effect, where, if you score a critical hit, you can take a bonus action to make an additional attack, replacing your normal bonus action option. To reflect this, we add another term to the DPR computation: the probability of at least one critical hit among the regular attack rolls, times the damage from one regular attack minus the damage from the normal bonus action attack routine. (Note:  This box should not be checked if your normal bonus action already does more damage than the GWM crit bonus action, because then there’d be no need to replace it when you crit)
### Damage Per Round: Save Effects
Half Damage
Many save effects have the target still take half damage on a successful save. We have to be a little bit careful in computing half damage, because D&D always rounds the results of division down, and so the half-average of DPH will be slightly less than DPH/2. The difference, in fact, is at most 0.5, and its exact value is determined by the ratio of odd damage results to even results.
In most cases, the value DPH/2 - 0.25 is the exact correct value. This is because the probability of an even damage result is equal to that of an odd damage result - so we round down by 0.5 exactly half the time, for an adjustment of -0.25.
One feature we use breaks this symmetry, however: Elemental Adept, which turns all 1’s into 2’s. In these cases, computing the exact adjustment is prohibitively difficult, and we still use DPH/2 - 0.25 as an approximation. The actual value is between DPH/2 - 0.25 and DPH/2, so that the error is at most 0.25 - and we figured that most users would not mind an uncertainty of a quarter of a hit point. Users are welcome to perform the intensive calculations required to figure out the true discrepancy, if it really bothers them.
Ludic’s note:  As Aureus discusses above, Elemental Adept + Save for Half is the only place in the entire calculator where there’s a very small margin of error instead of a 100% precise result.  Basically it came down to us having the time to do the calculations to get rid of that miniscule -- and likely to the vast majority of people negligible -- margin of error in that one edge case, or having the time to implement and test a ton of other features.
Damage on Save and Damage on Fail
We divide save effects into three classes, depending on what they inflict on a successful save (damage on save, or DOS) and what they inflict on a failed save (damage on failure, or DOF).
No save: Full damage in all cases.
Save negates: No damage on successful save, full damage on failed save.
Save for half: Half damage on successful save, full damage on failed save.
Then a certain feature offered by the Rogue, Ranger, and Monk classes, and by the Mounted Combatant feat, converts the third type into
Evasion: No damage on successful save, half damage on failed save.
Once we have computed both of these values, we can compute the average damage dealt to a particular target as, letting F be the probability of a failed save:

Then we simply multiply this by the number of targets and conclude.