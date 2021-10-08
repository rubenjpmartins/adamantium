import { ApiParam, ApiProperty } from "@nestjs/swagger";

export class TransactionRequest {
    @ApiProperty()
    data: string;

    @ApiProperty()
    keyId: string
}
