import { SignerController } from "./signer.controller"
import { createMockInstance } from 'jest-create-mock-instance'
import { VaultService } from "..//vault/vault.service"
import { TransactionService } from "./services/transaction.service"

describe('Signer', () => {

    let controller: SignerController
    beforeEach(() => {
        controller = new SignerController(createMockInstance(VaultService), createMockInstance(TransactionService))
    })

    it("verify signature", () => {
        const signature: string = 'aDRkKEzOoc/O9H+xorCvLSEeNbak75das0qfywidvuZUkiSO1hwACyKu3SzDOeyQAMrEOQ/H/38rFdWv1lZzAw=='

        // controller.verifyEd25519()
    })
})
