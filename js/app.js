'use strict';

// Shows one screen and hides the others.
function showScreen(id) {
  Object.values(APP.SCREEN_IDS).forEach(function (screenId) {
    document.getElementById(screenId).hidden = screenId !== id;
  });
}

showScreen(APP.SCREEN_IDS.LAUNCH);
