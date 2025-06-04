import SkillRoll from "../apps/skillroll.js";

export default class InfinityCoreActorSheet extends ActorSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    prepareData() {
        super.prepareData();

        // Loop over all attributes and set default to 7 if not set
        const attributes = this.actor.attributes;
        for (const attrKey in attributes) {
            if (attributes[attrKey].value === undefined || attributes[attrKey].value === null) {
                attributes[attrKey].value = 7;
            }
        }
        system.vigour = system.vigour || {};
        if (system.vigour.value === undefined || system.vigour.value === null) {
            system.vigour.value = 7;
        }
        system.firewall = system.firewall || {};
        if (system.firewall.value === undefined || system.firewall.value === null) {
            system.firewall.value = 7;
        }
        system.resolve = system.resolve || {};
        if (system.resolve.value === undefined || system.resolve.value === null) {
            system.resolve.value = 7;
        }
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        const brawn = this.actor.system.attributes.brawn?.value ?? 0;
        const resistance = this.actor.system.attributes.brawn.skill.resistance.value?.value ?? 0;

        this.actor.system.vigour = this.actor.system.vigour || {};
        this.actor.system.vigour.max = brawn + resistance;

        const intelligence = this.actor.system.attributes.intelligence?.value ?? 0;
        const hacking = this.actor.system.attributes.intelligence.skill.hacking.value?.value ?? 0;

        this.actor.system.firewall = this.actor.system.firewall || {};
        this.actor.system.firewall.max = intelligence + hacking;

        const willpower = this.actor.system.attributes.willpower?.value ?? 0;
        const discipline = this.actor.system.attributes.willpower.skill.discipline.value?.value ?? 0;

        this.actor.system.resolve = this.actor.system.resolve || {};
        this.actor.system.resolve.max = willpower + discipline;
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
        html.find('input[name="system.attributes.brawn.value"], input[name="system.attributes.brawn.skill.resistance.value"], input[name="system.attributes.intelligence.value"], input[name="system.attributes.intelligence.skill.hacking.value"], input[name="system.attributes.willpower.value"], input[name="system.attributes.willpower.skill.discipline.value"]').on('change', async event => {
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
