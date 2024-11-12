import { Request, Response } from "express";
import { Carrito } from "../models/carrito.model";
import { Producto } from "../models/producto.model";
import { Compra } from "../models/compra.model";
import { Cliente } from "../models/cliente.model";
import mongoose from "mongoose";

class CarritoController {
    static async crearCarrito(req: Request, res: Response) {
        try {
            const id = Math.floor(1000 + Math.random() * 9000).toString();
            const nuevoCarrito = new Carrito({ _id:id, idCliente: '', cantidad_productos:0, productos:[], precioTotal:0 });
            const newCarrito = await nuevoCarrito.save();
            res.status(201).json(newCarrito);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async agregarProductoCarrito(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { id, producto, cantidad } = req.params;
            const carrito = await Carrito.findById(id.trim());
            if (!carrito) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'El carrito no existe' });
            }
            const compraEncontrada = await Compra.findOne({'carrito._id': id.trim()}).session(session);
            if (compraEncontrada) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Este carrito ya ha terminado el proceso de compra' });
            } else {
                const productoEncontrado = await Producto.findOne({ producto: new RegExp(`^${producto.trim()}$`, 'i') });
                if (!productoEncontrado) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: `El producto ${producto} no existe` });
                }
                if (Number(cantidad) <= 0) {
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'La cantidad del producto debe ser mayor a 0' });
                }
                if (productoEncontrado.stock < Number(cantidad)) {
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'No hay Stock suficiente del producto que deseas comprar' });
                }
                const productoCarrito = carrito.productos.find((prod) => prod._id === productoEncontrado._id);
                if (productoCarrito) {
                    productoCarrito.cantidadCarrito += Number(cantidad);
                } else {
                    carrito.productos.push({ 
                        _id: productoEncontrado._id, 
                        producto: productoEncontrado.producto, 
                        precio: productoEncontrado.precio, 
                        cantidadCarrito: Number(cantidad) 
                    });
                }
                productoEncontrado.stock -= Number(cantidad);
                carrito.cantidad_productos += Number(cantidad);
                carrito.precioTotal += productoEncontrado.precio * Number(cantidad);
                await productoEncontrado.save({ session });
                await carrito.save({ session });
                await session.commitTransaction();
                res.status(200).json(carrito);
            }
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        } finally {
            session.endSession();
        }
    }

    static async borrarProductoCarrito(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { id, producto } = req.params;
            const carrito = await Carrito.findById(id.trim()).session(session);
            if (!carrito) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'El carrito no existe' });
            }
            const compraEncontrada = await Compra.findOne({'carrito._id': id.trim()}).session(session);
            if (compraEncontrada) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Este carrito ya ha terminado el proceso de compra' });
            } else {
                const productoEncontrado = await Producto.findOne({ producto: new RegExp(`^${producto.trim()}$`, 'i') });
                if (!productoEncontrado) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: `El producto ${producto} no existe` });
                }
                const productoCarrito = carrito.productos.find((prod) => prod._id === productoEncontrado._id);
                if (!productoCarrito) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: `El producto ${producto} no está en el carrito` });
                }
                carrito.cantidad_productos -= productoCarrito.cantidadCarrito;
                carrito.precioTotal -= productoCarrito.precio * productoCarrito.cantidadCarrito;
                carrito.productos = carrito.productos.filter((prod) => prod._id !== productoEncontrado._id);
                productoEncontrado.stock += productoCarrito.cantidadCarrito;
                await productoEncontrado.save({ session });
                await carrito.save({ session });
                await session.commitTransaction();
                res.status(200).json(carrito);
            }
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        } finally {
            session.endSession();
        }
    }

    static async obtenerCarrito(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const carrito = await Carrito.findById(id.trim());
            if (!carrito) {
                return res.status(404).json({ message: 'El carrito no existe' });
            }
            res.status(200).json(carrito);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async obtenerCarritos(req: Request, res: Response) {
        try {
            const carritos = await Carrito.find();
            if (carritos.length === 0) {
                return res.status(204).end();
            }
            res.status(200).json(carritos);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async obtenerCarritosXCliente(req: Request, res: Response) {
        try {
            const { idCliente } = req.params;
            const cliente = await Cliente.findById(idCliente.trim());
            if (!cliente) {
                return res.status(404).json({ message: 'El cliente no existe' });
            }
            const carritos = await Carrito.find({ idCliente: idCliente.trim() });
            if (carritos.length === 0) {
                return res.status(204).end();
            }
            res.status(200).json(carritos);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async eliminarCarrito(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const compraEncontrada = await Compra.findOneAndDelete({'carrito._id': id.trim()});
            const carritoEncontrado = await Carrito.findOneAndDelete({_id:id.trim()});
            const clienteEncontrado = await Cliente.findOne({'compras.carrito._id': id.trim()});
            if (!carritoEncontrado) {
                return res.status(404).json({ message: 'El carrito no existe' });
            } else if (compraEncontrada && clienteEncontrado) {
                clienteEncontrado.compras = clienteEncontrado.compras.filter((compra) => compra.carrito._id !== id.trim());
                clienteEncontrado.save();
                res.status(200).json({ message: 'El Carrito y su compra han sido eliminados' });
            } else {
                res.status(200).json({ message: 'Carrito eliminado' });
            }
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

export default CarritoController;