import {NavController, NavParams, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';

import { Storage} from '@ionic/storage';
import { OdooProvider } from '../../providers/odoo-connector/odoo-connector';
import { ListPage } from '../list/list';
import { AudioPlayer } from '../../providers/audio/audio';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
    EMPLOYEE_FIELDS = ['id', 'name', 'user_id', 'state', 'last_sign']
    loginData = {password: '', username: ''};
    CONEXION_remote_gc = {
      url: 'https://odoo.cbgrancanaria.net/',
      port: '443',
      db: 'cbgc',
      username: 'comunitea',
			password: '7V(3R~6S372wb@o',
		  user: {}
	};
		CONEXION_remote= {
			url: 'http://192.168.0.10/',
			port: '8069',
			db: 'clock',
			username: '',
			password: '',
user: {}
};
	CONEXION = {
				url: '',
        port: '',
        db: '',
        username: '',
				password: '',
				user: {}
	}
	employee:{}
	apk:{}
  cargar = false;
	mensaje = '';
	login_server: boolean = false
	apk_image
    constructor(public player: AudioPlayer, public navCtrl: NavController, public navParams: NavParams,
                private storage: Storage, public alertCtrl: AlertController,
                private odoo: OdooProvider) {
		
		this.login_server = false
		this.storage.get('APK_IMAGE').then((image) => {
			if (image){
				this.apk_image = image}
			
			else
			{this.apk_image = false}})

		if (this.navParams.get('login')){
			this.CONEXION.username = this.navParams.get('login')};
			this.check_storage_conexion(this.navParams.get('borrar'))
    }

	check_storage_conexion(borrar){
		if (borrar){
			this.CONEXION = this.CONEXION_remote;
		}	
		else {
			this.storage.get('CONEXION').then((val) => {
				if (val && val['username']){
					this.CONEXION = val
				}
				else{
					this.storage.clear()
					this.CONEXION = this.CONEXION_remote;
					
					this.storage.set('CONEXION', this.CONEXION).then(()=>{
				})
			}
			})
		}
	}

    presentAlert(titulo, texto) {
        const alert = this.alertCtrl.create({
            title: titulo,
            subTitle: texto,
            buttons: ['Ok']
        });
        alert.present();
    }


	conectarApp(verificar){
		this.player.play('click')
		this.cargar = true;
		if (verificar){
			this.storage.set('CONEXION', this.CONEXION).then(() => {
				this.load_user(this.CONEXION)
			})
		}

		else {
			this.storage.get('CONEXION').then((val) => {
				var con;
				if (val == null) {//no existe datos         
					this.cargar = false;
					con = this.CONEXION;
					if (con.username.length < 3 || con.password.length < 3) {
						if (verificar) {
							this.player.play('error')
							this.presentAlert('Alerta!', 'Por favor ingrese usuario y contraseña');
						}
					return;
					}
		
				} else {
				//si los trae directamente ya fueron verificados
					con = val;
					if (con.username.length < 3 || con.password.length < 3) {
						this.player.play('error')
						this.cargar = false;
						return
					}
				}
				if (con){
					this.storage.set('CONEXION', con).then(() => {
						this.player.play('ok')
						this.load_user(con)
						
					})
				}
			})
		}
	}		

	load_user(con){
		var model = 'hr.employee'
		this.odoo.login(con.username, con.password).then ((uid)=>{
			this.odoo.uid = uid

			var values = {'user_id': uid}
			this.odoo.execute(model, 'get_employee_info', values).then((data)=>{
				if (data['error']){
					this.presentAlert('Error!', data['error_msg']);
					this.cargar =false;
				}
				else {
				let	employee = data['data']
				console.log(employee)
				con.user = uid
				this.storage.set('CONEXION', con).then(()=>{

					this.storage.set('EMPLEADO', employee).then(()=>{
						this.cargar =false;
						this.employee=employee['employee']
						this.apk=employee['apk']
						this.storage.set('APK_IMAGE', this.apk['image']).then(() => {
            
						})
						document.documentElement.style.setProperty(`--logo_color`, this.apk['logo_color']);
						this.navCtrl.setRoot(ListPage, employee);
					})  
				})  
				}	
			})
			.catch((error) => {
				this.cargar =false;
				this.presentAlert('Error!', 'No se pudo recuperar los datos de cache. Error' + error);
			});
		}).catch((error) => {
			this.cargar =false;
			this.presentAlert('Error!', error['error_msg']);
		});

	}
	check_conexion(con) {	
		var model = 'res.users'
		var domain = [['login', '=', con.username]]
		var fields = ['id', 'login', 'image', 'name', 'company_id']
		this.odoo.login(con.username, con.password).then ((uid)=>{
			this.odoo.uid = uid
			this.odoo.searchRead(model, domain, fields).then((value)=>{
				var user = {id: null, name: null, image: null, login: null, cliente_id: null, company_id: null};
				if (value) { 
					if (!con.user || value[0].id != con.user['id'] || value[0].company_id[0] != con.user['company_id']){
            user = value[0];
            con.user = user
            this.odoo.searchRead('hr.employee', [['user_id', '=', con.user['id']]], this.EMPLOYEE_FIELDS,0,1).then((employee)=>{
              if (employee){
								
                console.log(employee)
                this.storage.set('CONEXION', con).then(()=>{
                  this.storage.set('EMPLEADO', employee).then(()=>{
                    this.navCtrl.setRoot(ListPage, employee);
                  })  
                })  
              }
            }).catch((error_employee) => {
							this.cargar =false;
							this.presentAlert('Error!', 'No se pudo encontrar el empleado asociado al usuario:' + con.username);
						})
          }
				}}).catch(() => {
				this.cargar =false;
				this.presentAlert('Error!', 'No se pudo encontrar el usuario:' + con.username);
			})
			.catch(() => {
				this.cargar = false;
				this.presentAlert('Error!', 'No se pudo encontrar el usuario:' + con.username);
			});
		})
	}
}
