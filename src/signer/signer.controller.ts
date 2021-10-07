import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ECCurve } from "../vault/vault-keys";
import { VaultService } from "../vault/vault.service";
import { CreateKeyRequest } from "./requests/create-key.request";
import { Hasher, HASH_ALGO } from "./hasher";
import { SignRequest } from "./requests/sign.request";
import { TransactionService } from "./services/transaction.service";

@Controller('signer')
@ApiTags('Signer')
export class SignerController {
    constructor(private readonly vaultService: VaultService,
        private readonly signerService: TransactionService
        ) {}
    
    /**
     * 
     * @param type 
     * @param name 
     * @returns 
     */
    @Get('/pub/key/:type/name/:name')
    async getPublicKey(
        @Query('type') type: string,
        @Query('name') name: string
    ): Promise<any> {
        return this.vaultService.read(ECCurve.vaultPathGetPubKey(type, name))
    }

    /**
     * 
     * @param type 
     * @returns 
     */
    @Get('/pub/all')
    async getKeys(
        @Query('type') type: string
    ): Promise<any> {
        return this.vaultService.read(ECCurve.vaultPathGetKeys(type))
    }

    /**
     * 
     * @param body 
     * @returns 
     */
    @Post('/create')
    async createKey(@Body() body: CreateKeyRequest): Promise<any> {
        const keypath: string = ECCurve.vaultPathForNewKey(body.type, body.name)
        const response = await this.vaultService.createKey(keypath, body)
        return response
    }

    /**
     * 
     * @param body 
     * @returns 
     */
    @Post('/sign')
    async sign(@Body() body: SignRequest): Promise<any> {
        return this.signerService.sign(body.type, body.name, Buffer.from(body.data))
        // const keypath: string = ECCurve.vaultPathForSigning(body.type, body.name)

        // if (body.type == ECCurve.secp256k1) {
        //     const hex: string = '0x' + Buffer.from(body.data).toString('hex')
        //     return this.vaultService.signData(keypath, { id: body.name, data: hex })    
        // }
        
        // // ed25519
        // const hash = Hasher.hash(Buffer.from(body.data), HASH_ALGO.BLAKE2b)

        // console.log(`hash: ${hash.toString('base64')}`)
        // return this.vaultService.signData(keypath, { input: hash.toString('base64'), prehashed: true })
    }
}
