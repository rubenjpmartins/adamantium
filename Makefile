TOKEN = $$(jq '.root_token' ./.secret/shamir_shares | tr -d '"')

down:
	docker-compose down
	rm .secret/*

up: 
	docker-compose up vault-plugin-compile
	docker-compose up -d vault 
	docker-compose up vault-init
	docker-compose up adamantium

init:
	curl \
	--request POST \
	--data '{"secret_shares": 5, "secret_threshold": 3}' \
	http://vault:8200/v1/sys/init > ./.secret/shamir_shares

status:
	./bin/vault status

unseal: 
	sh vault_unseal.sh

login:
	sh vault_auth.sh

transit:
	./bin/vault secrets enable transit

test-ed25519:
	yarn test:single src/signer/ed25519*

test-secp256k1-verify-compressed:
	yarn test:single src/signer/secp256k1.verify.compressed*

test-secp256k1-verify-uncompressed:
	yarn test:single src/signer/secp256k1.verify.uncompressed*

test-secp256k1-compress:
	yarn test:single src/signer/secp256k1.compress*

test-fix-secp256k1:
	yarn test:single src/signer/secp256k1.malleable*

test-eth-addr:
	yarn test:single src/signer/ethereum-address.*

test-eth-tx-hash:
	yarn test:e2e:single test/tx-hasher*

test-nonce-spam:
	yarn test:e2e:single test/nonce-spammer*

test-send-tx:
	yarn test:e2e:single test/app-e2e*

test-ecdh:
	yarn test:single src/signer/ecdh.*
