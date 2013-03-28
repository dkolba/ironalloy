test:
	@./node_modules/.bin/mocha -u bdd \
		--reporter list


.PHONY: test
