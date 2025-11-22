import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

const futures = [
  {
    id: 1,
    name: "Adulto maduro",
    subtitle: "La humanidad aprende a cuidar lo que ama",
    avatar_key: "adult_mature",
    color: "#4A9B6F",
    description: "En este futuro, la humanidad llega a la adultez sin perder la sensibilidad. No somos perfectos, pero aprendemos a tomar decisiones pensando en generaciones futuras. La tecnología deja de ser un fin en sí mismo y se vuelve una herramienta al servicio del cuidado: de las personas, de los vínculos y del planeta. Aceptamos nuestros errores históricos sin negarlos ni romantizarlos, y los usamos como brújula para no repetirlos.",
    achievements: [
      "Transición global hacia energías limpias y modelos productivos regenerativos",
      "Sistemas de salud y educación pensados para toda la vida, no solo para 'producir'",
      "Instituciones más transparentes, con participación ciudadana real y control público",
      "Integración seria entre ciencia, ética y justicia social en la toma de decisiones",
      "Reducción sostenida de la pobreza extrema y de las brechas económicas más violentas"
    ],
    wounds: [
      "Duelo colectivo por especies y culturas que ya se perdieron",
      "Conflictos de adaptación: generaciones que se resisten a renunciar a privilegios",
      "Cansancio emocional frente a décadas de crisis encadenadas",
      "Tensiones entre identidades locales y acuerdos globales"
    ],
    risks: [
      "Que la sensación de 'estar mejor' nos haga bajar la guardia ante nuevos autoritarismos",
      "Que los logros se concentren en algunas regiones y otras queden rezagadas",
      "Que la tecnología 'ética' termine siendo un lujo de países ricos",
      "Que normalicemos un nivel 'medio aceptable' de injusticia y dejemos de incomodarnos"
    ]
  },
  {
    id: 2,
    name: "Adulto cínico",
    subtitle: "La humanidad se acostumbra a sobrevivir sin esperanza",
    avatar_key: "adult_cynic",
    color: "#6B7280",
    description: "En este futuro, la humanidad llega técnicamente a la adultez, pero emocionalmente se apaga. Logramos estabilizar el mundo lo suficiente como para que no colapse, pero no para hacerlo verdaderamente justo. Hay avances tecnológicos impresionantes, ciudades inteligentes y vidas hiperconectadas, pero una parte grande de la población vive en una mezcla de resignación, ansiedad y distracción permanente. No explotamos del todo, pero tampoco sanamos: solo seguimos funcionando.",
    achievements: [
      "Control relativo de grandes crisis: pandemias, inflación descontrolada, estallidos bélicos",
      "Innovaciones tecnológicas que mejoran el confort de parte de la población",
      "Sistemas de vigilancia y gestión de datos que permiten anticipar algunos desastres",
      "Incremento de la esperanza de vida promedio y tratamientos avanzados para muchas enfermedades"
    ],
    wounds: [
      "Normalización de la desigualdad extrema como 'parte del sistema'",
      "Desconfianza generalizada en instituciones, medios y discursos políticos",
      "Soledad masiva en contextos hiperconectados; vínculos superficiales y frágiles",
      "Fatiga crónica ante la avalancha de información, conflictos y crisis"
    ],
    risks: [
      "Que el cinismo se vuelva la emoción dominante: 'nada va a cambiar, así que da lo mismo'",
      "Avance silencioso de regímenes autoritarios bajo la excusa del orden y la seguridad",
      "Estallidos sociales impredecibles cuando la apatía se rompe de golpe",
      "Dependencia casi total de sistemas tecnológicos que poca gente entiende o controla"
    ]
  },
  {
    id: 3,
    name: "Adulto truncado",
    subtitle: "Cuando una especie no llega a la adultez",
    avatar_key: "adult_broken",
    color: "#7C2D12",
    description: "En este futuro, la humanidad no logra atravesar su adolescencia. No necesariamente significa extinción total inmediata, pero sí colapsos civilizatorios grandes y duraderos. Regiones enteras se vuelven prácticamente inhabitables, se pierden saberes, infraestructuras y memorias culturales. Sobreviven grupos humanos, pero el proyecto de 'humanidad planetaria conectada' se rompe. Lo que hoy conocemos como historia, ciencia y derechos se fragmenta, se olvida o queda guardado en restos de servidores que ya nadie puede mantener.",
    achievements: [
      "Restos de conocimiento científico y tecnológico dispersos, conservados por pequeñas comunidades",
      "Experiencias locales de cooperación y cuidado en medio del colapso",
      "Aprendizajes dolorosos sobre los límites físicos y ecológicos del planeta"
    ],
    wounds: [
      "Pérdida masiva de vidas humanas por guerras, crisis climáticas y hambrunas",
      "Desaparición de lenguas, culturas, obras de arte y archivos completos",
      "Trauma transgeneracional: generaciones nacidas en el caos sin memoria clara de un mundo estable",
      "Retrocesos en derechos básicos, especialmente para mujeres, minorías y grupos vulnerables"
    ],
    risks: [
      "Extinción total en el mediano o largo plazo por encadenamiento de crisis",
      "Aparición de líderes mesiánicos violentos que explotan el miedo y la escasez",
      "Que las pocas tecnologías supervivientes (IA, bio, energía) caigan en manos de grupos sin freno ético",
      "Que incluso los que sobrevivan concluyan que 'no vale la pena' reconstruir algo colectivo"
    ]
  }
];

const stages = [
  {
    id: 1,
    age_human: "0-2 años",
    age_label: "Bebé",
    age_real: "50.000 a.C. – 10.000 a.C.",
    avatar_key: "baby",
    title: "Aprendiendo a sobrevivir",
    subtitle: "La humanidad bebé",
    achievements: [
      "Desarrollo del lenguaje simbólico",
      "Dominio básico del fuego",
      "Uso de herramientas primitivas",
      "Organización en pequeñas bandas nómadas"
    ],
    wounds: [
      "Vulnerabilidad extrema frente al clima y depredadores",
      "Esperanza de vida muy baja",
      "Dependencia total del entorno natural"
    ],
    risks: [
      "Extinción por cambios climáticos o catástrofes naturales",
      "Falta de recursos en ciertas regiones",
      "Alta mortalidad infantil y adulta"
    ],
    text: "En esta etapa, la humanidad es como un bebé que recién abre los ojos al mundo. Vivimos en grupos pequeños, seguimos a los animales y a las estaciones. No producimos, sólo recolectamos y cazamos. No controlamos el entorno: el entorno nos controla a nosotros. Aprendemos a usar el fuego, a fabricar herramientas y a comunicarnos mejor, pero seguimos siendo frágiles y totalmente dependientes de la naturaleza."
  },
  {
    id: 2,
    age_human: "3-5 años",
    age_label: "Niñez temprana",
    age_real: "10.000 a.C. – 4.000 a.C.",
    avatar_key: "early_child",
    title: "Hacer que la comida venga a casa",
    subtitle: "La humanidad descubre la agricultura",
    achievements: [
      "Invención de la agricultura",
      "Domesticación de animales",
      "Aparición de aldeas estables",
      "Desarrollo de la cerámica y almacenamiento de alimentos"
    ],
    wounds: [
      "Primeras desigualdades en el acceso a la tierra y la comida",
      "Dependencia del clima y de las cosechas",
      "Aumento del esfuerzo físico y del trabajo repetitivo"
    ],
    risks: [
      "Hambrunas por malas cosechas",
      "Enfermedades asociadas a la vida sedentaria",
      "Conflictos iniciales por territorios y recursos"
    ],
    text: "Como un niño que empieza a caminar solo, la humanidad aprende a hacer que la comida crezca cerca. Dejamos de movernos tanto y construimos aldeas. Con la agricultura y la ganadería aparece el excedente: sobra comida. Y cuando sobra algo, aparece la pregunta de quién lo controla. Nacen las primeras diferencias de poder, los primeros jefes y las primeras tensiones por la tierra."
  },
  {
    id: 3,
    age_human: "6-8 años",
    age_label: "Niñez media",
    age_real: "4.000 a.C. – 1.000 a.C.",
    avatar_key: "middle_child",
    title: "Ciudades, leyes y reyes",
    subtitle: "La humanidad se organiza en grande",
    achievements: [
      "Nacimiento de las primeras ciudades-estado",
      "Invención de la escritura",
      "Primeros códigos de leyes escritos",
      "Desarrollo del riego y la ingeniería hidráulica",
      "Organización de ejércitos estables"
    ],
    wounds: [
      "Aparición de monarquías absolutas",
      "Esclavitud institucionalizada",
      "Guerras recurrentes entre ciudades y reinos"
    ],
    risks: [
      "Colapso de ciudades por mala gestión del agua y del suelo",
      "Guerras constantes por poder y territorio",
      "Concentración extrema del poder en pocas manos"
    ],
    text: "La humanidad entra en una especie de primaria avanzada. Aprendemos a leer y a escribir, pero también a imponer y castigar. Aparecen ciudades como Uruk, Ur o Tebas, con templos, burocracia e impuestos. Los reyes y sacerdotes se colocan por encima del resto y justifican su poder con dioses. Las leyes ordenan, pero también oprimen. Somos más organizados, pero también más duros entre nosotros. El crecimiento trae orden, pero también costo emocional."
  },
  {
    id: 4,
    age_human: "9-11 años",
    age_label: "Preadolescencia",
    age_real: "1.000 a.C. – 1500 d.C.",
    avatar_key: "preteen",
    title: "Imperios, dioses y grandes relatos",
    subtitle: "La humanidad busca sentido",
    achievements: [
      "Formación de grandes imperios (romano, persa, chino, etc.)",
      "Desarrollo de filosofías y religiones universales",
      "Avances en ingeniería, arquitectura y organización militar",
      "Codificación de tradiciones orales en textos sagrados y legales"
    ],
    wounds: [
      "Guerras de conquista a gran escala",
      "Persecuciones religiosas y fanatismos",
      "Sistemas rígidos de castas y jerarquías sociales"
    ],
    risks: [
      "Colapso de imperios por sobreexpansión y corrupción",
      "Pandemias sin control",
      "Estancamiento científico por dogmatismo"
    ],
    text: "La humanidad entra en su preadolescencia: no sólo vive y obedece, ahora se pregunta por el sentido. Nacen grandes religiones, filosofías y relatos que intentan explicar quiénes somos y qué deberíamos hacer. Pero esas mismas ideas también dividen y justifican cruzadas, invasiones y purgas. Construimos catedrales, murallas y caminos, pero mantenemos una estructura social rígida y violenta. Estamos creciendo, pero todavía no sabemos manejar lo que sentimos ni lo que creemos. La humanidad empezó a pensar más de lo que entendía. Queríamos respuestas, pero todavía no sabíamos hacernos preguntas maduras."
  },
  {
    id: 5,
    age_human: "12-13 años",
    age_label: "Adolescencia temprana",
    age_real: "1500 – 1900",
    avatar_key: "early_teen",
    title: "Ciencia, máquinas y conquista global",
    subtitle: "La humanidad descubre su propio poder",
    achievements: [
      "Nacimiento de la ciencia moderna y el método científico",
      "Renacimiento cultural y artístico",
      "Exploración y colonización de casi todo el planeta",
      "Revolución industrial y máquinas a vapor",
      "Ideas modernas de libertad, república y derechos"
    ],
    wounds: [
      "Colonialismo y saqueo de continentes enteros",
      "Esclavitud transatlántica a gran escala",
      "Explotación brutal de trabajadores y niños",
      "Destrucción ambiental inicial por la industrialización"
    ],
    risks: [
      "Profundización de la desigualdad global",
      "Conflictos crecientes por recursos y poder",
      "Dependencia de sistemas económicos que necesitan crecimiento infinito"
    ],
    text: "La humanidad se comporta como un adolescente brillante que descubre que es fuerte e inteligente, pero todavía no desarrolla empatía. Inventamos telescopios, imprentas, motores, vacunas. Navegamos todo el planeta y lo cartografiamos. Pero usamos ese poder para conquistar, esclavizar y explotar. Hablamos de libertad y derechos, mientras negamos esos mismos derechos a millones de personas. El potencial es enorme, la contradicción también."
  },
  {
    id: 6,
    age_human: "14-16 años",
    age_label: "Adolescencia plena",
    age_real: "1900 – hoy",
    avatar_key: "full_teen",
    title: "Entre la autodestrucción y la madurez",
    subtitle: "La humanidad en su etapa más peligrosa",
    achievements: [
      "Desarrollo de la energía moderna (electricidad, nuclear, renovables)",
      "Avances masivos en medicina y aumento de la esperanza de vida",
      "Informática, internet y comunicación global instantánea",
      "Inteligencia artificial y biotecnología avanzada",
      "Reconocimiento formal de los derechos humanos y de las minorías"
    ],
    wounds: [
      "Guerras mundiales con destrucción masiva",
      "Creación y proliferación de armas nucleares",
      "Crisis climática y pérdida acelerada de biodiversidad",
      "Desigualdades económicas extremas",
      "Ansiedad, soledad y fragmentación social en la era digital"
    ],
    risks: [
      "Autodestrucción mediante guerra nuclear",
      "Colapso ecológico y social por cambio climático",
      "Uso irresponsable o malicioso de la inteligencia artificial",
      "Deriva hacia sistemas de vigilancia total y autoritarismo digital"
    ],
    text: "Hoy la humanidad es un adolescente con herramientas de adulto. Tenemos la capacidad de curar enfermedades, viajar al espacio, comunicarnos en segundos a cualquier lugar del mundo y crear máquinas que aprenden. Pero también tenemos la capacidad de destruirnos en cuestión de horas. Seguimos atrapados entre la cooperación y la competencia extrema, entre el cuidado y el saqueo, entre el diálogo y el odio. Estamos en la etapa más peligrosa: la de decidir si vamos a crecer o a repetir nuestros impulsos hasta romperlo todo. Somos capaces de convertirnos en adultos sabios… o en una especie que no llegue a la adultez."
  }
];

const QuizComponent = ({ onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);

  const questions = [
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

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (ans) => {
    const total = Object.values(ans).reduce((a, b) => a + b, 0);
    const avg = total / questions.length;
    
    let result;
    if (avg <= 1.5) {
      result = {
        stage: "Adolescencia temprana",
        description: "Estás en proceso de descubrir quién sos y cómo relacionarte con el mundo.",
        message: "La buena noticia: estás consciente y podés crecer. Cada decisión cuenta."
      };
    } else if (avg <= 2.5) {
      result = {
        stage: "Adolescencia plena",
        description: "Tenés las herramientas pero todavía estás aprendiendo a usarlas sabiamente.",
        message: "Estás en el momento perfecto para dar el salto hacia la madurez."
      };
    } else {
      result = {
        stage: "Adultez emergente",
        description: "Mostrás señales de madurez emocional y consciencia sobre tu impacto.",
        message: "Tu trabajo ahora es ayudar a otros a crecer también."
      };
    }
    onComplete(result);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Pregunta {currentQ + 1} de {questions.length}</span>
          <span>{Math.round(((currentQ) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ width: `${((currentQ) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">{questions[currentQ].q}</h3>
      
      <div className="space-y-3">
        {questions[currentQ].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option.value)}
            className="w-full p-4 text-left bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors border border-gray-600/50 hover:border-orange-500/50"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

const AdultAvatar = ({ future, size = 200 }) => {
  return (
    <div className="relative flex justify-center items-center">
      <div className="absolute bottom-0 w-32 h-8 bg-black/20 blur-[40px] rounded-full" />
      <div className="relative z-10">
        <svg width={size} height={size + 40} viewBox={`0 0 ${size} ${size + 40}`}>
          <circle cx={size / 2} cy={80 / 2} r={80 / 2} fill={future.color} />
          <circle cx={size / 2 - 10} cy={80 / 2 - 5} r={4} fill="#2C1810" />
          <circle cx={size / 2 + 10} cy={80 / 2 - 5} r={4} fill="#2C1810" />
          <rect
            x={(size - 70) / 2}
            y={80}
            width={70}
            height={120}
            fill={future.color}
            rx={5}
          />
          <rect x={(size - 80) / 2 - 6} y={85} width={6} height={60} fill={future.color} rx={3} />
          <rect x={(size + 80) / 2} y={85} width={6} height={60} fill={future.color} rx={3} />
        </svg>
      </div>
    </div>
  );
};

const FutureCard = ({ future }) => {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div className="transition-all duration-700 opacity-0 translate-y-3 animate-[cardFadeIn_0.7s_ease-out_forwards] bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600/50 hover:-translate-y-1">
      <div className="flex flex-col items-center mb-8">
        <AdultAvatar future={future} />
        <h3 className="text-2xl font-bold text-white mt-6 mb-2">{future.name}</h3>
        <div className="mx-auto mt-2 mb-4 w-16 h-[2px] bg-white/20 rounded-full" />
        <p className="text-lg text-gray-300 text-center">{future.subtitle}</p>
      </div>

      <p className="text-gray-200 leading-relaxed mb-8 max-w-[720px] mx-auto">
        {future.description}
      </p>

      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700">
          {['achievements', 'wounds', 'risks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'achievements' && 'Logros'}
              {tab === 'wounds' && 'Heridas'}
              {tab === 'risks' && 'Riesgos'}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {future[activeTab].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-300">
              <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Avatar = ({ stage, isActive }) => {
  const avatarConfigs = {
    baby: { size: 80, head: 50, body: 30, color: '#F4A460' },
    early_child: { size: 100, head: 55, body: 45, color: '#E8A050' },
    middle_child: { size: 120, head: 60, body: 60, color: '#D89040' },
    preteen: { size: 140, head: 65, body: 75, color: '#C87830' },
    early_teen: { size: 160, head: 70, body: 90, color: '#B06020' },
    full_teen: { size: 180, head: 75, body: 105, color: '#8B4513' }
  };

  const config = avatarConfigs[stage.avatar_key];

  return (
    <div className="relative flex justify-center items-center">
      {/* Shadow */}
      <div className="absolute bottom-0 w-20 sm:w-24 md:w-28 h-6 bg-black/20 blur-[40px] rounded-full" />
      
      {/* Avatar */}
      <div className={`relative z-10 transition-all duration-700 ${isActive ? 'scale-100 opacity-100 animate-[avatarPop_0.4s_ease-out]' : 'scale-90 opacity-0'}`}>
        <svg width={config.size} height={config.size + 40} viewBox={`0 0 ${config.size} ${config.size + 40}`}>
        {/* Head */}
        <circle
          cx={config.size / 2}
          cy={config.head / 2}
          r={config.head / 2}
          fill={config.color}
          className="transition-all duration-700"
        />
        {/* Eyes */}
        <circle cx={config.size / 2 - 8} cy={config.head / 2 - 5} r={3} fill="#2C1810" />
        <circle cx={config.size / 2 + 8} cy={config.head / 2 - 5} r={3} fill="#2C1810" />
        {/* Body */}
        <rect
          x={(config.size - config.body * 0.6) / 2}
          y={config.head}
          width={config.body * 0.6}
          height={config.body}
          fill={config.color}
          rx={5}
          className="transition-all duration-700"
        />
        {/* Arms */}
        <rect
          x={(config.size - config.body * 0.8) / 2 - 5}
          y={config.head + 5}
          width={5}
          height={config.body * 0.5}
          fill={config.color}
          rx={3}
        />
        <rect
          x={(config.size + config.body * 0.8) / 2}
          y={config.head + 5}
          width={5}
          height={config.body * 0.5}
          fill={config.color}
          rx={3}
        />
      </svg>
      <div className="text-center mt-4 text-sm font-medium text-gray-400">
        {stage.age_human}
      </div>
    </div>
    </div>
  );
};

const TimelineStage = ({ stage, isActive, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div className={`transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}>
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center my-8 lg:my-12">
          <Avatar stage={stage} isActive={isActive} />
          <div className="mt-8 text-center">
            <div className="text-2xl font-bold text-white">{stage.age_label}</div>
            <div className="text-sm text-gray-400 mt-1">{stage.age_real}</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              {stage.title}
            </h2>
            <div className="mx-auto mt-4 mb-8 w-16 h-[2px] bg-white/20 rounded-full" />
            <p className="text-xl text-gray-300 mt-3">{stage.subtitle}</p>
          </div>

          <p className="text-gray-200 leading-relaxed text-lg max-w-[720px] mt-8">
            {stage.text}
          </p>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-gray-700">
              {['achievements', 'wounds', 'risks'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab === 'achievements' && 'Logros'}
                  {tab === 'wounds' && 'Heridas'}
                  {tab === 'risks' && 'Riesgos'}
                </button>
              ))}
            </div>

            <ul className="space-y-3">
              {stage[activeTab].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HumanityAdolescence() {
  const [currentStage, setCurrentStage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [quizResult, setQuizResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    let interval;
    if (autoPlay && currentStage < stages.length - 1) {
      interval = setInterval(() => {
        setCurrentStage(prev => prev + 1);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, currentStage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentStage > 0) {
        setCurrentStage(currentStage - 1);
        setShowScrollHint(false);
      } else if (e.key === 'ArrowRight' && currentStage < stages.length - 1) {
        setCurrentStage(currentStage + 1);
        setShowScrollHint(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentStage < stages.length - 1) {
        setCurrentStage(currentStage + 1);
      } else if (diff < 0 && currentStage > 0) {
        setCurrentStage(currentStage - 1);
      }
      setShowScrollHint(false);
    }
    setTouchStart(null);
  };

  const scrollToTimeline = () => {
    document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
  };

  const shareProject = (platform) => {
    const url = window.location.href;
    const text = "Descubrí que la humanidad tiene 15 años. ¿En qué etapa emocional estamos como especie?";
    
    const urls = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/` // Instagram no permite share directo, abre la app
    };
    
    if (platform === 'instagram') {
      alert('Para compartir en Instagram, tomá una captura de pantalla y compartila en tus historias 📸');
      return;
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white relative overflow-hidden">
      {/* Starfield background */}
      <div className="fixed inset-0 opacity-40">
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[20%] animate-pulse"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[15%] left-[80%] animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[25%] left-[40%] animate-pulse" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[35%] left-[70%] animate-pulse" style={{animationDelay: '0.9s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[45%] left-[15%] animate-pulse" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[55%] left-[85%] animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[65%] left-[30%] animate-pulse" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[75%] left-[60%] animate-pulse" style={{animationDelay: '2.1s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[85%] left-[45%] animate-pulse" style={{animationDelay: '2.4s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[50%] animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[40%] left-[90%] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[60%] left-[10%] animate-pulse" style={{animationDelay: '1.7s'}}></div>
      </div>
      
      {/* Nebula effects */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[180px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[200px]"></div>
      </div>
      
      <div className="relative z-10">
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-out;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        @keyframes avatarPop {
          0% { transform: translateY(8px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cardFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .parallax-slow {
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .parallax-slow {
            animation: none;
            transform: none;
          }
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3);
        }
        .text-glow-white {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2);
        }
      `}</style>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-[clamp(5rem,12vh,8rem)] pb-20 relative overflow-hidden">
        {/* Meta tags for sharing */}
        <head>
          <title>La Humanidad Adolescente - ¿En qué etapa emocional está nuestra especie?</title>
          <meta name="description" content="Si la humanidad fuera una persona, hoy tendría 15 años. Explorá nuestra historia como un viaje de crecimiento emocional." />
          <meta property="og:title" content="La Humanidad Adolescente" />
          <meta property="og:description" content="¿En qué etapa emocional está nuestra especie? Una experiencia interactiva sobre el crecimiento de la humanidad." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="La Humanidad Adolescente" />
          <meta name="twitter:description" content="Si la humanidad fuera una persona, hoy tendría 15 años." />
        </head>
        
        {/* Illustrated background - Cosmic sunset with silhouettes */}
        <svg className="absolute inset-0 w-full h-full opacity-40 parallax-slow" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="heroSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#1a0b2e', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#7b2cbf', stopOpacity: 0.8}} />
              <stop offset="100%" style={{stopColor: '#ff6b35', stopOpacity: 0.9}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroSky)" />
          {/* Mountains silhouette */}
          <path d="M0,600 L200,400 L400,500 L600,350 L800,450 L1000,300 L1200,400 L1400,250 L1920,400 L1920,1080 L0,1080 Z" 
                fill="#0a0118" opacity="0.9" />
          <path d="M0,700 L300,550 L600,650 L900,500 L1200,600 L1500,450 L1920,550 L1920,1080 L0,1080 Z" 
                fill="#1a0b2e" opacity="0.7" />
          {/* Stars */}
          <circle cx="100" cy="100" r="3" fill="white" opacity="1" />
          <circle cx="300" cy="150" r="2" fill="white" opacity="0.8" />
          <circle cx="500" cy="80" r="3" fill="white" opacity="1" />
          <circle cx="700" cy="120" r="2" fill="white" opacity="0.9" />
          <circle cx="900" cy="90" r="3" fill="white" opacity="1" />
          <circle cx="1100" cy="140" r="2" fill="white" opacity="0.8" />
          <circle cx="1300" cy="110" r="2.5" fill="white" opacity="0.9" />
        </svg>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-orange-900/20 to-gray-900/50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 mb-12 animate-fade-in-up animate-float">
          <Avatar stage={stages[5]} isActive={true} />
        </div>
        
        <h1 className="relative z-10 text-5xl lg:text-7xl font-black mb-4 max-w-5xl leading-tight animate-fade-in-up text-glow-white" style={{animationDelay: '0.2s'}}>
          LA HUMANIDAD
        </h1>
        <h2 className="relative z-10 text-5xl lg:text-7xl font-black mb-8 max-w-5xl leading-tight animate-fade-in-up text-glow" style={{animationDelay: '0.3s', color: '#FDB813'}}>
          ADOLESCENTE
        </h2>
        
        <p className="relative z-10 text-xl lg:text-2xl text-gray-200 mb-4 max-w-3xl animate-fade-in-up font-medium" style={{animationDelay: '0.4s'}}>
          ¿En qué etapa emocional está nuestra especie?
        </p>
        
        <p className="relative z-10 text-lg lg:text-xl text-gray-300 mb-12 max-w-2xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          Una web interactiva para entender nuestra época
        </p>
        
        <button
          onClick={scrollToTimeline}
          className="relative z-10 px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-gray-900 rounded-full font-bold text-lg hover:from-orange-400 hover:to-amber-400 transition-all shadow-lg shadow-orange-500/50 animate-fade-in-up"
          style={{animationDelay: '0.6s'}}
        >
          Explorar la línea de tiempo
        </button>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="min-h-screen py-20 px-6 relative overflow-hidden">
        {/* Illustrated background - Path through ages */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="timelineSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#0f172a', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#1e293b', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#timelineSky)" />
          {/* Winding path/timeline */}
          <path d="M-100,800 Q400,700 800,600 T1600,400 T2400,300" 
                stroke="#fbbf24" strokeWidth="6" fill="none" opacity="0.6" strokeDasharray="20,10" />
          {/* Ancient structures silhouettes */}
          <rect x="100" y="650" width="80" height="150" fill="#1a1a2e" opacity="0.8" />
          <polygon points="140,650 100,620 180,620" fill="#1a1a2e" opacity="0.8" />
          {/* City skyline */}
          <rect x="1200" y="500" width="40" height="300" fill="#1a1a2e" opacity="0.7" />
          <rect x="1250" y="450" width="50" height="350" fill="#1a1a2e" opacity="0.8" />
          <rect x="1310" y="480" width="45" height="320" fill="#1a1a2e" opacity="0.7" />
          {/* Additional details */}
          <circle cx="400" cy="700" r="8" fill="#fbbf24" opacity="0.5" />
          <circle cx="800" cy="600" r="8" fill="#fbbf24" opacity="0.5" />
          <circle cx="1200" cy="500" r="8" fill="#fbbf24" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-20 text-glow-white">
            Nuestro crecimiento como especie
          </h2>

          {/* Stage Display */}
          <div 
            className="relative min-h-[600px] mb-16"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Scroll hint */}
            {showScrollHint && currentStage === 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm animate-bounce z-20 flex items-center gap-2">
                <span>←</span> Desliza para explorar <span>→</span>
              </div>
            )}
            
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-20">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
              />
            </div>

            {stages.map((stage, idx) => (
              <TimelineStage
                key={stage.id}
                stage={stage}
                isActive={currentStage === idx}
              />
            ))}
          </div>

          {/* Navigation with autoplay */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
              disabled={currentStage === 0}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-2">
              {stages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStage(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentStage === idx
                      ? 'bg-white w-8'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentStage(Math.min(stages.length - 1, currentStage + 1))}
              disabled={currentStage === stages.length - 1}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Autoplay toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="px-6 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
            >
              {autoPlay ? '⏸' : '▶'} {autoPlay ? 'Pausar' : 'Reproducir automático'}
            </button>
          </div>
        </div>
      </section>

      {/* Futures Section */}
      <section className="pt-20 pb-6 px-6 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
        {/* Illustrated background - Multiple paths diverging */}
        <svg className="absolute inset-0 w-full h-full opacity-25 parallax-slow" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="futuresSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#0a0a1a', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#1a0b2e', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#2d1b4e', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#futuresSky)" />
          {/* Three diverging paths */}
          <path d="M960,900 L960,700 L700,500" 
                stroke="#4A9B6F" strokeWidth="5" fill="none" opacity="0.7" strokeDasharray="10,5" />
          <path d="M960,900 L960,650 L960,400" 
                stroke="#6B7280" strokeWidth="5" fill="none" opacity="0.7" strokeDasharray="10,5" />
          <path d="M960,900 L960,700 L1220,500" 
                stroke="#7C2D12" strokeWidth="5" fill="none" opacity="0.7" strokeDasharray="10,5" />
          {/* Future city left (green) */}
          <rect x="650" y="450" width="30" height="80" fill="#4A9B6F" opacity="0.6" />
          <rect x="690" y="470" width="25" height="60" fill="#4A9B6F" opacity="0.6" />
          <rect x="625" y="480" width="20" height="50" fill="#4A9B6F" opacity="0.5" />
          {/* Neutral structures center */}
          <rect x="950" y="350" width="20" height="50" fill="#6B7280" opacity="0.6" />
          <rect x="975" y="370" width="18" height="30" fill="#6B7280" opacity="0.5" />
          {/* Broken structures right (red) */}
          <polygon points="1200,520 1180,500 1220,500" fill="#7C2D12" opacity="0.6" />
          <rect x="1200" y="520" width="20" height="30" fill="#7C2D12" opacity="0.6" />
          <path d="M1215,505 L1225,515" stroke="#7C2D12" strokeWidth="2" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-6 text-glow-white">
            ¿En qué tipo de adultos podemos convertirnos?
          </h2>
          
          {/* Temporal window explanation */}
          <div className="max-w-3xl mx-auto mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Cuándo dejaríamos de ser adolescentes como especie?
            </h3>
            <div className="text-gray-200 leading-relaxed space-y-3">
              <p>
                Si la humanidad fuera una persona, hoy tendría unos 15 años. Convertirnos en adultos no depende del calendario, sino de las decisiones colectivas que tomemos.
              </p>
              <p>
                Pero si usamos el paralelismo humano, la adultez ocurre entre los 20 y los 25 años. En escala histórica, esto equivale a que nuestra especie podría alcanzar la madurez dentro de 200 a 500 años, si elegimos un camino de crecimiento.
              </p>
              <p>
                También podríamos quedarnos estancados… o no llegar nunca a la adultez. Esa ventana es nuestro momento más formativo y también el más peligroso.
              </p>
            </div>
          </div>
          
          {/* Línea divisoria elegante */}
          <div className="w-16 h-0.5 bg-white/20 mx-auto mt-4 mb-6 rounded-full"></div>
          
          <p className="text-xl text-gray-300 text-center mb-8 max-w-3xl mx-auto">
            Tres futuros posibles. Ninguno está garantizado. Todos dependen de lo que elijamos hacer hoy.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {futures.map(future => (
              <FutureCard key={future.id} future={future} />
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section id="quiz" className="py-20 px-6 bg-gradient-to-b from-gray-900 via-indigo-900/20 to-gray-900 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-6 text-glow-white">
            ¿En qué etapa estás tú?
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Respondé este breve quiz y descubrí tu madurez individual
          </p>

          {!quizResult ? (
            <div className="bg-gray-800/80 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50">
              <QuizComponent onComplete={setQuizResult} />
            </div>
          ) : (
            <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50 text-center">
              <h3 className="text-3xl font-bold mb-4 text-glow">
                Eres: {quizResult.stage}
              </h3>
              <p className="text-lg text-gray-300 mb-6">{quizResult.description}</p>
              <p className="text-gray-400 mb-8">{quizResult.message}</p>
              <button
                onClick={() => setQuizResult(null)}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-gray-900 rounded-full font-bold hover:from-orange-400 hover:to-amber-400 transition-all"
              >
                Volver a hacer el quiz
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="ml-4 px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all"
              >
                Compartir resultado
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-6" onClick={() => setShowShareModal(false)}>
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6 text-center">Compartir</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => shareProject('x')} className="p-4 bg-black hover:bg-gray-900 rounded-xl font-semibold transition-colors">
                𝕏 (Twitter)
              </button>
              <button onClick={() => shareProject('facebook')} className="p-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors">
                Facebook
              </button>
              <button onClick={() => shareProject('instagram')} className="p-4 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 rounded-xl font-semibold transition-colors">
                Instagram
              </button>
              <button onClick={() => shareProject('whatsapp')} className="p-4 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-colors">
                WhatsApp
              </button>
              <button onClick={() => shareProject('linkedin')} className="p-4 bg-blue-700 hover:bg-blue-800 rounded-xl font-semibold transition-colors col-span-2">
                LinkedIn
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="mt-6 w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Maturity Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-6">
            ¿Qué significa madurar como especie?
          </h2>
          <div className="mx-auto mt-4 mb-12 w-16 h-[2px] bg-white/20 rounded-full" />

          <p className="text-gray-200 leading-relaxed text-lg mb-8 max-w-[720px] mx-auto">
            Madurar como especie no es dejar de cometer errores, sino aprender a qué costo queremos seguir cometiéndolos. No se trata de volvernos perfectos, sino de asumir que nuestras decisiones tienen impacto en millones de vidas y en un planeta finito.
          </p>

          <p className="text-gray-300 text-lg mb-6 max-w-[720px] mx-auto">
            Algunas señales de madurez serían:
          </p>

          <ul className="space-y-4 max-w-[720px] mx-auto">
            {[
              "Ampliar nuestro círculo de empatía: que 'nosotros' incluya a personas de otros países, culturas y también a las generaciones que todavía no nacieron.",
              "Aceptar límites reales: entender que ni el crecimiento ni el consumo pueden ser infinitos en un mundo que sí lo es.",
              "Integrar ciencia y ética: no solo preguntarnos qué podemos hacer técnicamente, sino qué deberíamos hacer moralmente.",
              "Sostener el desacuerdo sin destruirnos: poder discutir proyectos de país, modelos económicos o creencias profundas sin que eso implique guerra o exterminio del otro.",
              "Cuidar los vínculos tanto como las infraestructuras: entender que las redes afectivas y comunitarias son tan importantes como las redes eléctricas o de datos.",
              "Dejar un mundo habitable, no solo 'más avanzado': progreso no es tener mejores dispositivos, sino mejores posibilidades de vida para quienes vienen después."
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300">
                <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-gray-200 leading-relaxed text-lg mt-8 max-w-[720px] mx-auto">
            Madurar como especie, en resumen, sería pasar de preguntarnos "qué podemos hacer" a preguntarnos "qué tipo de mundo queremos sostener juntos".
          </p>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-20 px-6 bg-gray-800/30 relative overflow-hidden">
        {/* Illustrated background - Hands reaching/building */}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="actionSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#0f172a', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#1e293b', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#actionSky)" />
          {/* Network of connections */}
          <circle cx="300" cy="300" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="700" cy="400" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="1100" cy="350" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="500" cy="600" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="900" cy="650" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          {/* Connecting lines */}
          <line x1="300" y1="300" x2="700" y2="400" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="700" y1="400" x2="1100" y2="350" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="300" y1="300" x2="500" y2="600" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="700" y1="400" x2="900" y2="650" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="500" y1="600" x2="900" y2="650" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="1100" y1="350" x2="900" y2="650" stroke="#fbbf24" strokeWidth="2" opacity="0.3" />
          {/* Center nodes */}
          <circle cx="300" cy="300" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="700" cy="400" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="1100" cy="350" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="500" cy="600" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="900" cy="650" r="10" fill="#fbbf24" opacity="0.7" />
        </svg>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold text-center mb-6">
            Qué podemos hacer hoy
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Siendo adolescentes con tecnología de adulto
          </p>

          <p className="text-gray-200 leading-relaxed text-lg mb-12 max-w-[720px] mx-auto">
            No podemos decidir solos el futuro de la humanidad, pero sí podemos influir en la dirección en la que empujamos. Lo que hagamos a escala individual, comunitaria y política no es suficiente por sí solo, pero tampoco es irrelevante.
          </p>

          <div className="space-y-12 max-w-[720px] mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">1. A nivel personal</h3>
              <ul className="space-y-3">
                {[
                  "Cuidar nuestra salud mental y emocional como algo serio, no como un lujo",
                  "Practicar la empatía activa: escuchar historias distintas a la nuestra sin necesidad de estar de acuerdo",
                  "Revisar nuestras propias formas de consumo, información y tiempo: ¿qué estamos alimentando todos los días?",
                  "Aprender de forma continua, especialmente sobre temas que nos incomodan o no entendemos"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-4">2. A nivel comunitario</h3>
              <ul className="space-y-3">
                {[
                  "Participar en proyectos locales que mejoren algo concreto: comedores, espacios culturales, cooperativas, mutuales, centros educativos, etc.",
                  "Apoyar y fortalecer redes de cuidado: grupos de apoyo, redes barriales, colectivos que defienden derechos básicos",
                  "Generar y compartir contenido que eleve la conversación, en lugar de sumarse al ruido o al odio automático",
                  "Crear espacios donde se pueda hablar de futuro sin caer solo en el catastrofismo ni en la fantasía ingenua"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-4">3. A nivel institucional y político</h3>
              <ul className="space-y-3">
                {[
                  "Informarse antes de votar o apoyar decisiones de gran escala, aunque lleve tiempo y esfuerzo",
                  "Exigir transparencia, rendición de cuentas y límites claros a quienes tienen poder económico, político o tecnológico",
                  "Apoyar políticas que reduzcan daños sistémicos (cambio climático, desigualdad extrema, violencia) aunque no nos beneficien de forma inmediata",
                  "Impulsar que la educación incluya pensamiento crítico, alfabetización digital, ética y habilidades emocionales, no solo contenidos técnicos"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-gray-200 leading-relaxed text-lg mt-12 max-w-[720px] mx-auto">
            No podemos elegir si la humanidad va a dejar de ser adolescente mañana. Pero sí podemos decidir si cada gesto nuestro refuerza la parte más destructiva de la adolescencia… o la parte que aprende, repara y crece.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">
            Compartí esta reflexión
          </h2>
          <div className="mx-auto mt-4 mb-8 w-16 h-[2px] bg-white/20 rounded-full" />
          
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <button onClick={() => shareProject('twitter')} className="px-6 py-3 bg-blue-400 hover:bg-blue-500 rounded-full font-semibold transition-colors">
              🐦 Twitter
            </button>
            <button onClick={() => shareProject('facebook')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors">
              📘 Facebook
            </button>
            <button onClick={() => shareProject('whatsapp')} className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full font-semibold transition-colors">
              💬 WhatsApp
            </button>
            <button onClick={() => shareProject('linkedin')} className="px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded-full font-semibold transition-colors">
              💼 LinkedIn
            </button>
          </div>

          <div className="text-gray-300 space-y-4 max-w-[720px] mx-auto">
            <p className="leading-relaxed">
              Este ensayo interactivo fue creado como una metáfora para entender dónde estamos como especie y hacia dónde podríamos ir.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Idea y texto original:</strong> Alejandro Miranda (Alejano910 - Curioso Profesional y Emprendedor)
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Desarrollo interactivo:</strong> Colaboración entre humanos e inteligencias artificiales.
            </p>
            <p className="leading-relaxed mt-8 text-center text-gray-400">
              No pretende dar respuestas definitivas, sino abrir una conversación:<br />
              Si la humanidad tiene apenas 15 años… ¿qué tipo de adultos queremos ser?
            </p>
          </div>
        </div>
      </footer>

      {/* Footer minimalista */}
      <footer className="text-center text-white/40 text-sm py-10 mt-20 border-t border-white/10">
        Creado por Alejano910 · 2025
      </footer>

      {/* Botón flotante "Volver arriba" con sound toggle */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-12 h-12 rounded-full bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur text-white flex items-center justify-center transition shadow-lg"
          aria-label="Toggle sound"
          title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        
        {/* Back to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white flex items-center justify-center transition shadow-lg"
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          ↑
        </button>
      </div>
      </div>
    </div>
  );
}
