import { getSuccessesFromBattleRoll, getEffectsFromBattleRoll } from "../apps/battleroll.js";

export default class InfinityCoreItem extends Item {
    /**
     * Optional: Add item-specific roll logic
     */
    async roll() {
        const flat = this.system.flatdamage || 0;
        const dice = this.system.damagedice || 0;

        const roll = await new Roll(`${dice}d6`).roll({ async: true });

        const results = roll.terms[0].results;
        for (let r of results) {
            r.classes = [];
            if (r.result <= 2) r.classes.push("success-die");
            else if (r.result === 6) r.classes.push("effect-die");
        }

        const successes = getSuccessesFromBattleRoll(roll);
        const effects = getEffectsFromBattleRoll(roll);
        const totalDamage = flat + successes;
        const diceHTML = results.map(r => {
            let cls = "d6-result";
            if (r.result <= 2) cls += " success-die";
            else if (r.result === 6) cls += " effect-die";
            return `<span class="${cls}">${r.result}</span>`;
        }).join(" ");

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            rolls: [roll],
            content: `
    <div class="dice-roll">
      <div class="dice-result">
        <strong>${this.name} Damage Roll</strong><br>
        <em>Dice Rolled:</em> ${diceHTML}<br>
        <em>Flat Damage:</em> ${flat}<br>
        <em>Successes (1-2):</em> ${successes}<br>
        <em>Effects (6s):</em> ${effects}<br>
        <strong>Total Damage:</strong> ${totalDamage}
      </div>
    </div>
    `
        });

    }
}