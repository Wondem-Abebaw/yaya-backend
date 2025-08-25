import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  AppService,
  PaginatedResponse,
  Transaction,
  SearchTransactionDto,
} from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('transactions')
  async getTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<PaginatedResponse<Transaction>> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new HttpException('Invalid page parameter', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new HttpException(
        'Invalid limit parameter (1-100)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.appService.getTransactions(pageNum, limitNum);
  }

  @Post('transactions/search')
  async searchTransactions(
    @Body() searchDto: SearchTransactionDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<PaginatedResponse<Transaction>> {
    if (!searchDto.query || searchDto.query.trim().length === 0) {
      throw new HttpException(
        'Search query is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new HttpException('Invalid page parameter', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new HttpException(
        'Invalid limit parameter (1-100)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.appService.searchTransactions({
      ...searchDto,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
