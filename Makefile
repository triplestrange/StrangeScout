#!make

VERSION=$(shell ./.version.sh)

BUILDPATH=$(shell pwd)/build
OUT=$(shell pwd)/out
SNAP=$(shell pwd)/strangescout.snap

NAME = team1533/strangescout
IMG = $(NAME):$(VERSION)
LATEST = $(NAME):latest
 

out:
	@printf "\n Creating build directories\n";
	mkdir -p $(BUILDPATH)/frontend
	mkdir -p $(BUILDPATH)/output

	@printf "\n Copying sources\n";
	cd server; tar cf - --exclude='node_modules' --exclude='static' --exclude='dbs/*' * | ( cd $(BUILDPATH)/output; tar xfp -)
	cd frontend/web; tar cf - --exclude='node_modules' --exclude='dist' * | ( cd $(BUILDPATH)/frontend; tar xfp -)

	@printf "\n Setting version %s\n" "$(VERSION)";
	sed -i s/0.0.0/$(SS_VERSION)/ $(BUILDPATH)/frontend/src/environments/environment.prod.ts;

	@printf "\n Installing frontend dependencies\n";
	@cd $(BUILDPATH)/frontend; \
	npm i;

	@printf "\n Copying build leveldown dep to output\n";
	mkdir -p $(BUILDPATH)/output/node_modules/
	cp -r $(BUILDPATH)/frontend/node_modules/leveldown $(BUILDPATH)/output/node_modules/leveldown

	@printf "\n Building frontend\n";
	@cd $(BUILDPATH)/frontend; \
	./node_modules/.bin/ng build --prod --aot --source-map=false --build-optimizer --progress --output-path=$(BUILDPATH)/output/static;

	@printf "\n Installing server dependencies\n";
	@cd $(BUILDPATH)/output; \
	npm i;

	@printf "\n Relocating output\n";
	mv $(BUILDPATH)/output $(OUT);

	@printf "\n Cleaning build files\n";
	rm -rf $(BUILDPATH);

	@printf "\n Done!";

.PHONY: clean docker
clean:
	@echo " Cleaning...";
	rm -rf $(BUILDPATH);
	rm -rf $(OUT);
	rm -rf $(SNAP);

snap: out
	snapcraft snap -o $(SNAP);

docker: out
	docker image build -f docker/Dockerfile -t $(IMG) ./
	docker tag $(IMG) $(LATEST)
