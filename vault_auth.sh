#!/bin/bash

jq '.root_token' ./.secret/shamir_shares | tr -d '"' | xargs -n 1 -I {} ./bin/vault login {}
