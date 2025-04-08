export const recipes = [
  {
    "idReceta": 101,
    "titulo": "Tortillas de papa con atún",
    "descripcion": "Deliciosas tortillas de papa con atún, perfectas como entrada o plato principal.",
    "porciones": 4,
    "tipoReceta": "Principal",
    "fechaCreacion": "2025-04-08T14:30:00Z",
    "estadoPublicacion": "pendiente", 
    "usuario": {
      "idUsuario": "u1001",
      "alias": "ChefPepito"
    },
    "ingredientes": [
      {
        "idIngredienteReceta": 1,
        "nombre": "Papa",
        "cantidad": 3,
        "unidadMedida": "unidades"
      },
      {
        "idIngredienteReceta": 2,
        "nombre": "Atún",
        "cantidad": 1,
        "unidadMedida": "lata"
      },
      {
        "idIngredienteReceta": 3,
        "nombre": "Cebolla",
        "cantidad": 1,
        "unidadMedida": "unidad"
      },
      {
        "idIngredienteReceta": 4,
        "nombre": "Aceite de oliva",
        "cantidad": 2,
        "unidadMedida": "cucharadas"
      }
    ],
    "pasos": [
      {
        "orden": 1,
        "descripcionPaso": "Pelar y picar la cebolla, luego freírla en aceite."
      },
      {
        "orden": 2,
        "descripcionPaso": "Hervir las papas y hacer un puré."
      },
      {
        "orden": 3,
        "descripcionPaso": "Mezclar el puré con el atún y la cebolla frita."
      },
      {
        "orden": 4,
        "descripcionPaso": "Formar las tortillas y freírlas en una sartén hasta dorar."
      }
    ],
    "multimedia": [
      {
        "idMultimedia": 5001,
        "tipo": "imagen",
        "url": "https://misitio.com/recetas/101/paso1.jpg"
      },
      {
        "idMultimedia": 5002,
        "tipo": "video",
        "url": "https://misitio.com/recetas/101/preparacion.mp4"
      }
    ],
    "calificaciones": [
      {
        "idCalificacion": 301,
        "puntuacion": 5,
        "comentarioCalificacion": "¡Excelente receta, muy fácil de hacer!",
        "usuario": {
          "idUsuario": "u2002",
          "alias": "FanDeLaCocina"
        }
      },
      {
        "idCalificacion": 302,
        "puntuacion": 4,
        "comentarioCalificacion": "Me gustó, pero le faltó un toque de sabor.",
        "usuario": {
          "idUsuario": "u2005",
          "alias": "CocineroCasero"
        }
      }
    ],
    "comentarios": [
      {
        "idComentario": 801,
        "contenido": "Agregué un poco de perejil y quedó espectacular.",
        "fechaComentario": "2025-04-09T11:20:00Z",
        "usuario": {
          "idUsuario": "u2003",
          "alias": "ComensalFeliz"
        }
      },
      {
        "idComentario": 802,
        "contenido": "Podría usarse menos aceite para hacerlo más ligero.",
        "fechaComentario": "2025-04-10T09:45:00Z",
        "usuario": {
          "idUsuario": "u2007",
          "alias": "SaludableChef"
        }
      }
    ]
  },
  {
    "idReceta": 102,
    "titulo": "Ensalada Mediterránea",
    "descripcion": "Una ensalada fresca con ingredientes típicos mediterráneos.",
    "porciones": 2,
    "tipoReceta": "Entrada",
    "fechaCreacion": "2025-04-10T10:00:00Z",
    "estadoPublicacion": "aprobado", 
    "usuario": {
      "idUsuario": "u1002",
      "alias": "VerdeVida"
    },
    "ingredientes": [
      {
        "idIngredienteReceta": 5,
        "nombre": "Tomate",
        "cantidad": 2,
        "unidadMedida": "unidades"
      },
      {
        "idIngredienteReceta": 6,
        "nombre": "Pepino",
        "cantidad": 1,
        "unidadMedida": "unidad"
      },
      {
        "idIngredienteReceta": 7,
        "nombre": "Aceitunas negras",
        "cantidad": 10,
        "unidadMedida": "unidades"
      },
      {
        "idIngredienteReceta": 8,
        "nombre": "Queso feta",
        "cantidad": 100,
        "unidadMedida": "gramos"
      }
    ],
    "pasos": [
      {
        "orden": 1,
        "descripcionPaso": "Cortar los tomates y el pepino en cubos."
      },
      {
        "orden": 2,
        "descripcionPaso": "Agregar las aceitunas y el queso feta desmenuzado."
      },
      {
        "orden": 3,
        "descripcionPaso": "Mezclar y aderezar con aceite de oliva y orégano."
      }
    ],
    "multimedia": [
      {
        "idMultimedia": 5003,
        "tipo": "imagen",
        "url": "https://misitio.com/recetas/102/ensalada.jpg"
      }
    ],
    "calificaciones": [
      {
        "idCalificacion": 303,
        "puntuacion": 4,
        "comentarioCalificacion": "Muy fresca y saludable.",
        "usuario": {
          "idUsuario": "u2008",
          "alias": "SaludYBienestar"
        }
      }
    ],
    "comentarios": [
      {
        "idComentario": 803,
        "contenido": "Le agregué albahaca fresca, ¡fantástico!",
        "fechaComentario": "2025-04-11T12:30:00Z",
        "usuario": {
          "idUsuario": "u2009",
          "alias": "AmanteDeLaCocina"
        }
      }
    ]
  },
  {
    "idReceta": 103,
    "titulo": "Brownies de Chocolate",
    "descripcion": "Brownies esponjosos y ricos en sabor, perfectos para el postre.",
    "porciones": 8,
    "tipoReceta": "Postre",
    "fechaCreacion": "2025-04-12T16:00:00Z",
    "estadoPublicacion": "aprobado", 
    "usuario": {
      "idUsuario": "u1004",
      "alias": "DulcePasión"
    },
    "ingredientes": [
      {
        "idIngredienteReceta": 9,
        "nombre": "Chocolate negro",
        "cantidad": 200,
        "unidadMedida": "gramos"
      },
      {
        "idIngredienteReceta": 10,
        "nombre": "Mantequilla",
        "cantidad": 100,
        "unidadMedida": "gramos"
      },
      {
        "idIngredienteReceta": 11,
        "nombre": "Harina",
        "cantidad": 150,
        "unidadMedida": "gramos"
      },
      {
        "idIngredienteReceta": 12,
        "nombre": "Huevos",
        "cantidad": 3,
        "unidadMedida": "unidades"
      }
    ],
    "pasos": [
      {
        "orden": 1,
        "descripcionPaso": "Derretir el chocolate y la mantequilla juntos."
      },
      {
        "orden": 2,
        "descripcionPaso": "Batir los huevos y mezclarlos con la harina."
      },
      {
        "orden": 3,
        "descripcionPaso": "Incorporar el chocolate derretido a la mezcla y verter en un molde."
      },
      {
        "orden": 4,
        "descripcionPaso": "Hornear durante 25-30 minutos a 180°C."
      }
    ],
    "multimedia": [
      {
        "idMultimedia": 5004,
        "tipo": "imagen",
        "url": "https://misitio.com/recetas/103/brownie.jpg"
      }
    ],
    "calificaciones": [
      {
        "idCalificacion": 304,
        "puntuacion": 5,
        "comentarioCalificacion": "Increíble, se derrite en la boca.",
        "usuario": {
          "idUsuario": "u2010",
          "alias": "ChocoLover"
        }
      }
    ],
    "comentarios": [
      {
        "idComentario": 804,
        "contenido": "Le puse nueces y le dio un toque crujiente.",
        "fechaComentario": "2025-04-13T14:10:00Z",
        "usuario": {
          "idUsuario": "u2011",
          "alias": "NuezAdicto"
        }
      }
    ]
  }
];