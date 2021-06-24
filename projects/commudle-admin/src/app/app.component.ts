import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { NbIconLibraries, NbMenuItem, NbSidebarService, NbWindowService, NbWindowState } from '@nebular/theme';
import { AppCentralNotificationService } from 'projects/commudle-admin/src/app/services/app-central-notifications.service';
import { FooterService } from 'projects/commudle-admin/src/app/services/footer.service';
import { environment } from 'projects/commudle-admin/src/environments/environment';
import { CookieConsentComponent } from 'projects/shared-components/cookie-consent/cookie-consent.component';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { TruncateTextPipe } from 'projects/shared-pipes/truncate-text.pipe';
import { ActionCableConnectionSocket } from 'projects/shared-services/action-cable-connection.socket';
import { ApiRoutesService } from 'projects/shared-services/api-routes.service';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { CookieConsentService } from './services/cookie-consent.service';

// import * as LogRocket from 'logrocket';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TruncateTextPipe]
})
export class AppComponent implements OnInit, AfterViewChecked {

  sideBarNotifications = false;
  sideBarState = 'collapsed';
  faBars = faBars;
  currentUser: ICurrentUser;
  userContextMenu: NbMenuItem[] = [
    { title: 'Logout', link: '/logout' }
  ];
  cookieAccepted = false;
  footerStatus = true;

  private isBrowser: boolean = isPlatformBrowser(this.platformId);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private apiRoutes: ApiRoutesService,
    private authWatchService: LibAuthwatchService,
    private actionCableConnectionSocket: ActionCableConnectionSocket,
    private sidebarService: NbSidebarService,
    private titleService: Title,
    private router: Router,
    private windowService: NbWindowService,
    private cookieConsentService: CookieConsentService,
    private appCentralNotificationsService: AppCentralNotificationService,
    private iconLibraries: NbIconLibraries,
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    private truncate: TruncateTextPipe
  ) {
    this.checkHTTPS();
    this.apiRoutes.setBaseUrl(environment.base_url);
    this.actionCableConnectionSocket.setBaseUrl(environment.anycable_url);

    this.iconLibraries.registerFontPack('far', { iconClassPrefix: 'fa', packClass: 'far' });
    this.iconLibraries.registerFontPack('fas', { iconClassPrefix: 'fa', packClass: 'fas' });
    this.iconLibraries.registerFontPack('fab', { iconClassPrefix: 'fa', packClass: 'fab' });
  }

  ngOnInit() {
    this.authWatchService.currentUser$.subscribe(currentUser => {
      this.currentUser = currentUser;

      if (this.currentUser && this.userContextMenu.length <= 1) {
        this.userContextMenu.unshift({
          title: `@${this.truncate.transform(currentUser.username, 10)}`,
          link: `/users/${currentUser.username}`,
          badge: {
            text: 'Profile',
            status: 'basic'
          }
        });

        // LogRocket.init('g90s8l/commudle');
        // LogRocket.identify(`${this.currentUser.username}`, {
        //   name: `${this.currentUser.name}`,
        //   email: `${this.currentUser.email}`,
        // });
      }

      if (this.isBrowser) {
        this.actionCableConnectionSocket.connectToServer();
      }
    });

    this.router.events.subscribe(event => {
      if (this.isBrowser) {
        setTimeout(() => {
          if (window.innerWidth <= 1000 && document.getElementById('commudleSidebar').classList.contains('expanded')) {
            this.document.getElementById('commudleSidebar').classList.remove('expanded');
            this.document.getElementById('commudleSidebar').classList.add('collapsed');
            this.sideBarState = 'collapsed';
          }
        }, 10);
      }
    });

    if (this.isBrowser && !this.cookieConsentService.isCookieConsentAccepted()) {
      setTimeout(() => {
        this.windowService.open(CookieConsentComponent, {
          title: 'Let\'s Share Cookies!',
          initialState: NbWindowState.MAXIMIZED,
          windowClass: 'cookie-consent'
        });
      }, 3000);
    }

    if (this.cookieConsentService.isCookieConsentAccepted()) {
      this.cookieAccepted = true;
    }

    this.checkNotifications();
  }

  ngAfterViewChecked(): void {
    this.footerService.footerStatus$.subscribe(value => this.footerStatus = value);
    this.cdr.detectChanges();
  }

  checkNotifications() {
    this.sidebarService.onCollapse().subscribe(data => this.sideBarState = 'collapsed');

    this.appCentralNotificationsService.sidebarNotifications$.subscribe(data => this.sideBarNotifications = data);
  }

  checkHTTPS() {
    if (this.isBrowser) {
      if (environment.production && location.protocol !== 'https:') {
        // location.replace(`https:${location.href.substring(location.protocol.length)}`);
      }
    }
  }

  toggleSidebar() {
    this.sideBarState = this.sideBarState === 'collapsed' ? 'expanded' : 'collapsed';
    this.sidebarService.toggle(false, 'mainMenu');
  }

  login() {
    this.document.location.href = `https://auther.commudle.com/?back_to=${encodeURIComponent(window.location.href)}`;
  }

}
