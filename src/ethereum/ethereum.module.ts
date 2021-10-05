import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SignerModule } from "src/signer/signer.module";
import { NonceEntity } from "./entities/nonce.entity";
import { EthereumController } from "./ethereum.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([NonceEntity]),
        SignerModule, 
        HttpModule.register({
            baseURL: 'https://e0xhg5f7w0:9eQJgWZi5XE-ttiwqVLxHoV2IQME3XcQW3TXpuU7NFQ@e0rijjug7m-e0lgj8sru8-rpc.de0-aws.kaleido.io/'
    })],
    controllers: [EthereumController]
})
export class EthereumModule{}
