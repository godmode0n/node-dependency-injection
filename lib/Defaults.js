(function() {
  var Defaults, isWindow;

  isWindow = typeof window !== 'undefined';

  Defaults = (function() {
    function Defaults(di) {
      di.addService('di', di).setInstantiate(false);
      di.addService('timer', this.getTimer()).setInstantiate(false);
      if (isWindow) {
        di.addService('window', window).setInstantiate(false);
        di.addService('document', window.document).setInstantiate(false);
      } else {
        di.addService('global', global).setInstantiate(false);
      }
    }

    Defaults.prototype.getTimer = function() {
      var main;
      main = isWindow ? window : global;
      return {
        setTimeout: function(callback, delay) {
          return main.setTimeout.apply(main, arguments);
        },
        setInterval: function(callback, delay) {
          return main.setInterval.apply(main, arguments);
        },
        clearTimeout: function(timeoutID) {
          return main.clearTimeout.call(main, timeoutID);
        },
        clearInterval: function(intervalID) {
          return main.clearInterval.call(main, intervalID);
        }
      };
    };

    return Defaults;

  })();

  module.exports = Defaults;

}).call(this);
