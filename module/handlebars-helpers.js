// systems/infinitycore/module/helpers/handlebars-helpers.js
export function registerHandlebarsHelpers() {

  /** Capitalise first letter: "vigour" → "Vigour" */
  Handlebars.registerHelper("capitalize", s =>
    typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : s
  );

  /** Inclusive-exclusive range: {{#each (range 0 max)}}…{{/each}} */
  Handlebars.registerHelper("range", (start, end) =>
    Array.from({ length: end - start }, (_, i) => i + start)
  );

  /** Math helpers you’ll use a lot */
  Handlebars.registerHelper("add",  (a, b) => Number(a) + Number(b));
  Handlebars.registerHelper("sub",  (a, b) => Number(a) - Number(b));
  Handlebars.registerHelper("mul",  (a, b) => Number(a) * Number(b));
  Handlebars.registerHelper("div",  (a, b) => Number(a) / Number(b));

  /** Comparison helpers for clean conditionals */
  Handlebars.registerHelper("eq",  (a, b) => a === b);
  Handlebars.registerHelper("ne",  (a, b) => a !== b);
  Handlebars.registerHelper("lt",  (a, b) => a <  b);
  Handlebars.registerHelper("lte", (a, b) => a <= b);
  Handlebars.registerHelper("gt",  (a, b) => a >  b);
  Handlebars.registerHelper("gte", (a, b) => a >= b);

  Handlebars.registerHelper("and", (a, b) => a && b);
  Handlebars.registerHelper("or",  (a, b) => a || b);
  Handlebars.registerHelper("not", a => !a);

  /** Build an array inline: {{#each (array obj1 obj2)}} */
  Handlebars.registerHelper("array", (...args) => args.slice(0, -1));

  /** Quick object literal for templates */
  Handlebars.registerHelper("object", (...args) => {
    const opt = args.pop(); const o = {};
    for (let i = 0; i < args.length; i += 2) o[args[i]] = args[i+1];
    return o;
  });

  /** Pick a subset of keys from an object */
  Handlebars.registerHelper("pick", (obj, ...keys) => {
    keys.pop(); // remove Handlebars options object
    const result = {};
    for (let key of keys) {
      if (obj[key]) result[key] = obj[key];
    }
    return result;
  });

  /** Single helper that renders damage boxes for ANY tracker */
  Handlebars.registerHelper("damageBoxes", (tracker, options) => {
    const { value = 0, max = 0 } = tracker;
    let html = '<div class="checkbox-row">';
    for (let i = 0; i < max; i++) {
      const checked = i < value ? "checked" : "";
      html += `<input type="checkbox"
                       data-key="${options.hash.key}"
                       data-index="${i}"
                       ${checked}
                       ${options.hash.disabled ? "disabled" : ""}>`;
    }
    html += "</div>";
    return new Handlebars.SafeString(html);
  });

}
