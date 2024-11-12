import { Router } from "express";
import ProductoController from "../controllers/producto.controller";

const routerProduct = Router()

routerProduct.post('/agregar', ProductoController.agregarProducto);

routerProduct.get('', ProductoController.obtenerProductos);

routerProduct.get('/:producto', ProductoController.obtenerProducto);

routerProduct.put('/actualizar/:_id', ProductoController.actualizarProducto);

routerProduct.delete('/eliminar/:producto', ProductoController.eliminarProducto);

export default routerProduct;