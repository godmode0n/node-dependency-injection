DI = require '/lib/DI'
DIConfigurator = require '/lib/DIConfigurator'

dir = '/test/data'

di = null
configurator = null

describe 'DIConfiguration', ->

	beforeEach( ->
		configurator = new DIConfigurator(dir + '/config.json')
		di = configurator.create()
		di.basePath = dir
	)

	describe '#parameters', ->

		it 'should contain all parameters', ->
			expect(di.parameters).to.be.eql(
				language: 'en'
				users:
					david: '123456'
					admin: 'nimda'
				database:
					user: 'admin'
					password: 'nimda'
			)

	describe '#getParameter()', ->

		it 'should throw an error if di object was not created from DIConfigurator', ->
			di = new DI
			expect( -> di.getParameter('buf') ).to.throw(Error, 'DI container was not created with DIConfigurator.')

		it 'should return expanded parameter', ->
			expect(di.getParameter('database.password')).to.be.equal('nimda')