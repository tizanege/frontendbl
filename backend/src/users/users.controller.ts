import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';
import { UserRole } from './entities/user.entity';

@Controller('team')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    getTeam() {
        return this.usersService.getTeamMembers();
    }

    @Get('stats')
    getTeamStats() {
        return this.usersService.getTeamStats();
    }

    @Post('invite')
    inviteMember(@Body() body: { firstName: string; lastName: string; email: string; role: UserRole }) {
        return this.usersService.inviteTeamMember(body);
    }

    @Patch(':id/role')
    updateRole(@Param('id') id: string, @Body() body: { role: UserRole }) {
        return this.usersService.updateMemberRole(id, body.role);
    }

    @Delete(':id')
    deactivateMember(@Param('id') id: string) {
        return this.usersService.deactivateMember(id);
    }
}
