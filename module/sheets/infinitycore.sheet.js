export default class InfinityCoreItemSheet extends ItemSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.item.type}-sheet.html`;

    }
}