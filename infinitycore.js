import InfinityCoreItemSheet from "./module/sheets/infinitycore-item-sheet.js";
import InfinityCoreActorSheet from "./module/sheets/infinitycore-actor-sheet.js";
import itemRoll from "./module/apps/itemroll.js";


Hooks.once("init", function () {
    console.log("InfinityCore | Initializing system");

    // Unregister the global ItemSheet class (not from v1 API)
    Items.unregisterSheet("core", ItemSheet);

    // Register our custom sheet
    Items.registerSheet("infinitycore", InfinityCoreItemSheet, {
        types: ["weapon"],
        makeDefault: true,
    });

    // Register custom Actor sheet
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("infinitycore", InfinityCoreActorSheet, {
        types: ["character"], // you can add more types here later
        makeDefault: true,
    });

    // Set default item data
    CONFIG.Item.documentClass.prototype._getInitialItemData = function () {
        const type = this.type;
        const template = foundry.utils.deepClone(CONFIG.Item.typeLabels[type] ?? {});
        return mergeObject({ type }, template);
    };
});
Handlebars.registerHelper("pick", function (obj, ...keys) {
    keys.pop(); // remove Handlebars options object
    const result = {};
    for (let key of keys) {
        if (obj[key]) result[key] = obj[key];
    }
    return result;
});