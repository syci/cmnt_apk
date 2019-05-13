import { Component } from '@angular/core';
import { NavController, NavParams, AlertController} from 'ionic-angular';
import { OdooProvider } from '../../providers/odoo-connector/odoo-connector';
import { Storage} from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

//import { InAppBrowser } from '@ionic-native/in-app-browser/ngx'
import {HomePage} from '../home/home'
@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  EMPLOYEE_FIELDS = ['id', 'name', 'user_id', 'state', 'last_sign']
  selectedItem: any;
  icons: string[];
  attendances
  employee:{}
  apk:{}
  action: string;
  date: string
  gps:{}
  state: {}
  url_map: string
  ip: string
  show_gps_info
  constructor(public navCtrl: NavController, private odoo: OdooProvider, private storage: Storage, 
    public alertCtrl: AlertController, public navParams: NavParams, private geolocation: Geolocation) {
    // If we navigated to this page, we will have an item available as a nav param
    this.state = {'present': 'Presente', 'absent': 'Ausente'}
    this.gps = {}
    this.url_map = 'https://maps.google.com'
    this.show_gps_info = false

      
  
    
    this.geolocation.getCurrentPosition().then((resp) => {
      this.gps['latitude'] = resp.coords.latitude
      this.gps['longitude'] = resp.coords.longitude
      this.gps['accuracity'] = Math.round(resp.coords.accuracy)
      this.gps['ip'] = this.ip

      this.url_map = "https://maps.google.com/?ll=" + resp.coords.latitude + "," + resp.coords.longitude + ",&z=20"
      this.url_map = this.get_url_map(this.gps)
     }).catch((error) => {
       console.log('Error getting location', error);
     });
    
    let user =  this.navParams.data;
    if (!user['employee'])
      {this.storage.get('EMPLEADO').then((empleado) => {
        if (empleado){
          this.employee = empleado['employee']
          this.apk = empleado['apk']
        }
        else{
           this.navCtrl.setRoot(HomePage);
        }
      })
      }
        

    else {
      this.employee = user['employee']
      this.apk = user['apk']
    }



    console.log(this.employee)
    //this.get_attendances()
    // Let's populate this page with some filler content for funzies
    this.date = (new Date()).toLocaleString('es-ES', { timeZone: 'UTC' })
  }
  alternate_show_gps_info(){
    this.show_gps_info = !this.show_gps_info
  }
  get_url_map(gps){
    return "https://www.openstreetmap.org/#map=19/" + gps['latitude'] + "/" + gps['longitude'] + "&layers=TN"
    
  }
  open_url(){
    window.open(this.get_url_map(this.gps), '_blank'); //Abre la URL dentro de la propia aplicación Cordova)
  }

  presentAlert(titulo, texto) {
    const alert = this.alertCtrl.create({
        title: titulo,
        subTitle: texto,
        buttons: ['Ok']
    });
    alert.present();
  }


  refresh_employee(employee_id){
    this.odoo.searchRead('hr.employee', [['id', '=', employee_id]],this.EMPLOYEE_FIELDS).then((employee)=>{
      if (employee){
        this.employee = employee && employee[0]
        console.log(employee)
      }
    })
    .catch(() => {
      this.presentAlert('Error!', 'No se pudo recargar el empleado');
    });
  }
  check_log(){
    let model = 'hr.employee'
    let values ={'limit': 7, 'employee_id': this.employee['id'], 'gps_info': this.gps}
    
    this.odoo.execute(model, 'attendance_action_change_apk', values).then((act_change)=>{
      console.log(act_change)
      if (act_change['error']) {
        this.presentAlert('Error de validación', act_change['error_msg'])
      }
      else {
        //this.get_attendances()
        this.refresh_employee(this.employee['id'])
        //this.presentAlert('Log', 'Log correcto')
      }
    })
    .catch(() => {
      this.presentAlert('Error!', 'No se pudo hacer log contra odoo');
    });
    
  }

  get_attendances(){
    let model = 'hr.attendance'
    let values = {'limit': 7, 'employee_id': this.employee['id']}
    
    this.odoo.execute(model, 'get_logs', values).then((atts)=>{
      console.log(atts)
      this.attendances = atts 
    })
    .catch(() => {
      this.presentAlert('Error!', 'No se pudo recuperar la lista de logs contra odoo');
    });

  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(ListPage, {
      item: item
    });
  }
}
