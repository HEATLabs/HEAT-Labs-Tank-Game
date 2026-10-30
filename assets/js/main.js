// Main Entry Point
function onDomReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

(function () {
    // Resolve paths relative to this file so the folder can live anywhere
    const current = document.currentScript;
    const base = current ? current.src.replace(/main\.js(\?.*)?$/, '') : 'assets/js/';

    // ORDER MATTERS - each group depends on the one above it
    const modules = [
        // 1. Configuration & shared systems
        'game/config.js',
        'game/notifications.js',

        // 2. Utilities
        'game/utils/canvas-polyfill.js',

        // 3. TankGame core class (state + constructor)
        'game/core/tank-game.js',

        // 4. TankGame behaviour modules (extend TankGame.prototype)
        'game/core/camera.js',
        'game/core/input.js',
        'game/core/game-flow.js',
        'game/core/loop.js',
        'game/ui/hud.js',
        'game/ui/menus.js',
        'game/world/world-generation.js',
        'game/systems/waves.js',
        'game/systems/collisions.js',
        'game/systems/effects.js',
        'game/entities/player.js',
        'game/entities/enemies.js',
        'game/entities/projectiles.js',
        'game/entities/health-packs.js',
        'game/rendering/renderer.js',
        'game/rendering/world-renderer.js',
        'game/rendering/tank-renderer.js',
        'game/rendering/effects-renderer.js',
        'game/rendering/indicators.js',
        'game/rendering/debug.js',

        // 5. Site-level modules
        'modules/external-link.js',
        'modules/context-menu.js',

        // 6. Start the game (must be last - every TankGame module has to be loaded)
        'game/core/bootstrap.js'
    ];

    function loadScript(path) {
        return new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = base + path;
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error('Failed to load ' + path));
            };
            document.body.appendChild(script);
        });
    }

    // Load sequentially so execution order is guaranteed
    modules.reduce(function (chain, path) {
        return chain.then(function () { return loadScript(path); });
    }, Promise.resolve()).catch(function (err) {
        console.error('[Tank Defense] ' + err.message);
    });
})();
