#!/bin/bash
    
DOCKER_APP_NAME=boostore

EXIST_BLUE=$(docker-compose -p ${DOCKER_APP_NAME} ps | grep boostore_blue | grep -i running)

docker-compose -p ${DOCKER_APP_NAME} up --no-recreate -d


if [ -z "$EXIST_BLUE" ]; then
    echo "blue up"
    docker-compose -p ${DOCKER_APP_NAME} up boostore_blue -d
    
    sleep 10
    
    docker-compose -p ${DOCKER_APP_NAME} stop boostore_green
else
    echo "green up"
    docker-compose -p ${DOCKER_APP_NAME} up boostore_green -d
    
    sleep 10
    
    docker-compose -p ${DOCKER_APP_NAME} stop boostore_blue
fi