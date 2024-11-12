import { Request, Response } from "express";
import { Compra } from "../models/compra.model";
import { Cliente } from "../models/cliente.model";
import { Carrito } from "../models/carrito.model";

class CompraController {
    static async agregarCompra(req: Request, res: Response) {
        try {
            const { idCliente, idCarrito } = req.params;
            const cliente = await Cliente.findById(idCliente);
            if (!cliente) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            const carrito = await Carrito.findById(idCarrito);
            if (!carrito) {
                return res.status(404).json({ message: 'Carrito no encontrado' });
            }
            if(carrito.productos.length === 0){
                return res.status(400).json({ message: 'El carrito está vacío' });
            }
            if (carrito.idCliente !='') {
                return res.status(400).json({ message: 'El carrito ya fue comprado' });
            }
            const id = Math.floor(1000 + Math.random() * 9000).toString();
            const fecha = new Date().toISOString().split('T')[0];
            const compra = new Compra({ _id: id, idCliente, carrito: { _id: carrito._id, cantidad_productos: carrito.cantidad_productos, precioTotal: carrito.precioTotal }, fecha });
            await compra.save();
            cliente.compras.push(compra);
            cliente.save();
            carrito.idCliente = idCliente;
            carrito.save();
            res.status(201).json(compra);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerCompras(req: Request, res: Response) {
        try {
            const compras = await Compra.find();
            if (compras.length === 0) {
                return res.status(204).end();
            }
            res.status(200).json(compras);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerCompra(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const compraEncontrada = await Compra.findById(id);
            if (!compraEncontrada) {
                return res.status(404).json({ message: 'Compra no encontrada' });
            }
            res.status(200).json(compraEncontrada);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerComprasPorFecha(req: Request, res: Response) {
        try {
            const { fecha } = req.params;
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            if (!regex.test(fecha)) {
                return res.status(400).json({ message: 'Formato de fecha inválido. Debe ser yyyy-MM-dd' });
            }
            const compras = await Compra.find({ fecha });
            if (compras.length === 0) {
                return res.status(404).json({ message: `No hay compras registradas en la fecha ${fecha}` });
            }
            res.status(200).json(compras);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    static async obtenerComprasPorCliente(req: Request, res: Response) {
        try {
            const { idCliente } = req.params;
            const clienteEncontrado = await Cliente.findById(idCliente);
            if (!clienteEncontrado) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            const compras = await Compra.find({ idCliente });
            if (compras.length === 0) {
                return res.status(404).json({ message: `No hay compras registradas del cliente ${idCliente}` });
            }
            res.status(200).json(compras);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async eliminarCompra(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const compra = await Compra.findByIdAndDelete(id);
            const carritoEncontrado = await Carrito.findOneAndDelete({_id: compra.carrito._id});
            const clienteEncontrado = await Cliente.findById(compra.idCliente);
            if (!compra) {
                return res.status(404).json({ message: 'Compra no encontrada' });
            } else if (!carritoEncontrado) {
                return res.status(404).json({ message: 'Carrito no encontrado' });
            } else {
                clienteEncontrado.compras = clienteEncontrado.compras.filter((compra) => compra.carrito._id !== compra.carrito._id);
                clienteEncontrado.save();
                res.status(200).json({message: 'Compra y carrito eliminados'});
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default CompraController;