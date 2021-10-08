import supertest, { SuperTest, Test } from 'supertest';
import { CreateKeyRequest } from '../src/signer/requests/create-key.request'
import { ECCurve } from '../src/vault/vault-keys';
import { v4 } from 'uuid'

describe('e2e', () => {
    let app: SuperTest<Test>

    beforeEach(() => {
        app = supertest('http://localhost:3000')
    })

    it('(OK) send several txs from same account', async () => {
        const createRequest: CreateKeyRequest = {
            name: v4(),
            type: ECCurve.secp256k1
        }

        const response = await app.post('/v1/signer/create')
        .send(createRequest)
        .expect(201)

        const address = response.body.data.address
        console.log(`spamming with address: ${address}`)

        for (let index = 0; index < 20; index++) {
            await app.post('/v1/eth/send')
            .send({
                data: v4(),
                keyId: address
            })
            .expect(201)            
        }
    })
})
