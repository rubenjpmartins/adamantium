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
    // @Get('/pub/all')
    // async getKeys(
    //     @Query('type') type: string
    // ): Promise<any> {
    //     return this.vaultService.read(ECCurve.vaultPathGetKeys(type))
    // }

    /**
     * 
     * @param body 
     * @returns 
     */
    @Post('/create')
    async createKey(@Body() body: CreateKeyRequest): Promise<any> {
        const keypath: string = ECCurve.vaultPathForNewKey(body.type, body.id)
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
        const encoding: BufferEncoding = body.encoding ? body.encoding : 'utf-8'
        return this.signerService.sign(body.type, body.keyId, Buffer.from(body.data, encoding))
    }
}
