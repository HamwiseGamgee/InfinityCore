export default class SkillRoll extends Application {
  constructor(actor, attrKey, skillKey, options = {}) {
    super(options);
    this.actor = actor;
    this.attrKey = attrKey;
    this.skillKey = skillKey;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "skill-roll",
      title: "Skill Roll",
      template: "systems/infinitycore/templates/apps/skill-roll.hbs",
      classes: ["infinitycore", "dialog"],
      width: 400
    });
  }

  getData() {
    const skill = this.actor.system.attributes[this.attrKey].skill[this.skillKey];
    return {
      actor: this.actor,
      attrKey: this.attrKey,
      skillKey: this.skillKey,
      skill
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Update slider display
    html.find('input[name="dice-count"]').on('input change', ev => {
      const val = ev.target.value;
      html.find('.dice-count-display').text(val);
    });

    // Roll button
    html.find('button.roll').click(ev => {
      const numDice = parseInt(html.find('input[name="dice-count"]').val()) || 2;
      this._rollSkill(numDice);
    });
  }

  async _rollSkill(numDice) {
    const skill = this.actor.system.attributes[this.attrKey].skill[this.skillKey];
    const attributeValue = this.actor.system.attributes[this.attrKey].value || 0;
    const skillValue = skill.value || 0;
    const focus = skill.focus || 0;

    const target = attributeValue + skillValue;
    const rolls = [];
    let successCount = 0;
    let critCount = 0;

    for (let i = 0; i < numDice; i++) {
      const roll = await new Roll("1d20").roll({ async: true });
      const value = roll.total;

      const isCrit = value <= focus;
      const isSuccess = value <= target;

      if (isSuccess) successCount++;
      if (isCrit) critCount++;

      rolls.push({ value, isSuccess, isCrit });
    }

    // Build output string
    const results = rolls.map(r => {
      const tags = [];
      if (r.isCrit) tags.push("🟊 Critical");
      else if (r.isSuccess) tags.push("✓ Success");
      return `${r.value}${tags.length ? ` (${tags.join(", ")})` : ""}`;
    }).join(", ");

    const flavor = `
      <strong>${this.skillKey.toUpperCase()}</strong> roll (${this.attrKey})<br>
      Target Number: <strong>${target}</strong> | Focus: <strong>${focus}</strong><br>
      Dice Rolled: <strong>${numDice}</strong><br>
      Results: ${results}<br>
      <strong>Total Successes:</strong> ${successCount} (${critCount} Critical)
    `;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: flavor,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    });

    this.close();
  }
}
