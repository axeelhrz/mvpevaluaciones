import { createAdminClient } from '../lib/supabase/server';

const TEXTO_BIENVENIDA = `Estimado participante:

Te damos una cordial bienvenida a la evaluación en línea. El tiempo estimado para resolver el cuestionario es de 30 minutos y nos dará información valiosa sobre tu forma de ser en el trabajo.

Te recomendamos realizar la evaluación en una sola aplicación y de preferencia en condiciones que te permitan concentrarte.

La prueba consta de 3 secciones. En la primera se te pedirá información únicamente para tener un control estadístico de tus respuestas. La segunda y la tercera corresponden propiamente a la evaluación.

En medida que vayas avanzando se te darán instrucciones para responder correctamente.

Adelante.`;

const INSTRUCCIONES_SECCION_2 = `Instrucciones Segunda Sección

En la siguiente sección se te presentarán pares de afirmaciones. Las afirmaciones pueden mostrar rasgos, comportamientos o actitudes con los que te podrás sentir más o menos identificado.

Para responder, deberás señalar para cada par de afirmaciones con cuál te identificas Más y con cuál te identificas Menos.

Toma en cuenta que solo se te permitirá elegir una opción de respuesta para cada afirmación.

Para facilitar tu elección, te recomendamos lo siguiente:

1. Primero lee atentamente cada una de las 2 afirmaciones.
2. Evalúa mentalmente qué tan identificado te sientes con cada afirmación, según sea tu caso particular.
3. Señala cuál es la afirmación con la que te identificas Más y con cuál Menos.

Para facilitar tus respuestas, también puedes pensar en cuál es la afirmación que es "Mayormente cierta" y cuál es "Mayormente Falsa".

Nota: Si te sientes igualmente identificado con las dos afirmaciones, o si sientes que no te identificas con ninguna, para ayudarte a elegir, piensa en lo que crees que diría de ti alguien que sea muy cercano a ti, o bien; escoge la afirmación que refleje el comportamiento que creas más posible de suceder en tu caso.

Considera que para este cuestionario no existen respuestas correctas o incorrectas sino que solo reflejan tu manera de ser, por lo que te pedimos contestar con total honestidad.

Agradecemos mucho tu tiempo y disposición.`;

const INSTRUCCIONES_SECCION_3 = `¡Felicidades! Has completado la segunda sección.

En esta última sección notarás que a diferencia de la anterior, las afirmaciones tienen un sentido negativo. Es decir, las afirmaciones reflejarán dificultades, inhabilidades, comportamientos o actitudes que también deberás comparar con tu forma de ser, sentir, pensar y actuar.

El procedimiento para responder es el mismo que en la sección anterior. Para cada par de afirmaciones deberás elegir con cuál de las dos afirmaciones te identificas Más y con cuál Menos.

Recuerda que si te sientes identificado con las dos afirmaciones por igual, o si no te identificas con ninguna, piensa en lo que crees que diría alguien que sea muy cercano a ti, o bien; escoge la afirmación que refleje el comportamiento más posible de suceder de acuerdo a tu caso particular.

Adelante. Continúa con la tercera sección.`;

const INSTRUCCIONES_SECCION_4 = `Instrucciones Cuarta Sección

A continuación encontrarás una serie de afirmaciones sobre rasgos que describen comportamientos relacionados con tu forma de administrar tus recursos.

Para cada afirmación, deberás seleccionar la casilla de la opción que más se acerque a tu situación particular.

Verás que las opciones de respuesta pretenden identificar qué tan Falsa o Verdadera es cada afirmación aplicada a tu caso.

Al responder, considera que la escala indica:
(1) Falso Completamente
(2) Moderadamente Falso
(3) Ni Falso ni Verdadero
(4) Moderadamente Verdadero
(5) Verdadero Completamente

Considera también que no existen respuestas buenas ni malas y que tu encuesta será tratada de manera absolutamente confidencial, por ello te pedimos que respondas con total honestidad.

Agradecemos mucho tu tiempo y disposición.

Adelante. Continúa con el cuestionario.`;

// Campos estadísticos
const camposEstadisticos = [
  { nombre: 'correo', etiqueta: 'Correo electrónico', tipo: 'email', obligatorio: true, orden: 1 },
  { nombre: 'nombreCompleto', etiqueta: 'Nombre y apellidos', tipo: 'text', obligatorio: true, orden: 2 },
  { nombre: 'situacionLaboral', etiqueta: 'Situación Laboral', tipo: 'text', obligatorio: true, orden: 3 },
  { nombre: 'genero', etiqueta: 'Género', tipo: 'text', obligatorio: true, orden: 4 },
  { nombre: 'edad', etiqueta: 'Edad', tipo: 'number', obligatorio: true, orden: 5 },
  { nombre: 'paisCiudad', etiqueta: 'País y Ciudad de residencia', tipo: 'text', obligatorio: true, orden: 6 },
  { 
    nombre: 'nivelAcademico', 
    etiqueta: 'Nivel Académico', 
    tipo: 'select', 
    obligatorio: true, 
    orden: 7,
    opciones: ['Secundaria', 'Preparatoria', 'Licenciatura', 'Superior a licenciatura']
  },
  { nombre: 'areaEspecializacion', etiqueta: '¿A qué te dedicas? (Tu área de especialización)', tipo: 'text', obligatorio: true, orden: 8 },
  { nombre: 'puestoActual', etiqueta: '¿Cuál es tu puesto actual? Si estás desempleado, escribe por favor tu último puesto.', tipo: 'text', obligatorio: true, orden: 9 },
  { nombre: 'areasExperiencia', etiqueta: 'Menciona las 3 áreas en las que tengas mayor experiencia (por ejemplo: Ventas, Almacén, Operaciones, Reclutamiento)', tipo: 'textarea', obligatorio: true, orden: 10 },
  { 
    nombre: 'nivelMaximo', 
    etiqueta: 'Nivel máximo alcanzado', 
    tipo: 'select', 
    obligatorio: true, 
    orden: 11,
    opciones: ['Analista o Especialista', 'Supervisor, Jefe o Coordinador', 'Gerente', 'Subdirector, Director o Superior']
  },
  { 
    nombre: 'ingresoMaximo', 
    etiqueta: 'Ingreso máximo alcanzado', 
    tipo: 'select', 
    obligatorio: true, 
    orden: 12,
    opciones: ['Hasta 10,000 pesos', 'De 11,000 a 20,000 pesos', 'De 21,000 a 30,000 pesos', 'De 31,000 a 40,000', '41,000 a 50,000', 'Más de 51,000']
  }
];

// Pares de la Sección 2 (Positivos)
const paresSeccion2 = [
  { a: 'Planeo certificarme formalmente sobre un tema que me interesa', b: 'Soy bueno para ayudar a los demás a decidirse' },
  { a: 'Tengo una habilidad que podría beneficiar a muchas personas', b: 'Soy bueno para hacer las cosas suceder' },
  { a: 'Sé perfectamente a qué me gustaría dedicarme en el futuro', b: 'Me entusiasma pensar en todo lo que estoy haciendo actualmente' },
  { a: 'Soy una persona precavida', b: 'Me doy cuenta fácilmente de lo que debo cambiar en mí para mejorar mis resultados' },
  { a: 'Me reconozco y felicito por mis aciertos en cada paso del camino', b: 'Busco proactivamente convertirme en la mejor versión de mí mismo' },
  { a: 'En situaciones de crisis puedo mantenerme enfocado en las tareas importantes', b: 'Hago lo necesario por mantenerme actualizado' },
  { a: 'Establezco estándares de desempeño claros para mí mismo y los uso de referencia para evaluar mi comportamiento', b: 'Deseo adquirir la mayor cantidad de experiencia y conocimientos posible' },
  { a: 'Facilito las cosas para que las oportunidades vengan a mí', b: 'Siento un llamado por ayudar a hacer de este un mundo mejor' },
  { a: 'Dedico mi tiempo y energía exclusivamente a las actividades que me acercan a mis objetivos', b: 'Me animo a creer que en mi vida sucederán cosas significativas y extraordinarias' },
  { a: 'Adelanto mi trabajo para estar listo por si algo se llega a necesitar', b: 'Cuando un problema no está siendo fácil de resolver, sigo intentándolo hasta encontrar la respuesta' },
  { a: 'Siempre guardo algo de lo que gano', b: 'Evalúo muy bien mis decisiones antes de tomarlas' },
  { a: 'En este momento puedo identificar claramente cuál es mi estado emocional', b: 'Puedo predecir el comportamiento de las personas' },
  { a: 'Me siento bien de ser yo mismo', b: 'Me gano la vida haciendo lo que más me gusta' },
  { a: 'Si algo no sale como quiero me recupero rápidamente y lo vuelvo a intentar', b: 'Cuando estoy estresado puedo pensar con claridad' },
  { a: 'La gente confía en mí para administrar el dinero', b: 'Para cumplir con todas mis responsabilidades me aseguro de conseguir la ayuda que necesito' },
  { a: 'Me esfuerzo por ser una mejor persona', b: 'Fácilmente encuentro relaciones entre variables que parecen ser distintas' },
  { a: 'Observo mi situación financiera con regularidad', b: 'Puedo negociar temas difíciles sin perder la calma' },
  { a: 'Me concentro en las tareas que debo hacer, incluso si no me gustan', b: 'Soy hábil para hacer que el dinero me rinda para todo' },
  { a: 'Sé muy bien cuáles son las capacidades que los demás valoran en mí', b: 'Estoy convencido de que el trabajo que hago es útil para los demás' },
  { a: 'He sabido cómo aprovechar mis habilidades y talentos para alcanzar el nivel que hoy tengo', b: 'Estoy decidido a ser El Mejor en lo que hago' },
  { a: 'Me esfuerzo por mejorar mis capacidades', b: 'Aún bajo estrés puedo realizar mis tareas sin equivocarme' },
  { a: 'Preveo situaciones y reacciono a ellas antes de que sucedan', b: 'Tengo una idea clara del futuro que quiero para mí' },
  { a: 'Mantengo un alto nivel de dinamismo y energía', b: 'Me siento impulsado a marcar una diferencia positiva en mi entorno' },
  { a: 'Me preocupa que mi trabajo ayude a otras personas a mejorar su vida de alguna forma', b: 'Frecuentemente estoy ideando nuevas formas para mejorar mis resultados' },
  { a: 'Sé que puedo resolver problemas difíciles si me esfuerzo lo suficiente', b: 'Puedo controlar mi temperamento cuando es necesario' },
  { a: 'Me hago responsable de mi propio aprendizaje', b: 'Puedo ver claramente la estrategia que debo seguir para lograr lo que más deseo en la vida' },
  { a: 'Pongo atención a mi comportamiento para detectar lo que me funciona y lo que no', b: 'Cuando quiero algo, no descanso hasta conseguirlo' },
  { a: 'Espero de mí mismo marcar una diferencia significativa para muchas personas', b: 'Estoy convencido de que la manera de producir los mayores resultados es sumando pequeños logros uno a otro' },
  { a: 'Constantemente estoy buscando mejores formas de hacer las cosas', b: 'Yo jamás he ofrecido dinero para acelerar un trámite' },
  { a: 'Me esfuerzo un montón por lograr y superar los estándares fijados', b: 'Detecto oportunidades mucho antes de que otros puedan' },
  { a: 'A lo largo de mi trayectoria he construido una excelente reputación', b: 'Pretendo lograr el mayor éxito financiero y profesional posible en mi vida' },
  { a: 'Adquiero conocimientos para estar a la altura de lo que está sucediendo hoy en el mundo', b: 'Me es fácil encontrar múltiples soluciones a un mismo problema' },
  { a: 'Tomo decisiones que me ayudan a fortalecer mi posición', b: 'Soy positivo cuando pienso en el futuro' },
  { a: 'Me esfuerzo cada día para ser mejor en lo que hago', b: 'Si me equivoco, puedo cambiar de estrategia pero sigo adelante' },
  { a: 'Rechazo las oportunidades de trabajo que no corresponden a mis mayores intereses', b: 'Comprendo bien mis emociones' },
  { a: 'Rápidamente puedo percibir los cambios del entorno', b: 'Sé muy bien adónde quiero llegar en la vida' },
  { a: 'Me adapto bien a los cambios de rutinas', b: 'Me divierte realizar juegos mentales que ponen a prueba mi inteligencia' },
  { a: 'Tengo la firme expectativa de mejorar notablemente para el próximo año', b: 'Cuando se trata de dinero, tomo decisiones fría, racional y concienzudamente' },
  { a: 'Cuando algo no sale como quiero enfoco rápidamente mi energía en soluciones constructivas', b: 'En el último año he conseguido todo lo que me he propuesto' },
  { a: 'Hoy hago cosas que son importantes para mí', b: 'Actúo racionalmente ante las dificultades' },
  { a: 'Conozco muy bien cuáles son las cosas que me enojan o me ponen triste', b: 'Me implico en actividades que me ayudan a superarme a mí mismo' },
  { a: 'Difícilmente dejo algún pendiente sin completar', b: 'Pretendo recibir la máxima educación disponible que hay en mi campo' },
  { a: 'Puedo trabajar horas extra sin perder efectividad en mi trabajo', b: 'Tengo la certeza de que me irá bien en la vida' },
  { a: 'Si tengo un objetivo ambicioso, lo fracciono en metas cortas para ir un paso a la vez', b: 'Me administro de una forma que siempre me queda algo para ahorrar' },
  { a: 'Reacciono con la urgencia apropiada en situaciones de peligro', b: 'Vivo mi vida con un alto compromiso y sentido del deber' },
  { a: 'Creo en mí para lograr lo que pretendo', b: 'Procuro y fomento mis relaciones' },
  { a: 'Antes de hacer algo, dedico suficiente tiempo a planear', b: 'Prefiero arriesgarme y perder que lamentarme luego por haber dejado ir una buena oportunidad' },
  { a: 'Me empeño en mejorar mis habilidades para producir mayores resultados', b: 'Me aseguro de encontrar la forma de lograr mis metas y objetivos' },
  { a: 'Me aseguro de administrar bien los saldos en mis tarjetas para evitar cargos financieros', b: 'Para resolver un problema, identifico soluciones posibles que otros pasan por alto' },
  { a: 'Puedo darme cuenta de mis emociones mientras estoy trabajando', b: 'Cuando me comprometo con algo mi voluntad es inquebrantable' },
  { a: 'Pienso bien de mí mismo', b: 'Para determinar la causa de un problema busco información más allá del evento específico que se ha presentado' },
  { a: 'Sé muy bien cuáles son las capacidades que debo desarrollar para tener éxito en mi camino', b: 'Busco activamente prepararme para los cambios venideros' },
  { a: 'Si no tengo los materiales que necesito, aprovecho creativamente los que tengo disponibles', b: 'Procuro rodearme de gente positiva y exitosa' },
  { a: 'Mis convicciones me guían para actuar en la vida', b: 'Me involucro activamente en los problemas de los grupos a los que pertenezco' },
  { a: 'Tengo claras mis metas de ahorro, a corto, mediano y largo plazo', b: 'Persigo mis sueños con empeño' },
  { a: 'Tengo control total sobre mi situación actual', b: 'Intervengo oportunamente para aclarar los malos entendidos' },
  { a: 'Si participo en una competencia, digo la verdad aunque los demás estén mintiendo', b: 'Intento entender cómo es que los factores de una situación están relacionados entre sí' },
  { a: 'Quisiera dedicarme a mi pasión y poder cobrar por ello', b: 'Siento que estoy en mi mejor momento' },
  { a: 'Soy hábil para ganarme la confianza de la gente', b: 'Conozco cuál es el trabajo que más quiero hacer en la vida' },
  { a: 'Me manejo bien en situaciones de crisis', b: 'Apoyo las ideas nuevas' },
  { a: 'Me empeño en hacer que mi trayectoria laboral vaya en ascenso', b: 'Contribuyo proactivamente para mejorar mi entorno de trabajo' },
  { a: 'Conozco cuál es mi vocación y planeo dedicarme a ella en un futuro próximo', b: 'Generalmente logro lo que me propongo' },
  { a: 'En los últimos años he tomado muy buenas decisiones con mi dinero', b: 'Me esfuerzo por hacer buenas relaciones en todos lados' },
  { a: 'Siempre dejo una buena impresión en los demás', b: 'Quiero ser considerado como una autoridad en mi campo' },
  { a: 'No permito que mis sentimientos interfieran con mi trabajo', b: 'La situación que vivo actualmente en mi vida me hace sentir en paz y en calma' },
  { a: 'Busco la manera de cumplir a tiempo con todas mis responsabilidades', b: 'Se me ocurren soluciones originales a los problemas a los que me enfrento' },
  { a: 'Cuando estoy trabajando en algo, le dedico toda mi atención', b: 'Me involucro propositivamente en los asuntos de mi comunidad' },
  { a: 'Para mí es prioritario ganarme la vida haciendo lo que más me gusta', b: 'Antes de tomar una decisión pienso en cómo un cambio puede impactar en otras situaciones' },
  { a: 'Sacrifico parte de mis ganancias para volverlas a invertir', b: 'Puedo con facilidad aislar mi mente del exterior para no distraerme' },
  { a: 'Identifico las habilidades que debo fortalecer en mí mismo para mejorar mis resultados', b: 'Aprendo de mis fracasos para intentarlo de nuevo' },
  { a: 'Si cometo un error, me aseguro que en el futuro no vuelva a suceder', b: 'Mi carácter me ayuda a levantarme fortalecido de las crisis' },
  { a: 'Pago mis deudas en su totalidad y en el plazo acordado', b: 'Disfruto intercambiar opiniones y llegar a consensos con personas que piensan diferente a mí' },
  { a: 'Estoy convencido de que tengo un alto poder de influencia en los demás', b: 'Soy obstinado con mis metas y objetivos' },
  { a: 'Me siento satisfecho con los resultados que hoy soy capaz de dar', b: 'Soy exigente conmigo mismo' },
  { a: 'Confío en que me irá bien en el futuro', b: 'Puedo hablar de temas difíciles con mi pareja sin entrar en discusiones' },
  { a: 'Analizo mis errores para aprender de ellos', b: 'Sé muy bien qué es lo que debo hacer para cambiar lo que quiero mejorar en mí mismo' },
  { a: 'Evalúo regularmente el progreso de mi trabajo para cumplir a tiempo con mis objetivos', b: 'Confío en mi capacidad para modificar lo que no me gusta de mi vida' },
  { a: 'Sé cómo persuadir a otros para que se pongan de mi lado', b: 'Puedo comprender fácilmente cómo piensan los demás' },
  { a: 'Siempre cumplo lo que prometo', b: 'Cuando hago planes me aseguro de que estén bien calculados hacia la meta' },
  { a: 'Mantengo contacto con las personas que he conocido en el camino', b: 'Escucho con atención y considero las aportaciones que hacen los demás' },
  { a: 'Rechazaría las ofertas de trabajo que no me permitieran dedicarme a lo que más me gusta hacer', b: 'Mantengo la calma en situaciones difíciles' },
  { a: 'Mi ahorro está creciendo', b: 'Dedico bastante tiempo y energía a mi propio desarrollo' },
  { a: 'Llevo un calendario y me apego a él para administrarme', b: 'Puedo mantenerme relajado en situaciones de presión' },
  { a: 'Estoy consciente de la forma en la que mis emociones afectan a los demás', b: 'Actúo proactivamente para resolver los contratiempos' },
  { a: 'Hago listas de pendientes que reviso y actualizo a lo largo del día', b: 'Suelo tener un plan B por si las cosas no salen como espero' },
  { a: 'A lo largo de la jornada doy el máximo todo el tiempo', b: 'Confío en mi capacidad para obtener un logro importante en un lapso de tiempo corto' },
  { a: 'Generalmente puedo anticipar cómo reaccionarán las personas que conozco ante una situación determinada', b: 'Aún en condiciones adversas me mantengo firme hasta el final' },
  { a: 'Disfruto encontrar conexiones poco usuales en la información que reviso', b: 'Me estoy esforzando en mi trabajo para mejorar mi situación en el mediano plazo' },
  { a: 'Me trazo a mí mismo objetivos concretos de aprendizaje en función de lo que quiero lograr', b: 'Nunca he hecho trampa para ganar' },
  { a: 'Me gusta participar con otras personas para lograr objetivos en común', b: 'Me preocupo por los problemas de mi país y me involucro en las soluciones' },
  { a: 'Me implico activamente en crear oportunidades que me generen ingresos', b: 'Sacrifico horas de sueño si es necesario para sacar adelante proyectos que para mí son importantes' },
  { a: 'Dirijo mi vida en la dirección que quiero ir', b: 'Puedo trabajar durante muchas horas manteniendo el mismo nivel de energía' },
  { a: 'Cuando se pide la participación de todos soy el primero en levantar la mano', b: 'Puedo adivinar la intención real de otras personas al hablar con ellos' },
  { a: 'Hoy estoy cumpliendo con mis propósitos de vida más importantes', b: 'Conozco las barreras que tendré que superar para lograr mis objetivos' },
  { a: 'Fácilmente puedo pensar en estrategias para diversificar mis inversiones', b: 'Si alguien no está participando me acerco para ayudarlo a involucrarse' },
  { a: 'Me comprometo con mis proyectos y objetivos hasta sus últimas consecuencias', b: 'Me aseguro de tener unas finanzas sanas' }
];

// Pares de la Sección 3 (Negativos)
const paresSeccion3 = [
  { a: 'Mantengo expectativas bajas para mí mismo', b: 'En situaciones difíciles me pongo serio y pierdo el sentido del humor' },
  { a: 'Actualmente no estoy desarrollando ninguna nueva habilidad que me ayude a hacer mejor mi trabajo', b: 'Me es difícil concentrar mi energía en la dirección que quiero ir' },
  { a: 'Cuando algo sale mal tiendo a quejarme, echar la culpa o señalar a las circunstancias', b: 'Prefiero alejarme de la gente' },
  { a: 'Me distraigo y pierdo el tiempo fácilmente', b: 'Generalmente las personas no me reconocen como autoridad' },
  { a: 'Me comprometo con entusiasmo pero luego se me olvida', b: 'Las cosas que se me ocurren son aburridas y poco creativas' },
  { a: 'Aceptaría cualquier trabajo porque sé que de todo puedo aprender muy rápido', b: 'Todavía no identifico qué es lo que quiero lograr en mi vida' },
  { a: 'Me es difícil anticipar mis cambios de ánimo', b: 'No veo cómo yo pueda resolver mis problemas actuales' },
  { a: 'Difícilmente me entero de lo que se está haciendo en otros campos diferentes al mío', b: 'No estoy disfrutando mi vida como me gustaría' },
  { a: 'Cuando no entiendo algo me desespero y lo abandono', b: 'Dudo que mi voto sea de mucha utilidad' },
  { a: 'Actualmente no invierto mi dinero', b: 'No veo sentido en exigirme demasiado' },
  { a: 'Muy poco se me ocurren ideas creativas y novedosas', b: 'Sospecho que yo mismo bloqueo las oportunidades, a veces sin darme cuenta' },
  { a: 'En los últimos seis meses me quedé sin dinero por lo menos una vez', b: 'Tengo un asunto no resuelto que me hace perder la concentración' },
  { a: 'Si me ofrecieran un trabajo para el que sé que no tengo capacidad suficiente, igual lo tomaría', b: 'Mi desempeño está por debajo de las expectativas' },
  { a: 'Algunos dirían que soy intolerante o que no acepto a las personas como son', b: 'Me esfuerzo poco para superarme a mí mismo' },
  { a: 'Frecuentemente soy el último en darse cuenta de que las cosas no van bien', b: 'Bajo estrés actúo con prisas y de forma descuidada' },
  { a: 'Con frecuencia confundo mis emociones', b: 'Mi desempeño se disminuye en situaciones de mucha exigencia' },
  { a: 'Me dejo llevar por lo que opinan los demás', b: 'A veces aparento tener virtudes que en realidad no poseo' },
  { a: 'Mi nivel de ingreso se ha mantenido igual desde hace años', b: 'Se me dificulta reconocer mis errores y fracasos' },
  { a: 'Soy capaz de mentir para librarme de problemas', b: 'A veces siento que no soy lo suficientemente bueno para lograr lo que quiero' },
  { a: 'Desarrollar nuevas habilidades no es prioritario para mí en este momento', b: 'Me cuesta entender los sentimientos de otras personas' },
  { a: 'No tengo muchos motivos para enorgullecerme de mí mismo', b: 'Pierdo mucho tiempo buscando mis cosas cuando las necesito' },
  { a: 'No arriesgaría recursos propios para abrir un negocio', b: 'Se me dificulta cumplir a tiempo con mis obligaciones' },
  { a: 'Me desanimo con facilidad ante los obstáculos', b: 'Se me ocurren ideas pero me cuesta llevarlas a la práctica' },
  { a: 'Prefiero ser conservador y esperar lo menos de la vida', b: 'En ocasiones soy inconstante o indisciplinado' },
  { a: 'Se me dificulta reconocer las buenas oportunidades de negocio', b: 'Me es difícil darme cuenta cuando alguien me está mintiendo' },
  { a: 'Trabajo mucho pero consigo pocos resultados', b: 'He alterado la verdad cuando ha sido necesario para zafarme de problemas' },
  { a: 'Compro cosas sin pensarlo lo suficiente', b: 'Desde la última vez que fracasé no estoy intentando nada nuevo' },
  { a: 'Desconozco cómo es que los cambios en el entorno pudieran afectar mis planes', b: 'Se me dificulta relacionarme con los demás' },
  { a: 'Los problemas me crecen por no atender a tiempo mis asuntos', b: 'Al discutir con mi pareja (o familia) pierdo rápidamente la paciencia' },
  { a: 'Intento concentrarme pero pierdo el foco con facilidad', b: 'Hacer una contribución importante al mundo no es algo que me preocupe por el momento' },
  { a: 'A veces creo que me quejo mucho pero no propongo', b: 'Dudo de mi capacidad para convencer a otros' },
  { a: 'Me es difícil imaginar cómo será mi vida dentro de unos años', b: 'Soy muy permisivo con los demás' },
  { a: 'Quiero hacer muchas cosas pero me canso con facilidad', b: 'Se me dificulta tomar decisiones bajo estrés' },
  { a: 'Soy desordenado con mis finanzas', b: 'Me cuesta aceptarme como soy' },
  { a: 'Desconozco qué opciones tengo para invertir mi dinero', b: 'Seguir estudiando es lo último que haría' },
  { a: 'Desconozco de qué forma podría aprovechar mis talentos para generar mayores ingresos', b: 'Pospongo lo más que puedo las tareas que no me gustan' },
  { a: 'En una emergencia se me dificulta mantenerme concentrado', b: 'Tiendo a dejar que se me acumulen los pendientes' },
  { a: 'Dudo que mis circunstancias puedan mejorar para el mes que viene', b: 'Estoy poco enterado de los problemas que hay en el mundo' },
  { a: 'A veces hago las cosas sin seguir un orden lógico', b: 'Inicio con fuerza pero pasado un tiempo, dejo de dar seguimiento a mis avances' },
  { a: 'Tiendo a perder la paciencia', b: 'Me frustra darme cuenta de lo limitado que hoy me siento' },
  { a: 'Abandono las tareas que me exigen demasiado esfuerzo', b: 'Hay veces en las que tomar algo que no es tuyo puede estar justificado' },
  { a: 'Me es difícil apegarme a los acuerdos que hago otras personas', b: 'Me rindo cuando las cosas parecen no tener solución' },
  { a: 'Me cuesta prever las consecuencias de mis actos', b: 'Cuando las cosas no van bien, pienso que debería darme por vencido' },
  { a: 'Cuando las cosas se tornan complicadas me es difícil saber qué es lo correcto de hacer', b: 'Me hace falta tener más energía para completar mis actividades del día' },
  { a: 'Desconozco el camino que debo seguir para hacer realidad mi visión personal', b: 'A menos que sea absolutamente necesario, no estoy dispuesto a cambiar mi forma de trabajo' },
  { a: 'Se me dificulta pensar ideas innovadoras', b: 'Me cierro a vivir nuevas experiencias' },
  { a: 'Me resulta difícil disfrutar de mi vida', b: 'Prefiero trabajar solo' },
  { a: 'Me cuesta trabajo hablar en público', b: 'A veces tengo que pedir prestado para cumplir con mis gastos del mes' },
  { a: 'Prefiero no tener un plan y dejar que la vida me sorprenda', b: 'Cuando estoy estresado suelo reaccionar de mal modo con los demás' },
  { a: 'Para reconocer mis errores, necesito que otros me los hagan ver', b: 'He dejado que otros paguen las consecuencias de mis malas decisiones' },
  { a: 'Soy insensible a los problemas ajenos', b: 'Entrar en contacto con otras personas me pone nervioso' },
  { a: 'Se me dificulta relacionar conceptos complejos o ideas muy abstractas', b: 'No acostumbro seguir un presupuesto de gasto' },
  { a: 'Es difícil que cambie mi forma de hacer las cosas aunque me de cuenta de que no me están funcionando', b: 'Es raro que me ponga a investigar que está sucediendo en mi país o en el mundo' },
  { a: 'Dudo tener el talento que se necesita para lograr el éxito que pretendo', b: 'Los proyectos en los que estoy involucrado obstaculizan mi camino hacia mis ideales' },
  { a: 'Me siento preocupado por temas de dinero', b: 'Me va mejor en trabajos de baja responsabilidad' },
  { a: 'Mis emociones tienden a afectar mi objetividad', b: 'Desconfío del futuro y de las nuevas ideas' },
  { a: 'Todavía no tengo claro cuál es mi propósito en la vida', b: 'La gente diría que me cuesta mucho reponerme de los fracasos' },
  { a: 'Tiendo a dejar las cosas para después', b: 'Desconozco cuánto debo, cuánto gano o cuánto tengo' },
  { a: 'Me doy cuenta que estoy equivocado hasta que alguien me lo avisa', b: 'Me impaciento cuando alguien me platica sus problemas' },
  { a: 'Me siento intranquilo o irritable ante situaciones nuevas o cambiantes', b: 'Invariablemente me quedo sin dinero' },
  { a: 'Me enfada escuchar críticas sobre mi trabajo', b: 'Necesito supervisión para completar mis tareas' },
  { a: 'Acepto las nuevas oportunidades de trabajo aunque estas no correspondan a mi predilección', b: 'Si un libro se vuelve difícil de entender, lo abandono y comienzo uno nuevo' },
  { a: 'Conocer las razones del porqué de los problemas no es interesante para mí', b: 'Desconozco qué es lo que más me conviene hacer para lograr mis ideales' },
  { a: 'Cuando se me agota el entusiasmo inicial, abandono la actividad para ir por otra nueva', b: 'En situaciones de presión cometo más errores de lo normal' },
  { a: 'Funciono mejor en trabajos de baja responsabilidad', b: 'Invariablemente veo primero por mis propios intereses' },
  { a: 'En situaciones de conflicto pierdo el profesionalismo', b: 'En ocasiones actúo impulsivamente' },
  { a: 'Pierdo la motivación cuando las cosas no salen como quiero', b: 'No me motiva recibir reconocimientos por mi buen desempeño' },
  { a: 'Ignoro cuáles son los retos a los que se enfrentará mi profesión en el corto plazo', b: 'Es común que en las negociaciones con otros yo salga perdiendo' },
  { a: 'Me cuesta reconocer mis áreas de oportunidad', b: 'Tiendo a reaccionar a los problemas cuando ya se presentaron o cuando ya es demasiado tarde' },
  { a: 'Tengo planes, pero no hago mucho por traerlos a la práctica', b: 'Cometer errores me desanima al grado de pensar en renunciar a mi objetivo' },
  { a: 'Prefiero los trabajos de poca exigencia', b: 'Discutir temas difíciles con otros me pone irritable o de mal humor' },
  { a: 'Me preocupa la idea de no estar acompañado', b: 'Me frustro cuando pienso en mi situación actual' }
];

// Preguntas Likert Sección 4
const preguntasLikert = [
  'Tengo claras mis metas de ahorro, a corto, mediano y largo plazo.',
  'Gasto únicamente en lo necesario.',
  'Tengo un plan para incrementar mis ingresos en el corto plazo.',
  'Estoy ahorrando para un objetivo de largo plazo.',
  'Cuando se trata de dinero, tomo decisiones fría, racional y concienzudamente.',
  'Invierto mi dinero en opciones que son convenientes para mí.',
  'Nunca dejo ir una buena oportunidad para ganar un dinero extra.',
  'Siempre guardo algo de lo que gano.',
  'Me implico activamente en crear oportunidades que me generen ingresos.',
  'Realizo inversiones que me producen cada vez mejores rendimientos.',
  'Mis deudas están perfectamente controladas.',
  'Me administro de una forma que siempre me queda algo para ahorrar.',
  'Solo compro lo realmente necesario',
  'Al tomar decisiones de dinero me aseguro de obtener siempre el máximo rendimiento.',
  'Me aseguro de sacar el mayor provecho a los recursos que tengo disponibles.',
  'Estoy preparado para afrontar un imprevisto sin desestabilizar mis finanzas.',
  'De mis deudas siempre pago más del saldo mínimo.',
  'Actualmente estoy invirtiendo mi dinero.',
  'Compro cosas solo cuando tengo la certeza de que las podré pagar.',
  'Constantemente estoy ideando formas de ganar dinero.',
  'Acostumbro seguir un presupuesto de gasto.',
  'Sacrifico parte de mis ganancias para volverlas a invertir.',
  'Facilito las cosas para que el dinero venga a mí.',
  'Nunca gasto más de lo que gano.',
  'Acostumbro Adelantar pagos para acabar más rápido con mis compromisos.'
];

async function main() {
  console.log('🚀 Iniciando población del cuestionario completo...');
  
  const supabase = await createAdminClient();

  // 1. Crear el cuestionario principal
  console.log('\n📝 Creando cuestionario principal...');
  const { data: cuestionario, error: cuestionarioError } = await supabase
    .from('Cuestionario')
    .insert({
      titulo: 'Evaluación Psicofinanciera',
      descripcion: 'Evaluación completa de competencias psicofinancieras y habilidades de gestión de recursos',
      activo: true,
      textoInicio: TEXTO_BIENVENIDA,
      textoFinal: '¡Gracias por completar la evaluación! Tus respuestas han sido guardadas exitosamente.',
      mostrarProgreso: true,
      permitirRetroceso: false,
      tiempoLimite: 30
    })
    .select()
    .single();

  if (cuestionarioError) {
    console.error('❌ Error al crear cuestionario:', cuestionarioError);
    return;
  }

  console.log('✅ Cuestionario creado:', cuestionario.id);

  // 2. Crear campos estadísticos
  console.log('\n📊 Creando campos estadísticos...');
  for (const campo of camposEstadisticos) {
    const { error } = await supabase
      .from('CampoEstadistico')
      .insert({
        nombre: campo.nombre,
        etiqueta: campo.etiqueta,
        tipo: campo.tipo,
        obligatorio: campo.obligatorio,
        orden: campo.orden,
        opciones: campo.opciones || null,
        activo: true
      });

    if (error) {
      console.error(`❌ Error al crear campo ${campo.nombre}:`, error);
    } else {
      console.log(`✅ Campo creado: ${campo.nombre}`);
    }
  }

  // 3. Crear preguntas de pareamiento positivo (Sección 2)
  console.log('\n🔵 Creando preguntas de pareamiento positivo (96 pares)...');
  let ordenPregunta = 1;
  
  for (let i = 0; i < paresSeccion2.length; i++) {
    const par = paresSeccion2[i];
    
    const { error } = await supabase
      .from('Pregunta')
      .insert({
        cuestionarioId: cuestionario.id,
        tipo: 'pareamiento',
        texto: `${par.a}|||${par.b}`,
        orden: ordenPregunta,
        seccion: 'pareamiento_positivo',
        instrucciones: i === 0 ? INSTRUCCIONES_SECCION_2 : null,
        obligatoria: true
      });

    if (error) {
      console.error(`❌ Error al crear par ${i + 1}:`, error);
    } else {
      console.log(`✅ Par ${i + 1}/96 creado`);
    }
    
    ordenPregunta++;
  }

  // 4. Crear preguntas de pareamiento negativo (Sección 3)
  console.log('\n🟣 Creando preguntas de pareamiento negativo (72 pares)...');
  
  for (let i = 0; i < paresSeccion3.length; i++) {
    const par = paresSeccion3[i];
    
    const { error } = await supabase
      .from('Pregunta')
      .insert({
        cuestionarioId: cuestionario.id,
        tipo: 'pareamiento',
        texto: `${par.a}|||${par.b}`,
        orden: ordenPregunta,
        seccion: 'pareamiento_negativo',
        instrucciones: i === 0 ? INSTRUCCIONES_SECCION_3 : null,
        obligatoria: true
      });

    if (error) {
      console.error(`❌ Error al crear par negativo ${i + 1}:`, error);
    } else {
      console.log(`✅ Par negativo ${i + 1}/72 creado`);
    }
    
    ordenPregunta++;
  }

  // 5. Crear preguntas Likert (Sección 4)
  console.log('\n🟢 Creando preguntas Likert (25 preguntas)...');
  
  
for (let i = 0; i < preguntasLikert.length; i++) {
    const pregunta = preguntasLikert[i];
    
    const { error } = await supabase
      .from('Pregunta')
      .insert({
        cuestionarioId: cuestionario.id,
        tipo: 'likert',
        texto: pregunta,
        orden: ordenPregunta,
        seccion: 'habilidades_financieras',
        instrucciones: i === 0 ? INSTRUCCIONES_SECCION_4 : null,
        obligatoria: true,
        escalaMin: 1,
        escalaMax: 5,
        etiquetaMin: 'Falso Completamente',
        etiquetaMax: 'Verdadero Completamente',
        etiquetas: JSON.stringify([
          'Falso Completamente',
          'Moderadamente Falso',
          'Ni Falso ni Verdadero',
          'Moderadamente Verdadero',
          'Verdadero Completamente'
        ])
      });

    if (error) {
      console.error(`❌ Error al crear pregunta Likert ${i + 1}:`, error);
    } else {
      console.log(`✅ Pregunta Likert ${i + 1}/25 creada`);
    }
    
    ordenPregunta++;
  }

  console.log('\n✅ ¡Cuestionario completo poblado exitosamente!');
  console.log(`\n📊 Resumen:`);
  console.log(`   - Cuestionario ID: ${cuestionario.id}`);
  console.log(`   - Campos estadísticos: ${camposEstadisticos.length}`);
  console.log(`   - Pares positivos: ${paresSeccion2.length}`);
  console.log(`   - Pares negativos: ${paresSeccion3.length}`);
  console.log(`   - Preguntas Likert: ${preguntasLikert.length}`);
  console.log(`   - Total preguntas: ${paresSeccion2.length + paresSeccion3.length + preguntasLikert.length}`);
}

main()
  .then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });
