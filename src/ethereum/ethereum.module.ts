import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SignerModule } from "src/signer/signer.module";
import { NonceEntity } from "./entities/nonce.entity";
import { EthereumController } from "./ethereum.controller";
import { NonceService } from "./services/nonce.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([NonceEntity]),
        SignerModule, 
        HttpModule.register({
            baseURL: 'https://e0om6vzrdj:3uEPfapzgYvnfuFG-vlvvtLI0bYujkG-CIsfLwvGGH8@e0y58xo76i-e0gvxromxi-rpc.de0-aws.kaleido.io/'
    })],
    controllers: [EthereumController],
    providers: [NonceService]
})
export class EthereumModule{}
