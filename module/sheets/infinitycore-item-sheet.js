export default class InfinityCoreItemSheet extends ItemSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData(options) {
        const context = await super.getData(options);
        context.system = this.item.system;
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Roll damage on button click
        html.find(".roll-damage").click(ev => {
            ev.preventDefault();
            const flat = this.item.system.flatdamage || 0;
            const dice = this.item.system.damagedice || 0;
            const roll = new Roll(`${flat} + ${dice}d6`);
            roll.roll({ async: false });
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: `${this.item.name} Damage Roll`
            });
        });
    }
}
