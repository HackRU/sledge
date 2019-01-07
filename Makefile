export SHELL := /bin/sh
export PATH := $(CURDIR)/bin:$(CURDIR)/node_modules/.bin:$(PATH)
export DEBUG=sledge

.PHONY: build
build: build-server-js build-client-js build-client-css build-client-copy

.PHONY: build-server-js
build-server-js:
	tsc --project tsconfig-server.json

.PHONY: build-client-js
build-client-js:
	tsc --project tsconfig-client.json

.PHONY: build-client-css
build-client-css:
	sass src/client/global.scss public/global.css

.PHONY: build-client-copy
build-client-copy:
	mkdir -p public
	cp static/* public
	cp -R src public/src
	mkdir -p public/vendor
	cp node_modules/socket.io-client/dist/socket.io.dev.js public/vendor/
	cp node_modules/react/umd/react.development.js public/vendor/
	cp node_modules/react-dom/umd/react-dom.development.js public/vendor/
	cp node_modules/react-redux/dist/react-redux.js public/vendor/
	cp node_modules/redux/dist/redux.js public/vendor/
	cp node_modules/reactstrap/dist/reactstrap.full.js public/vendor/
	cp node_modules/immutable/dist/immutable.js public/vendor/
	cp node_modules/papaparse/papaparse.js public/vendor/
	cp node_modules/mocha/mocha.js public/vendor/
	cp node_modules/mocha/mocha.css public/vendor/
	cp node_modules/chai/chai.js public/vendor/
	cp node_modules/systemjs/dist/system.js public/vendor/

.PHONY: test
test: build
	$(CURDIR)/test.sh

.PHONY: lint
lint:
	tslint $(shell find src/ -regex '.*\.tsx?')

.PHONY: clean
clean:
	rm -rf lib public

.PHONY: start
start: build
	sledge
