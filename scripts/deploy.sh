#!/usr/bin/env bash
set -e

$(aws ecr get-login --no-include-email --region eu-central-1)
docker build -t vault .
docker tag vault:latest 975963362635.dkr.ecr.eu-central-1.amazonaws.com/vault:latest
docker push 975963362635.dkr.ecr.eu-central-1.amazonaws.com/vault:latest