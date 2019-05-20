import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import {Storage} from '@ionic/storage';


import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LogHistoryPage } from '../pages/log-history/log-history';

import { AudioPlayer } from '../providers/audio/audio'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  
  
  pages: Array<{title: string, component: any}>;
  user={}
  constructor(player: AudioPlayer, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public storage: Storage ) {

    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Acceso', component: HomePage },
      { title: 'Registrar', component: ListPage },
      { title: 'Histórico', component: LogHistoryPage }
    ];
    player.preload('click', 'assets/audio/click.mp3');
    player.preload('check_in', 'assets/audio/check_in.mp3');
    player.preload('check_out', 'assets/audio/check_out.mp3');
    player.preload('ok', 'assets/audio/ok.mp3');

    player.preload('gps_ok', 'assets/audio/gps_ok.mp3');
    player.preload('error', 'assets/audio/error.mp3');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}



