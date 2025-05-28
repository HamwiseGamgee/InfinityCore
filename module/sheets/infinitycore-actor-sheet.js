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


    }

    activateListeners(html) {
        super.activateListeners(html);
        // Add JS listeners here if needed   
    
        //  // Owner-only listeners
    if (this.actor.owner) {
        html.find("item-roll").click(this._onItemRoll.bind(this));
    }
    /*async _onAttributeTest(event, selectedAttribute, selectedAttributeValue, selectedSkill, selectedSkillValue) {
  event.preventDefault();

  const defaultValue = 2;
  const speaker = this.actor;
  const template = 'InfinityCore/module/apps/skillroll.js';

  const html = await foundry.applications.handlebars.renderTemplate(template, {
    defaultValue
  });

  const formData = await api.DialogV2.wait({
    window: {
      title: game.i18n.localize('sta.apps.dicepoolwindow')  // Consider updating localization key
    },
    position: {
      height: 'auto',
      width: 350
    },
    content: html,
    classes: ['dialogue'],
    buttons: [{
      action: 'roll',
      default: true,
      label: game.i18n.localize('sta.apps.rolldice'),  // Consider updating localization key
      callback: (event, button, dialog) => {
        const form = dialog.element.querySelector('form');
        return form ? new FormData(form) : null;
      },
    }],
    close: () => null,
  });

  if (formData) {
    const dicePool = parseInt(formData.get('dicePoolSlider'), 10) || defaultValue;
    const usingFocus = formData.get('usingFocus') === 'on';
    const usingDedicatedFocus = formData.get('usingDedicatedFocus') === 'on';
    const usingDetermination = formData.get('usingDetermination') === 'on';
    const complicationRange = parseInt(formData.get('complicationRange'), 10) || 1;

    const staRoll = new STARoll();
    staRoll.performAttributeTest(
      dicePool,
      usingFocus,
      usingDedicatedFocus,
      usingDetermination,
      selectedAttribute,
      selectedAttributeValue,
      selectedSkill,
      selectedSkillValue,
      complicationRange,
      speaker
    );
  }
}
*/
    _onItemRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemID;
        const item = this.actor.getOwnedItem(itemID);

        item.roll();
    }
    _onSkillRoll (event) {
        const skill = this.actor.{{key}}.value;
        const attribute = this.actor{{}}
    }
  }

