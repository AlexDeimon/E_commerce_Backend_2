import { Request, Response } from "express";
import { Cliente } from "../models/cliente.model";
import { Compra } from "../models/compra.model";
import { Carrito } from "../models/carrito.model";
import mongoose from "mongoose";

class ClienteController {
    static validarDatosCliente({ _id, nombre, apellidos, direccion, telefono, correo }: any) {
        if (!_id || _id.trim() === '' || !nombre || nombre.trim() === '' || !apellidos || apellidos.trim() === '' || !direccion || direccion.trim() === '' || !telefono || telefono.trim() === '' || !correo || correo.trim() === '') {
            return 'Todos los campos son requeridos';
        }
        if (!/^[0-9]+$/.test(_id)) {
            return 'El id solo puede contener caracteres numéricos';
        }
        if (_id.length > 12 || _id.length < 10) {
            return 'El id debe contener entre 10 y 12 caracteres numéricos';
        }
        if (!/^[a-zA-Z\s]+$/.test(nombre) || !/^[a-zA-Z\s]+$/.test(apellidos)) {
            return 'El nombre y apellidos solo pueden contener caracteres alfabéticos';
        }
        if (!/^[0-9]+$/.test(telefono)) {
            return 'El teléfono solo puede contener caracteres numéricos';
        }
        if (telefono.length > 12 || telefono.length < 8) {
            return 'El teléfono debe contener entre 8 y 12 caracteres numéricos';
        }
        if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-z]+$/.test(correo)) { 
            return 'El correo no tiene un formato válido';
        }
        return null;
    }
    static async agregarCliente(req: Request, res: Response) {
        try {
            const { _id, nombre, apellidos, direccion, telefono, correo} = req.body;
            const error = ClienteController.validarDatosCliente({ _id, nombre, apellidos, direccion, telefono, correo });
            if (error) {
                return res.status(400).json({ message: error });
            }
            if (_id && await Cliente.findById(_id.trim())) {
                return res.status(400).json({ message: 'El cliente ya existe.' });
            }
            if (correo && await Cliente.findOne({ correo })) {
                return res.status(400).json({ message: 'Ya existe un cliente con ese correo' });
            }
            const nuevoCliente = new Cliente({ _id, nombre, apellidos, direccion, telefono, correo, compras: [] });
            const newCliente = await nuevoCliente.save();
            res.status(201).json(newCliente);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async obtenerClientes(req: Request, res: Response) {
        try{
            const clientes = await Cliente.find();
            if(clientes.length === 0){
                return res.status(204).end();
            }
            res.status(200).json(clientes);
        } catch(error){
            res.status(500).json({menssage: error.message});
        }
    }

    static async obtenerCliente(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const clienteEncontrado = await Cliente.findById(id.trim());
            if (!clienteEncontrado) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            res.status(200).json(clienteEncontrado);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async actualizarCliente(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { nombre, apellidos, direccion, telefono, correo } = req.body;
            const error = ClienteController.validarDatosCliente({ _id: id, nombre, apellidos, direccion, telefono, correo });
            if (error) {
                return res.status(400).json({ message: error });
            }
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            Object.assign(cliente, {
                nombre: nombre || cliente.nombre,
                apellidos: apellidos || cliente.apellidos,
                direccion: direccion || cliente.direccion,
                telefono: telefono || cliente.telefono,
                correo: correo || cliente,
                compras: cliente.compras
            });
            const clienteActualizado = await cliente.save();
            res.status(200).json(clienteActualizado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async eliminarCliente(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { id } = req.params;
            const { borrarCompras } = req.query;
            const cliente = await Cliente.findByIdAndDelete(id);
            if (!cliente) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Cliente no encontrado' });
            } else if (borrarCompras) {
                await Compra.deleteMany({ _id: { $in: cliente.compras } }).session(session);
                await Carrito.deleteMany({ _id: { $in: cliente.compras.map(compra => compra.carrito) } }).session(session);
                await session.commitTransaction();
                res.status(200).json('se ha eliminado el cliente y sus compras registradas');
            } else {
                res.status(200).json('se ha eliminado el cliente');
            }
        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({ message: error.message });
        } finally {
            session.endSession();
        }
    }
}

export default ClienteController;