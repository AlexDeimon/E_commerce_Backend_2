import { Request, Response } from "express";
import { Producto } from "../models/producto.model";
import { Categoria } from "../models/categoria.model";
import mongoose from "mongoose";

class ProductoController {
    static async agregarProducto(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { producto, descripcion, precio, stock, categoria} = req.body;
            if(!producto || producto.trim().length ===0 || !descripcion || descripcion.trim().length ===0 || !categoria || categoria.trim().length ===0){
                await session.abortTransaction();
                return res.status(400).json({ message: 'Todos los campos son requeridos' });
            }
            const productoEncontrado = await Producto.findOne({ producto: new RegExp(`^${producto.trim()}$`, 'i') });
            if (productoEncontrado) {
                await session.abortTransaction();
                return res.status(400).json({ message: `El producto ${producto} ya existe` });
            }
            if (precio <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ message:'El precio debe ser un número mayor a 0' });
            }
            if (stock <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ message:'La cantidad disponible debe ser un número mayor a 0' });
            }
            const id = Math.floor(1000 + Math.random() * 9000).toString();
            const categoriaEncontrada = await Categoria.findOne({ nombre: new RegExp(`^${categoria.trim()}$`, 'i') });
            if (!categoriaEncontrada) {
                await session.abortTransaction();
                return res.status(404).json({ message: `La categoria ${categoria} no existe` });
            } else {
                categoriaEncontrada.productos.push({ _id: id, producto });
                await categoriaEncontrada.save({ session });
            }
            const nuevoProducto = new Producto({ _id: id, producto, descripcion, precio, stock, categoria: categoriaEncontrada.nombre });
            const newProducto = await nuevoProducto.save({ session });
            await session.commitTransaction();
            res.status(201).json(newProducto);
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message }); 
        } finally {
            session.endSession();
        }
    }

    static async obtenerProductos(req: Request, res: Response) {
        try{
            const productos = await Producto.find();
            if(productos.length === 0){
                return res.status(204).end();
            } else {
                res.status(200).json(productos);
            }
        } catch(error){
            res.status(500).json({menssage: error.message});
        }
    }

    static async obtenerProducto(req: Request, res: Response) {
        try {
            const { producto } = req.params;
            const productoEncontrado = await Producto.findOne({ producto: new RegExp(`^${producto.trim()}$`, 'i') }); 
            if (!productoEncontrado) {
                return res.status(404).json({ message: `El producto ${producto} no existe` });
            } else {
                res.status(200).json(productoEncontrado);
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async actualizarProducto(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { _id } = req.params;
            const { producto, descripcion, precio, stock, categoria } = req.body;
            if(!producto || producto.trim().length ===0 || !descripcion || descripcion.trim().length ===0 || !categoria || categoria.trim().length ===0){
                await session.abortTransaction();
                return res.status(400).json({ message: 'Faltan campos por completar' });
            }
            const productoEncontrado = await Producto.findById(_id);
            if (!productoEncontrado) {
                await session.abortTransaction();
                return res.status(404).json({ message: `El producto no existe` });
            }
            if (precio <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ message:'El precio debe ser un número mayor a 0' });
            }
            if (stock < 0) {
                await session.abortTransaction();
                return res.status(400).json({ message:'La cantidad disponible no puede ser menor a 0' });
            }
            const categoriaEncontrada = await Categoria.findOne({ nombre: new RegExp(`^${categoria.trim()}$`, 'i') });
            if(categoriaEncontrada.nombre !== productoEncontrado.categoria){
                categoriaEncontrada.productos.push({ _id: productoEncontrado._id, producto });
                const categoriaAnterior = await Categoria.findOne({ nombre: productoEncontrado.categoria });
                categoriaAnterior.productos = categoriaAnterior.productos.filter(producto => producto._id !== productoEncontrado._id);
                await categoriaAnterior.save({ session });
                await categoriaEncontrada.save({ session });
            }
            Object.assign(productoEncontrado, {
                producto: producto,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                categoria: categoriaEncontrada.nombre
            });
            const productoActualizado = await productoEncontrado.save({ session });
            await session.commitTransaction();
            res.status(200).json(productoActualizado);
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        } finally {
            session.endSession();
        }
    }

    static async eliminarProducto(req: Request, res: Response) {
        try {
            const { producto } = req.params;
            const categoriaEncontrada = await Categoria.findOne({ productos: { $elemMatch: { producto: new RegExp(`^${producto}$`, 'i') } } });
            const productoEncontrado = await Producto.findOneAndDelete({ producto: new RegExp(`^${producto}$`, 'i') });
            if (!productoEncontrado) {
                return res.status(404).json({ message: `El producto ${producto} no existe` });
            } else if (categoriaEncontrada) {
                categoriaEncontrada.productos = categoriaEncontrada.productos.filter(producto => producto._id !== productoEncontrado._id);
                await categoriaEncontrada.save();
            }
            res.status(200).json({ message: `Se ha eliminado el producto ${producto}`});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default ProductoController;