import { Injectable, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Form } from '../entities/form.entity';
import { Submission } from '../entities/submission.entity';
import { TenantContext } from '../../common/context/tenant.context';
import { BillingService } from '../../billing/services/billing.service';
import { DispatchService } from '../../dispatch/services/dispatch.service';
import { DispatchStatus } from '../../dispatch/entities/dispatch.entity';

@Injectable()
export class FormsService {
    constructor(
        @InjectRepository(Form)
        private formRepository: Repository<Form>,
        @InjectRepository(Submission)
        private submissionRepository: Repository<Submission>,
        private tenantContext: TenantContext,
        private billingService: BillingService,
        @Inject(forwardRef(() => DispatchService))
        private dispatchService: DispatchService,
    ) { }

    async getStats() {
        const tenantId = this.tenantContext.tenantId;
        if (!tenantId) return { forms: 0, submissions: 0, geoTagged: 0 };

        const formCount = await this.formRepository.count({ where: { tenant_id: tenantId } });
        const submissionCount = await this.submissionRepository.count({ where: { tenant_id: tenantId } });

        const geoTaggedCount = await this.submissionRepository
            .createQueryBuilder('s')
            .where('s.tenant_id = :tenantId', { tenantId })
            .andWhere('s.location IS NOT NULL')
            .getCount();

        return {
            forms: formCount,
            submissions: submissionCount,
            geoTagged: geoTaggedCount
        };
    }

    async getForms() {
        if (!this.tenantContext.tenantId) return [];
        return this.formRepository.createQueryBuilder('form')
            .loadRelationCountAndMap('form.submissionsCount', 'form.submissions')
            .where('form.tenant_id = :tenantId', { tenantId: this.tenantContext.tenantId })
            .andWhere('form.is_active = :isActive', { isActive: true })
            .orderBy('form.created_at', 'DESC')
            .getMany();
    }

    async getFormById(id: string) {
        if (!this.tenantContext.tenantId) return null;
        return this.formRepository.findOne({
            where: { id, tenant_id: this.tenantContext.tenantId },
        });
    }

    async getPublicFormById(id: string) {
        const form = await this.formRepository.findOne({
            where: { id, is_active: true },
        });
        if (!form) throw new BadRequestException('Form not found or inactive');
        return form;
    }

    async createForm(formData: any) {
        const tenantId = this.tenantContext.tenantId;
        if (!tenantId) throw new ForbiddenException('Tenant identification failed');

        // Check billing limits
        const sub = await this.billingService.getSubscriptionByTenant(tenantId);
        if (!sub || !sub.plan) throw new ForbiddenException('No active subscription found');

        const count = await this.formRepository.count({ where: { tenant_id: tenantId } });

        if (sub.plan.name === 'Free' && count >= 3) {
            throw new ForbiddenException('Free plan limit reached: 3 forms max. Upgrade to Pro for unlimited forms.');
        }

        const form = this.formRepository.create({
            ...formData,
            tenant_id: tenantId,
        });
        return this.formRepository.save(form);
    }

    async updateForm(id: string, updateData: any) {
        const tenantId = this.tenantContext.tenantId;
        const form = await this.formRepository.findOne({
            where: { id, tenant_id: tenantId },
        });
        if (!form) throw new BadRequestException('Form not found');

        // Merge allowed fields
        if (updateData.name !== undefined) form.name = updateData.name;
        if (updateData.description !== undefined) form.description = updateData.description;
        if (updateData.category !== undefined) form.category = updateData.category;
        if (updateData.schema !== undefined) form.schema = updateData.schema;
        if (updateData.status !== undefined) form.status = updateData.status;
        if (updateData.is_active !== undefined) form.is_active = updateData.is_active;

        // Auto-increment version on each save
        form.version = (form.version || 1) + 1;

        return this.formRepository.save(form);
    }

    async submitForm(formId: string, data: any, location?: any, userId?: string, dispatchId?: string) {
        let tenantId = this.tenantContext.tenantId;

        // If no tenant context (public submission), find the form's tenant
        if (!tenantId) {
            const form = await this.formRepository.findOne({ where: { id: formId } });
            if (!form) throw new BadRequestException('Invalid form ID');
            tenantId = form.tenant_id;
        }

        // Check submission limits (per month)
        const sub = await this.billingService.getSubscriptionByTenant(tenantId);
        if (!sub) throw new ForbiddenException('No active subscription found');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const submissionCount = await this.submissionRepository.count({
            where: {
                tenant_id: tenantId,
                submitted_at: Between(startOfMonth, new Date())
            },
        });

        if (sub.plan.name === 'Free' && submissionCount >= 100) {
            throw new ForbiddenException('Free plan limit reached: 100 submissions/month. Upgrade to Pro.');
        }

        const submission = this.submissionRepository.create({
            form_id: formId,
            data,
            location,
            tenant_id: tenantId,
            captured_by_user_id: userId,
        });

        const savedSubmission = await this.submissionRepository.save(submission);

        // If this was part of a dispatch, mark it as completed
        if (dispatchId) {
            await this.dispatchService.updateStatus(dispatchId, DispatchStatus.COMPLETED);
        }

        return savedSubmission;
    }



    async getSubmissionsByFormId(formId: string) {
        return this.submissionRepository.find({
            where: { form_id: formId, tenant_id: this.tenantContext.tenantId },
            order: { submitted_at: 'DESC' },
        });
    }

    async getSubmissionsCsv(formId: string) {
        const form = await this.formRepository.findOne({ where: { id: formId, tenant_id: this.tenantContext.tenantId } });
        const submissions = await this.getSubmissionsByFormId(formId);

        if (!form || submissions.length === 0) return '';

        // Determine max rows per table field across all submissions
        const tableFieldMaxRows: Record<string, number> = {};
        for (const field of form.schema.fields) {
            if (field.type === 'table' && field.columns) {
                let maxR = 0;
                for (const s of submissions) {
                    const arr = s.data?.[field.id];
                    if (Array.isArray(arr) && arr.length > maxR) maxR = arr.length;
                }
                tableFieldMaxRows[field.id] = maxR;
            }
        }

        // Build header row
        const headers: string[] = ['Submission ID', 'Timestamp', 'Geo-Latitude', 'Geo-Longitude'];
        for (const field of form.schema.fields) {
            if (field.type === 'table' && field.columns) {
                const maxR = tableFieldMaxRows[field.id] || 0;
                for (let r = 0; r < maxR; r++) {
                    for (const col of field.columns) {
                        headers.push(`${field.label} R${r + 1} ${col.label}`);
                    }
                }
            } else {
                headers.push(field.label);
            }
        }

        // Build data rows
        const rows = submissions.map(s => {
            const data = s.data || {};
            const cells: (string | number | boolean)[] = [
                s.id,
                s.submitted_at.toISOString(),
                s.location?.lat || '',
                s.location?.lng || '',
            ];

            for (const field of form.schema.fields) {
                if (field.type === 'table' && field.columns) {
                    const tableRows = Array.isArray(data[field.id]) ? data[field.id] : [];
                    const maxR = tableFieldMaxRows[field.id] || 0;
                    for (let r = 0; r < maxR; r++) {
                        const row = tableRows[r] || {};
                        for (const col of field.columns) {
                            const val = row[col.id];
                            if (val === undefined || val === null) {
                                cells.push('');
                            } else if (typeof val === 'boolean') {
                                cells.push(val ? 'Yes' : 'No');
                            } else {
                                cells.push(val);
                            }
                        }
                    }
                } else {
                    const val = data[field.id];
                    cells.push(val !== undefined && val !== null ? val : '');
                }
            }

            return cells.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });

        return [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','), ...rows].join('\n');
    }

    async getAnalytics() {
        const tenantId = this.tenantContext.tenantId;

        // ── 1. Overall totals ────────────────────────────────────────────────
        const totalForms = await this.formRepository.count({ where: { tenant_id: tenantId } });
        const totalSubmissions = await this.submissionRepository.count({ where: { tenant_id: tenantId } });

        // ── 2. Submissions this month ────────────────────────────────────────
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const submissionsThisMonth = await this.submissionRepository.count({
            where: { tenant_id: tenantId, submitted_at: Between(startOfMonth, endOfMonth) },
        });

        // ── 3. Submissions last month ────────────────────────────────────────
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const submissionsLastMonth = await this.submissionRepository.count({
            where: { tenant_id: tenantId, submitted_at: Between(startOfLastMonth, endOfLastMonth) },
        });

        // ── 4. Geo-tagged submissions ────────────────────────────────────────
        const geoTaggedCount = await this.submissionRepository
            .createQueryBuilder('s')
            .where('s.tenant_id = :tenantId', { tenantId })
            .andWhere('s.location IS NOT NULL')
            .getCount();

        // ── 5. Daily chart data — last 30 days ───────────────────────────────
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyRaw: any[] = await this.submissionRepository
            .createQueryBuilder('s')
            .select("DATE_TRUNC('day', s.submitted_at)", 'day')
            .addSelect('COUNT(*)', 'count')
            .where('s.tenant_id = :tenantId', { tenantId })
            .andWhere('s.submitted_at >= :thirtyDaysAgo', { thirtyDaysAgo })
            .groupBy("DATE_TRUNC('day', s.submitted_at)")
            .orderBy("DATE_TRUNC('day', s.submitted_at)", 'ASC')
            .getRawMany();

        const dailyData = dailyRaw.map(r => {
            const dateStr = r.day instanceof Date
                ? r.day.toISOString().split('T')[0]
                : String(r.day).substring(0, 10);
            return {
                date: dateStr,
                submissions: parseInt(r.count, 10),
            };
        });

        // ── 6. Per-form breakdown ─────────────────────────────────────────────
        const formBreakdownRaw: { form_id: string; form_name: string; count: string }[] = await this.submissionRepository
            .createQueryBuilder('s')
            .innerJoin('s.form', 'f')
            .select('s.form_id', 'form_id')
            .addSelect('f.name', 'form_name')
            .addSelect('COUNT(s.id)', 'count')
            .where('s.tenant_id = :tenantId', { tenantId })
            .groupBy('s.form_id, f.name')
            .orderBy('COUNT(s.id)', 'DESC')
            .limit(5)
            .getRawMany();

        const formBreakdown = formBreakdownRaw.map(r => ({
            formId: r.form_id,
            formName: r.form_name,
            submissions: parseInt(r.count, 10),
        }));

        // ── 7. Month-over-month change ────────────────────────────────────────
        const momChange = submissionsLastMonth === 0
            ? 100
            : Math.round(((submissionsThisMonth - submissionsLastMonth) / submissionsLastMonth) * 100);

        return {
            totals: {
                forms: totalForms,
                submissions: totalSubmissions,
                submissionsThisMonth,
                submissionsLastMonth,
                momChange,
                geoTagged: geoTaggedCount,
                geoRate: totalSubmissions > 0 ? Math.round((geoTaggedCount / totalSubmissions) * 100) : 0,
            },
            dailyData,
            formBreakdown,
        };
    }
}
