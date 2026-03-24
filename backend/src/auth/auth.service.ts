import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const hashed = await bcrypt.hash(password, 10);
      await this.adminRepo.save({ username, password: hashed });
      console.log(`Default admin created: ${username}`);
    }
  }

  async login(dto: LoginDto) {
    const admin = await this.adminRepo.findOne({
      where: { username: dto.username },
    });

    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, username: admin.username };
    const token = this.jwtService.sign(payload);

    return { token, username: admin.username };
  }

  async getMe(userId: number) {
    const admin = await this.adminRepo.findOne({ where: { id: userId } });
    if (!admin) throw new UnauthorizedException();
    return { id: admin.id, username: admin.username };
  }
}
