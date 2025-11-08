/**
 * Script para generar el archivo Reactivos.xlsx con los 168 pares de reactivos
 * 
 * Este script crea un archivo Excel con la estructura correcta para importar
 * los reactivos del sistema de pareamiento forzado.
 * 
 * Uso:
 * npx tsx scripts/generar-excel-reactivos.ts
 */

import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// DATOS DE LOS PARES
// ============================================

// Pares Positivos (96 pares - IDs 1-192)
const paresPositivos = [
  ['Planeo certificarme formalmente sobre un tema que me interesa', 'Soy bueno para ayudar a los demás a decidirse'],
  ['Tengo una habilidad que podría beneficiar a muchas personas', 'Soy bueno para hacer las cosas suceder'],
  ['Sé perfectamente a qué me gustaría dedicarme en el futuro', 'Me entusiasma pensar en todo lo que estoy haciendo actualmente'],
  ['Soy una persona precavida', 'Me doy cuenta fácilmente de lo que debo cambiar en mí para mejorar mis resultados'],
  ['Me reconozco y felicito por mis aciertos en cada paso del camino', 'Busco proactivamente convertirme en la mejor versión de mí mismo'],
  ['En situaciones de crisis puedo mantenerme enfocado en las tareas importantes', 'Hago lo necesario por mantenerme actualizado'],
  ['Establezco estándares de desempeño claros para mí mismo y los uso de referencia para evaluar mi comportamiento', 'Deseo adquirir la mayor cantidad de experiencia y conocimientos posible'],
  ['Facilito las cosas para que las oportunidades vengan a mí', 'Siento un llamado por ayudar a hacer de este un mundo mejor'],
  ['Dedico mi tiempo y energía exclusivamente a las actividades que me acercan a mis objetivos', 'Me animo a creer que en mi vida sucederán cosas significativas y extraordinarias'],
  ['Adelanto mi trabajo para estar listo por si algo se llega a necesitar', 'Cuando un problema no está siendo fácil de resolver, sigo intentándolo hasta encontrar la respuesta'],
  ['Siempre guardo algo de lo que gano', 'Evalúo muy bien mis decisiones antes de tomarlas'],
  ['En este momento puedo identificar claramente cuál es mi estado emocional', 'Puedo predecir el comportamiento de las personas'],
  ['Me siento bien de ser yo mismo', 'Me gano la vida haciendo lo que más me gusta'],
  ['Si algo no sale como quiero me recupero rápidamente y lo vuelvo a intentar', 'Cuando estoy estresado puedo pensar con claridad'],
  ['La gente confía en mí para administrar el dinero', 'Para cumplir con todas mis responsabilidades me aseguro de conseguir la ayuda que necesito'],
  ['Me esfuerzo por ser una mejor persona', 'Fácilmente encuentro relaciones entre variables que parecen ser distintas'],
  ['Observo mi situación financiera con regularidad', 'Puedo negociar temas difíciles sin perder la calma'],
  ['Me concentro en las tareas que debo hacer, incluso si no me gustan', 'Soy hábil para hacer que el dinero me rinda para todo'],
  ['Sé muy bien cuáles son las capacidades que los demás valoran en mí', 'Estoy convencido de que el trabajo que hago es útil para los demás'],
  ['He sabido cómo aprovechar mis habilidades y talentos para alcanzar el nivel que hoy tengo', 'Estoy decidido a ser El Mejor en lo que hago'],
  ['Me esfuerzo por mejorar mis capacidades', 'Aún bajo estrés puedo realizar mis tareas sin equivocarme'],
  ['Preveo situaciones y reacciono a ellas antes de que sucedan', 'Tengo una idea clara del futuro que quiero para mí'],
  ['Mantengo un alto nivel de dinamismo y energía', 'Me siento impulsado a marcar una diferencia positiva en mi entorno'],
  ['Me preocupa que mi trabajo ayude a otras personas a mejorar su vida de alguna forma', 'Frecuentemente estoy ideando nuevas formas para mejorar mis resultados'],
  ['Sé que puedo resolver problemas difíciles si me esfuerzo lo suficiente', 'Puedo controlar mi temperamento cuando es necesario'],
  ['Me hago responsable de mi propio aprendizaje', 'Puedo ver claramente la estrategia que debo seguir para lograr lo que más deseo en la vida'],
  ['Pongo atención a mi comportamiento para detectar lo que me funciona y lo que no', 'Cuando quiero algo, no descanso hasta conseguirlo'],
  ['Espero de mí mismo marcar una diferencia significativa para muchas personas', 'Estoy convencido de que la manera de producir los mayores resultados es sumando pequeños logros uno a otro'],
  ['Constantemente estoy buscando mejores formas de hacer las cosas', 'Yo jamás he ofrecido dinero para acelerar un trámite'],
  ['Me esfuerzo un montón por lograr y superar los estándares fijados', 'Detecto oportunidades mucho antes de que otros puedan'],
  ['A lo largo de mi trayectoria he construido una excelente reputación', 'Pretendo lograr el mayor éxito financiero y profesional posible en mi vida'],
  ['Adquiero conocimientos para estar a la altura de lo que está sucediendo hoy en el mundo', 'Me es fácil encontrar múltiples soluciones a un mismo problema'],
  ['Tomo decisiones que me ayudan a fortalecer mi posición', 'Soy positivo cuando pienso en el futuro'],
  ['Me esfuerzo cada día para ser mejor en lo que hago', 'Si me equivoco, puedo cambiar de estrategia pero sigo adelante'],
  ['Rechazo las oportunidades de trabajo que no corresponden a mis mayores intereses', 'Comprendo bien mis emociones'],
  ['Rápidamente puedo percibir los cambios del entorno', 'Sé muy bien adónde quiero llegar en la vida'],
  ['Me adapto bien a los cambios de rutinas', 'Me divierte realizar juegos mentales que ponen a prueba mi inteligencia'],
  ['Tengo la firme expectativa de mejorar notablemente para el próximo año', 'Cuando se trata de dinero, tomo decisiones fría, racional y concienzudamente'],
  ['Cuando algo no sale como quiero enfoco rápidamente mi energía en soluciones constructivas', 'En el último año he conseguido todo lo que me he propuesto'],
  ['Hoy hago cosas que son importantes para mí', 'Actúo racionalmente ante las dificultades'],
  ['Conozco muy bien cuáles son las cosas que me enojan o me ponen triste', 'Me implico en actividades que me ayudan a superarme a mí mismo'],
  ['Difícilmente dejo algún pendiente sin completar', 'Pretendo recibir la máxima educación disponible que hay en mi campo'],
  ['Puedo trabajar horas extra sin perder efectividad en mi trabajo', 'Tengo la certeza de que me irá bien en la vida'],
  ['Si tengo un objetivo ambicioso, lo fracciono en metas cortas para ir un paso a la vez', 'Me administro de una forma que siempre me queda algo para ahorrar'],
  ['Reacciono con la urgencia apropiada en situaciones de peligro', 'Vivo mi vida con un alto compromiso y sentido del deber'],
  ['Creo en mí para lograr lo que pretendo', 'Procuro y fomento mis relaciones'],
  ['Antes de hacer algo, dedico suficiente tiempo a planear', 'Prefiero arriesgarme y perder que lamentarme luego por haber dejado ir una buena oportunidad'],
  ['Me empeño en mejorar mis habilidades para producir mayores resultados', 'Me aseguro de encontrar la forma de lograr mis metas y objetivos'],
  ['Me aseguro de administrar bien los saldos en mis tarjetas para evitar cargos financieros', 'Para resolver un problema, identifico soluciones posibles que otros pasan por alto'],
  ['Puedo darme cuenta de mis emociones mientras estoy trabajando', 'Cuando me comprometo con algo mi voluntad es inquebrantable'],
  ['Pienso bien de mí mismo', 'Para determinar la causa de un problema busco información más allá del evento específico que se ha presentado'],
  ['Sé muy bien cuáles son las capacidades que debo desarrollar para tener éxito en mi camino', 'Busco activamente prepararme para los cambios venideros'],
  ['Si no tengo los materiales que necesito, aprovecho creativamente los que tengo disponibles', 'Procuro rodearme de gente positiva y exitosa'],
  ['Mis convicciones me guían para actuar en la vida', 'Me involucro activamente en los problemas de los grupos a los que pertenezco'],
  ['Tengo claras mis metas de ahorro, a corto, mediano y largo plazo', 'Persigo mis sueños con empeño'],
  ['Tengo control total sobre mi situación actual', 'Intervengo oportunamente para aclarar los malos entendidos'],
  ['Si participo en una competencia, digo la verdad aunque los demás estén mintiendo', 'Intento entender cómo es que los factores de una situación están relacionados entre sí'],
  ['Quisiera dedicarme a mi pasión y poder cobrar por ello', 'Siento que estoy en mi mejor momento'],
  ['Soy hábil para ganarme la confianza de la gente', 'Conozco cuál es el trabajo que más quiero hacer en la vida'],
  ['Me manejo bien en situaciones de crisis', 'Apoyo las ideas nuevas'],
  ['Me empeño en hacer que mi trayectoria laboral vaya en ascenso', 'Contribuyo proactivamente para mejorar mi entorno de trabajo'],
  ['Conozco cuál es mi vocación y planeo dedicarme a ella en un futuro próximo', 'Generalmente logro lo que me propongo'],
  ['En los últimos años he tomado muy buenas decisiones con mi dinero', 'Me esfuerzo por hacer buenas relaciones en todos lados'],
  ['Siempre dejo una buena impresión en los demás', 'Quiero ser considerado como una autoridad en mi campo'],
  ['No permito que mis sentimientos interfieran con mi trabajo', 'La situación que vivo actualmente en mi vida me hace sentir en paz y en calma'],
  ['Busco la manera de cumplir a tiempo con todas mis responsabilidades', 'Se me ocurren soluciones originales a los problemas a los que me enfrento'],
  ['Cuando estoy trabajando en algo, le dedico toda mi atención', 'Me involucro propositivamente en los asuntos de mi comunidad'],
  ['Para mí es prioritario ganarme la vida haciendo lo que más me gusta', 'Antes de tomar una decisión pienso en cómo un cambio puede impactar en otras situaciones'],
  ['Sacrifico parte de mis ganancias para volverlas a invertir', 'Puedo con facilidad aislar mi mente del exterior para no distraerme'],
  ['Identifico las habilidades que debo fortalecer en mí mismo para mejorar mis resultados', 'Aprendo de mis fracasos para intentarlo de nuevo'],
  ['Si cometo un error, me aseguro que en el futuro no vuelva a suceder', 'Mi carácter me ayuda a levantarme fortalecido de las crisis'],
  ['Pago mis deudas en su totalidad y en el plazo acordado', 'Disfruto intercambiar opiniones y llegar a consensos con personas que piensan diferente a mí'],
  ['Estoy convencido de que tengo un alto poder de influencia en los demás', 'Soy obstinado con mis metas y objetivos'],
  ['Me siento satisfecho con los resultados que hoy soy capaz de dar', 'Soy exigente conmigo mismo'],
  ['Confío en que me irá bien en el futuro', 'Puedo hablar de temas difíciles con mi pareja sin entrar en discusiones'],
  ['Analizo mis errores para aprender de ellos', 'Sé muy bien qué es lo que debo hacer para cambiar lo que quiero mejorar en mí mismo'],
  ['Evalúo regularmente el progreso de mi trabajo para cumplir a tiempo con mis objetivos', 'Confío en mi capacidad para modificar lo que no me gusta de mi vida'],
  ['Sé cómo persuadir a otros para que se pongan de mi lado', 'Puedo comprender fácilmente cómo piensan los demás'],
  ['Siempre cumplo lo que prometo', 'Cuando hago planes me aseguro de que estén bien calculados hacia la meta'],
  ['Mantengo contacto con las personas que he conocido en el camino', 'Escucho con atención y considero las aportaciones que hacen los demás'],
  ['Rechazaría las ofertas de trabajo que no me permitieran dedicarme a lo que más me gusta hacer', 'Mantengo la calma en situaciones difíciles'],
  ['Mi ahorro está creciendo', 'Dedico bastante tiempo y energía a mi propio desarrollo'],
  ['Llevo un calendario y me apego a él para administrarme', 'Puedo mantenerme relajado en situaciones de presión'],
  ['Estoy consciente de la forma en la que mis emociones afectan a los demás', 'Actúo proactivamente para resolver los contratiempos'],
  ['Hago listas de pendientes que reviso y actualizo a lo largo del día', 'Suelo tener un plan B por si las cosas no salen como espero'],
  ['A lo largo de la jornada doy el máximo todo el tiempo', 'Confío en mi capacidad para obtener un logro importante en un lapso de tiempo corto'],
  ['Generalmente puedo anticipar cómo reaccionarán las personas que conozco ante una situación determinada', 'Aún en condiciones adversas me mantengo firme hasta el final'],
  ['Disfruto encontrar conexiones poco usuales en la información que reviso', 'Me estoy esforzando en mi trabajo para mejorar mi situación en el mediano plazo'],
  ['Me trazo a mí mismo objetivos concretos de aprendizaje en función de lo que quiero lograr', 'Nunca he hecho trampa para ganar'],
  ['Me gusta participar con otras personas para lograr objetivos en común', 'Me preocupo por los problemas de mi país y me involucro en las soluciones'],
  ['Me implico activamente en crear oportunidades que me generen ingresos', 'Sacrifico horas de sueño si es necesario para sacar adelante proyectos que para mí son importantes'],
  ['Dirijo mi vida en la dirección que quiero ir', 'Puedo trabajar durante muchas horas manteniendo el mismo nivel de energía'],
  ['Cuando se pide la participación de todos soy el primero en levantar la mano', 'Puedo adivinar la intención real de otras personas al hablar con ellos'],
  ['Hoy estoy cumpliendo con mis propósitos de vida más importantes', 'Conozco las barreras que tendré que superar para lograr mis objetivos'],
  ['Fácilmente puedo pensar en estrategias para diversificar mis inversiones', 'Si alguien no está participando me acerco para ayudarlo a involucrarse'],
  ['Me comprometo con mis proyectos y objetivos hasta sus últimas consecuencias', 'Me aseguro de tener unas finanzas sanas']
];

// Pares Negativos (72 pares - IDs 193-336)
const paresNegativos = [
  ['Mantengo expectativas bajas para mí mismo', 'En situaciones difíciles me pongo serio y pierdo el sentido del humor'],
  ['Actualmente no estoy desarrollando ninguna nueva habilidad que me ayude a hacer mejor mi trabajo', 'Me es difícil concentrar mi energía en la dirección que quiero ir'],
  ['Cuando algo sale mal tiendo a quejarme, echar la culpa o señalar a las circunstancias', 'Prefiero alejarme de la gente'],
  ['Me distraigo y pierdo el tiempo fácilmente', 'Generalmente las personas no me reconocen como autoridad'],
  ['Me comprometo con entusiasmo pero luego se me olvida', 'Las cosas que se me ocurren son aburridas y poco creativas'],
  ['Aceptaría cualquier trabajo porque sé que de todo puedo aprender muy rápido', 'Todavía no identifico qué es lo que quiero lograr en mi vida'],
  ['Me es difícil anticipar mis cambios de ánimo', 'No veo cómo yo pueda resolver mis problemas actuales'],
  ['Difícilmente me entero de lo que se está haciendo en otros campos diferentes al mío', 'No estoy disfrutando mi vida como me gustaría'],
  ['Cuando no entiendo algo me desespero y lo abandono', 'Dudo que mi voto sea de mucha utilidad'],
  ['Actualmente no invierto mi dinero', 'No veo sentido en exigirme demasiado'],
  ['Muy poco se me ocurren ideas creativas y novedosas', 'Sospecho que yo mismo bloqueo las oportunidades, a veces sin darme cuenta'],
  ['En los últimos seis meses me quedé sin dinero por lo menos una vez', 'Tengo un asunto no resuelto que me hace perder la concentración'],
  ['Si me ofrecieran un trabajo para el que sé que no tengo capacidad suficiente, igual lo tomaría', 'Mi desempeño está por debajo de las expectativas'],
  ['Algunos dirían que soy intolerante o que no acepto a las personas como son', 'Me esfuerzo poco para superarme a mí mismo'],
  ['Frecuentemente soy el último en darse cuenta de que las cosas no van bien', 'Bajo estrés actúo con prisas y de forma descuidada'],
  ['Con frecuencia confundo mis emociones', 'Mi desempeño se disminuye en situaciones de mucha exigencia'],
  ['Me dejo llevar por lo que opinan los demás', 'A veces aparento tener virtudes que en realidad no poseo'],
  ['Mi nivel de ingreso se ha mantenido igual desde hace años', 'Se me dificulta reconocer mis errores y fracasos'],
  ['Soy capaz de mentir para librarme de problemas', 'A veces siento que no soy lo suficientemente bueno para lograr lo que quiero'],
  ['Desarrollar nuevas habilidades no es prioritario para mí en este momento', 'Me cuesta entender los sentimientos de otras personas'],
  ['No tengo muchos motivos para enorgullecerme de mí mismo', 'Pierdo mucho tiempo buscando mis cosas cuando las necesito'],
  ['No arriesgaría recursos propios para abrir un negocio', 'Se me dificulta cumplir a tiempo con mis obligaciones'],
  ['Me desanimo con facilidad ante los obstáculos', 'Se me ocurren ideas pero me cuesta llevarlas a la práctica'],
  ['Prefiero ser conservador y esperar lo menos de la vida', 'En ocasiones soy inconstante o indisciplinado'],
  ['Se me dificulta reconocer las buenas oportunidades de negocio', 'Me es difícil darme cuenta cuando alguien me está mintiendo'],
  ['Trabajo mucho pero consigo pocos resultados', 'He alterado la verdad cuando ha sido necesario para zafarme de problemas'],
  ['Compro cosas sin pensarlo lo suficiente', 'Desde la última vez que fracasé no estoy intentando nada nuevo'],
  ['Desconozco cómo es que los cambios en el entorno pudieran afectar mis planes', 'Se me dificulta relacionarme con los demás'],
  ['Los problemas me crecen por no atender a tiempo mis asuntos', 'Al discutir con mi pareja (o familia) pierdo rápidamente la paciencia'],
  ['Intento concentrarme pero pierdo el foco con facilidad', 'Hacer una contribución importante al mundo no es algo que me preocupe por el momento'],
  ['A veces creo que me quejo mucho pero no propongo', 'Dudo de mi capacidad para convencer a otros'],
  ['Me es difícil imaginar cómo será mi vida dentro de unos años', 'Soy muy permisivo con los demás'],
  ['Quiero hacer muchas cosas pero me canso con facilidad', 'Se me dificulta tomar decisiones bajo estrés'],
  ['Soy desordenado con mis finanzas', 'Me cuesta aceptarme como soy'],
  ['Desconozco qué opciones tengo para invertir mi dinero', 'Seguir estudiando es lo último que haría'],
  ['Desconozco de qué forma podría aprovechar mis talentos para generar mayores ingresos', 'Pospongo lo más que puedo las tareas que no me gustan'],
  ['En una emergencia se me dificulta mantenerme concentrado', 'Tiendo a dejar que se me acumulen los pendientes'],
  ['Dudo que mis circunstancias puedan mejorar para el mes que viene', 'Estoy poco enterado de los problemas que hay en el mundo'],
  ['A veces hago las cosas sin seguir un orden lógico', 'Inicio con fuerza pero pasado un tiempo, dejo de dar seguimiento a mis avances'],
  ['Tiendo a perder la paciencia', 'Me frustra darme cuenta de lo limitado que hoy me siento'],
  ['Abandono las tareas que me exigen demasiado esfuerzo', 'Hay veces en las que tomar algo que no es tuyo puede estar justificado'],
  ['Me es difícil apegarme a los acuerdos que hago otras personas', 'Me rindo cuando las cosas parecen no tener solución'],
  ['Me cuesta prever las consecuencias de mis actos', 'Cuando las cosas no van bien, pienso que debería darme por vencido'],
  ['Cuando las cosas se tornan complicadas me es difícil saber qué es lo correcto de hacer', 'Me hace falta tener más energía para completar mis actividades del día'],
  ['Desconozco el camino que debo seguir para hacer realidad mi visión personal', 'A menos que sea absolutamente necesario, no estoy dispuesto a cambiar mi forma de trabajo'],
  ['Se me dificulta pensar ideas innovadoras', 'Me cierro a vivir nuevas experiencias'],
  ['Me resulta difícil disfrutar de mi vida', 'Prefiero trabajar solo'],
  ['Me cuesta trabajo hablar en público', 'A veces tengo que pedir prestado para cumplir con mis gastos del mes'],
  ['Prefiero no tener un plan y dejar que la vida me sorprenda', 'Cuando estoy estresado suelo reaccionar de mal modo con los demás'],
  ['Para reconocer mis errores, necesito que otros me los hagan ver', 'He dejado que otros paguen las consecuencias de mis malas decisiones'],
  ['Soy insensible a los problemas ajenos', 'Entrar en contacto con otras personas me pone nervioso'],
  ['Se me dificulta relacionar conceptos complejos o ideas muy abstractas', 'No acostumbro seguir un presupuesto de gasto'],
  ['Es difícil que cambie mi forma de hacer las cosas aunque me de cuenta de que no me están funcionando', 'Es raro que me ponga a investigar que está sucediendo en mi país o en el mundo'],
  ['Dudo tener el talento que se necesita para lograr el éxito que pretendo', 'Los proyectos en los que estoy involucrado obstaculizan mi camino hacia mis ideales'],
  ['Me siento preocupado por temas de dinero', 'Me va mejor en trabajos de baja responsabilidad'],
  ['Mis emociones tienden a afectar mi objetividad', 'Desconfío del futuro y de las nuevas ideas'],
  ['Todavía no tengo claro cuál es mi propósito en la vida', 'La gente diría que me cuesta mucho reponerme de los fracasos'],
  ['Tiendo a dejar las cosas para después', 'Desconozco cuánto debo, cuánto gano o cuánto tengo'],
  ['Me doy cuenta que estoy equivocado hasta que alguien me lo avisa', 'Me impaciento cuando alguien me platica sus problemas'],
  ['Me siento intranquilo o irritable ante situaciones nuevas o cambiantes', 'Invariablemente me quedo sin dinero'],
  ['Me enfada escuchar críticas sobre mi trabajo', 'Necesito supervisión para completar mis tareas'],
  ['Acepto las nuevas oportunidades de trabajo aunque estas no correspondan a mi predilección', 'Si un libro se vuelve difícil de entender, lo abandono y comienzo uno nuevo'],
  ['Conocer las razones del porqué de los problemas no es interesante para mí', 'Desconozco qué es lo que más me conviene hacer para lograr mis ideales'],
  ['Cuando se me agota el entusiasmo inicial, abandono la actividad para ir por otra nueva', 'En situaciones de presión cometo más errores de lo normal'],
  ['Funciono mejor en trabajos de baja responsabilidad', 'Invariablemente veo primero por mis propios intereses'],
  ['En situaciones de conflicto pierdo el profesionalismo', 'En ocasiones actúo impulsivamente'],
  ['Pierdo la motivación cuando las cosas no salen como quiero', 'No me motiva recibir reconocimientos por mi buen desempeño'],
  ['Ignoro cuáles son los retos a los que se enfrentará mi profesión en el corto plazo', 'Es común que en las negociaciones con otros yo salga perdiendo'],
  ['Me cuesta reconocer mis áreas de oportunidad', 'Tiendo a reaccionar a los problemas cuando ya se presentaron o cuando ya es demasiado tarde'],
  ['Tengo planes, pero no hago mucho por traerlos a la práctica', 'Cometer errores me desanima al grado de pensar en renunciar a mi objetivo'],
  ['Prefiero los trabajos de poca exigencia', 'Discutir temas difíciles con otros me pone irritable o de mal humor'],
  ['Me preocupa la idea de no estar acompañado', 'Me frustro cuando pienso en mi situación actual']
];

// ============================================
// FUNCIÓN PARA GENERAR REACTIVOS
// ============================================

interface Reactivo {
  idOrd: number;
  itemPareado: string;
  reactivo: string;
  tipo: string;
  puntajeFijo: number;
  test: string;
  escala: string;
}

function generarReactivos(): Reactivo[] {
  const reactivos: Reactivo[] = [];
  let idOrd = 1;

  // Generar reactivos positivos (96 pares)
  paresPositivos.forEach((par, index) => {
    const pairId = `PAR_POS_${(index + 1).toString().padStart(3, '0')}`;
    
    // Reactivo A
    reactivos.push({
      idOrd: idOrd++,
      itemPareado: pairId,
      reactivo: par[0],
      tipo: 'POS',
      puntajeFijo: 2,
      test: 'Pareado Positivo',
      escala: 'ESCALA_GENERICA' // Se asignará la escala correcta en la importación
    });

    // Reactivo B
    reactivos.push({
      idOrd: idOrd++,
      itemPareado: pairId,
      reactivo: par[1],
      tipo: 'POS',
      puntajeFijo: 2,
      test: 'Pareado Positivo',
      escala: 'ESCALA_GENERICA'
    });
  });

  // Generar reactivos negativos (72 pares)
  paresNegativos.forEach((par, index) => {
    const pairId = `PAR_NEG_${(index + 1).toString().padStart(3, '0')}`;
    
    // Reactivo A
    reactivos.push({
      idOrd: idOrd++,
      itemPareado: pairId,
      reactivo: par[0],
      tipo: 'NEG',
      puntajeFijo: 0,
      test: 'Pareado Negativo',
      escala: 'ESCALA_GENERICA'
    });

    // Reactivo B
    reactivos.push({
      idOrd: idOrd++,
      itemPareado: pairId,
      reactivo: par[1],
      tipo: 'NEG',
      puntajeFijo: 0,
      test: 'Pareado Negativo',
      escala: 'ESCALA_GENERICA'
    });
  });

  return reactivos;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

function main() {
  console.log('🚀 Generando archivo Reactivos.xlsx...\n');

  // Generar reactivos
  const reactivos = generarReactivos();

  console.log(`📊 Estadísticas:`);
  console.log(`   - Total de reactivos: ${reactivos.length}`);
  console.log(`   - Pares positivos: ${paresPositivos.length}`);
  console.log(`   - Pares negativos: ${paresNegativos.length}`);
  console.log(`   - Total de pares: ${paresPositivos.length + paresNegativos.length}`);

  // Crear hoja de reactivos
  const wsData = [
    // Encabezados
    ['idOrd', 'itemPareado', 'reactivo', 'tipo', 'puntajeFijo', 'test', 'escala'],
    // Datos
    ...reactivos.map(r => [
      r.idOrd,
      r.itemPareado,
      r.reactivo,
      r.tipo,
      r.puntajeFijo,
      r.test,
      r.escala
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 8 },  // idOrd
    { wch: 15 }, // itemPareado
    { wch: 100 }, // reactivo
    { wch: 8 },  // tipo
    { wch: 12 }, // puntajeFijo
    { wch: 20 }, // test
    { wch: 20 }  // escala
  ];

  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reactivos Test');

  // Guardar archivo
  const fileName = 'Reactivos.xlsx';
  XLSX.writeFile(wb, fileName);

  console.log(`\n✅ Archivo generado exitosamente: ${fileName}`);
  console.log(`\n📝 Siguiente paso:`);
  console.log(`   1. Revisa el archivo ${fileName}`);
  console.log(`   2. Asigna las escalas correctas a cada reactivo (columna "escala")`);
  console.log(`   3. Ejecuta el script de importación:`);
  console.log(`      npx tsx scripts/import-reactivos-xlsx.ts`);
  console.log(`\n⚠️  NOTA: Los reactivos tienen "ESCALA_GENERICA" como placeholder.`);
  console.log(`   Debes asignar las escalas correctas antes de importar.`);
}

// Ejecutar
main();
