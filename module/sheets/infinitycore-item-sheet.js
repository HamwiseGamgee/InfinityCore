import { getSuccessesFromBattleRoll, getEffectsFromBattleRoll } from "../apps/battleroll.js";

export default class InfinityCoreItemSheet extends ItemSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData(options) {
        const context = await super.getData(options);
        context.system = this.item.system;
        context.editable = this.isEditable;

        // Enrich description for display
        context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description || "", { async: true });

        return context;
    }


    activateListeners(html) {
        super.activateListeners(html);

        // Roll damage from icon
        html.find(".roll-damage").on("click", (ev) => {
            ev.preventDefault();
            if (this.item.roll) {
                this.item.roll();
            } else {
                ui.notifications.warn(`${this.item.name} cannot be rolled.`);
            }
        });

        // Toggle Economics section
        html.find(".toggle-econ").on("click", () => {
            const content = html.find(".econ-content");
            content.toggle();
            html.find(".toggle-econ i").toggleClass("fa-caret-down fa-caret-up");
        });

        // Edit description field




        // Placeholder for "Purchase" button logic
        html.find(".purchase-button").on("click", () => {
            ui.notifications.info("Purchase roll not implemented yet.");
        });
    }
}
