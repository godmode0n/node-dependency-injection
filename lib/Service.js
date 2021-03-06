(function() {
  var Helpers, Service;

  Helpers = require('./Helpers');

  Service = (function() {
    Service.prototype.di = null;

    Service.prototype.name = null;

    Service.prototype.service = null;

    Service.prototype["arguments"] = null;

    Service.prototype.instantiate = true;

    Service.prototype.autowired = true;

    Service.prototype.factory = false;

    Service.prototype.factoryArguments = [];

    Service.prototype.setup = null;

    Service.prototype.instance = null;

    function Service(di, name, service, _arguments) {
      this.di = di;
      this.name = name;
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
      var args, e, method, names, s, service, _ref;
      if (Helpers.arrayIndexOf(this.di.creating, this.name) !== -1) {
        s = this.di.creating.length === 1 ? '' : 's';
        names = this.di.creating.join(', ');
        throw new Error("Circular reference detected for service" + s + ": " + names + ".");
      }
      this.di.creating.push(this.name);
      service = this.service;
      if (Object.prototype.toString.call(service) === '[object String]') {
        service = require(service);
      }
      if (this.factory) {
        service = service.apply(service, Helpers.autowireArguments(service, this.di.tryCallStringArguments(this.factoryArguments), this.di));
      }
      try {
        service = this.di.createInstance(service, this["arguments"], this.instantiate);
        _ref = this.setup;
        for (method in _ref) {
          args = _ref[method];
          if (this.setup.hasOwnProperty(method)) {
            if (typeof service[method] === 'function') {
              service[method].apply(service, Helpers.autowireArguments(service[method], args, this.di));
            } else {
              service[method] = args;
            }
          }
        }
      } catch (_error) {
        e = _error;
        this.di.creating.splice(Helpers.arrayIndexOf(this.di.creating, this.name), 1);
        throw e;
      }
      this.di.creating.splice(Helpers.arrayIndexOf(this.di.creating, this.name), 1);
      return service;
    };

    Service.prototype.addSetup = function(method, args) {
      if (args == null) {
        args = [];
      }
      this.setup[method] = args;
      return this;
    };

    Service.prototype.setInstantiate = function(instantiate) {
      this.instantiate = instantiate;
      return this;
    };

    Service.prototype.setFactory = function(factory, factoryArguments) {
      this.factory = factory;
      this.factoryArguments = factoryArguments;
      return this;
    };

    Service.prototype.setAutowired = function(autowired) {
      this.autowired = autowired;
      return this;
    };

    return Service;

  })();

  module.exports = Service;

}).call(this);
