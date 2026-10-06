# Dungeon Crawler Carl — Crawler Forge 0.2.0

Independent Foundry VTT v14 system. System ID: `dcc-crawler-forge`.

## Installation and updating

Back up your world before updating. Extract the ZIP's `dcc-crawler-forge` folder into your Foundry User Data `systems` directory, replacing the earlier Crawler Forge folder. The final path is `systems/dcc-crawler-forge/system.json`. Restart Foundry. Existing Crawler Forge worlds keep the same system ID. For an initial installation, create a new world using **Dungeon Crawler Carl — Crawler Forge**.

This remains a separate system from other Dungeon Crawler Carl implementations. No migration from another system is supplied. Test this build in a copied or new v14 world first.

Forge installation requires hosting the package and its manifest. Add a permanent `manifest` URL and release ZIP `download` URL to system.json, and include that same manifest in the hosted ZIP. Use that manifest URL in Forge's custom system installer. Automatic updates are not configured in this locally installable package.

## Start here

1. In Reference, use **Create starter crawler (GM)**. The sample includes Unarmed Combat, Fists, passive Heal, Endurance and Fabricate.
2. Enter base and enhanced stats on Identity. Derived equipment bonuses, Mana maximum, slot strength, movement and DR update automatically.
3. Import **DCC-Crawler-Forge-Private-Reference-v0.2.0.json** through the Reference tab as GM. This separate file contains your supplied source material; keep it private. Imports can be repeated without duplicating source records.
4. Drop world Items onto actors. Edit weapons to link an owned skill, and configure damage dice and damage stat separately. Edit spells and skills to set their checks, action cost, cooldown and rank upgrades.
5. Use Gear to equip items and select the ten Hotlist items. Slot and external-buff limits also apply to direct edits. Set flat and percentage bonuses explicitly on items.
6. Use the Dungeon tools to start an encounter for scene tokens. The system's phase controls and **Next round** process actions, cleanup and the shared ten-second round clock. Use these controls rather than Foundry's standard next-round button.
7. Roll from Skills, Magic or Combat. Select the target token before a targeted roll. Target damage/healing requires ownership; otherwise the GM applies it. Mob attacks announce attack difficulty for crawler reactions.
8. Use Advancement for level awards, Stat-point claims, allocation, marked skill advancement and grinding; Crafting for projects, junk, work hours and bench requirements.

## Added in 0.2.0

- Eleven tabs: Identity, Skills, Magic, Combat, Gear, Advancement, Crafting, Dungeon, Story, Companions and Reference.
- Crawler, adversary and companion actor types; thirteen item types, including consumables, quests, recipes and crafting tables.
- Encounter phases, action expenditure, AI Favor extra actions and pre-result rerolls, cooldowns and shared dungeon/floor clocks.
- Conditions, stacking penalties, ongoing-damage cleanup, shields, damage types, fatal damage saves, death timers and rest recovery.
- Source-based Mob and Boss Health Bars; pet Health, floor ranks, once-per-round attacks and owner-linked level awards.
- Equipment-derived stats and DR, location/slot checks, Hotlist enforcement and external-buff limits.
- Structured rank upgrades for check, damage, Mana, healing and shield values; Tutorial Floor caps and confirmation for rank edits.
- Passive spells, scrolls, potions, spellbooks, healing targets and linked weapon skill upgrades.
- Advancement ledgers, boss/crawler-kill awards, grinding, mundane/magic crafting, salvage and enchantment risk.
- Loot, party-check summaries, quest rewards, popularity tools and companion commands.
- Searchable private rules references, idempotent imports and linked roll-table subtables.

## Private reference import

The separate JSON supplies 272 journals (including 154 readable table references), 20 checked rollable tables and 27 starter item records. All seven source documents are preserved as searchable text. Only tables with unambiguous complete numeric ranges were converted; flattened or contradictory source tables remain readable references. In particular, several GMTK neighborhood tables describe a d20 but expose only rows 1–6, so their missing ranges were not invented.

The import also accepts Foundry RollTable JSON, an array, or an object containing `tables`. Rollable table results use v14 document types. Source tables and book text are deliberately outside this system ZIP.

## GM adjudication and limits

This release automates the common numerical workflows; individual race/class abilities, unusual spell effects, recipes and GM exceptions still need configuration and adjudication. Plain-text effects and rank-effect lines display on chat cards; they are not automatically interpreted as arbitrary rules. Enter item bonuses and structured upgrades to make those values automatic. Enchantment outcomes need their actual magical properties configured after creation.

Companion special commands, opposed Animal Handling requirements, encounter narrative and individual exception rules remain GM decisions. Torch token lighting and positional movement are manual. Combat phase order is controlled by the GM; phase labels do not enforce every possible action restriction. Use a designated GM for cleanup and shared clock changes. Advance rest time once for the party, not once per actor. Grinding time entry is a checkpoint; do not also advance the shared clock for the same hours.

The v14 manifest compatibility declaration is a target, not evidence of a live server test. The proprietary Foundry client/server is unavailable in this workspace.

## Validation

39 automated tests pass, covering derived statistics, native registration, all tab contexts, item constraints, action/Favor use, damage, shields, dying, conditions, advancement, companions, scrolls, cooldowns, reference imports, crafting calculations and table boundaries. These include mock integration tests; a live Foundry/Forge session is still needed. JavaScript syntax and ZIP integrity are checked separately.

Run from the system folder: `node --test tests/*.test.mjs`.

API references: https://foundryvtt.com/api/v14/ and https://foundryvtt.com/article/system-development/.
