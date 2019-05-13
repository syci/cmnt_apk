import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LogHistoryPage } from './log-history';

@NgModule({
  declarations: [
    LogHistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(LogHistoryPage),
  ],
})
export class LogHistoryPageModule {}
