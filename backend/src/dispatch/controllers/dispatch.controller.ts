import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { DispatchService } from '../services/dispatch.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../common/interceptors/tenant.interceptor';
import { DispatchStatus } from '../entities/dispatch.entity';
import { PlanGuard } from '../../billing/guards/plan.guard';
import { Feature } from '../../billing/guards/feature.decorator';

@Controller('dispatch')
@UseGuards(JwtAuthGuard, PlanGuard)
@Feature('workflow')
@UseInterceptors(TenantInterceptor)
export class DispatchController {
    constructor(private readonly dispatchService: DispatchService) { }

    @Post()
    create(@Body() data: any) {
        return this.dispatchService.create(data);
    }

    @Get()
    findAll() {
        return this.dispatchService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.dispatchService.getStats();
    }

    @Get('my-tasks')
    findMyTasks(@Req() req: any) {
        return this.dispatchService.findByAssignee(req.user.sub);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.dispatchService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: DispatchStatus) {
        return this.dispatchService.updateStatus(id, status);
    }
}
