	var express = require("express");
	var app = express();
	var server = require("http").createServer(app);
	var io = require("socket.io")(server);
	var bodyParser = require("body-parser");
	var parseUrlencoded = bodyParser.urlencoded({extended: false});
	var mongoose = require("mongoose");
	var maxUsuarios =10;
	var numeroMaximoMensajes = 10; 
	app.use(express.static('public'));
	var port = process.env.PORT || 8080;
	
	//Peticion de login:
	app.post("/login", parseUrlencoded, function(request, response) {
		var datosUsuario = request.body;
		console.log(datosUsuario.nickname);
		if (datosUsuario.nickname == ''){
			
			response.json([false, 'Por favor, introduzca un nombre valido']);
		} else{
			Usuario.find().count(function(error, count){
				var contadorUsuarios = count;
				 
				 if (contadorUsuarios >= maxUsuarios){
					
					response.json([false, 'Limite de usuarios alcanzado']); 
				} else {
					Usuario.find({nickname: datosUsuario.nickname}, function (error,result){
						if (result.length ==1){
							response.json([false, 'El usuario ya existe']); 
						}
						else if (result.length ==0){

							var insertarUsuario = new Usuario({nickname: datosUsuario.nickname});
							insertarUsuario.save();
							//response.json(datosUsuario.nickname);
							response.json([true, 'Usuario añadido!']);
						
						}
					});
								
								
						
				} 
			});
				
		}
	});	

	//Desconectarse
	app.post("/desconexion", parseUrlencoded, function(request, response) {
		
		var usuarioDesconectar = request.body;
		console.log(usuarioDesconectar.nickname);
		Usuario.findOne({nickname: usuarioDesconectar.nickname}, function(error, result) {
					console.log(result);

			result.remove(function() {
				response.json([true,"Desconectado. Hasta pronto!"]);
			});
		});
	
	});
	
	
	//Mensajes
	app.post("/mensajes", parseUrlencoded, function(request, response) {
		
		var datosTabla = request.body;
		if (datosTabla.contenido == ''){
			response.json(false);
		}else{
			var insertarMensaje = new Mensaje({nickname: datosTabla.nickname, contenido : datosTabla.contenido, fecha : datosTabla.fecha});
			insertarMensaje.save();
			response.json(true);
		}
		
		
		
	});
	
	 //listaMEnsajes
	
app.post("/listaMensajes", parseUrlencoded, function(request, response) {
	console.log("aaaa");
	Mensaje.find( function(error,result){
		
		console.log(result);
		response.json(result);
		
		
	});
	
});	
	
	
	
//lista Usuarios
	
app.post("/listaUsuarios", parseUrlencoded, function(request, response) {

		Usuario.find(function(error,result) {
			response.json(result);
		});
});
	
//realizamos la conexion a la BBDD
	mongoose.connect("mongodb://usuarioweb:dsmchat@ds133340.mlab.com:33340/chat", function(error_basedatos) {

		if(!error_basedatos) {

			console.log("conexión a la base de datos establecida");

		}

		else {

			throw error_basedatos;

		}

	});

//sockets
io.on("connection", function (client) {

	client.on("nuevoUsuario",function(user){
		
		client.broadcast.emit("nuevoUsuario",user);
	});

	client.on("borrarUsuario",function(user){
		console.log('jojo');
		console.log(user.usuario_logueado);
		client.broadcast.emit("borrarUsuario",user.usuario_logueado);
	});
	
	client.on('agregarMensaje',function(mensaje){
		client.broadcast.emit('agregarMensaje',mensaje);
	});
	
	client.on('escribiendo',function(user){
		client.broadcast.emit('escribiendo',user);
	});
	
	client.on('noescribiendo',function(user){
		client.broadcast.emit('noescribiendo',user);
	});
});


//definimos el schema y creamos modelo para acceder a datos
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;
	var Usuario = new Schema(
		{
			nickname: String
		});
	var Usuario = mongoose.model("Username", Usuario); 
	
	var Mensaje = new Schema(
		{
			nickname: String,
			contenido: String,
			fecha: String
			
		});
	var Mensaje = mongoose.model("Mensajes", Mensaje); 


	app.listen(port);
	//server.listen(8080);