import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about'
import { Service } from './service/service'
import { Team } from './team/team'
import { Contact } from './contact/contact'
import { Privacy } from './privacy/privacy'
import { Terms } from './terms/terms'
import { Planform } from './planform/planform'
import { Login } from './login/login'
import { PaymentLogin } from './paymentlogin/payment-login'
import { Forgetpassword } from './forgetpassword/forgetpassword'
import { Otpverify } from './otpverify/otpverify'
import { Resetpassword } from './resetpassword/resetpassword'


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'about', component: About },
  { path: 'service', component: Service },
  { path: 'team', component: Team },
  { path: 'contact', component: Contact },
  { path: 'privacy', component: Privacy },
  { path: 'terms', component: Terms },
  { path: 'planform/:id', component: Planform },
  { path: 'payment-login', component: PaymentLogin },
  { path: 'forgetpassword', component: Forgetpassword },
  { path: 'otpverify', component: Otpverify },
  { path: 'resetpass', component: Resetpassword },
    
];