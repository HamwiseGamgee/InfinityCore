import { getSuccessesFromBattleRoll, getEffectsFromBattleRoll } from "../apps/battleroll.js";

export default class InfinityCoreItem extends Item {
    /**
     * Optional: Add item-specific roll logic
     */
    async roll() {
        const flat = this.system.flatdamage || 0;
        const baseDice = this.system.damagedice || 0;

        const actor = this.actor;
        const attackWith = this.system.attackwith;

        let attributeValue = 0;
        if (actor && attackWith && actor.system.attributes?.[attackWith]?.value) {
            attributeValue = actor.system.attributes[attackWith].value;
        }

        function getBonusDamageDice(attributeValue) {
            if (attributeValue <= 8) return 0;
            return Math.floor((attributeValue - 7) / 2);
        }

        const bonusDice = getBonusDamageDice(attributeValue);
        const totalDice = baseDice + bonusDice;

        const roll = await new Roll(`${totalDice}d6`).roll({ async: true });

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
            speaker: ChatMessage.getSpeaker({ actor }),
            rolls: [roll],
            content: `
<div class="dice-roll">
  <div class="dice-result">
    <strong>${this.name} Damage Roll</strong><br>
    <em>Base Dice:</em> ${baseDice} + <em>Bonus Dice:</em> ${bonusDice} (from ${attackWith} ${attributeValue})<br>
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

    async postToChat() {
        const enriched = await TextEditor.enrichHTML(this.system.description || "", {
            async: true,
            secrets: this.isOwner
        });

        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: `
<div class="item-chat-card">
  <h2>${this.name}</h2>
  ${enriched}
</div>`
        };

        ChatMessage.create(chatData);
    }
}
