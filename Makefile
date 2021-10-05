TOKEN = $$(jq '.root_token' ./.secret/shamir_shares | tr -d '"')

down:
	docker-compose down

up: 
	docker-compose up vault-plugin-compile
	docker-compose up -d vault 
	docker-compose up vault-init
	docker-compose up adamantium

clean:
	make down
	rm .secret/*

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
