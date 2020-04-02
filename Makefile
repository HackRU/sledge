export SHELL := /bin/sh
export PATH := $(CURDIR)/bin:$(CURDIR)/node_modules/.bin:$(PATH)
export DEBUG=sledge

.PHONY: build
build: build-client-static build-client-html build-client-webpack build-server

.PHONY: build-client-static
build-client-static:
	mkdir -p public
	cp static/* public
	cp -R src public/src

.PHONY: build-client-html
build-client-html: build-client-static build-server
	sledge --generate-html ${CURDIR}/public

.PHONY: build-client-webpack
build-client-webpack:
	webpack

.PHONY: build-server
build-server:
	tsc

.PHONY: start
start: build
	sledge

.PHONY: test
test: build
	jest

.PHONY: apidoc
apidoc:
	typedoc --out api src
