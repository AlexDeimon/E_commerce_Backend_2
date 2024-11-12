import mongoose, { Document, Schema } from 'mongoose';

interface ICarrito extends Document {
    _id:                string;
    idCliente:          string;
    cantidad_productos: number;
    productos:          Array<{ _id: string, producto:string, precio:  number, cantidadCarrito: number }>;
    precioTotal:        number;
}

const CarritoSchema: Schema = new Schema({
    _id:                { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    idCliente:          { type: String },
    cantidad_productos: { type: Number, required: true },
    productos:          [{ _id: {type: String, required:true}, producto: {type: String, required:true}, precio: {type: Number, required:true}, cantidadCarrito: {type: Number, required:true} }],
    precioTotal:        { type: Number, required: true }
}, { collection: 'carrito'});

export const Carrito = mongoose.model<ICarrito>('Carrito', CarritoSchema);