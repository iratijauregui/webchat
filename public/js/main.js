	var socket = io.connect ();
	var estoyLogueado=false;
	var espacio_blanco = /\s/;
	$(document).ready(function(){

	window.onbeforeunload=function(e){

		cerrarVentana();
		return "ieee";
	}
		//Conexion nuevo usuario
		
		$("#logUsuario").submit(function (event) { //cuando se pulsa el boton Entrar
			
			
			var nombreUsuario = $("#nombreUsuario").val(); //cogemos valor del campoo
			event.preventDefault();
		
			nombreTabla = ({nickname: nombreUsuario});  //campo a introducir en la tabla
		
			if(espacio_blanco.test(nombreUsuario)){
				
			}else{
			
				$.ajax({type: "POST", url: "/login", data: nombreTabla}).done(function(datosConexion) {
					
					if (datosConexion[0]){
						estoyLogueado=true;
						usuario_logueado=nombreUsuario;
						numeroUsuario=0;
						$('#holaUsuario').text('Hola, '+usuario_logueado + '!');
						
						//Cargar usuarios conectados
						$.ajax({type: "POST", url: "/listaUsuarios", data: nombreTabla}).done(function (listaUsuarios) {
						for (j = 0; j < listaUsuarios.length; j++) {
	/* 						
	 */						$('.usuariosConectados').append('<span class='+listaUsuarios[j].nickname+'>' + listaUsuarios[j].nickname + '</span><span>, </span>');
						}
						});
						$("#nombreUsuario").val('');
						socket.emit("nuevoUsuario", {nuevoUsuario: nombreUsuario});
						
						//Cargar los mensajes antiguos
						$.ajax({type: "POST", url: "/listaMensajes", data: usuario_logueado}).done(function (listaMensajes) {
							console.log("Lista mensajes");
							console.log(listaMensajes);
							var numeroMaximoMensajes = 10; 
							var cont = 1; 
																					
							if (listaMensajes.length > numeroMaximoMensajes){

								for (i = 0; i < numeroMaximoMensajes; i++) {
									$('#listaMensajes').append('<li class="emoticonizar">' + listaMensajes[listaMensajes.length-1-numeroMaximoMensajes+cont].fecha +'>' + listaMensajes[listaMensajes.length-1-numeroMaximoMensajes+cont].nickname + ' dice: ' + listaMensajes[listaMensajes.length-1-numeroMaximoMensajes+cont].contenido + '</li>');
									$('.emoticonizar').emoticonize();
									cont++;
								}
							}
							else {

								for (i = listaMensajes.length  ; i > 0 ; i--) {

									$('#listaMensajes').append('<li class="emoticonizar">' + listaMensajes[listaMensajes.length-i].fecha +'>' + listaMensajes[listaMensajes.length-i].nickname + ' dice: ' + listaMensajes[listaMensajes.length-i].contenido + '</li>');
									$('.emoticonizar').emoticonize();
								
								}	
							
							}
						});
						
						
						$('#contenedorLogin').fadeOut();
						
						//$('#logUsuarios').fadeIn();
						$('#desconexion').fadeIn();
						//$('#logUsuarios').css('display','inline');					
						$('#holaUsuario').fadeIn();
						$('#desconectarBoton').show();
						$('.chat').fadeIn();
						$('.chat').css('display',' -webkit-box');
						$('.chat').css('display',' -webkit-flex');
						$('.chat').css('display',' -ms-flexbox');
						$('#listaMensajes').fadeIn();
						

					}else{
						alert('Por favor, introduzca nombre valido');
					}
				});
			}
			
	
		});
		
		//Desconexion
		
		$("#desconectarBoton").on("click", function () {
			event.preventDefault();
			alert('adios, '+usuario_logueado);
			 estoyLogueado=false;
			nombreTabla = ({nickname: usuario_logueado});
			$.ajax({type: "POST", url: "/desconexion", data: nombreTabla}).done(function(datosBorrado) {
				if (datosBorrado[0]){ 
					socket.emit("borrarUsuario", {usuario_logueado});
					$('.usuariosConectados').empty();
					$('#listaMensajes').empty();
					$('.chat').fadeOut();
					$('#holaUsuario').fadeOut();
					$('#desconectarBoton').hide();
					$('#contenedorLogin').fadeIn();
				}
					
			});
			
		});
		
		// Mensajes
		$("#mensajes").submit(function (event) {
			event.preventDefault();
			var hora = Date();
			var espacio_blancoMensaje = /^\s/;
			var horaSplit = hora.split(' ')[4];
		
			mandarMensaje = ({ nickname: usuario_logueado, contenido: $('#escribe').val(), fecha: horaSplit});
			
			var validar = mandarMensaje.contenido;
			
			if(espacio_blancoMensaje.test(validar)){
				
			}else{
				$.ajax({type: 'POST', url: '/mensajes', data: mandarMensaje}).done(function(datosMensaje){
					if (datosMensaje){
						$('#listaMensajes').append('<li class="emoticonizar">' + mandarMensaje.fecha +'><b><font color="blue">' + mandarMensaje.nickname + ' dice:</b> ' + mandarMensaje.contenido + '</font></li>');
						$('.emoticonizar').emoticonize();

						$("#escribe").val('');
						socket.emit('agregarMensaje',  mandarMensaje);
						
					}
					
					
				})
			};
		});
		
		//Escribiendo
		$("#escribe").on('input',function(e){
			socket.emit('escribiendo',usuario_logueado);
		});
		
		//No escribiendo
		$("#escribe").on('focusout',function(e){
			socket.emit('noescribiendo',usuario_logueado);

		});
		//sockets
		
		
		socket.on("nuevoUsuario",function(user){
			
		if (estoyLogueado){
			$('.usuariosConectados').append('<span class='+user.nuevoUsuario+'>' + user.nuevoUsuario + '</span><span>, </span>');
			$('#listaMensajes').append('<li>' +user.nuevoUsuario+ ' se unió al chat.</li>');
		}
			
		});
		
		socket.on("borrarUsuario",function(user){
			var indiceBorrado;
			
			var listaUsuarios = $(".usuariosConectados span");
			for( i = 0; i<=listaUsuarios.length-1; i++){
				  if (listaUsuarios.eq(i).text() == user) {

					  indiceBorrado = i;
					  break;
				  }
				  
			}
								  					
			
			listaUsuarios.eq(indiceBorrado).remove();
			listaUsuarios.eq(indiceBorrado+1).remove();

			$('#listaMensajes').append('<li>' +user+ ' abandonó el chat.</li>');
			
		});
		
		socket.on('agregarMensaje',function(mensaje){
			if (estoyLogueado){
			$('#listaMensajes').append('<li class="emoticonizar">' + mensaje.fecha +'><b>' + mensaje.nickname + ' dice:</b> ' + mensaje.contenido + '</font></li>');
					$('.emoticonizar').emoticonize();
			}
			
		});
		

		
		socket.on('escribiendo',function(user){
			if ($('.lista-usuarios').children().length == 0){
				$('#escribiendo-mensaje').hide();
			} else{
				$('#escribiendo-mensaje').show();
			}
			
			if ($('.lista-usuarios span:contains("'+user+'")').length ==0){
				$('.lista-usuarios').append('<span>'+user+'</span>');
					
			}
		
		});
		
		
		socket.on('noescribiendo',function(user){
			$('.lista-usuarios span:contains("'+user+'")').remove();
			if ($('.lista-usuarios').children().length == 0){
				$('#escribiendo-mensaje').hide();
			} else{
				$('#escribiendo-mensaje').show();
			}
/* 			var listaUsuarios = $(".usuariosEscribiendo span");
			for( i = 0; i<=listaUsuarios.length-1; i++){
				  if (listaUsuarios.eq(i).text() == (user + ' escribiendo...')) {
					listaUsuarios.eq(i).text(user);
					 
					  break;
				  }
				  
			} */
		});
				
		function cerrarVentana(){
			//si usuario logueado true hacer una cosa si no, otra
			
			if(estoyLogueado){
				estoyLogueado=false;
				nombreTabla = ({nickname: usuario_logueado});
				$.ajax({type: "POST", url: "/desconexion", data: nombreTabla}).done(function(datosBorrado) {
					if (datosBorrado[0]){ 
						socket.emit("borrarUsuario", {usuario_logueado});

					}
						
				});
			}
		}
		
		
		
		
		
	});