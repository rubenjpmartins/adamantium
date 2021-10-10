import supertest, { SuperTest, Test } from 'supertest';
import { CreateKeyRequest } from '../src/signer/requests/create-key.request'
import { TransactionRequest } from '../src/ethereum/requests/transaction.request'
import { ECCurve } from '../src/vault/vault-keys';
import { v4 } from 'uuid'


jest.setTimeout(20000)
describe('e2e', () => {
    let app: SuperTest<Test>

    beforeEach(() => {
        app = supertest('http://localhost:3000')
    })

    it('(OK) e2e post create key', async () => {
        const createRequest: CreateKeyRequest = {
            id: v4(),
            type: ECCurve.secp256k1
        }

        const response = await app.post('/v1/signer/create')
        .send(createRequest)
        .expect(201)
        
        console.log(`response body : ${JSON.stringify(response.body.data)}`)
    })

    it('(OK) e2e send transaction', async () => {
        const createRequest: CreateKeyRequest = {
            id: v4(),
            type: ECCurve.secp256k1
        }

        const response = await app.post('/v1/signer/create')
        .send(createRequest)
        .expect(201)

        console.log(`response body : ${JSON.stringify(response.body.data)}`)
        const address = response.body.data.address
        
        const sendRequest: TransactionRequest = {
            data: v4(),
            keyId: address
        }

        const sendResponse = await app.post('/v1/eth/send')
        .send(sendRequest)
        .expect(201)

        console.log(`sendResponse : ${JSON.stringify(sendResponse)}`)
    })
})
