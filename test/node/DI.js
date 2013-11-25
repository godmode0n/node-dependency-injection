// Generated by CoffeeScript 1.6.3
(function() {
  var Application, DI, Http, Service, di, dir, expect, path;

  expect = require('chai').expect;

  path = require('path');

  DI = require('../../lib/DI');

  Service = require('../../lib/Service');

  Application = require('../data/Application');

  Http = require('../data/Http');

  di = null;

  dir = path.resolve(__dirname + '/../data');

  describe('DI', function() {
    beforeEach(function() {
      return di = new DI;
    });
    describe('#addService()', function() {
      it('should return instance of new Service class from object', function() {
        return expect(di.addService('array', Array)).to.be.an["instanceof"](Service);
      });
      it('should return instance of new Service class from path', function() {
        return expect(di.addService('app', "" + dir + "/Application")).to.be.an["instanceof"](Service);
      });
      it('should throw an error if you try to register service with reserved name', function() {
        return expect(function() {
          return di.addService('di', DI);
        }).to["throw"](Error, "DI: name 'di' is reserved by DI.");
      });
      return it('should create service with null as arguments', function() {
        di.addService('http', "" + dir + "/Http");
        di.addService('app', "" + dir + "/Application", [null]);
        return expect(di.get('app').array).to.not.exists;
      });
    });
    describe('#createInstance()', function() {
      beforeEach(function() {
        di.addService('array', Array);
        return di.addService('http', Http);
      });
      it('should return new instance of Application with all dependencies', function() {
        var app;
        app = di.createInstance(Application);
        expect(app).to.be.an["instanceof"](Application);
        expect(app.array).to.be.an["instanceof"](Array);
        return expect(app.http).to.be.an["instanceof"](Http);
      });
      return it('should throw an error when service to inject does not exists', function() {
        delete di.services.http;
        return expect(function() {
          return di.createInstance(Application);
        }).to["throw"](Error, "DI: Service 'http' was not found.");
      });
    });
    describe('#findDefinitionByName()', function() {
      it('should return definition of Array service', function() {
        di.addService('array', Array);
        return expect(di.findDefinitionByName('array')).to.be.an["instanceof"](Service);
      });
      return it('should throw an error if service is not registered', function() {
        return expect(function() {
          return di.findDefinitionByName('array');
        }).to["throw"](Error, "DI: Service 'array' was not found.");
      });
    });
    return describe('Loaders', function() {
      beforeEach(function() {
        di.addService('array', Array);
        di.addService('http', Http);
        di.addService('info', ['hello']).setInstantiate(false);
        di.addService('noArray', ['not this one']).setInstantiate(false).setAutowired(false);
        return di.addService('application', Application).addSetup('prepare', ['simq', '...']);
      });
      describe('#get()', function() {
        it('should return instance of Application with all dependencies', function() {
          var app;
          app = di.get('application');
          expect(app).to.be.an["instanceof"](Application);
          expect(app.namespace).to.be.equal('simq');
          expect(app.array).to.be.eql([]);
          return expect(app.http).to.be.an["instanceof"](Http);
        });
        it('should return always the same instance of Application', function() {
          return expect(di.get('application')).to.be.equal(di.get('application'));
        });
        it('should return info array without instantiating it', function() {
          return expect(di.get('info')).to.be.eql(['hello']);
        });
        it('should not set services which are not autowired', function() {
          di.findDefinitionByName('application').addSetup('setData');
          return expect(function() {
            return di.get('application');
          }).to["throw"](Error, "DI: Service 'noArray' in not autowired.");
        });
        it('should autowire di container into Application instance', function() {
          di.findDefinitionByName('application').addSetup('setDi');
          return expect(di.get('application').di).to.be.equal(di);
        });
        it('should autowire di container factory into Application instance', function() {
          var factory;
          di.findDefinitionByName('application').addSetup('setDiFactory');
          factory = di.get('application').diFactory;
          expect(factory).to.be.an["instanceof"](Function);
          return expect(factory()).to.be.equal(di);
        });
        return it('should set info property directly', function() {
          di.findDefinitionByName('application').addSetup('info', 'by property');
          return expect(di.get('application').info).to.be.equal('by property');
        });
      });
      describe('#create()', function() {
        return it('should return always new instance of Application', function() {
          return expect(di.create('application')).to.not.be.equal(di.create('application'));
        });
      });
      describe('#getFactory()', function() {
        return it('should return callable factory for Application', function() {
          var factory;
          factory = di.getFactory('application');
          expect(factory).to.be.an["instanceof"](Function);
          return expect(factory()).to.be.an["instanceof"](Application);
        });
      });
      return describe('#inject()', function() {
        it('should inject some service into annonymous function', function(done) {
          di.addService('array', Array);
          return di.inject(function(array) {
            expect(array).to.be.eql([]);
            return done();
          });
        });
        return it('should throw an error if inject method is not called on function', function() {
          return expect(function() {
            return di.inject('');
          }).to["throw"](Error, "DI: Inject method can be called only on functions.");
        });
      });
    });
  });

}).call(this);