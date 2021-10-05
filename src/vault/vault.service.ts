import axios, { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

@Injectable()
export class VaultService {

    constructor(private httpService: HttpService) {
        
    }

    /**
     * 
     * @returns 
     */
    async read(path: string) {
        const response: AxiosResponse = await this.httpService.get(`v1/${path}`).toPromise()
        return response.data
    }

    /**
     * 
     * @param path 
     * @param name 
     * @returns 
     */
    async createKey(path: string, data: any) {
        const response: AxiosResponse = await this.httpService.post(`v1/${path}`, data).toPromise()
        console.log(`response = ${JSON.stringify(response.data)}`)

        return response.data
    }

    async signData(path: string, data: any): Promise<any> {
        const response: AxiosResponse = await this.httpService.post(`v1/${path}`, data).toPromise()
        console.log(`response = ${JSON.stringify(response.data)}`)

        return response.data.data.signature
    }
}
