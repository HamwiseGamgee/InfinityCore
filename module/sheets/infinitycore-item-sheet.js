export default class InfinityCoreItemSheet extends ItemSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.item.type}-sheet.hbs`;
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
