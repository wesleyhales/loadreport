-include test/test.env

test_all:
	mocha --reporter spec
