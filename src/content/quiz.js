export const questions = [
  {
    q: "¿Cómo reaccionas cuando alguien te contradice?",
    options: [
      { text: "Me enojo y defiendo mi posición agresivamente", value: 1 },
      { text: "Escucho pero me cuesta cambiar de opinión", value: 2 },
      { text: "Considero su punto de vista y puedo cambiar mi perspectiva", value: 3 }
    ]
  },
  {
    q: "¿Cómo usas la tecnología?",
    options: [
      { text: "La uso sin pensar en consecuencias", value: 1 },
      { text: "Intento usarla responsablemente pero a veces fallo", value: 2 },
      { text: "La uso conscientemente, pensando en su impacto", value: 3 }
    ]
  },
  {
    q: "¿Cómo te relacionas con personas de otras culturas o ideas?",
    options: [
      { text: "Desconfío o me cierran las diferencias", value: 1 },
      { text: "Tengo curiosidad pero me cuesta salir de mi zona de confort", value: 2 },
      { text: "Me enriquezco con la diversidad activamente", value: 3 }
    ]
  },
  {
    q: "¿Pensás en las generaciones futuras al tomar decisiones?",
    options: [
      { text: "No, me enfoco en el presente inmediato", value: 1 },
      { text: "A veces, pero no es mi prioridad", value: 2 },
      { text: "Sí, considero el impacto a largo plazo", value: 3 }
    ]
  },
  {
    q: "¿Cómo manejás tus emociones intensas?",
    options: [
      { text: "Exploto o las reprimo sin procesar", value: 1 },
      { text: "Intento controlarlas pero a veces me desbordan", value: 2 },
      { text: "Las reconozco, proceso y expreso sanamente", value: 3 }
    ]
  }
];

export const quizResults = {
  earlyAdolescence: {
    stage: "Adolescencia temprana",
    description: "Estás en proceso de descubrir quién sos y cómo relacionarte con el mundo.",
    message: "La buena noticia: estás consciente y podés crecer. Cada decisión cuenta."
  },
  fullAdolescence: {
    stage: "Adolescencia plena",
    description: "Tenés las herramientas pero todavía estás aprendiendo a usarlas sabiamente.",
    message: "Estás en el momento perfecto para dar el salto hacia la madurez."
  },
  emergingAdulthood: {
    stage: "Adultez emergente",
    description: "Mostrás señales de madurez emocional y consciencia sobre tu impacto.",
    message: "Tu trabajo ahora es ayudar a otros a crecer también."
  },
};
