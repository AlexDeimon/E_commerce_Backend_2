import { Router } from "express";
import CarritoController from "../controllers/carrito.controller";

const routerCarrito = Router();

routerCarrito.post('/crear', CarritoController.crearCarrito);

routerCarrito.put('/agregarProducto/:id/:producto/:cantidad', CarritoController.agregarProductoCarrito);

routerCarrito.put('/borrarProducto/:id/:producto', CarritoController.borrarProductoCarrito);

routerCarrito.get('/:id', CarritoController.obtenerCarrito);

routerCarrito.get('/', CarritoController.obtenerCarritos);

routerCarrito.get('/cliente/:idCliente', CarritoController.obtenerCarritosXCliente);

routerCarrito.delete('/eliminar/:id', CarritoController.eliminarCarrito);

export default routerCarrito;