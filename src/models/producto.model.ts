import mongoose, { Document, Schema } from 'mongoose';

export interface IProducto extends Document {
    _id:             string;
    producto:        string;
    descripcion:     string;
    precio:          number;
    stock:           number;
    categoria:       string;
}

const ProductoSchema: Schema = new Schema({
    _id:             {type: String, default: () => new mongoose.Types.ObjectId().toString()},
    producto:        {type: String, required:true},
    descripcion:     {type: String, required:true},   
    precio:          {type: Number, required:true},     
    stock:           {type: Number, required:true},     
    categoria:       {type: String, required:true}
}, { collection: 'producto'});

export const Producto = mongoose.model<IProducto>('Producto', ProductoSchema);