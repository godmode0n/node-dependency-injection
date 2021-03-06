(function() {
  var Application, DI, Http, Service, di, dir, expect, path;

  expect = require('chai').expect;

  path = require('path');

  DI = require('../../lib/DI');

  Service = require('../../lib/Service');

  Application = require('../data/lib/Application');

  Http = require('../data/lib/Http');

  dir = path.resolve(__dirname + '/../data/lib');

  di = null;

  describe('DI', function() {
    beforeEach(function() {
      return di = new DI;
    });
    describe('defaults', function() {
      it('should be added di into services', function() {
        return expect(di.get('di')).to.be.equal(di);
      });
      it('should be added timer service', function(done) {
        var timer;
        timer = di.get('timer');
        expect(timer).to.have.keys(['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval']);
        return timer.setTimeout(function() {
          return done();
        }, 100);
      });
      return it('should be added global object service', function() {
        return expect(di.get('global')).to.be.equal(global);
      });
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
    describe('#tryCallArgument()', function() {
      it('should just return argument if it is not string', function() {
        return expect(di.tryCallArgument(new Date)).to.be.an["instanceof"](Date);
      });
      it('should just return argument if it is not in right format', function() {
        return expect(di.tryCallArgument('hello word')).to.be.equal('hello word');
      });
      it('should return service by its name', function() {
        di.addService('date', Date);
        return expect(di.tryCallArgument('@date')).to.be.an["instanceof"](Date);
      });
      it('should return service by its path', function() {
        di.addService('callsite', 'callsite').setInstantiate(false);
        return expect(di.tryCallArgument('$callsite/index.js')).to.be.equal(require('callsite'));
      });
      it('should return factory by its name', function() {
        var factory;
        di.addService('date', Date);
        factory = di.tryCallArgument('factory:@date');
        expect(factory).to.be.an["instanceof"](Function);
        return expect(factory()).to.be.an["instanceof"](Date);
      });
      it('should return factory by its path', function() {
        var factory;
        di.addService('callsite', 'callsite').setInstantiate(false);
        factory = di.tryCallArgument('factory:$callsite/index.js');
        expect(factory).to.be.an["instanceof"](Function);
        return expect(factory()).to.be.equal(require('callsite'));
      });
      it('should return result from method in service', function() {
        di.addService('obj', {
          doSomething: function() {
            return 'hello';
          }
        }).setInstantiate(false);
        return expect(di.tryCallArgument('@obj::doSomething')).to.be.equal('hello');
      });
      it('should return result from method with arguments', function() {
        di.addService('obj', {
          doSomething: function(one, two, three) {
            return one + two + three;
          }
        }).setInstantiate(false);
        return expect(di.tryCallArgument('@obj::doSomething("hello", " ", "word")')).to.be.equal('hello word');
      });
      return it('should return result from method with arguments with sub calls to di', function() {
        di.addService('obj', {
          complete: function() {
            return {
              callMe: function(greetings, name) {
                return greetings + ' ' + name;
              }
            };
          }
        }).setInstantiate(false);
        return expect(di.tryCallArgument('@obj::complete::callMe("hello", "David")')).to.be.equal('hello David');
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
        return expect(app.http).to.not.exists;
      });
      return it('should throw an error when service to inject does not exists', function() {
        var app;
        delete di.services.http;
        app = di.createInstance(Application);
        return expect(function() {
          return di.inject(app.setHttp, [], app);
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
          return expect(app.http).to.not.exists;
        });
        it('should return always the same instance of Application', function() {
          return expect(di.get('application')).to.be.equal(di.get('application'));
        });
        it('should add service from node_modules', function() {
          di.addService('callsite', 'callsite').setInstantiate(false);
          return expect(di.get('callsite')).to.be.equal(require('callsite'));
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
        it('should set info property directly', function() {
          di.findDefinitionByName('application').addSetup('info', 'by property');
          return expect(di.get('application').info).to.be.equal('by property');
        });
        it('should throw an error if circular reference was found', function() {
          di.addService('first', function(second) {});
          di.addService('second', function(first) {});
          return expect(function() {
            return di.get('first');
          }).to["throw"](Error, 'Circular reference detected for services: first, second.');
        });
        it('should throw an error with simple circular reference', function() {
          di.addService('first', function(first) {});
          return expect(function() {
            return di.get('first');
          }).to["throw"](Error, 'Circular reference detected for service: first.');
        });
        return it('should throw an error with advanced circular reference', function() {
          di.addService('first', function(second) {});
          di.addService('second', function(third) {});
          di.addService('third', function(fourth) {});
          di.addService('fourth', function(first) {});
          return expect(function() {
            return di.get('first');
          }).to["throw"](Error, 'Circular reference detected for services: first, second, third, fourth.');
        });
      });
      describe('#getByPath()', function() {
        it('should return service by require path', function() {
          di.addService('app', "" + dir + "/Application");
          return expect(di.getByPath("" + dir + "/Application")).to.be.an["instanceof"](Application);
        });
        return it('should return null for not auto required services', function() {
          di.addService('info', ['hello']).setInstantiate(false);
          return expect(di.getByPath('info')).to.not.exists;
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
