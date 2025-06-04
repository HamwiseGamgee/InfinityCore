import SkillRoll from "../apps/skillroll.js";

export default class InfinityCoreActorSheet extends ActorSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    prepareData() {
        super.prepareData();

        // Loop over all attributes and set default to 7 if not set
        const attributes = this.actor.system.attributes;
        for (const attrKey in attributes) {
            if (attributes[attrKey].value === undefined || attributes[attrKey].value === null) {
                attributes[attrKey].value = 7;
            }
        }
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        const brawn = this.actor.system.attributes.brawn?.value ?? 0;
        const resistance = this.actor.system.attributes.resistance?.value ?? 0;

        this.actor.system.vigour = this.actor.system.vigour || {};
        this.actor.system.vigour.max = brawn + resistance;
    }

    // Note: Foundry's getData is normally sync; adjust if your system expects async
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

        // Clamp values safely
        for (const [, attr] of Object.entries(attributes)) {
            attr.value = Math.max(0, Math.min(99, attr.value ?? 0));
        }

        for (const [, disc] of Object.entries(disciplines)) {
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

        // Register change listener once on the brawn and resistance inputs
        html.find('input[name="system.attributes.brawn.value"], input[name="system.attributes.resistance.value"]').on('change', async event => {
            // Grab current values from the inputs
            const brawn = parseInt(html.find('input[name="system.attributes.brawn.value"]').val()) || 0;
            const resistance = parseInt(html.find('input[name="system.attributes.resistance.value"]').val()) || 0;

            // Update vigour.max to brawn + resistance
            await this.actor.update({ 'system.vigour.max': brawn + resistance });

            // Re-render sheet to update damageBoxes display with new max
            this.render();
        });
    }

    _onItemRoll(event) {
        const itemID = event.currentTarget.closest(".item")?.dataset.itemID;
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
