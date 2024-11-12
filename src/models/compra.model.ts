import mongoose, { Document, Schema } from 'mongoose';

interface ICompra extends Document{
    _id:        string;
    idCliente:  string;
    carrito:    { _id: string, cantidad_productos: number, precioTotal: number };
    fecha:      Date;
}

const CompraSchema:Schema = new Schema({
    _id:        { type: String, default: () => new mongoose.Types.ObjectId().toString()},
    idCliente:  { type: String, required: true },
    carrito:    { _id: {type: String, required: true}, cantidad_productos: {type: Number, required: true}, precioTotal: {type: Number, required: true} },
    fecha:      { type: Date, requred: true}
}, {collection: 'compra'})

export const Compra = mongoose.model<ICompra>('Compra', CompraSchema);