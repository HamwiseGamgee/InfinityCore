export default class InfinityCoreActorSheet extends ActorSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    getData(options) {
        const context = super.getData(options);
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // Add JS listeners here if needed
    }
}
