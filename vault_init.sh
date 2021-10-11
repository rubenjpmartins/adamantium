#!/bin/bash

export VAULT_ADDR='http://vault:8200'

# init if not
FILE=./.secret/shamir_shares
if [ ! -f "$FILE" ]; then
    echo "$FILE not exists."
    echo "init..."
    curl \
    --request POST \
    --data '{"secret_shares": 5, "secret_threshold": 3}' \
    http://vault:8200/v1/sys/init > ./.secret/shamir_shares
    echo "done"
fi

# ./bin/vault status

# unseal
jq '.keys' ./.secret/shamir_shares | jq -c '.[]' | xargs -n 1 -I {} curl --request PUT --data '{ "key": {} }' http://vault:8200/v1/sys/unseal

VAULT_TOKEN=`jq '.root_token' ./.secret/shamir_shares | tr -d '"'`
echo "VAULT_TOKEN=${VAULT_TOKEN}" > .env

# login
# ./bin/vault login ${VAULT_TOKEN}

# transit
# ./bin/vault secrets enable transit
curl \
    --header "X-Vault-Token: ${VAULT_TOKEN}" \
    --request POST \
    --data '{ "type": "transit" }' \
    http://vault:8200/v1/sys/mounts/transit


# secp256k1 plugin 
echo "sha256 for file...${PLUGIN_FILE}"
SHA256SUM=$(sha256sum -b ${PLUGIN_FILE} | cut -d' ' -f1)
echo "sha256 ${SHA256SUM}"

echo "registering Quorum Hashicorp Vault plugin..."
curl --header "X-Vault-Token: ${VAULT_TOKEN}" --request POST \
  --data "{\"sha256\": \"${SHA256SUM}\", \"command\": \"quorum-hashicorp-vault-plugin\" }" \
  ${VAULT_ADDR}/v1/sys/plugins/catalog/secret/quorum-hashicorp-vault-plugin

echo "enabling Quorum Hashicorp Vault engine..."
curl --header "X-Vault-Token: ${VAULT_TOKEN}" --request POST \
  --data '{"type": "plugin", "plugin_name": "quorum-hashicorp-vault-plugin", "config": {"force_no_cache": true, "passthrough_request_headers": ["X-Vault-Namespace"]} }' \
  ${VAULT_ADDR}/v1/sys/mounts/quorum

echo "done registering quorum plugin"
