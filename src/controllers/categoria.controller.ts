import { Request, Response } from "express";
import { Categoria } from "../models/categoria.model";
import { Producto } from "../models/producto.model";
import mongoose from "mongoose";

class CategoriaController {
    static async crearCategoria(req: Request, res: Response) {
        try {
            const { nombre } = req.body;
            if(!nombre || nombre.trim().length === 0){
                return res.status(400).json({ message: 'El nombre de la categoria es requerido' });
            }
            const categoriaEncontrada = await Categoria.findOne({ nombre: new RegExp(`^${nombre.trim()}$`, 'i') });
            if (categoriaEncontrada) {
                return res.status(400).json({ message: `La categoria ${nombre} ya existe` });
            } else {
                const id = Math.floor(1000 + Math.random() * 9000).toString();
                const nuevaCategoria = new Categoria({ _id:id, nombre, productos:[] });
                const newCategoria = await nuevaCategoria.save();
                res.status(201).json(newCategoria); 
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerProductosPorCategoria(req: Request, res: Response) {
        try {
            const { categoria } = req.params;
            const categoriaEncontrada = await Categoria.findOne({ nombre: new RegExp(`^${categoria.trim()}$`, 'i') });
            if (!categoriaEncontrada) {
                return res.status(404).json({ message: `La categoria ${categoria} no existe` });
            } else {
                const productosCategoria = await Producto.find({ categoria: categoriaEncontrada.nombre });
                if (productosCategoria.length === 0) {
                    return res.status(204).end();
                }
                res.status(200).json(productosCategoria);
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerCategorias(req: Request, res: Response) {
        try{
            const categorias = await Categoria.find();
            if(categorias.length === 0){
                return res.status(204).end();
            } else {
                res.status(200).json(categorias);
            }
        } catch(error){
            res.status(500).json({menssage: error.message});
        }
    }

    static async eliminarCategoria(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { categoria } = req.params;
            const { borrarProductos } = req.query;
            const categoriaEliminada = await Categoria.findOneAndDelete({ nombre: new RegExp(`^${categoria.trim()}$`, 'i') });
            if (!categoriaEliminada) {
                await session.abortTransaction();
                return res.status(404).json({ message: `La categoria ${categoria} no existe` });
            } else if (borrarProductos) {
                await Producto.deleteMany({ categoria: categoriaEliminada.nombre });
                await session.commitTransaction();
                res.status(200).json({ message: `La categoria ${categoria} y sus productos han sido eliminados` });  
            } else {
                res.status(200).json({ message: `La categoria ${categoria} ha sido eliminada` });
            }
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        } finally {
            session.endSession();
        }
    }
}

export default CategoriaController;