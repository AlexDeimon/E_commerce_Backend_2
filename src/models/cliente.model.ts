import mongoose, { Document, Schema } from 'mongoose';

interface ICliente extends Document{
    _id:       string;
    nombre:    string;
    apellidos: string;
    direccion: string;
    telefono:  string;
    correo:    string;
    compras:  Array<{ _id: string, carrito: { _id: string, cantidad_productos: number, precioTotal: number }, fecha: Date }>;
}

const ClienteSchema: Schema = new Schema({
    _id:       { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    nombre:    { type: String, required: true },
    apellidos: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono:  { type: String, required: true },
    correo:    { type: String, required: true },
    compras:   [{ _id: {type: String, required: true}, carrito: { _id: {type: String, required: true}, cantidad_productos: {type: Number, required: true}, precioTotal: {type: Number, required: true} }, fecha: {type: Date, required: true} }]
}, { collection: 'cliente'})

export const Cliente = mongoose.model<ICliente>('Cliente',ClienteSchema);