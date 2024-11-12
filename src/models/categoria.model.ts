import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoria extends Document {
    _id:       string;
    nombre:    string;
    productos: Array<{ _id: string, producto: string}>;
}

const CategoriaSchema: Schema = new Schema({
    _id:       { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    nombre:    { type: String, required: true },
    productos: [ { _id: { type: String, required: true }, producto: { type: String, required: true} } ],
}, { collection: 'categoria' });

export const Categoria = mongoose.model<ICategoria>('Categoria', CategoriaSchema);