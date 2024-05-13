1. BUILDING DOCKER IMAGE : `docker build -t node-template-docker-image:dev -f docker/development/Dockerfile .`

2. RUNNING DOCKER CONTAINER : `docker run --env-file $(pwd)/.env --rm -it  -p 3000:3000 -v $(pwd):/usr/src/app -v  /usr/src/app/node_modules --name node-template-docker-container -e NODE_ENV=dev node-template-docker-image:dev`

# Explanation: `-v /usr/src/app/node_modules` ( this is used , so as to force docker to use its own node_modules folder and not sync / use our systems node_modules folder )

3. VIEWING RUNNING CONTAINERS : `docker ps`

4. STOPPING DOCKER CONTAINER : `docker stop node-template-docker-container`

# Stopping using current server command line : `Ctrl + C`
