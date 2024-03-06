function getProficiencies(actor) {
	let filters = [];
	const proficiencies = actor.system.proficiencies.attacks;
	for (const proficiencyName of Object.keys(proficiencies)) {
		if (proficiencies[proficiencyName].rank < 1) {
			continue;
		}
		if (proficiencyName === "unarmed" || proficiencyName === "simple" || proficiencyName === "martial" || proficiencyName === "advanced") {
			if (proficiencies[proficiencyName].rank > 0) {
				filters.push(`item:category:${proficiencyName}`);
			}
		} else if (proficiencyName.match(/^weapon-base-/)) {
			const base = proficiencyName.match(/^weapon-base-(.*)/)[1];
			filters.push(`item:base:${base}`);
		} else if (proficiencyName.match(/^weapon-group-/)) {
			const base = proficiencyName.match(/^weapon-group-(.*)/)[1];
			filters.push(`item:base:${base}`);
		} else if (proficiencies[proficiencyName].definition !== undefined) {
			if (proficiencies[proficiencyName].definition.length === 1) {
				filters.push(proficiencies[proficiencyName].definition[0]);
			} else {
				filters.push({ and: proficiencies[proficiencyName].definition });
			}
		}
	}
	return filters;
}

Hooks.on("ready", () => {
	game.warlockPf2e = {
		actions: {
			createEnergyBlastStrike: async function (actor) {
				const filters = getProficiencies(actor)
				let energyBlastEffect = duplicate(await fromUuid("Compendium.warlock-pf2e.warlock-effects.Item.8nTUZhGt9c1BN9xg"));
				delete energyBlastEffect._id;
				energyBlastEffect.flags = {};
				energyBlastEffect.system.rules[0].choices.filter[2].or = filters;
				let doc = (await actor.createEmbeddedDocuments("Item", [energyBlastEffect]))[0];
				let weapon = await fromUuid(doc.system.rules[0].selection);
				let updated = { system: { rules: duplicate(doc.system.rules) } };
				let traits = ["agile", "free-hand", "magical", "occult", "propulsive"];
				let rangeIncrement = weapon.range?.increment ?? 0;
				for (const trait of weapon.system.traits.value) {
					if (trait.startsWith("thrown-")) {
						rangeIncrement = Math.max(rangeIncrement, Number(trait.match(/^thrown-(.*)/)[1]));
					}
					if (traits.indexOf(trait) === -1 && !trait.startsWith("thrown")) {
						traits.push(trait);
					}
				}
				if (actor.getRollOptions('self').includes('feat:essence-weapon')) {
					traits.push(`thrown-${rangeIncrement}`);
					updated.system.rules[1] = { key: "Strike", damage: { base: { damageType: "force", dice: weapon.system.damage.dice, die: weapon.system.damage.die } }, traits: traits, ability: "cha", slug: "energy-blast" };
				} else {
					updated.system.rules[1] = { key: "Strike", damage: { base: { damageType: "force", dice: weapon.system.damage.dice, die: weapon.system.damage.die } }, traits: traits, range: weapon.range ?? (rangeIncrement !== 0 ? { increment: rangeIncrement } : null), ability: "cha", slug: "energy-blast" };
				}
				await doc.update(updated);
			},
			createEldritchWeaponStrike: async function (actor) {
				const filters = getProficiencies(actor)
				let eldritchWeaponEffect = duplicate(await fromUuid("Compendium.warlock-pf2e.warlock-effects.Item.l4lrhNSBzwTplhnq"));
				delete eldritchWeaponEffect._id;
				eldritchWeaponEffect.flags = {};
				eldritchWeaponEffect.system.rules[0].choices.filter[2].or = filters;
				let doc = (await actor.createEmbeddedDocuments("Item", [eldritchWeaponEffect]))[0];
				let weapon = await fromUuid(doc.system.rules[0].selection);
				let updated = { system: { rules: duplicate(doc.system.rules) } };
				let traits = ["agile", "backstabber", "free-hand", "magical", "occult", "propulsive"];
				let rangeIncrement = weapon.range?.increment ?? 0;
				for (const trait of weapon.system.traits.value) {
					if (trait.startsWith("thrown-")) {
						rangeIncrement = Math.max(rangeIncrement, Number(trait.match(/^thrown-(.*)/)[1]));
					}
					if (traits.indexOf(trait) === -1 && !trait.startsWith("thrown")) {
						traits.push(trait);
					}
				}
				if (actor.getRollOptions('self').includes('feat:essence-weapon')) {
					traits.push(`thrown-${rangeIncrement}`);
				}
				updated.system.rules[1] = { key: "Strike", damage: { base: { damageType: "force", dice: weapon.system.damage.dice, die: weapon.system.damage.die } }, traits: traits, ability: "cha", slug: "eldritch-weapon" };
				await doc.update(updated);
			}
		}
	};
});
