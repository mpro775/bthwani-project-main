import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { UtilityModule } from '../utility/utility.module';

@Module({
  imports: [UtilityModule],
  controllers: [MetaController],
})
export class MetaModule {}
