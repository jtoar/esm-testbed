clean:
	git restore .
	git clean -fxd -e .env
	yarn cache clean --all

install:
	yarn

reset: clean install

get-yarn-cache-folder:
	yarn config get cacheFolder

ls-yarn-cache-folder:
	ls $(shell yarn config get cacheFolder)

# ```
# make run-attw ARGS=./tarballs/redwoodjs-auth.tgz
# ```
run-attw:
	yarn attw $(ARGS)

run-add-tarball:
	yarn node scripts/add_tarball.js

run-get-package-location:
	yarn node scripts/get_package_location.js

run-main:
	yarn node main.js

configure-node-modules-linker: clean
	echo "nodeLinker: node-modules" > .yarnrc.yml
	yarn

configure-pnp-linker: clean
	rm -f .yarnrc.yml
	yarn
