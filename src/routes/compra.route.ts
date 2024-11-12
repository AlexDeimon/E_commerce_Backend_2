import { Router } from "express";
import CompraController from "../controllers/compra.controller";

const routerCompra = Router();

routerCompra.post('/agregar/:idCliente/:idCarrito', CompraController.agregarCompra);

routerCompra.get('/', CompraController.obtenerCompras);

routerCompra.get('/:id', CompraController.obtenerCompra);

routerCompra.get('/verComprasXFecha/:fecha', CompraController.obtenerComprasPorFecha);

routerCompra.get('/verComprasXCliente/:idCliente', CompraController.obtenerComprasPorCliente);

routerCompra.delete('/eliminar/:id', CompraController.eliminarCompra);

export default routerCompra;