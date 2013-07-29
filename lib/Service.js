// Generated by CoffeeScript 1.6.3
(function() {
  var Service;

  Service = (function() {
    Service.prototype.di = null;

    Service.prototype.service = null;

    Service.prototype["arguments"] = null;

    Service.prototype.setup = null;

    Service.prototype.instance = null;

    function Service(di, service, _arguments) {
      this.di = di;
      this.service = service;
      this["arguments"] = _arguments != null ? _arguments : [];
      this.setup = {};
    }

    Service.prototype.getInstance = function() {
      if (this.instance === null) {
        this.instance = this.create();
      }
      return this.instance;
    };

    Service.prototype.create = function() {
      var args, called, method, service, wrapper, _ref;
      wrapper = function(service, args) {
        var f;
        if (args == null) {
          args = [];
        }
        f = function() {
          return service.apply(this, args);
        };
        f.prototype = service.prototype;
        return f;
      };
      Service = require(this.service);
      service = new (wrapper(Service, this.di.autowireArguments(Service, this["arguments"])));
      called = [];
      _ref = this.setup;
      for (method in _ref) {
        args = _ref[method];
        service[method].apply(service, this.di.autowireArguments(service[method], args));
        called.push(method);
      }
      for (method in service) {
        if (called.indexOf(method) === -1 && method.match(/^inject/) !== null) {
          service[method].apply(service, this.di.autowireArguments(service[method], []));
        }
      }
      return service;
    };

    Service.prototype.addSetup = function(method, args) {
      if (args == null) {
        args = [];
      }
      this.setup[method] = args;
      return this;
    };

    return Service;

  })();

  module.exports = Service;

}).call(this);