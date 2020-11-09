const { io } = require('../index');
const { comprobarJWT } = require('../helpers/jwt');
const { usuarioConectado, usuarioDesconectado, grabarMensaje } = require('../controllers/socket');

// Mensajes de Sockets
io.on('connection', ( client ) => {
    console.log('Cliente Conectado');

    //?? CLiente con JWT
    const [valido, uid ] = comprobarJWT(client.handshake.headers['x-token']);

    //Verificar autenticación
    if( !valido ){
        return client.disconnect();
    }

    //Cliente autenticado
    usuarioConectado(uid);

    // Ingresar al usuario a una sala particular
    //Sala global, client.id, 5fa599cbe7ace11f6e637ed8
    client.join( uid );

    //Escuchar del cliente el mensaje-personal
    client.on('mensaje-personal', async ( payload ) => {
        // Grabar mensaje
        await grabarMensaje( payload );

        io.to( payload.para ).emit('mensaje-personal', payload);
    })

    client.on('disconnect', () => {
        usuarioDesconectado(uid);
    });



});