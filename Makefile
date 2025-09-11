MAVEN_CLI_OPTS?=-s .m2/settings.xml

login:
	echo $(GITHUB_USER_PASS) | docker login ghcr.io -u $(GITHUB_USER_NAME) --password-stdin

.PHONY:	clean
clean:
	docker compose down --remove-orphans --volumes
	mvn $(MAVEN_CLI_OPTS) clean
	rm -rf **/node_modules
	rm -rf frontend/dist
	rm -rf blockchain/avalanche/cache
	rm -rf blockchain/avalanche/artifacts

.PHONY: install
install:
	@$(MAKE) -C blockchain/avalanche compile || { echo "Unable to install avalanche dependencies!"; exit 1; }
	mvn $(MAVEN_CLI_OPTS) install

	cd frontend && npm install && npm run build

	docker compose -f docker-compose.yml build --build-arg VERSION="$(VERSION)" --build-arg GIT_REV="$(GITHUB_SHA)" --build-arg BUILD_DATE="$(shell date)"

.PHONY:	run-only
run-only:
	-docker compose up --wait
	cd frontend && npm run dev

.PHONY:	run
run: install run-only
