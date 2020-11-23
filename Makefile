
.PHONY: contract deploy clean flatten

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

