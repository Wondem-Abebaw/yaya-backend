import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import {
  PaginatedResponse,
  SearchTransactionDto,
  Transaction,
} from './interfaces/transaction.interfaces';

@Injectable()
export class AppService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YAYA_API_KEY') ?? '';
    this.apiSecret = this.configService.get<string>('YAYA_API_SECRET') ?? '';
    this.baseUrl =
      this.configService.get<string>('YAYA_API_BASE_URL') ??
      'https://sandbox.yayawallet.com';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('YaYa Wallet API credentials not configured');
    }
    if (!this.baseUrl) {
      throw new Error('YaYa Wallet API base URL not configured');
    }
  }

  private generateSignature(
    timestamp: string,
    method: string,
    endpoint: string,
    body: string,
  ): string {
    // Create pre-hash string: timestamp + method + endpoint + body
    const preHashString = timestamp + method + endpoint + body;

    // Create HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', this.apiSecret);
    hmac.update(preHashString);
    const signature = hmac.digest('base64');

    return signature;
  }

  private getAuthHeaders(method: string, endpoint: string, body: string = '') {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(timestamp, method, endpoint, body);

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'YAYA-API-KEY': this.apiKey,
      'YAYA-API-TIMESTAMP': timestamp,
      'YAYA-API-SIGN': signature,
    };
  }

  async getTransactions(
    p: number = 1,
    limit: number = 15,
  ): Promise<PaginatedResponse<Transaction>> {
    console.log('🚀 ~ AppService ~ getTransactions ~ p:', p);
    try {
      const endpoint = '/api/en/transaction/find-by-user';
      const method = 'GET';
      const body = '';

      const headers = this.getAuthHeaders(method, endpoint, body);

      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}${endpoint}`,
        {
          headers,
          params: {
            p,
            limit,
          },
        },
      );

      // console.log(
      //   '🚀 ~ AppService ~ getTransactions ~ response:',
      //   response.data,
      // );

      // Transform the response to match our expected format
      const transactions = this.transformTransactions(response.data.data || []);

      return {
        data: transactions,
        pagination: {
          page: Number(p),
          limit: Number(limit),
          total: response.data.total || transactions.length,
          totalPages:
            response.data.lastPage ||
            Math.ceil((response.data.total || transactions.length) / limit),
        },
        incomingSum: response.data.incomingSum,
        outgoingSum: response.data.outgoingSum,
        lastPage: response.data.lastPage,
        perPage: response.data.perPage,
      };
    } catch (error) {
      console.error(
        'Error fetching transactions:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to fetch transactions from YaYa Wallet API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async searchTransactions(
    searchDto: SearchTransactionDto,
  ): Promise<PaginatedResponse<Transaction>> {
    try {
      const { query, page = 1, limit = 15 } = searchDto;
      const endpoint = '/api/en/transaction/search';
      const method = 'POST';
      const requestBody = JSON.stringify({ query });

      const headers = this.getAuthHeaders(method, endpoint, requestBody);

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}${endpoint}`,
        { query },
        {
          headers,
          params: {
            page,
            limit,
          },
        },
      );

      const transactions = this.transformTransactions(
        response.data.data || response.data,
      );

      return {
        data: transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: response.data.total || transactions.length,
          totalPages: Math.ceil(
            (response.data.total || transactions.length) / limit,
          ),
        },
        incomingSum: response.data.incomingSum,
        outgoingSum: response.data.outgoingSum,
        lastPage: response.data.lastPage,
        perPage: response.data.perPage,
      };
    } catch (error) {
      console.error(
        'Error searching transactions:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to search transactions from YaYa Wallet API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private transformTransactions(data: any[]): Transaction[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      id: item.id || '',
      sender: {
        name: item.sender?.name || '',
        account: item.sender?.account || '',
      },
      receiver: {
        name: item.receiver?.name || '',
        account: item.receiver?.account || '',
      },
      amount_with_currency:
        item.amount_with_currency ||
        `${item.amount || 0}.00 ${item.currency || 'ETB'}`,
      amount: parseFloat(item.amount) || 0,
      amount_in_base_currency:
        parseFloat(item.amount_in_base_currency) ||
        parseFloat(item.amount) ||
        0,
      fee: parseFloat(item.fee) || 0,
      currency: item.currency || 'ETB',
      cause: item.cause || '',
      sender_caption: item.sender_caption || '',
      receiver_caption: item.receiver_caption || '',
      created_at_time: item.created_at_time || Math.floor(Date.now() / 1000),
      is_topup: Boolean(item.is_topup),
      is_outgoing_transfer: Boolean(item.is_outgoing_transfer),
      fee_vat: parseFloat(item.fee_vat) || 0,
      fee_before_vat: parseFloat(item.fee_before_vat) || 0,
    }));
  }
}
