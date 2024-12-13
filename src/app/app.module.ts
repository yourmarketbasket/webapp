import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CurrencyPipe } from '@angular/common'; 
import { CommonModule } from '@angular/common';
import {MatRadioModule} from '@angular/material/radio';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MdbSelectModule } from 'mdb-angular-ui-kit/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import {MatMenuModule} from '@angular/material/menu';
import { NointernetComponent } from './nointernet/nointernet.component';
import { RegisterComponent } from './register/register.component';
import { MatBadgeModule } from '@angular/material/badge';
import { NavigationComponent } from './navigation/navigation.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule} from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe, registerLocaleData } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { SocketService } from './services/socket.service';
import { CreatestoreComponent } from './mystores/createstore/createstore.component';
import { ManageStoresComponent } from './mystores/manage-stores/manage-stores.component';
import { MatTabsModule } from '@angular/material/tabs';
import { StoresDashboardComponent } from './mystores/stores-dashboard/stores-dashboard.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatDividerModule } from '@angular/material/divider';
import { FooterComponent } from './footer/footer.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatChipsModule} from '@angular/material/chips';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { HeaderComponent } from './header/header.component';
import { AddProductsComponent } from './mystores/add-products/add-products.component';
import { LoginComponent } from './login/login.component';
import { ViewProductsComponent } from './mystores/view-products/view-products.component';
import { ProfileComponent } from './profile/profile.component';
import { ManagerComponent } from './manager/manager.component';
import { RootComponent } from './root/root.component';
import { QualityAssuranceComponent } from './quality-assurance/quality-assurance.component';
import { FinanceDepartmentComponent } from './finance-department/finance-department.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { RootHeaderComponent } from './root/root-header/root-header.component';
import { RootSidebarComponent } from './root/root-sidebar/root-sidebar.component';
import { ManagementDashboardComponent } from './management-dashboard/management-dashboard.component';
import { RootDashboardComponent } from './root/root-dashboard/root-dashboard.component';
import { QaDashboardComponent } from './quality-assurance/qa-dashboard/qa-dashboard.component';
import { QaHeaderComponent } from './quality-assurance/qa-header/qa-header.component';
import { QaSidebarComponent } from './quality-assurance/qa-sidebar/qa-sidebar.component';
import { ReviewProductsComponent } from './quality-assurance/review-products/review-products.component';
import { MatTableModule } from '@angular/material/table';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { EditProductModalComponent } from './mystores/view-products/edit-product-modal/edit-product-modal.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { ProductsComponent } from './marketplace/products/products.component';
import { HeaderComponent as ProductsHeader } from './marketplace/products/header/header.component';
import { ProductComponent } from './marketplace/product/product.component';
import { SettingsComponent } from './profile/settings/settings.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CartComponent } from './marketplace/cart/cart.component';
import { AddToCartComponent } from './marketplace/add-to-cart/add-to-cart.component';
import { CheckoutComponent } from './marketplace/checkout/checkout.component';
import { PaymentDialogComponent } from './marketplace/checkout/payment-dialog/payment-dialog.component';
import { PaymentSuccessComponent } from './marketplace/checkout/payment-success/payment-success.component';
import {MatSliderModule} from '@angular/material/slider';
import { CategoriesComponent } from './marketplace/categories/categories.component';
import { OrdersComponent } from './marketplace/orders/orders.component';
import { ProcessOrderComponent } from './mystores/process-order/process-order.component';
import { SelectStoreDialogComponent } from './marketplace/orders/select-store-dialog/select-store-dialog.component';
import { PhonePipe } from './phone.pipe';
import { VerifyComponent } from './verify/verify.component';
import { RatingPipe } from './rating.pipe';
import { CapitalizePipe } from './capitalize.pipe';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai-preview';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import en from '@angular/common/locales/en';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { FeatherModule } from 'angular-feather';
import { Star, Camera, List, Heart, Github, Bell, Eye, ShoppingCart, LogOut, AlertCircle, Clock, CheckCircle, AlertOctagon} from 'angular-feather/icons';
import { NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MdbRatingModule } from 'mdb-angular-ui-kit/rating';
import { NouisliderModule } from 'ng2-nouislider';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

 
registerLocaleData(en);

import {CloudinaryModule} from '@cloudinary/ng';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsComponent } from './offcanvas/notifications/notifications.component';
import { NotificationModalComponent } from './offcanvas/notification-modal/notification-modal.component';
import { ManageViewsComponent } from './quality-assurance/manage-views/manage-views.component';
import { ManageUsersComponent } from './quality-assurance/manage-users/manage-users.component';
import { AbbreviateNumberPipe } from './abbreviate-number.pipe';
import { NipipePipe } from './nipipe.pipe';


const icons = {
  Camera,
  Heart,
  Github,
  Bell,
  ShoppingCart,
  LogOut,
  AlertCircle,
  Clock,
  CheckCircle,
  AlertOctagon,
  Star,
  Eye,
  List
};



@NgModule({ 
  declarations: [
        RatingPipe,
        LoginComponent,
        AppComponent,
        ConfirmationComponent,
        NointernetComponent,
        RegisterComponent,
        NavigationComponent,
        CreatestoreComponent,
        ManageStoresComponent,
        StoresDashboardComponent,
        DashboardComponent,
        SidebarComponent,
        FooterComponent,
        NotFoundComponent,
        HeaderComponent,
        AddProductsComponent,
        ViewProductsComponent,
        ProfileComponent,
        ManagerComponent,
        RootComponent,
        QualityAssuranceComponent,
        FinanceDepartmentComponent,
        AdminHeaderComponent,
        AdminSidebarComponent,
        RootHeaderComponent,
        RootSidebarComponent,
        ManagementDashboardComponent,
        QaDashboardComponent,
        RootDashboardComponent,
        QaHeaderComponent,
        QaSidebarComponent,
        ReviewProductsComponent,
        EditProductModalComponent,
        MarketplaceComponent,
        ProductsComponent,
        ProductsHeader,
        ProductComponent,
        SettingsComponent,
        ResetPasswordComponent,
        CartComponent,
        AddToCartComponent,
        CheckoutComponent,
        PaymentDialogComponent,
        PaymentSuccessComponent,
        CategoriesComponent,
        OrdersComponent,
        ProcessOrderComponent,
        SelectStoreDialogComponent,
        PhonePipe,
        VerifyComponent,
        RatingPipe,
        CapitalizePipe,
        NotificationsComponent,
        NotificationModalComponent,
        ManageViewsComponent,
        ManageUsersComponent,
        AbbreviateNumberPipe,
        NipipePipe,
    ],
    bootstrap: [AppComponent], 
    imports: [
        NzCarouselModule,
        MatMenuModule,   
        FeatherModule,  
        CloudinaryModule,   
        MatSlideToggleModule,
        MatSliderModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        NgbDropdownModule,
        MdbCarouselModule,
        CommonModule,
        NgbCollapseModule,
        MatTableModule,
        MatTooltipModule,
        MatChipsModule,
        MatTabsModule,
        MatListModule,
        BrowserModule,
        MdbDropdownModule, 
        MdbRippleModule,
        MatExpansionModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MdbRatingModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatToolbarModule,
        MatSelectModule,
        MatSidenavModule,
        MatGridListModule,
        MatStepperModule,
        MatDatepickerModule,
        MatProgressBarModule,
        MatNativeDateModule,
        MatDividerModule,
        MatCheckboxModule,
        MatBadgeModule,
        MatPaginatorModule,
        MatSortModule,
        MatRadioModule,
        FeatherModule.pick(icons),
        NgbModule,
        NgbOffcanvasModule,
        NgbRatingModule,
        NouisliderModule,
        MdbSelectModule
      ], 
        providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { displayDefaultIndicatorType: false },
        },
        CurrencyPipe,
        DatePipe,
        SocketService,
        {
            provide: MatPaginatorIntl,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
        provideFirebaseApp(() => initializeApp({"projectId":"market-9ed5b","appId":"1:198696938433:web:81349c211924c6bb125d40","storageBucket":"market-9ed5b.firebasestorage.app","apiKey":"AIzaSyCr90ZfEU69mIPPtlElsO5A01tAzedOjzc","authDomain":"market-9ed5b.firebaseapp.com","messagingSenderId":"198696938433","measurementId":"G-KEYCR0YSZT"})),
        provideAuth(() => getAuth()),
        provideAnalytics(() => getAnalytics()),
        ScreenTrackingService,
        UserTrackingService,
        provideAppCheck(() => {
          // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
          const provider = new ReCaptchaEnterpriseProvider("key");
          return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
        }),
        provideFirestore(() => getFirestore()),
        provideDatabase(() => getDatabase()),
        provideFunctions(() => getFunctions()),
        provideMessaging(() => getMessaging()),
        providePerformance(() => getPerformance()),
        provideStorage(() => getStorage()),
        provideRemoteConfig(() => getRemoteConfig()),
        provideVertexAI(() => getVertexAI()),
        { provide: NZ_I18N, useValue: en_US },
        provideHttpClient()
    ] })
export class AppModule { }
