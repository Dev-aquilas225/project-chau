import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserReviewsService } from './user-reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

class CreateUserReviewDto {
  @IsNumber() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() comment?: string;
  @IsString() orderId: string;
}

@Controller('users/:id/reviews')
export class UserReviewsController {
  constructor(private userReviewsService: UserReviewsService) {}

  @Get()
  findByUser(@Param('id') userId: string) {
    return this.userReviewsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('id') revieweeId: string,
    @Body() dto: CreateUserReviewDto
  ) {
    return this.userReviewsService.create(user.sub, revieweeId, dto);
  }
}
