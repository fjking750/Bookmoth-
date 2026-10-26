// Bookmoth auto-update.
// On launch: ask GitHub for the latest release, and if it is newer than the
// version running, download its www.zip, unzip it (the plugin does this) and switch to it.
(function () {
  var REPO = 'fjking750/Bookmoth-';

  async function run() {
    var Cap = window.Capacitor;
    // Only runs inside the installed app, not in a normal browser tab.
    if (!Cap || (Cap.getPlatform && Cap.getPlatform() === 'web')) return;

    var U = (Cap.Plugins && Cap.Plugins.CapacitorUpdater) ||
            (Cap.registerPlugin && Cap.registerPlugin('CapacitorUpdater'));
    if (!U) return;

    try {
      // Tells the plugin this version started fine (otherwise it rolls back).
      await U.notifyAppReady();

      var res = await fetch('https://api.github.com/repos/' + REPO + '/releases/latest');
      if (!res.ok) return;
      var rel = await res.json();

      var latest = parseInt(String(rel.tag_name).replace(/^v/, ''), 10);
      var asset = (rel.assets || []).find(function (a) { return a.name === 'www.zip'; });
      if (!latest || !asset) return;

      var current = await U.current();
      var have = parseInt(current.bundle.version, 10) || 0; // built-in version counts as 0
      if (latest <= have) return;

      var bundle = await U.download({
        url: asset.browser_download_url,
        version: String(latest)
      });
      await U.set({ id: bundle.id }); // switches to the new version and reloads the app
    } catch (e) {
      console.warn('Update check failed:', e);
    }
  }

  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run);
})();
