
.PHONY: all contract deploy clean flatten test

all: 
	@source .env && dapp --use solc:0.7.6 build

contract:
	node compile-with-solc.js

deploy:
	node deploy-contract.js

flatten:
	npx waffle flatten

test:
	node testflow.js

clean:
	rm -rf build
	rm -rf flatten

