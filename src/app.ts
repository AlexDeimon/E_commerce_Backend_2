import express from 'express';
import { config } from 'dotenv';
import { connect, connection } from 'mongoose';
import routerCategoria from './routes/categoria.route';
import routerProduct from './routes/producto.route';
import routerCarrito from './routes/carrito.route';
import routerCliente from './routes/cliente.route';
import routerCompra from './routes/compra.route';
import cors from 'cors';

config()
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB_NAME;

const app = express();
app.use(express.json());
app.use(cors());

connect(mongoUrl, { dbName });
const db = connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use('/categorias', routerCategoria);
app.use('/productos', routerProduct);
app.use('/carritos', routerCarrito);
app.use('/clientes', routerCliente);
app.use('/compras', routerCompra);

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`)
})
