import { ApiProperty } from "@nestjs/swagger";
import Joi, { string } from "joi";
import { ECCurve } from "../../vault/vault-keys";

export class SignRequest {
    @ApiProperty()
    keyId: string

    @ApiProperty({
        enum: ECCurve,
        example: ECCurve.ed25519,
        type: string
    })
    type: string

    @ApiProperty()
    data: string

    @ApiProperty({ required: false })
    encoding?: BufferEncoding
}
