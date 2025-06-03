export default class InfinityCoreActorSheet extends ActorSheet {
    get template() {
        return `systems/infinitycore/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    getData(options) {
        const context = super.getData(options);
        return context;
    }
  async _prepareContext(options) {
    const context = {
      actor: this.actor,
      items: this.actor.items?.contents || [],
      attributes: this.actor.system.attributes,
      disciplines: this.actor.system.skill,
      enrichedNotes: await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.notes),
      tabGroups: this.tabGroups,
      tabs: this.getTabs(),
    };

    Object.entries(context.attributes).forEach(([key, attributes]) => {
      attributes.value = Math.max(0, Math.min(99, attributes.value));
    });

    Object.entries(context.disciplines).forEach(([key, disciplines]) => {
      disciplines.value = Math.max(0, Math.min(99, disciplines.value));
    });
    return context;
  }


    

activateListeners(html) {
  super.activateListeners(html);

  // Owner-only listeners
  if (this.actor.isOwner) {
    // Skill rolls
    html.find(".skill-roll").click(this._onSkillRoll.bind(this));

    // Item rolls
    html.find(".item-roll").click(this._onItemRoll.bind(this));

    // Damage tracker checkboxes
    html.find(".checkbox-row input[type='checkbox']").on("click", async ev => {
  const input = ev.currentTarget;
  const key = input.dataset.key;
  const index = parseInt(input.dataset.index);
  const checked = input.checked;

  // Set the new value based on checkbox clicked
  const newValue = checked ? index + 1 : index;
  await this.actor.update({ [`system.${key}.value`]: newValue });
});

  }
}


    _onItemRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemID;
        const item = this.actor.items.get(itemID);

        item.roll();
    }
async _onSkillRoll(event) {
  event.preventDefault();

  const element = event.currentTarget;
  const skillKey = element.dataset.skill;
  const attrKey = element.dataset.attribute;

  // Launch your roll dialog
  new SkillRollDialog(this.actor, attrKey, skillKey).render(true);
}

  }

