#!/bin/sh
# Usage : sh build.sh [imageName] [privateResgistryDomain]:[port]

mkdir -p dist
rm dist/$1.tar
docker image rm $1
docker image rm $2/$1
docker build . -t $1

# Save image as tar file
docker save -o dist/$1.tar $1

# Push image to private registry
docker tag $1 $2/$1
docker push $2/$1