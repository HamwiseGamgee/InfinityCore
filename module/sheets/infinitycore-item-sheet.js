import { getSuccessesFromBattleRoll, getEffectsFromBattleRoll } from "../apps/battleroll.js";

export default class InfinityCoreItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);
        this._sheetUnlocked = false;
    }

    get template() {
        return `systems/infinitycore/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getChatData({ secrets = false } = {}) {
        const data = duplicate(this.system);
        const enriched = await TextEditor.enrichHTML(data.description || "", {
            async: true,
            secrets,
            relativeTo: this.actor
        });

        return {
            ...data,
            description: enriched
        };
    }

    async getData(options) {
        const context = await super.getData(options);
        context.system = this.item.system;
        context.editable = this._sheetUnlocked;

        context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description || "", { async: true });

        context.enrichedPrerequisite = await TextEditor.enrichHTML(this.item.system.prerequisite || "", {
            async: true,
            secrets: this._sheetUnlocked,
            documents: true,
        });

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".roll-damage").on("click", (ev) => {
            ev.preventDefault();
            if (this.item.roll) {
                this.item.roll();
            } else {
                ui.notifications.warn(`${this.item.name} cannot be rolled.`);
            }
        });

        html.find(".sheet-lock").on("click", (event) => {
            event.preventDefault();
            this._sheetUnlocked = !this._sheetUnlocked;
            this.render(true);
        });

        html.find('.talent-ranks input[type="checkbox"]').on("change", async (event) => {
            const checkboxes = html.find('.talent-ranks input[type="checkbox"]');
            const rank = checkboxes.filter((_, cb) => cb.checked).length;
            await this.item.update({ "system.ranks": rank });
        });

        html.find(".rank-box").on("change", async (event) => {
            const checkboxes = html.find(".rank-box");
            const rank = Array.from(checkboxes).filter(cb => cb.checked).length;
            await this.item.update({ "system.ranks": rank });
        });

        html.find(".rank-adjust").on("click", async (event) => {
            const action = event.currentTarget.dataset.action;
            const max = this.item.system.maxranks ?? 0;
            let newMax = max;

            if (action === "increase") newMax = max + 1;
            if (action === "decrease") newMax = Math.max(0, max - 1);

            await this.item.update({ "system.maxranks": newMax });
        });

        html.find(".toggle-econ").on("click", () => {
            const content = html.find(".econ-content");
            content.toggle();
            html.find(".toggle-econ i").toggleClass("fa-caret-down fa-caret-up");
        });

        html.find(".purchase-button").on("click", () => {
            ui.notifications.info("Purchase roll not implemented yet.");
        });


    }
}
