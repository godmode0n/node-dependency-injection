(function() {
  var Configuration, DI, DIFactory, Database, Http, Mail, callsite, di, dir, expect, factory, path;

  expect = require('chai').expect;

  path = require('path');

  callsite = require('callsite');

  DI = require('../../lib/DI');

  DIFactory = require('../../DIFactory');

  Configuration = require('../../Configuration');

  Http = require('../data/lib/Http');

  Database = require('../data/lib/MySql');

  Mail = require('../data/lib/Mail');

  dir = path.resolve(__dirname + '/../data');

  di = null;

  factory = null;

  describe('DIFactory', function() {
    beforeEach(function() {
      factory = new DIFactory(dir + '/config/config.json');
      di = factory.create();
      return di.basePath = dir;
    });
    describe('#constructor()', function() {
      it('should resolve relative path to absolute path', function() {
        factory = new DIFactory('../data/config/config.json');
        expect(factory.path).to.be.equal(dir + '/config/config.json');
        return expect(factory.create().parameters.language).to.be.equal('en');
      });
      it('should create di with custom config object', function() {
        var config;
        config = new Configuration;
        config.addConfig('../data/config/config.json');
        config.addConfig('../data/config/sections.json', 'local');
        factory = new DIFactory(config);
        di = factory.create();
        expect(di).to.be.an["instanceof"](DI);
        return expect(di.parameters.users.david).to.be.equal('divad');
      });
      it('should create database service from factory with list of parameters', function() {
        var db;
        factory = new DIFactory(dir + '/config/database.json');
        di = factory.create();
        db = di.get('database');
        expect(db).to.be.an["instanceof"](Database);
        return expect(db.parameters).to.be.eql({
          host: 'localhost',
          user: 'root',
          password: 'toor',
          database: 'application'
        });
      });
      return it('should create service with list of parameters', function() {
        var mail;
        factory = new DIFactory(dir + '/config/mail.json');
        di = factory.create();
        mail = di.get('mail');
        expect(mail).to.be.an["instanceof"](Mail);
        return expect(mail.setup).to.be.eql({
          type: 'SMTP',
          auth: {
            user: 'root',
            pass: 'toor'
          }
        });
      });
    });
    describe('#parameters', function() {
      return it('should contain all parameters', function() {
        return expect(di.parameters).to.be.eql({
          language: 'en',
          users: {
            david: '123456',
            admin: 'nimda'
          },
          database: {
            user: 'admin',
            password: 'nimda'
          }
        });
      });
    });
    describe('#getParameter()', function() {
      it('should throw an error if di object was not created from DIFactory', function() {
        di = new DI;
        return expect(function() {
          return di.getParameter('buf');
        }).to["throw"](Error, 'DI container was not created with DIFactory.');
      });
      return it('should return expanded parameter', function() {
        return expect(di.getParameter('database.password')).to.be.equal('nimda');
      });
    });
    return describe('#get()', function() {
      it('should load service defined with relative path', function() {
        factory = new DIFactory(dir + '/config/relative.json');
        di = factory.create();
        return expect(di.get('http')).to.be.an["instanceof"](Http);
      });
      it('should create services with derived arguments', function() {
        var application;
        factory = new DIFactory(dir + '/config/derivedArguments.json');
        di = factory.create();
        application = di.get('application');
        expect(application.data).to.be.equal('hello David');
        return expect(application.namespace).to.be["false"];
      });
      it('should create service derived from other service', function() {
        factory = new DIFactory(dir + '/config/derivedService.json');
        di = factory.create();
        return expect(di.get('http')).to.be.an["instanceof"](Http);
      });
      it('should create service from exported factory function', function() {
        var mail;
        factory = new DIFactory(dir + '/config/factory.json');
        di = factory.create();
        mail = di.get('mail');
        expect(mail).to.be.an["instanceof"](Mail);
        expect(mail.setup).to.be.eql({
          type: 'SMTP',
          auth: {
            user: 'root',
            pass: 'toor'
          }
        });
        return expect(mail.http).to.be.an["instanceof"](Http);
      });
      it('should create npm service', function() {
        factory = new DIFactory(dir + '/config/nodeModules.json');
        di = factory.create();
        expect(di.get('callsite')).to.be.equal(callsite);
        return expect(di.get('setup').callsite).to.be.equal(callsite);
      });
      return it('should create npm service from function factory', function() {
        factory = new DIFactory(dir + '/config/nodeModules.json');
        di = factory.create();
        return expect(di.get('callsiteFactory')).to.be.equal(callsite);
      });
    });
  });

}).call(this);
