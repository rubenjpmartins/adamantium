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
            baseURL: 'https://e0rcwu0tin:DE81xqmgPCgRZzqW1c2l5fi2FN3zHCLr96b6DjHAwY4@e0y58xo76i-e0th4myjv4-rpc.de0-aws.kaleido.io/'
    })],
    controllers: [EthereumController],
    providers: [NonceService]
})
export class EthereumModule{}
