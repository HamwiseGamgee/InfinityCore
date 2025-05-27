import item-sheet from './module/sheets/infinitycore.sheet.js';

Hooks.one('init', function () {
    console.log('InfinityCore | Initializing InfinityCore Item Sheet');
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('infinitycore', item - sheet, { makeDefault: true });
})