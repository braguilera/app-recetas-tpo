const recetas = [
  {
    idReceta: 1,
    titulo: "Hamburguesa Clásica",
    descripcion: "Una deliciosa hamburguesa con carne, queso, lechuga y tomate.",
    tipoReceta: "Hamburguesa",
    fechaCreacion: "2024-01-20",
    usuario: {
      alias: "JuanPerez",
    },
    calificaciones: [
      {
        puntuacion: 4,
      },
      {
        puntuacion: 5,
      },
    ],
    ingredientes: [
      {
        idIngredienteReceta: 1,
        nombre: "Pan de hamburguesa",
        cantidad: 2,
        unidadMedida: "unidades",
      },
      {
        idIngredienteReceta: 2,
        nombre: "Carne molida",
        cantidad: 200,
        unidadMedida: "gramos",
      },
      {
        idIngredienteReceta: 3,
        nombre: "Queso cheddar",
        cantidad: 50,
        unidadMedida: "gramos",
      },
    ],
    pasos: [
      {
        orden: 1,
        descripcionPaso: "Cocinar la carne a la parrilla.",
      },
      {
        orden: 2,
        descripcionPaso: "Colocar el queso sobre la carne.",
      },
      {
        orden: 3,
        descripcionPaso: "Armar la hamburguesa con lechuga y tomate.",
      },
    ],
    comentarios: [
      {
        idComentario: 1,
        usuario: {
          alias: "MariaLopez",
        },
        fechaComentario: "2024-01-21",
        contenido: "¡Muy rica!",
      },
    ],
  },
  {
    idReceta: 2,
    titulo: "Ensalada César",
    descripcion: "Una refrescante ensalada con lechuga romana, crutones y aderezo César.",
    tipoReceta: "Ensalada",
    fechaCreacion: "2024-02-15",
    usuario: {
      alias: "SofiaGomez",
    },
    calificaciones: [
      {
        puntuacion: 5,
      },
    ],
    ingredientes: [
      {
        idIngredienteReceta: 4,
        nombre: "Lechuga romana",
        cantidad: 1,
        unidadMedida: "unidad",
      },
      {
        idIngredienteReceta: 5,
        nombre: "Crutones",
        cantidad: 50,
        unidadMedida: "gramos",
      },
      {
        idIngredienteReceta: 6,
        nombre: "Aderezo César",
        cantidad: 30,
        unidadMedida: "ml",
      },
    ],
    pasos: [
      {
        orden: 1,
        descripcionPaso: "Lavar y cortar la lechuga.",
      },
      {
        orden: 2,
        descripcionPaso: "Mezclar la lechuga con los crutones.",
      },
      {
        orden: 3,
        descripcionPaso: "Agregar el aderezo César.",
      },
    ],
    comentarios: [
      {
        idComentario: 2,
        usuario: {
          alias: "CarlosRuiz",
        },
        fechaComentario: "2024-02-16",
        contenido: "¡Perfecta para el verano!",
      },
    ],
  },
  {
    idReceta: 3,
    titulo: "Pizza Margarita",
    descripcion: "Una pizza clásica con tomate, mozzarella y albahaca.",
    tipoReceta: "Pizza",
    fechaCreacion: "2024-03-01",
    usuario: {
      alias: "LauraFernandez",
    },
    calificaciones: [
      {
        puntuacion: 4,
      },
      {
        puntuacion: 3,
      },
    ],
    ingredientes: [
      {
        idIngredienteReceta: 7,
        nombre: "Masa de pizza",
        cantidad: 1,
        unidadMedida: "unidad",
      },
      {
        idIngredienteReceta: 8,
        nombre: "Salsa de tomate",
        cantidad: 150,
        unidadMedida: "gramos",
      },
      {
        idIngredienteReceta: 9,
        nombre: "Mozzarella",
        cantidad: 100,
        unidadMedida: "gramos",
      },
    ],
    pasos: [
      {
        orden: 1,
        descripcionPaso: "Extender la masa de pizza.",
      },
      {
        orden: 2,
        descripcionPaso: "Cubrir con salsa de tomate y mozzarella.",
      },
      {
        orden: 3,
        descripcionPaso: "Hornear hasta que el queso se derrita.",
      },
    ],
    comentarios: [
      {
        idComentario: 3,
        usuario: {
          alias: "PedroSanchez",
        },
        fechaComentario: "2024-03-02",
        contenido: "¡La mejor pizza!",
      },
    ],
  },
  {
    idReceta: 4,
    titulo: "Pollo al Curry",
    descripcion: "Exquisito pollo al curry con arroz basmati.",
    tipoReceta: "Pollo",
    fechaCreacion: "2024-03-10",
    usuario: {
      alias: "AnaMartinez",
    },
    calificaciones: [
      {
        puntuacion: 5,
      },
    ],
    ingredientes: [
      {
        idIngredienteReceta: 10,
        nombre: "Pechugas de pollo",
        cantidad: 500,
        unidadMedida: "gramos",
      },
      {
        idIngredienteReceta: 11,
        nombre: "Curry en polvo",
        cantidad: 2,
        unidadMedida: "cucharadas",
      },
      {
        idIngredienteReceta: 12,
        nombre: "Arroz basmati",
        cantidad: 200,
        unidadMedida: "gramos",
      },
    ],
    pasos: [
      {
        orden: 1,
        descripcionPaso: "Cortar el pollo en trozos.",
      },
      {
        orden: 2,
        descripcionPaso: "Sofreír el pollo con el curry.",
      },
      {
        orden: 3,
        descripcionPaso: "Servir con arroz basmati.",
      },
    ],
    comentarios: [
      {
        idComentario: 4,
        usuario: {
          alias: "LuisGarcia",
        },
        fechaComentario: "2024-03-11",
        contenido: "¡Delicioso y fácil de preparar!",
      },
    ],
  },
  {
    idReceta: 5,
    titulo: "Ensalada Griega",
    descripcion: "Una refrescante ensalada con tomate, pepino, aceitunas y queso feta.",
    tipoReceta: "Ensalada",
    fechaCreacion: "2024-03-15",
    usuario: {
      alias: "ElenaRodriguez",
    },
    calificaciones: [
      {
        puntuacion: 4,
      },
    ],
    ingredientes: [
      {
        idIngredienteReceta: 13,
        nombre: "Tomate",
        cantidad: 2,
        unidadMedida: "unidades",
      },
      {
        idIngredienteReceta: 14,
        nombre: "Pepino",
        cantidad: 1,
        unidadMedida: "unidad",
      },
      {
        idIngredienteReceta: 15,
        nombre: "Aceitunas negras",
        cantidad: 50,
        unidadMedida: "gramos",
      },
      {
        idIngredienteReceta: 16,
        nombre: "Queso feta",
        cantidad: 100,
        unidadMedida: "gramos",
      },
    ],
    pasos: [
      {
        orden: 1,
        descripcionPaso: "Cortar el tomate y el pepino.",
      },
      {
        orden: 2,
        descripcionPaso: "Mezclar con las aceitunas y el queso feta.",
      },
      {
        orden: 3,
        descripcionPaso: "Aliñar con aceite de oliva y orégano.",
      },
    ],
    comentarios: [
      {
        idComentario: 5,
        usuario: {
          alias: "JavierPerez",
        },
        fechaComentario: "2024-03-16",
        contenido: "¡Muy buena!",
      },
    ],
  },
]

export default recetas
