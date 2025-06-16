import InfinityCoreItem from "./module/apps/item.js";
import InfinityCoreItemSheet from "./module/sheets/infinitycore-item-sheet.js";
import InfinityCoreActorSheet from "./module/sheets/infinitycore-actor-sheet.js";
import { registerHandlebarsHelpers } from "./module/handlebars-helpers.js";

Hooks.once("init", async function () {
    console.log("InfinityCore | Initializing system");

    registerHandlebarsHelpers();

    const partials = ["attribute-skill-block", "item-reference-block"];
    for (const name of partials) {
        const path = `systems/infinitycore/templates/partials/${name}.hbs`;
        const content = await fetch(path).then(r => r.text());
        Handlebars.registerPartial(path, content);
    }

    CONFIG.Item.documentClass = InfinityCoreItem;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("infinitycore", InfinityCoreItemSheet, {
        types: ["weapon", "utility", "talent", "rule"],
        makeDefault: true,
    });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("infinitycore", InfinityCoreActorSheet, {
        types: ["character", "geist", "npc"],
        makeDefault: true,
    });

    CONFIG.Item.typeTemplates = {
        weapon: {
            flatdamage: 1,
            damagedice: 2,
            size: 1,
            cost: 0,
            tariff: 0,
            restriction: 0,
            description: "", 
            img: "icons/svg/item-bag.svg" // or your preferred default image

        }

    };
});
