import supertest, { SuperTest, Test } from 'supertest';

describe('e2e', () => {
    let app: SuperTest<Test>

    beforeEach(() => {
        app = supertest('http://localhost:4000')
    })

    it('(OK) e2e post transaction check hash', () => {
        app.post('')
    })
})
