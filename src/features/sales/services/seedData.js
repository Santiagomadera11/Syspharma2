import { salesService } from "./salesService";
import { expensesService } from "./expensesService";

export const seedSalesData = () => {
  // Crear algunas ventas de hoy para prueba
  const today = new Date().toLocaleDateString("es-CO");
  const existingSales = salesService.getTodaySales();

  if (existingSales.length === 0) {
    // Agregar 5 ventas de ejemplo
    const sampleSales = [
      {
        cliente: "Juan Pérez",
        productos: [
          { nombre: "Amoxicilina 500mg", cantidad: 2, precio: 8500 },
          { nombre: "Paracetamol 500mg", cantidad: 1, precio: 5000 },
        ],
        metodoPago: "Efectivo",
        total: 22000,
        estado: "completada",
        notas: "Venta normal",
      },
      {
        cliente: "María García",
        productos: [{ nombre: "Ibuprofeno 400mg", cantidad: 3, precio: 6500 }],
        metodoPago: "Tarjeta débito",
        total: 19500,
        estado: "completada",
        notas: "",
      },
      {
        cliente: "Carlos López",
        productos: [
          { nombre: "Vitamina C 1000mg", cantidad: 1, precio: 15000 },
          { nombre: "Jarabe para la tos", cantidad: 1, precio: 12000 },
        ],
        metodoPago: "Efectivo",
        total: 27000,
        estado: "completada",
        notas: "Cliente frecuente",
      },
      {
        cliente: "Ana Martínez",
        productos: [{ nombre: "Antibiótico XYZ", cantidad: 1, precio: 35000 }],
        metodoPago: "Transferencia",
        total: 35000,
        estado: "completada",
        notas: "",
      },
      {
        cliente: "Pedro Rodríguez",
        productos: [
          { nombre: "Pastillas para alergia", cantidad: 2, precio: 9000 },
          { nombre: "Crema dermatológica", cantidad: 1, precio: 18000 },
        ],
        metodoPago: "Tarjeta crédito",
        total: 36000,
        estado: "completada",
        notas: "",
      },
    ];

    sampleSales.forEach((sale) => {
      salesService.create(sale);
    });
  }

  // Agregar algunos gastos de ejemplo
  const existingExpenses = expensesService.getTodayExpenses();
  if (existingExpenses.length === 0) {
    const sampleExpenses = [
      {
        descripcion: "Alquiler de local",
        monto: 500000,
        categoria: "Transporte",
      },
      {
        descripcion: "Suministros de limpieza",
        monto: 50000,
        categoria: "Mantenimiento",
      },
      {
        descripcion: "Café para el personal",
        monto: 30000,
        categoria: "Comida",
      },
    ];

    sampleExpenses.forEach((expense) => {
      expensesService.create(expense);
    });
  }
};
