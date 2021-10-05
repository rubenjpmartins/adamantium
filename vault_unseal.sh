#!/bin/bash

jq '.keys' ./.secret/shamir_shares | jq -c '.[]' | xargs -n 1 -I {} curl --request PUT --data '{ "key": {} }' http://vault:8200/v1/sys/unseal

# export VAULT_ADDR='http://127.0.0.1:8200'
# vault operator unseal
