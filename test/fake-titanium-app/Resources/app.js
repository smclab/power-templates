require('ti-mocha');

require('spec/parsing');
require('spec/render');

mocha.run(function (failures) {
  if (failures > 0) {
    Ti.API.error('[TESTS WITH FAILURES]');
  }
  else {
    Ti.API.error('[TESTS ALL OK]');
  }
});
