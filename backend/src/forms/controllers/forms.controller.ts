import { Controller, Get, Post, Put, Body, UseGuards, UseInterceptors, Param, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { FormsService } from '../services/forms.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../common/interceptors/tenant.interceptor';
import { Feature } from '../../billing/guards/feature.decorator';
import { PlanGuard } from '../../billing/guards/plan.guard';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('forms')
@UseGuards(JwtAuthGuard, PlanGuard)
@UseInterceptors(TenantInterceptor)
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    @Get('stats')
    getStats() {
        return this.formsService.getStats();
    }

    @Get('analytics')
    @Feature('analytics')
    getAnalytics() {
        return this.formsService.getAnalytics();
    }

    @Get()
    getForms() {
        return this.formsService.getForms();
    }

    @Post()
    createForm(@Body() body: any) {
        return this.formsService.createForm(body);
    }

    @Put(':id')
    updateForm(@Param('id') id: string, @Body() body: any) {
        return this.formsService.updateForm(id, body);
    }

    @Get(':id')
    getForm(@Param('id') id: string) {
        return this.formsService.getFormById(id);
    }

    @Public()
    @Get(':id/public')
    getPublicForm(@Param('id') id: string) {
        return this.formsService.getPublicFormById(id);
    }

    @Public()
    @Post(':id/submit')
    submit(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const { data, location, dispatchId } = body;
        return this.formsService.submitForm(id, data, location, req.user?.sub, dispatchId);
    }

    @Get(':id/submissions')
    getSubmissions(@Param('id') id: string) {
        return this.formsService.getSubmissionsByFormId(id);
    }

    @Get(':id/export')
    async exportSubmissions(@Param('id') id: string, @Res() res: Response) {
        const csv = await this.formsService.getSubmissionsCsv(id);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=submissions-${id}.csv`);
        res.status(200).send(csv);
    }
}
