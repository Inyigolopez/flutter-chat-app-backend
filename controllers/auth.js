const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async (req, res = response) => {

    const { email, password } = req.body;

    try {

        const existeEmail = await Usuario.findOne({ email });
        if( existeEmail ){
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        const usuario = new Usuario( req.body );
        
        //Encriptar contraseña.
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );
        
        await usuario.save();

        //generar mi JWT
        const token = await generarJWT( usuario.id );
    
        res.status(200).json({
            ok: true,
            usuario,
            token
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor. Hable con el administrador.'
        });
    }

}


const login = async (req, res = response) => {
    
    const { email, password } = req.body;

    try {
        
        const usuarioDB = await Usuario.findOne({ email }); 
        if(!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el usuario'
            });
        }

        //Validar password
        const validPassword = bcrypt.compareSync( password, usuarioDB.password);
        if( !validPassword ){
            return res.status(400).json({
                ok: false,
                msg: 'Las credenciales no son correctas.'
            });
        }

        //Generar JWT
        const token = await generarJWT( usuarioDB.id );

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor. Hable con el administrador.'
        })
    }



}


const renewToken = async (req, res = response) => {

    try {
        
        // uid del usuario
        const uid = req.uid;
    
        // Generación de un nuevo JWT
        const token = await generarJWT( uid );
    
        // Obtener el usuario por el UID, Usuario.findByID..
        const usuarioDB = await Usuario.findById({ _id: uid }); 
        if(!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el usuario'
            });
        }       
        
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor. Hable con el administrador.'
        });
    }


}

module.exports = {
    crearUsuario,
    login,
    renewToken
}