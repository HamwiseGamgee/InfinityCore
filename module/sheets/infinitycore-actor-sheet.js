import SkillRoll from "../apps/skillroll.js";

export default class InfinityCoreActorSheet extends ActorSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    prepareData() {
        super.prepareData();
        const system = this.actor.system;
        const attributes = system.attributes ?? {};

        // Ensure all attributes have a value
        for (const attrKey in attributes) {
            if (attributes[attrKey].value == null) {
                attributes[attrKey].value = 7;
            }
        }

        // Initialize structured traits (they use .value and .max)
        const structuredTraits = {
            vigour: 7,
            firewall: 7,
            resolve: 7
        };

        for (const key in structuredTraits) {
            system[key] = system[key] || {};
            if (system[key].value == null) {
                system[key].value = structuredTraits[key];
            }
        }

        // Initialize flat numeric stats
        const flatStats = {
            armor: 0,
            morale: 0,
            security: 0
        };

        for (const key in flatStats) {
            if (system[key] == null || typeof system[key] === "object") {
                system[key] = flatStats[key];
            }
        }
    }


    prepareDerivedData() {
        super.prepareDerivedData();
        const system = this.actor.system;

        const brawn = system.attributes?.brawn?.value ?? 0;
        const resistance = system.attributes?.brawn?.skill?.resistance?.value ?? 0;
        system.vigour.max = brawn + resistance;

        const intelligence = system.attributes?.intelligence?.value ?? 0;
        const hacking = system.attributes?.intelligence?.skill?.hacking?.value ?? 0;
        system.firewall.max = intelligence + hacking;

        const willpower = system.attributes?.willpower?.value ?? 0;
        const discipline = system.attributes?.willpower?.skill?.discipline?.value ?? 0;
        system.resolve.max = willpower + discipline;
    }

    async getData(options) {
        const baseData = await super.getData(options);
        const context = await this._prepareContext(options);
        return foundry.utils.mergeObject(baseData, context);
    }

    async _prepareContext(options) {
        const systemData = this.actor.system ?? {};
        const attributes = systemData.attributes ?? {};
        const disciplines = systemData.skill ?? {};
        const notes = systemData.notes ?? "";

        for (const attr of Object.values(attributes)) {
            attr.value = Math.max(0, Math.min(99, attr.value ?? 0));
        }

        for (const disc of Object.values(disciplines)) {
            disc.value = Math.max(0, Math.min(99, disc.value ?? 0));
        }

        return {
            actor: this.actor,
            items: this.actor.items?.contents || [],
            attributes,
            disciplines,
            enrichedNotes: await foundry.applications.ux.TextEditor.enrichHTML(notes),
            tabGroups: this.tabGroups ?? {}
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (!this.actor.isOwner) return;

        html.find(".skill-roll").click(this._onSkillRoll.bind(this));
        html.find(".item-roll").click(this._onItemRoll.bind(this));

        html.find(".checkbox-row input[type='checkbox']").on("click", async ev => {
            const input = ev.currentTarget;
            const key = input.dataset.key;
            const index = parseInt(input.dataset.index);
            const checked = input.checked;
            const newValue = checked ? index + 1 : index;
            await this.actor.update({ [`system.${key}.value`]: newValue });
        });

        html.find(`
            input[name="system.attributes.brawn.value"],
            input[name="system.attributes.brawn.skill.resistance.value"],
            input[name="system.attributes.intelligence.value"],
            input[name="system.attributes.intelligence.skill.hacking.value"],
            input[name="system.attributes.willpower.value"],
            input[name="system.attributes.willpower.skill.discipline.value"]
        `).on("change", async () => {
            const brawn = parseInt(html.find('input[name="system.attributes.brawn.value"]').val()) || 0;
            const resistance = parseInt(html.find('input[name="system.attributes.brawn.skill.resistance.value"]').val()) || 0;

            const intelligence = parseInt(html.find('input[name="system.attributes.intelligence.value"]').val()) || 0;
            const hacking = parseInt(html.find('input[name="system.attributes.intelligence.skill.hacking.value"]').val()) || 0;

            const willpower = parseInt(html.find('input[name="system.attributes.willpower.value"]').val()) || 0;
            const discipline = parseInt(html.find('input[name="system.attributes.willpower.skill.discipline.value"]').val()) || 0;

            await this.actor.update({
                'system.vigour.max': brawn + resistance,
                'system.firewall.max': intelligence + hacking,
                'system.resolve.max': willpower + discipline
            });

            this.render();
        });
    }

    _onItemRoll(event) {
        const itemID = event.currentTarget.closest(".item")?.dataset.itemId;
        const item = this.actor.items.get(itemID);
        item?.roll?.();
    }

    async _onSkillRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const skillKey = element.dataset.skill;
        const attrKey = element.dataset.attribute;
        new SkillRoll(this.actor, attrKey, skillKey).render(true);
    }
}
