(function() {
  var Application;

  Application = (function() {
    Application.prototype.array = null;

    Application.prototype.http = null;

    Application.prototype.namespace = null;

    Application.prototype.info = null;

    Application.prototype.data = null;

    Application.prototype.di = null;

    Application.prototype.diFactory = null;

    Application.prototype.other = null;

    function Application(array) {
      this.array = array;
    }

    Application.prototype.setHttp = function(http) {
      this.http = http;
    };

    Application.prototype.prepare = function(namespace, info) {
      this.namespace = namespace;
      this.info = info;
      return this.namespace;
    };

    Application.prototype.setData = function(noArray) {
      if (noArray == null) {
        noArray = null;
      }
      return this.data = noArray;
    };

    Application.prototype.setDi = function(di) {
      this.di = di;
    };

    Application.prototype.setDiFactory = function(diFactory) {
      this.diFactory = diFactory;
    };

    Application.prototype.withoutDefinition = function(param) {
      return this.other = arguments;
    };

    return Application;

  })();

  module.exports = Application;

}).call(this);
