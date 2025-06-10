
import { getSuccessesFromBattleRoll, getEffectsFromBattleRoll } from "../apps/battleroll.js";
export default class InfinityCoreItemSheet extends ItemSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData(options) {
        const context = await super.getData(options);
        context.system = this.item.system;
        return context;
    }

    async _onDrop(event) {
        event.preventDefault();

        // Use Foundry's utility to get data from the drag event
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));

        // If the dropped data is an Item
        if (data.type === "Item") {
            // Create the embedded item inside this actor
            await this.actor.createEmbeddedDocuments("Item", [data.data]);
        }
    }



    activateListeners(html) {
        super.activateListeners(html);

        html.find(".roll-damage").click(ev => {
            ev.preventDefault();

            const flat = this.item.system.flatdamage || 0;
            const dice = this.item.system.damagedice || 0;
            const roll = new Roll(`${dice}d6`);
            roll.roll({ async: false });

            const results = roll.terms[0].results;

            // Custom visual styles
            for (let r of results) {
                if (r.result <= 2) {
                    r.classes = ["success-die"];
                } else if (r.result === 6) {
                    r.classes = ["effect-die"];
                } else {
                    r.classes = [];
                }
                r.active = true; // Ensure dice are shown
            }

            const successes = getSuccessesFromBattleRoll(roll);
            const effects = getEffectsFromBattleRoll(roll);
            const totalDamage = flat + successes;

            // Send custom message without Foundry's default total
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                rolls: [roll], // Include the visual dice roll
                content: `
      <div class="dice-roll">
        <div class="dice-result">
          <strong>${this.item.name} Damage Roll</strong><br>
          <em>Dice: ${dice}d6</em><br>
          Flat Damage: ${flat}<br>
          Successes (1–2): ${successes}<br>
          Effects (6s): ${effects}<br>
          <strong>Total Damage: ${totalDamage}</strong>
        </div>
      </div>
    `
            });
        });

        };
    }

