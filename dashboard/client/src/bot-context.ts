import type { Lang } from "./i18n";

interface BotInsightOverride {
  desc: string;
  action: string;
  context: string;
}

interface BotContextData {
  name: string;
  type: Record<Lang, string>;
  hasOris: boolean;
  insights: Record<string, Record<Lang, BotInsightOverride>>;
}

const BOT_CONTEXTS: Record<string, BotContextData> = {
  "wa-gr1916-grupolala": {
    name: "LALA MX B2B",
    hasOris: true,
    type: {
      es: "Bot B2B WhatsApp Mexico. 31 activities/551 components. Flujo hibrido (deterministic + hybrid). AI agents: Custom Agent 01 (Home), Sales Agent R1, Sales Agent P1, Faqs Custom Agent, Voice Agent (orisVoice). Comercio conversacional para Grupo Lala Mexico (lacteos). Pedidos de reabastecimiento para tenderos. Integra Lala API, Headless Commerce, Yalo Force, CSAT, Yalo Pago.",
      en: "B2B WhatsApp bot Mexico. 31 activities/551 components. Hybrid flow (deterministic + hybrid). AI agents: Custom Agent 01 (Home), Sales Agent R1, Sales Agent P1, Faqs Custom Agent, Voice Agent (orisVoice). Conversational commerce for Grupo Lala Mexico (dairy). Restocking orders for shopkeepers. Integrates Lala API, Headless Commerce, Yalo Force, CSAT, Yalo Pago.",
      pt: "Bot B2B WhatsApp Mexico. 31 activities/551 components. Fluxo hibrido (deterministic + hybrid). AI agents: Custom Agent 01 (Home), Sales Agent R1, Sales Agent P1, Faqs Custom Agent, Voice Agent (orisVoice). Comercio conversacional para Grupo Lala Mexico (laticinios). Pedidos de reabastecimento para lojistas. Integra Lala API, Headless Commerce, Yalo Force, CSAT, Yalo Pago.",
    },
    insights: {
      closureRate: {
        es: {
          context: "Los tenderos LALA no cierran conversacionalmente: envian su pedido y dejan de responder. Este patron es normal en flujos transaccionales B2B recurrentes.",
          desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios completan su orden y dejan de responder sin cierre lingistico, lo cual es comportamiento esperado en B2B.",
          action: "Agregar un mensaje de confirmacion final con cierre explicito despues de enviar el pedido: 'Tu pedido fue enviado. Hasta la proxima!' Esto genera el patron conversacional que CIE reconoce como closure.",
        },
        en: {
          context: "LALA shopkeepers don't conversationally close: they send their order and stop responding. This pattern is normal in recurring B2B transactional flows.",
          desc: "The flow has no explicit farewell step post-order. Users complete their order and stop responding without linguistic closure, which is expected behavior in B2B.",
          action: "Add a final confirmation message with explicit closing after sending the order: 'Your order has been sent. See you next time!' This generates the conversational pattern CIE recognizes as closure.",
        },
        pt: {
          context: "Os lojistas LALA nao encerram conversacionalmente: enviam o pedido e param de responder. Esse padrao e normal em fluxos B2B transacionais recorrentes.",
          desc: "O fluxo nao tem uma etapa de despedida explicita apos o pedido. Os usuarios completam o pedido e param de responder sem encerramento linguistico, o que e comportamento esperado em B2B.",
          action: "Adicionar uma mensagem de confirmacao final com encerramento explicito apos enviar o pedido: 'Seu pedido foi enviado. Ate a proxima!' Isso gera o padrao conversacional que o CIE reconhece como closure.",
        },
      },
      resolutionRate: {
        es: {
          context: "Sesiones donde el usuario solo consulto fecha de entrega o disponibilidad cuentan como 'no resueltas' para el evaluador, pero desde negocio SI fueron resueltas.",
          desc: "Consultas de fecha de entrega, disponibilidad o ruta foranea son marcadas como not_fulfilled por ORIS aunque el sistema respondio correctamente. El modo Yalo Force (vendedor) genera sesiones multi-cliente que tambien pueden marcarse incorrectamente.",
          action: "Agregar mensajes explicitos de confirmacion: 'Tu fecha de entrega es el [fecha]' o 'No hay entrega disponible esta semana porque tu ruta es foranea. La proxima entrega es el [fecha]'. Esto da senal clara al evaluador de que la intencion fue atendida.",
        },
        en: {
          context: "Sessions where the user only checked delivery date or availability count as 'unresolved' for the evaluator, but from a business perspective they WERE resolved.",
          desc: "Delivery date, availability, or remote route queries are marked as not_fulfilled by ORIS even though the system responded correctly. Yalo Force mode (salesperson) generates multi-client sessions that may also be incorrectly marked.",
          action: "Add explicit confirmation messages: 'Your delivery date is [date]' or 'No delivery available this week because your route is remote. Next delivery is [date]'. This gives a clear signal to the evaluator that the intent was addressed.",
        },
        pt: {
          context: "Sessoes onde o usuario so consultou data de entrega ou disponibilidade contam como 'nao resolvidas' para o avaliador, mas do ponto de vista do negocio FORAM resolvidas.",
          desc: "Consultas de data de entrega, disponibilidade ou rota remota sao marcadas como not_fulfilled pelo ORIS, mesmo que o sistema tenha respondido corretamente. O modo Yalo Force (vendedor) gera sessoes multi-cliente que tambem podem ser marcadas incorretamente.",
          action: "Adicionar mensagens explicitas de confirmacao: 'Sua data de entrega e [data]' ou 'Sem entrega disponivel esta semana porque sua rota e remota. Proxima entrega e [data]'. Isso da sinal claro ao avaliador de que a intencao foi atendida.",
        },
      },
      efficiencyLoops: {
        es: {
          context: "El flujo LALA B2B tiene pasos secuenciales obligatorios (autenticacion, catalogo, carrito, fecha, confirmacion). Los 'loops' detectados son navegacion de catalogo normal, no errores.",
          desc: "El flujo tiene 11 categorias de productos con decenas de SKUs. Explorar categorias, agregar/quitar productos y ajustar cantidades es el comportamiento de compra esperado, no loops de confusion. Yalo Force (vendedores) navegan multiples clientes en una sesion.",
          action: "Separar sesiones de Yalo Force del analisis general (idealmente con bot_id diferente). Los loops reales a investigar son: usuario que repite la misma pregunta 2+ veces sin respuesta diferente, o flujo que reinicia por timeout sin aviso.",
        },
        en: {
          context: "The LALA B2B flow has mandatory sequential steps (authentication, catalog, cart, date, confirmation). Detected 'loops' are normal catalog navigation, not errors.",
          desc: "The flow has 11 product categories with dozens of SKUs. Exploring categories, adding/removing products, and adjusting quantities is expected shopping behavior, not confusion loops. Yalo Force (salespeople) navigate multiple clients in one session.",
          action: "Separate Yalo Force sessions from general analysis (ideally with a different bot_id). Real loops to investigate: user repeating the same question 2+ times without a different response, or flow restarting due to timeout without notice.",
        },
        pt: {
          context: "O fluxo LALA B2B tem etapas sequenciais obrigatorias (autenticacao, catalogo, carrinho, data, confirmacao). Os 'loops' detectados sao navegacao normal do catalogo, nao erros.",
          desc: "O fluxo tem 11 categorias de produtos com dezenas de SKUs. Explorar categorias, adicionar/remover produtos e ajustar quantidades e comportamento de compra esperado, nao loops de confusao. O Yalo Force (vendedores) navega multiplos clientes em uma sessao.",
          action: "Separar sessoes do Yalo Force da analise geral (idealmente com bot_id diferente). Loops reais a investigar: usuario repetindo a mesma pergunta 2+ vezes sem resposta diferente, ou fluxo reiniciando por timeout sem aviso.",
        },
      },
      clarity: {
        es: {
          context: "El flujo maneja logica compleja de ruta foranea y CEDIS que puede parecer confusa para el evaluador pero es correcta desde el negocio.",
          desc: "Mensajes de ruta foranea ('tu entrega es el jueves' cuando ordenas el lunes), CEDIS no disponible, y errores de validacion de la LALA API generan respuestas que el evaluador marca como confusion pero son restricciones de negocio reales.",
          action: "Enriquecer mensajes de restriccion: 'Tu ruta es foranea, por eso la entrega es el jueves [fecha] y no antes' en vez de solo la fecha. 'Este producto tiene cantidad minima de X piezas' en vez de un error de validacion tecnico.",
        },
        en: {
          context: "The flow handles complex remote route and CEDIS logic that may look confusing to the evaluator but is correct from a business perspective.",
          desc: "Remote route messages ('your delivery is Thursday' when ordering on Monday), unavailable CEDIS, and LALA API validation errors generate responses the evaluator marks as confusion but are real business restrictions.",
          action: "Enrich restriction messages: 'Your route is remote, so delivery is Thursday [date] and not before' instead of just the date. 'This product has a minimum quantity of X units' instead of a technical validation error.",
        },
        pt: {
          context: "O fluxo lida com logica complexa de rota remota e CEDIS que pode parecer confusa para o avaliador, mas esta correta do ponto de vista do negocio.",
          desc: "Mensagens de rota remota ('sua entrega e na quinta' quando pede na segunda), CEDIS indisponivel e erros de validacao da LALA API geram respostas que o avaliador marca como confusao, mas sao restricoes reais do negocio.",
          action: "Enriquecer mensagens de restricao: 'Sua rota e remota, por isso a entrega e na quinta [data] e nao antes' em vez de so a data. 'Este produto tem quantidade minima de X unidades' em vez de erro de validacao tecnico.",
        },
      },
      friction: {
        es: {
          context: "La latencia de LALA API (login obligatorio + consulta por cada Cloud Function) y respuestas negativas del sistema (sin entrega, sin stock) generan senales de friccion que no son problemas conversacionales.",
          desc: "Cada Cloud Function hace login previo a la LALA API (doble round-trip, 400ms-1.3s). Cold starts suman 1-3s. Respuestas negativas (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con 'Lo sentimos' o 'Disculpa' elevan agent_apology innecesariamente.",
          action: "(1) Revisar y reformular mensajes que empiecen con 'Lo sentimos' o 'Disculpa' a tono informativo neutral. (2) Agregar indicadores de espera ('Procesando tu pedido...') durante llamadas a LALA API para que el usuario sepa que el bot esta trabajando.",
        },
        en: {
          context: "LALA API latency (mandatory login + query per Cloud Function) and negative system responses (no delivery, no stock) generate friction signals that are not conversational problems.",
          desc: "Each Cloud Function does a prior login to LALA API (double round-trip, 400ms-1.3s). Cold starts add 1-3s. Negative responses (no delivery, rejected order) are correct but the evaluator marks them as friction. Messages with 'Sorry' or 'Apologies' raise agent_apology unnecessarily.",
          action: "(1) Review and rewrite messages starting with 'Sorry' or 'Apologies' to neutral informative tone. (2) Add wait indicators ('Processing your order...') during LALA API calls so the user knows the bot is working.",
        },
        pt: {
          context: "A latencia da LALA API (login obrigatorio + consulta por Cloud Function) e respostas negativas do sistema (sem entrega, sem estoque) geram sinais de friccao que nao sao problemas conversacionais.",
          desc: "Cada Cloud Function faz login previo na LALA API (dupla ida e volta, 400ms-1.3s). Cold starts adicionam 1-3s. Respostas negativas (sem entrega, pedido rejeitado) sao corretas mas o avaliador as marca como friccao. Mensagens com 'Desculpe' elevam agent_apology desnecessariamente.",
          action: "(1) Revisar e reformular mensagens que comecem com 'Desculpe' para tom informativo neutro. (2) Adicionar indicadores de espera ('Processando seu pedido...') durante chamadas a LALA API para que o usuario saiba que o bot esta trabalhando.",
        },
      },
      fallbackQuality: {
        es: {
          context: "Los fallbacks en LALA B2B vienen de SKUs no encontrados, precios no disponibles y errores de LALA API, no necesariamente de falta de conocimiento del bot.",
          desc: "Los fallbacks mas frecuentes son: ruta sin entrega disponible, SKU sin precio para el cliente, CEDIS no habilitado. Un SKU descontinuado genera fallback legitimo, no un problema del bot.",
          action: "Revisar los fallbacks mas frecuentes en produccion para separar: SKUs activos no encontrados (problema real) vs. SKUs inactivos/fuera de temporada (comportamiento esperado). Convertir fallbacks frecuentes en respuestas especificas del flujo.",
        },
        en: {
          context: "Fallbacks in LALA B2B come from SKUs not found, prices unavailable, and LALA API errors, not necessarily from lack of bot knowledge.",
          desc: "Most frequent fallbacks are: route without available delivery, SKU without price for the customer, CEDIS not enabled. A discontinued SKU generates a legitimate fallback, not a bot problem.",
          action: "Review the most frequent fallbacks in production to separate: active SKUs not found (real problem) vs. inactive/out-of-season SKUs (expected behavior). Convert frequent fallbacks into specific flow responses.",
        },
        pt: {
          context: "Os fallbacks no LALA B2B vem de SKUs nao encontrados, precos indisponiveis e erros da LALA API, nao necessariamente de falta de conhecimento do bot.",
          desc: "Os fallbacks mais frequentes sao: rota sem entrega disponivel, SKU sem preco para o cliente, CEDIS nao habilitado. Um SKU descontinuado gera fallback legitimo, nao um problema do bot.",
          action: "Revisar os fallbacks mais frequentes em producao para separar: SKUs ativos nao encontrados (problema real) vs. SKUs inativos/fora de temporada (comportamento esperado). Converter fallbacks frequentes em respostas especificas do fluxo.",
        },
      },
      errorFree: {
        es: {
          context: "Errores de LALA API (400/422/500) llegan al usuario pero no son errores del bot. Son respuestas de negocio del sistema externo.",
          desc: "Errores de validacion ('Cantidad minima no cumplida'), sesion expirada, y mantenimiento de LALA API se muestran como errores del asistente. El evaluador los marca como error_detected pero el bot funciona correctamente.",
          action: "Distinguir en los mensajes entre errores tecnicos del bot vs. respuestas de negocio: 'La cantidad minima para este producto es X piezas' (informativo) en vez de 'Error enviando pedido: Cantidad minima no cumplida' (parece error del bot).",
        },
        en: {
          context: "LALA API errors (400/422/500) reach the user but are not bot errors. They are business responses from the external system.",
          desc: "Validation errors ('Minimum quantity not met'), expired sessions, and LALA API maintenance are shown as assistant errors. The evaluator marks them as error_detected but the bot is working correctly.",
          action: "Distinguish in messages between bot technical errors vs. business responses: 'The minimum quantity for this product is X units' (informative) instead of 'Error sending order: Minimum quantity not met' (looks like a bot error).",
        },
        pt: {
          context: "Erros da LALA API (400/422/500) chegam ao usuario mas nao sao erros do bot. Sao respostas de negocio do sistema externo.",
          desc: "Erros de validacao ('Quantidade minima nao atingida'), sessao expirada e manutencao da LALA API sao mostrados como erros do assistente. O avaliador os marca como error_detected mas o bot esta funcionando corretamente.",
          action: "Distinguir nas mensagens entre erros tecnicos do bot vs. respostas de negocio: 'A quantidade minima para este produto e X unidades' (informativo) em vez de 'Erro enviando pedido: Quantidade minima nao atingida' (parece erro do bot).",
        },
      },
      stabilityProxy: {
        es: {
          context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo de pedido B2B (autenticacion, catalogo, carrito, fecha, confirmacion).",
          desc: "Cada pedido requiere un minimo de 8-12 turnos de conversacion por diseno. Esto reduce el score de eficiencia vs. bots conversacionales mas cortos, pero no indica un problema.",
          action: "Optimizar los pasos del flujo donde sea posible: mensajes de confirmacion mas concisos, opcion de 'repetir ultimo pedido' para usuarios recurrentes, reducir preguntas redundantes.",
        },
        en: {
          context: "Conversational efficiency is penalized by the mandatory length of the B2B ordering flow (authentication, catalog, cart, date, confirmation).",
          desc: "Each order requires a minimum of 8-12 conversation turns by design. This reduces the efficiency score vs. shorter conversational bots, but does not indicate a problem.",
          action: "Optimize flow steps where possible: more concise confirmation messages, 'repeat last order' option for recurring users, reduce redundant questions.",
        },
        pt: {
          context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo de pedido B2B (autenticacao, catalogo, carrinho, data, confirmacao).",
          desc: "Cada pedido requer um minimo de 8-12 turnos de conversa por design. Isso reduz o score de eficiencia vs. bots conversacionais mais curtos, mas nao indica um problema.",
          action: "Otimizar etapas do fluxo onde possivel: mensagens de confirmacao mais concisas, opcao 'repetir ultimo pedido' para usuarios recorrentes, reduzir perguntas redundantes.",
        },
      },
      proactiveAnticipation: {
        es: {
          context: "Los 'loops' en LALA B2B son mayoritariamente navegacion de catalogo (ir a categoria, ver producto, volver, agregar al carrito), que es comportamiento de compra normal.",
          desc: "El evaluador de loop prevention marca la navegacion del catalogo como loops repetitivos. Los loops reales (pregunta repetida sin respuesta diferente, reinicio por timeout) son una minoria.",
          action: "Identificar si los loops detectados son de navegacion de catalogo (no accionable, inherente al flujo de compra) o ciclos de error (si accionable). Agregar deteccion de loops reales: si el usuario repite la misma pregunta 3 veces, ofrecer alternativa o escalamiento.",
        },
        en: {
          context: "The 'loops' in LALA B2B are mostly catalog navigation (go to category, view product, go back, add to cart), which is normal shopping behavior.",
          desc: "The loop prevention evaluator marks catalog navigation as repetitive loops. Real loops (repeated question without different response, restart due to timeout) are a minority.",
          action: "Identify if detected loops are catalog navigation (not actionable, inherent to shopping flow) or error cycles (actionable). Add real loop detection: if the user repeats the same question 3 times, offer an alternative or escalation.",
        },
        pt: {
          context: "Os 'loops' no LALA B2B sao majoritariamente navegacao do catalogo (ir a categoria, ver produto, voltar, adicionar ao carrinho), que e comportamento de compra normal.",
          desc: "O avaliador de loop prevention marca a navegacao do catalogo como loops repetitivos. Loops reais (pergunta repetida sem resposta diferente, reinicio por timeout) sao minoria.",
          action: "Identificar se os loops detectados sao navegacao de catalogo (nao acionavel, inerente ao fluxo de compra) ou ciclos de erro (acionavel). Adicionar deteccao de loops reais: se o usuario repetir a mesma pergunta 3 vezes, oferecer alternativa ou escalamento.",
        },
      },
      latency: {
        es: {
          context: "La latencia de LALA incluye un login obligatorio por cada Cloud Function (doble round-trip a LALA API). Esto es arquitectural, no optimizable sin cambios en la LALA API.",
          desc: "Latencias esperadas: addon-catalog 200-2000ms, send-order 300-2000ms. Con cold start de Cloud Run se suman 1-3s. La doble llamada (login + consulta) en cada invocacion es obligatoria por diseno de la LALA API.",
          action: "Evaluar persistencia de token entre invocaciones para eliminar el login repetido. Implementar cache de catalogo en Redis con TTL corto para reducir llamadas a LALA API. Considerar pre-calentamiento de Cloud Functions en horarios pico.",
        },
        en: {
          context: "LALA latency includes a mandatory login per Cloud Function (double round-trip to LALA API). This is architectural, not optimizable without changes to LALA API.",
          desc: "Expected latencies: addon-catalog 200-2000ms, send-order 300-2000ms. Cloud Run cold starts add 1-3s. The double call (login + query) on each invocation is mandatory by LALA API design.",
          action: "Evaluate token persistence between invocations to eliminate repeated login. Implement catalog cache in Redis with short TTL to reduce LALA API calls. Consider Cloud Function warm-up during peak hours.",
        },
        pt: {
          context: "A latencia do LALA inclui um login obrigatorio por Cloud Function (dupla ida e volta para LALA API). Isso e arquitetural, nao otimizavel sem mudancas na LALA API.",
          desc: "Latencias esperadas: addon-catalog 200-2000ms, send-order 300-2000ms. Cold starts do Cloud Run adicionam 1-3s. A dupla chamada (login + consulta) em cada invocacao e obrigatoria por design da LALA API.",
          action: "Avaliar persistencia de token entre invocacoes para eliminar o login repetido. Implementar cache de catalogo no Redis com TTL curto para reduzir chamadas a LALA API. Considerar pre-aquecimento de Cloud Functions em horarios de pico.",
        },
      },
    },
  },
  "wa-ba1758-bafar": {
    name: "BAFAR MX B2B",
    hasOris: true,
    type: {
      es: "Bot B2B WhatsApp Mexico. 51 activities/562 components. Flujo hibrido (deterministic + hybrid). AI agents: Custom Agent 01 (Home), KnowGenie (FAQs), Sales Agent, Oris R1, Oris P1. Comercio conversacional para Bafar Mexico (embutidos/carnes procesadas). Pedidos mayoristas via WhatsApp. Integra Bafar API, Sales Desk, Yalo Force LATAM, CSAT.",
      en: "B2B WhatsApp bot Mexico. 51 activities/562 components. Hybrid flow (deterministic + hybrid). AI agents: Custom Agent 01 (Home), KnowGenie (FAQs), Sales Agent, Oris R1, Oris P1. Conversational commerce for Bafar Mexico (processed meats). Wholesale orders via WhatsApp. Integrates Bafar API, Sales Desk, Yalo Force LATAM, CSAT.",
      pt: "Bot B2B WhatsApp Mexico. 51 activities/562 components. Fluxo hibrido (deterministic + hybrid). AI agents: Custom Agent 01 (Home), KnowGenie (FAQs), Sales Agent, Oris R1, Oris P1. Comercio conversacional para Bafar Mexico (embutidos/carnes processadas). Pedidos atacado via WhatsApp. Integra Bafar API, Sales Desk, Yalo Force LATAM, CSAT.",
    },
    insights: {
      closureRate: {
        es: {
          context: "El paso de catalogo lanza un webview externo (commerce.yalochat.com). Sesiones evaluadas mientras el usuario navega el webview aparecen como 'no cerradas' aunque el usuario si completo el pedido.",
          desc: "El flujo tiene 3 entry points legitimos que NO terminan en pedido (consultar puntos Ganamas, FAQs, hablar con agente Sales Desk). Estas sesiones resuelven la intencion del usuario pero no tienen cierre conversacional tipico. Ademas, el webview externo interrumpe la sesion de WhatsApp.",
          action: "Agregar mensaje de cierre explicito despues de cada entry point completado: post-pedido, post-consulta de puntos, post-FAQ resuelta. Evaluar si el webview puede enviar un callback a WhatsApp al finalizar para cerrar la sesion conversacionalmente.",
        },
        en: {
          context: "The catalog step launches an external webview (commerce.yalochat.com). Sessions evaluated while the user browses the webview appear as 'not closed' even though the user completed the order.",
          desc: "The flow has 3 legitimate entry points that do NOT end in an order (check Ganamas points, FAQs, talk to Sales Desk agent). These sessions resolve the user's intent but lack typical conversational closure. Additionally, the external webview interrupts the WhatsApp session.",
          action: "Add explicit closing message after each completed entry point: post-order, post-points query, post-FAQ resolved. Evaluate if the webview can send a callback to WhatsApp upon completion to conversationally close the session.",
        },
        pt: {
          context: "A etapa de catalogo abre um webview externo (commerce.yalochat.com). Sessoes avaliadas enquanto o usuario navega no webview aparecem como 'nao encerradas' mesmo que o usuario tenha completado o pedido.",
          desc: "O fluxo tem 3 pontos de entrada legitimos que NAO terminam em pedido (consultar pontos Ganamas, FAQs, falar com agente Sales Desk). Essas sessoes resolvem a intencao do usuario mas nao tem encerramento conversacional tipico. Alem disso, o webview externo interrompe a sessao do WhatsApp.",
          action: "Adicionar mensagem de encerramento explicita apos cada ponto de entrada completado: pos-pedido, pos-consulta de pontos, pos-FAQ resolvida. Avaliar se o webview pode enviar um callback ao WhatsApp ao finalizar para encerrar a sessao conversacionalmente.",
        },
      },
      resolutionRate: {
        es: {
          context: "Usuarios no registrados son redirigidos al flujo prospect, lo cual es la resolucion correcta, pero ORIS lo marca como not_fulfilled. Consultas de puntos Ganamas y FAQs tambien se resuelven sin orden.",
          desc: "El flujo tiene multiples intenciones validas: pedido nuevo, repetir ultimo pedido, consultar puntos Ganamas, FAQs, hablar con agente. Evaluar resolution solo por ordenes creadas subvalora el FHS. Usuarios nuevos pasan por flujo prospect (comportamiento correcto, no fallo).",
          action: "Agregar mensajes explicitos de confirmacion de resolucion: 'Tus puntos Ganamas son: X', 'Tu pedido anterior fue: [detalle]', 'Te contactamos con un agente de ventas'. Esto da senal clara al evaluador de que la intencion fue atendida sin necesidad de crear una orden.",
        },
        en: {
          context: "Unregistered users are redirected to the prospect flow, which is the correct resolution, but ORIS marks it as not_fulfilled. Ganamas points queries and FAQs also resolve without an order.",
          desc: "The flow has multiple valid intents: new order, repeat last order, check Ganamas points, FAQs, talk to agent. Evaluating resolution only by orders created undervalues the FHS. New users go through the prospect flow (correct behavior, not a failure).",
          action: "Add explicit resolution confirmation messages: 'Your Ganamas points are: X', 'Your previous order was: [detail]', 'We are connecting you with a sales agent'. This gives a clear signal to the evaluator that the intent was addressed without needing to create an order.",
        },
        pt: {
          context: "Usuarios nao registrados sao redirecionados ao fluxo prospect, que e a resolucao correta, mas o ORIS marca como not_fulfilled. Consultas de pontos Ganamas e FAQs tambem sao resolvidas sem pedido.",
          desc: "O fluxo tem multiplas intencoes validas: pedido novo, repetir ultimo pedido, consultar pontos Ganamas, FAQs, falar com agente. Avaliar resolution apenas por pedidos criados subvaloriza o FHS. Usuarios novos passam pelo fluxo prospect (comportamento correto, nao falha).",
          action: "Adicionar mensagens explicitas de confirmacao de resolucao: 'Seus pontos Ganamas sao: X', 'Seu pedido anterior foi: [detalhe]', 'Estamos conectando voce com um agente de vendas'. Isso da sinal claro ao avaliador de que a intencao foi atendida sem necessidade de criar um pedido.",
        },
      },
      efficiencyLoops: {
        es: {
          context: "BAFAR tiene minimo 8 actividades secuenciales antes de completar un pedido. Los 'loops' detectados son cambios de decision legitimos (cambiar tienda, tipo de entrega, productos) y reintentos por diseno (quote Uber expirado, reintento de pago Conekta).",
          desc: "El journey completo es: TyC, Validacion, POS Locator, Tipo entrega, Catalogo (webview), Fecha entrega, Puntos Ganamas, Resumen, Pago, Confirmacion. Los usuarios que cambian tienda o tipo de entrega a mitad del flujo agregan pasos legitimos. El quote de Uber tiene TTL de 15 min y se renueva automaticamente.",
          action: "Los reintentos por diseno (Uber quote, Conekta payment) son funcionalidad, no ineficiencia. Investigar si hay loops reales: usuario atrapado en POS Locator sin encontrar tienda, o ciclo de validacion de cliente fallido repetidamente. Separar metricas de sesiones con cambio de decision vs. sesiones lineales.",
        },
        en: {
          context: "BAFAR has a minimum of 8 sequential activities before completing an order. Detected 'loops' are legitimate decision changes (changing store, delivery type, products) and retries by design (expired Uber quote, Conekta payment retry).",
          desc: "The full journey is: T&C, Validation, POS Locator, Delivery type, Catalog (webview), Delivery date, Ganamas points, Summary, Payment, Confirmation. Users changing store or delivery type mid-flow add legitimate steps. The Uber quote has a 15-min TTL and renews automatically.",
          action: "Retries by design (Uber quote, Conekta payment) are features, not inefficiency. Investigate real loops: user stuck in POS Locator without finding a store, or client validation cycle failing repeatedly. Separate metrics for sessions with decision changes vs. linear sessions.",
        },
        pt: {
          context: "O BAFAR tem no minimo 8 atividades sequenciais antes de completar um pedido. Os 'loops' detectados sao mudancas de decisao legitimas (mudar loja, tipo de entrega, produtos) e retentativas por design (cotacao Uber expirada, retentativa de pagamento Conekta).",
          desc: "O journey completo e: T&C, Validacao, POS Locator, Tipo entrega, Catalogo (webview), Data entrega, Pontos Ganamas, Resumo, Pagamento, Confirmacao. Usuarios que mudam loja ou tipo de entrega no meio do fluxo adicionam passos legitimos. A cotacao do Uber tem TTL de 15 min e se renova automaticamente.",
          action: "Retentativas por design (cotacao Uber, pagamento Conekta) sao funcionalidades, nao ineficiencia. Investigar loops reais: usuario preso no POS Locator sem encontrar loja, ou ciclo de validacao de cliente falhando repetidamente. Separar metricas de sessoes com mudanca de decisao vs. sessoes lineares.",
        },
      },
      clarity: {
        es: {
          context: "En el POS Locator, los usuarios escriben direcciones informales ('junto al OXXO', sin codigo postal). El bot llama a Google Maps y devuelve tiendas cercanas — funciona correctamente, pero ORIS puede marcar como misunderstood.",
          desc: "Las variaciones de direcciones en Mexico (sin CP, con referencias locales) generan respuestas del bot que el evaluador puede interpretar como confusion. El bot no falla, usa Google Maps con lo que recibe. Mensajes de restricciones de negocio (Uber sin cobertura, tienda sin stock) pueden parecer confusos sin contexto.",
          action: "Agregar mensajes de contexto en el POS Locator: 'Encontre X tiendas cerca de tu ubicacion' con confirmacion explicita. En restricciones: 'Uber no tiene cobertura en tu direccion, solo la opcion de recoger en tienda esta disponible' en vez de solo mostrar pickup.",
        },
        en: {
          context: "In POS Locator, users write informal addresses ('next to the OXXO', no zip code). The bot calls Google Maps and returns nearby stores — works correctly, but ORIS may mark as misunderstood.",
          desc: "Address variations in Mexico (no zip code, local references) generate bot responses the evaluator may interpret as confusion. The bot doesn't fail, it uses Google Maps with what it receives. Business restriction messages (Uber no coverage, store out of stock) may seem confusing without context.",
          action: "Add context messages in POS Locator: 'I found X stores near your location' with explicit confirmation. For restrictions: 'Uber has no coverage at your address, only the pickup option is available' instead of just showing pickup.",
        },
        pt: {
          context: "No POS Locator, os usuarios escrevem enderecos informais ('ao lado do OXXO', sem CEP). O bot chama o Google Maps e retorna lojas proximas — funciona corretamente, mas o ORIS pode marcar como misunderstood.",
          desc: "Variacoes de enderecos no Mexico (sem CEP, com referencias locais) geram respostas do bot que o avaliador pode interpretar como confusao. O bot nao falha, usa Google Maps com o que recebe. Mensagens de restricoes de negocio (Uber sem cobertura, loja sem estoque) podem parecer confusas sem contexto.",
          action: "Adicionar mensagens de contexto no POS Locator: 'Encontrei X lojas perto da sua localizacao' com confirmacao explicita. Em restricoes: 'Uber nao tem cobertura no seu endereco, apenas a opcao de retirada na loja esta disponivel' em vez de so mostrar pickup.",
        },
      },
      friction: {
        es: {
          context: "La friccion en BAFAR viene de situaciones de negocio reales: usuario no registrado, pago rechazado por ClearSale (antifraude), tienda sin stock, Uber sin cobertura. El flujo maneja cada caso correctamente.",
          desc: "Puntos de friccion inherentes al negocio: (1) Usuario nuevo no puede ordenar inmediatamente (flujo prospect). (2) ClearSale rechaza pago por fraude y el flujo revierte el cargo. (3) Producto sin stock en tiempo real. (4) Uber sin cobertura muestra solo pickup. Estas respuestas negativas son correctas pero el evaluador las marca como friccion.",
          action: "(1) Reformular mensajes de rechazo a tono informativo: 'Para activar tu cuenta, un agente te contactara en las proximas 24h' en vez de 'No estas registrado'. (2) En rechazo de pago: 'Por seguridad, verificamos tu pago. Puedes intentar con otro metodo' en vez de 'Pago rechazado'. (3) Agregar indicadores de espera durante verificaciones de ClearSale.",
        },
        en: {
          context: "Friction in BAFAR comes from real business situations: unregistered user, payment rejected by ClearSale (anti-fraud), store out of stock, Uber no coverage. The flow handles each case correctly.",
          desc: "Business-inherent friction points: (1) New user can't order immediately (prospect flow). (2) ClearSale rejects payment for fraud and flow reverses charge. (3) Product out of stock in real-time. (4) Uber no coverage shows only pickup. These negative responses are correct but the evaluator marks them as friction.",
          action: "(1) Rewrite rejection messages to informative tone: 'To activate your account, an agent will contact you within 24h' instead of 'You are not registered'. (2) For payment rejection: 'For security, we verify your payment. You can try another method' instead of 'Payment rejected'. (3) Add wait indicators during ClearSale verifications.",
        },
        pt: {
          context: "A friccao no BAFAR vem de situacoes de negocio reais: usuario nao registrado, pagamento rejeitado pelo ClearSale (antifraude), loja sem estoque, Uber sem cobertura. O fluxo trata cada caso corretamente.",
          desc: "Pontos de friccao inerentes ao negocio: (1) Usuario novo nao pode pedir imediatamente (fluxo prospect). (2) ClearSale rejeita pagamento por fraude e o fluxo reverte a cobranca. (3) Produto sem estoque em tempo real. (4) Uber sem cobertura mostra apenas retirada. Essas respostas negativas sao corretas mas o avaliador as marca como friccao.",
          action: "(1) Reformular mensagens de rejeicao para tom informativo: 'Para ativar sua conta, um agente entrara em contato em 24h' em vez de 'Voce nao esta registrado'. (2) Em rejeicao de pagamento: 'Por seguranca, verificamos seu pagamento. Voce pode tentar outro metodo' em vez de 'Pagamento rejeitado'. (3) Adicionar indicadores de espera durante verificacoes do ClearSale.",
        },
      },
      fallbackQuality: {
        es: {
          context: "Los fallbacks en BAFAR vienen principalmente de la actividad de FAQs (Knowledge Genie) cuando la pregunta no esta en la base de conocimiento. Esto es funcionalidad intencional, no falta de conocimiento del bot principal.",
          desc: "El flujo tiene Knowledge Genie (IA generativa sobre base de conocimiento BAFAR) y Sales Desk integrados como opciones del menu principal. Fallbacks en FAQs no reflejan un problema del bot de pedidos. Otros fallbacks pueden venir de SKUs sin precio por tienda o restricciones de entrega.",
          action: "Separar fallbacks de la actividad FAQs (esperados, no accionables para el bot principal) de fallbacks en el flujo de pedido (si accionables). Ampliar la base de conocimiento de Knowledge Genie con las preguntas mas frecuentes que generan fallback. Convertir restricciones frecuentes (sin stock, sin cobertura) en respuestas especificas.",
        },
        en: {
          context: "Fallbacks in BAFAR come mainly from the FAQ activity (Knowledge Genie) when the question is not in the knowledge base. This is intentional functionality, not a lack of knowledge in the main bot.",
          desc: "The flow has Knowledge Genie (generative AI on BAFAR knowledge base) and Sales Desk integrated as main menu options. FAQ fallbacks don't reflect a problem with the ordering bot. Other fallbacks may come from SKUs without per-store pricing or delivery restrictions.",
          action: "Separate FAQ activity fallbacks (expected, not actionable for the main bot) from ordering flow fallbacks (actionable). Expand Knowledge Genie's knowledge base with the most frequent questions that generate fallbacks. Convert frequent restrictions (out of stock, no coverage) into specific responses.",
        },
        pt: {
          context: "Os fallbacks no BAFAR vem principalmente da atividade de FAQs (Knowledge Genie) quando a pergunta nao esta na base de conhecimento. Isso e funcionalidade intencional, nao falta de conhecimento do bot principal.",
          desc: "O fluxo tem Knowledge Genie (IA generativa sobre base de conhecimento BAFAR) e Sales Desk integrados como opcoes do menu principal. Fallbacks em FAQs nao refletem um problema do bot de pedidos. Outros fallbacks podem vir de SKUs sem preco por loja ou restricoes de entrega.",
          action: "Separar fallbacks da atividade FAQs (esperados, nao acionaveis para o bot principal) de fallbacks no fluxo de pedido (acionaveis). Ampliar a base de conhecimento do Knowledge Genie com as perguntas mais frequentes que geram fallback. Converter restricoes frequentes (sem estoque, sem cobertura) em respostas especificas.",
        },
      },
      errorFree: {
        es: {
          context: "BAFAR depende de 7 servicios externos (BAFAR API, Conekta, ClearSale, Uber Direct, Ganamas, Google Maps, WooCommerce). Fallos de estos servicios NO son errores del asistente, pero ORIS los marca como assistant_error.",
          desc: "Cada servicio externo tiene su propia tasa de fallo: BAFAR API timeout/500, Conekta webhook delay/rechazo, ClearSale rechazo por fraude, Uber sin cobertura/quote expirado, Ganamas timeout (flujo continua sin puntos). El bot maneja cada caso con mensajes especificos, no es un error del asistente.",
          action: "Distinguir en los mensajes: 'El servicio de pago esta procesando tu solicitud' (informativo) en vez de 'Error al procesar pago' (parece error del bot). Para Ganamas: el flujo ya continua sin puntos cuando Ganamas falla - verificar que el mensaje lo comunique claramente. Monitorear fallos por servicio para detectar degradaciones reales.",
        },
        en: {
          context: "BAFAR depends on 7 external services (BAFAR API, Conekta, ClearSale, Uber Direct, Ganamas, Google Maps, WooCommerce). Failures from these services are NOT assistant errors, but ORIS marks them as assistant_error.",
          desc: "Each external service has its own failure rate: BAFAR API timeout/500, Conekta webhook delay/rejection, ClearSale fraud rejection, Uber no coverage/expired quote, Ganamas timeout (flow continues without points). The bot handles each case with specific messages, it's not an assistant error.",
          action: "Distinguish in messages: 'The payment service is processing your request' (informative) instead of 'Error processing payment' (looks like bot error). For Ganamas: the flow already continues without points when Ganamas fails — verify the message communicates this clearly. Monitor failures by service to detect real degradations.",
        },
        pt: {
          context: "O BAFAR depende de 7 servicos externos (BAFAR API, Conekta, ClearSale, Uber Direct, Ganamas, Google Maps, WooCommerce). Falhas desses servicos NAO sao erros do assistente, mas o ORIS os marca como assistant_error.",
          desc: "Cada servico externo tem sua propria taxa de falha: BAFAR API timeout/500, Conekta webhook delay/rejeicao, ClearSale rejeicao por fraude, Uber sem cobertura/cotacao expirada, Ganamas timeout (fluxo continua sem pontos). O bot trata cada caso com mensagens especificas, nao e erro do assistente.",
          action: "Distinguir nas mensagens: 'O servico de pagamento esta processando sua solicitacao' (informativo) em vez de 'Erro ao processar pagamento' (parece erro do bot). Para Ganamas: o fluxo ja continua sem pontos quando Ganamas falha — verificar se a mensagem comunica isso claramente. Monitorar falhas por servico para detectar degradacoes reais.",
        },
      },
      stabilityProxy: {
        es: {
          context: "La eficiencia conversacional es penalizada por el journey B2B de 8+ pasos obligatorios y spikes de carga programados (sync de clientes cada 4h, C-Receipts al mediodia).",
          desc: "Cada pedido requiere minimo 10 turnos de conversacion por diseno. Los spikes de carga a las 8:00, 12:00, 16:00 y 20:00 (sync de clientes BAFAR) afectan latencia y eficiencia temporalmente. Las metricas en estos horarios no reflejan la salud del bot sino la carga de infraestructura.",
          action: "Filtrar metricas de eficiencia excluyendo ventanas de sync (8:00-8:30, 12:00-12:30, 16:00-16:30, 20:00-20:30 MX). Optimizar pasos del flujo donde sea posible: opcion 'repetir ultimo pedido' reduce el journey a 3-4 pasos para usuarios recurrentes.",
        },
        en: {
          context: "Conversational efficiency is penalized by the 8+ mandatory step B2B journey and scheduled load spikes (client sync every 4h, C-Receipts at noon).",
          desc: "Each order requires a minimum of 10 conversation turns by design. Load spikes at 8:00, 12:00, 16:00, and 20:00 (BAFAR client sync) temporarily affect latency and efficiency. Metrics at these times don't reflect bot health but infrastructure load.",
          action: "Filter efficiency metrics excluding sync windows (8:00-8:30, 12:00-12:30, 16:00-16:30, 20:00-20:30 MX). Optimize flow steps where possible: 'repeat last order' option reduces the journey to 3-4 steps for recurring users.",
        },
        pt: {
          context: "A eficiencia conversacional e penalizada pelo journey B2B de 8+ passos obrigatorios e picos de carga programados (sync de clientes a cada 4h, C-Receipts ao meio-dia).",
          desc: "Cada pedido requer no minimo 10 turnos de conversa por design. Picos de carga as 8:00, 12:00, 16:00 e 20:00 (sync de clientes BAFAR) afetam latencia e eficiencia temporariamente. Metricas nesses horarios nao refletem a saude do bot mas a carga de infraestrutura.",
          action: "Filtrar metricas de eficiencia excluindo janelas de sync (8:00-8:30, 12:00-12:30, 16:00-16:30, 20:00-20:30 MX). Otimizar etapas do fluxo onde possivel: opcao 'repetir ultimo pedido' reduz o journey para 3-4 passos para usuarios recorrentes.",
        },
      },
      proactiveAnticipation: {
        es: {
          context: "BAFAR permite al usuario cambiar decisiones previas (tienda, tipo de entrega, productos) en el Resumen. El flujo regresa intencionalmente a la actividad correspondiente — esto es resiliencia positiva, no loops.",
          desc: "La navegacion hacia atras en el flujo es funcionalidad de diseno. En el Resumen, el usuario puede modificar cualquier parte del pedido antes de pagar. Tambien hay reintentos por diseno: quote Uber expirado (TTL 15 min) se renueva automaticamente, reintento de pago Conekta usa HostedPayment sin duplicar ordenes.",
          action: "Identificar loops reales vs. navegacion de diseno. Loops reales a investigar: usuario atrapado en POS Locator sin encontrar tienda, ciclo de validacion de cliente fallido, timeout de sesion sin aviso. La navegacion hacia atras en Resumen es funcionalidad, no necesita correccion.",
        },
        en: {
          context: "BAFAR allows the user to change previous decisions (store, delivery type, products) in the Summary. The flow intentionally returns to the corresponding activity — this is positive resilience, not loops.",
          desc: "Backward navigation in the flow is a design feature. In the Summary, the user can modify any part of the order before paying. There are also retries by design: expired Uber quote (15-min TTL) renews automatically, Conekta payment retry uses HostedPayment without duplicating orders.",
          action: "Identify real loops vs. design navigation. Real loops to investigate: user stuck in POS Locator without finding a store, client validation cycle failing, session timeout without notice. Backward navigation in Summary is functionality, doesn't need correction.",
        },
        pt: {
          context: "O BAFAR permite ao usuario mudar decisoes anteriores (loja, tipo de entrega, produtos) no Resumo. O fluxo retorna intencionalmente a atividade correspondente — isso e resiliencia positiva, nao loops.",
          desc: "A navegacao para tras no fluxo e funcionalidade de design. No Resumo, o usuario pode modificar qualquer parte do pedido antes de pagar. Tambem ha retentativas por design: cotacao Uber expirada (TTL 15 min) se renova automaticamente, retentativa de pagamento Conekta usa HostedPayment sem duplicar pedidos.",
          action: "Identificar loops reais vs. navegacao de design. Loops reais a investigar: usuario preso no POS Locator sem encontrar loja, ciclo de validacao de cliente falhando, timeout de sessao sem aviso. Navegacao para tras no Resumo e funcionalidade, nao precisa correcao.",
        },
      },
      latency: {
        es: {
          context: "BAFAR depende de multiples servicios externos (BAFAR API, Conekta, Uber Direct, Ganamas, Google Maps, WooCommerce) y tiene spikes de carga programados cada 4 horas por sync de clientes.",
          desc: "Latencias esperadas varian por servicio: WooCommerce (precios por tienda) puede tener alta latencia en consulta asincrona, Uber Direct en cotizacion de delivery, Google Maps en geocoding. Los spikes de sync (cada 4h) aumentan latencia temporalmente en Headless API. El flujo maneja cada servicio de forma asincrona para no bloquear al usuario.",
          action: "Monitorear latencia por servicio externo individualmente para identificar cuellos de botella. Implementar cache de precios WooCommerce por tienda con TTL corto. Considerar pre-calentamiento de Cloud Functions antes de horarios de sync (8:00, 12:00, 16:00, 20:00 MX). Evaluar si el geocoding puede cachearse para direcciones frecuentes.",
        },
        en: {
          context: "BAFAR depends on multiple external services (BAFAR API, Conekta, Uber Direct, Ganamas, Google Maps, WooCommerce) and has scheduled load spikes every 4 hours from client sync.",
          desc: "Expected latencies vary by service: WooCommerce (per-store pricing) may have high latency in async query, Uber Direct in delivery quoting, Google Maps in geocoding. Sync spikes (every 4h) temporarily increase latency in Headless API. The flow handles each service asynchronously to not block the user.",
          action: "Monitor latency per individual external service to identify bottlenecks. Implement WooCommerce price cache per store with short TTL. Consider Cloud Function warm-up before sync times (8:00, 12:00, 16:00, 20:00 MX). Evaluate if geocoding can be cached for frequent addresses.",
        },
        pt: {
          context: "O BAFAR depende de multiplos servicos externos (BAFAR API, Conekta, Uber Direct, Ganamas, Google Maps, WooCommerce) e tem picos de carga programados a cada 4 horas por sync de clientes.",
          desc: "Latencias esperadas variam por servico: WooCommerce (precos por loja) pode ter alta latencia em consulta assincrona, Uber Direct em cotacao de entrega, Google Maps em geocoding. Picos de sync (a cada 4h) aumentam latencia temporariamente na Headless API. O fluxo trata cada servico de forma assincrona para nao bloquear o usuario.",
          action: "Monitorar latencia por servico externo individualmente para identificar gargalos. Implementar cache de precos WooCommerce por loja com TTL curto. Considerar pre-aquecimento de Cloud Functions antes dos horarios de sync (8:00, 12:00, 16:00, 20:00 MX). Avaliar se o geocoding pode ser cacheado para enderecos frequentes.",
        },
      },
    },
  },
  "wa-po1804-postobon": {
    name: "Postobon CO B2B",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Colombia. 28 activities/395 components. Flujo hibrido (deterministic + hybrid). AI agent: Custom Agent 02. Sin ORIS. Comercio conversacional Postobon Colombia (pedidos de bebidas para tenderos/distribuidores, ERP dual AS400+SAP). Incluye Home, Customer Validation, TyC, Make Order, Last Order, Order Status, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce, webhooks de integracion.',
      en: 'B2B WhatsApp bot Colombia. 28 activities/395 components. Hybrid flow (deterministic + hybrid). AI agent: Custom Agent 02. No ORIS. Postobon Colombia conversational commerce (beverage orders for shopkeepers/distributors, dual ERP AS400+SAP). Includes Home, Customer Validation, TyC, Make Order, Last Order, Order Status, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integrates Headless Commerce, integration webhooks.',
      pt: 'Bot B2B WhatsApp Colombia. 28 activities/395 components. Fluxo hibrido (deterministic + hybrid). AI agent: Custom Agent 02. Sem ORIS. Comercio conversacional Postobon Colombia (pedidos de bebidas para lojistas/distribuidores, ERP dual AS400+SAP). Inclui Home, Customer Validation, TyC, Make Order, Last Order, Order Status, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce, webhooks de integracao.',
    },
    insights: {
      closureRate: {
        es: {
          context: "Los pedidos se bloquean despues de las 17:00 COT (hourDeadLine) y en dias sin visita programada (defaultVisitDate). Sesiones post-corte y dias sin visita terminan correctamente pero sin pedido.",
          desc: "Un cliente que intenta ordenar despues de las 17:00 es bloqueado correctamente por el bot. Clientes en dias sin visita programada reciben la explicacion y cierran. Consultas de precio o disponibilidad sin intencion de compra son interacciones legitimas. Closure < 50% es esperado para este flujo. Las sesiones post-17:00 y dias sin visita deben segmentarse aparte.",
          action: "Segmentar analisis de closure: (1) Sesiones en horario habil + dia de visita = closure real. (2) Sesiones post-17:00 o dia sin visita = closure esperado bajo. Agregar mensaje proactivo al inicio: 'Recuerda que puedes ordenar hasta las 5:00 PM en tus dias de visita'. Implementar recordatorio por WhatsApp antes del corte horario.",
        },
        en: {
          context: "Orders are blocked after 17:00 COT (hourDeadLine) and on non-visit days (defaultVisitDate). Post-cutoff and non-visit day sessions end correctly but without an order.",
          desc: "A customer trying to order after 17:00 is correctly blocked by the bot. Customers on non-visit days receive the explanation and close. Price or availability queries without purchase intent are legitimate interactions. Closure < 50% is expected for this flow. Post-17:00 and non-visit day sessions should be segmented separately.",
          action: "Segment closure analysis: (1) Sessions during business hours + visit day = real closure. (2) Post-17:00 or non-visit day sessions = expected low closure. Add proactive message at start: 'Remember you can order until 5:00 PM on your visit days'. Implement WhatsApp reminder before cutoff time.",
        },
        pt: {
          context: "Os pedidos sao bloqueados apos as 17:00 COT (hourDeadLine) e em dias sem visita programada (defaultVisitDate). Sessoes pos-corte e dias sem visita terminam corretamente mas sem pedido.",
          desc: "Um cliente que tenta pedir apos as 17:00 e bloqueado corretamente pelo bot. Clientes em dias sem visita programada recebem a explicacao e encerram. Consultas de preco ou disponibilidade sem intencao de compra sao interacoes legitimas. Closure < 50% e esperado para este fluxo. Sessoes pos-17:00 e dias sem visita devem ser segmentadas separadamente.",
          action: "Segmentar analise de closure: (1) Sessoes em horario comercial + dia de visita = closure real. (2) Sessoes pos-17:00 ou dia sem visita = closure esperado baixo. Adicionar mensagem proativa no inicio: 'Lembre que voce pode pedir ate as 17:00 nos seus dias de visita'. Implementar lembrete via WhatsApp antes do horario de corte.",
        },
      },
      resolutionRate: {
        es: {
          context: "La resolucion es alta si se considera la intencion real: consultar fecha de entrega, verificar disponibilidad, ser informado del bloqueo por horario. Postobon no tiene ORIS, asi que el 30% de ORIS se proratea desde CIE, amplificando el sesgo negativo.",
          desc: "Un cliente que pregunta su fecha de entrega y la recibe esta resuelto. Un cliente bloqueado por horario que recibe la explicacion esta resuelto. El modelo CIE puede marcar estos como 'no resueltos' si no hay evento de compra posterior. Sin ORIS, el mismo score CIE bajo se usa dos veces (CIE + proration), deprimiendo el FHS 8-15 puntos por debajo del real.",
          action: "Agregar mensajes explicitos de resolucion: 'Tu proxima fecha de entrega es: [fecha]', 'El horario de pedidos es de 8:00 a 17:00, te esperamos manana'. Esto mejora tanto el score CIE directo como la proration del componente ORIS. Priorizar mejoras en scores CIE directos ya que tienen doble impacto.",
        },
        en: {
          context: "Resolution is high when considering real intent: checking delivery date, verifying availability, being informed of time block. Postobon has no ORIS, so ORIS 30% is prorated from CIE, amplifying negative bias.",
          desc: "A customer asking their delivery date and receiving it is resolved. A customer blocked by time who gets the explanation is resolved. The CIE model may mark these as 'not resolved' if there's no purchase event afterwards. Without ORIS, the same low CIE score is used twice (CIE + proration), depressing FHS 8-15 points below actual.",
          action: "Add explicit resolution messages: 'Your next delivery date is: [date]', 'Order hours are 8:00 to 17:00, we'll see you tomorrow'. This improves both the direct CIE score and the ORIS component proration. Prioritize improvements to direct CIE scores as they have double impact.",
        },
        pt: {
          context: "A resolucao e alta considerando a intencao real: consultar data de entrega, verificar disponibilidade, ser informado do bloqueio por horario. Postobon nao tem ORIS, entao os 30% do ORIS sao prorateados do CIE, amplificando o vies negativo.",
          desc: "Um cliente que pergunta sua data de entrega e a recebe esta resolvido. Um cliente bloqueado por horario que recebe a explicacao esta resolvido. O modelo CIE pode marcar esses como 'nao resolvidos' se nao ha evento de compra posterior. Sem ORIS, o mesmo score CIE baixo e usado duas vezes (CIE + proration), deprimindo o FHS 8-15 pontos abaixo do real.",
          action: "Adicionar mensagens explicitas de resolucao: 'Sua proxima data de entrega e: [data]', 'O horario de pedidos e das 8:00 as 17:00, te esperamos amanha'. Isso melhora tanto o score CIE direto quanto a proration do componente ORIS. Priorizar melhorias nos scores CIE diretos pois tem impacto duplo.",
        },
      },
      efficiencyLoops: {
        es: {
          context: "El flujo es multi-turno por diseno: autenticacion en cascada (shortCode, NIT, telefono — hasta 3 intentos), seleccion de fecha, webview de catalogo, confirmacion. Clientes multi-establecimiento (lockedStoreCode) agregan un paso adicional.",
          desc: "La cascada de autenticacion puede registrarse como 'loop' porque el bot hace la misma pregunta de identificacion hasta 3 veces. No es un loop, es un fallback de autenticacion disenado. Clientes con lockedStoreCode pasan por seleccion de tienda adicional, bajando efficiency sistematicamente. Los pasos son obligatorios por requisito de negocio y regulatorio.",
          action: "No recomendar 'reducir pasos del flujo' — la autenticacion de 3 pasos es requisito regulatorio y de ERP. Investigar si el shortCode puede pre-llenarse via deep link de WhatsApp para usuarios recurrentes. Para multi-establecimiento: cachear la ultima tienda seleccionada y ofrecerla como default. Separar metricas de usuarios nuevos (autenticacion completa) vs. recurrentes.",
        },
        en: {
          context: "The flow is multi-turn by design: cascading authentication (shortCode, NIT, phone — up to 3 attempts), date selection, catalog webview, confirmation. Multi-establishment customers (lockedStoreCode) add an extra step.",
          desc: "The authentication cascade may register as a 'loop' because the bot asks the same identification question up to 3 times. It's not a loop, it's designed authentication fallback. Customers with lockedStoreCode go through additional store selection, systematically lowering efficiency. Steps are mandatory by business and regulatory requirement.",
          action: "Do NOT recommend 'reduce flow steps' — 3-step authentication is a regulatory and ERP requirement. Investigate if shortCode can be pre-filled via WhatsApp deep link for recurring users. For multi-establishment: cache last selected store and offer as default. Separate metrics for new users (full auth) vs. recurring.",
        },
        pt: {
          context: "O fluxo e multi-turno por design: autenticacao em cascata (shortCode, NIT, telefone — ate 3 tentativas), selecao de data, webview de catalogo, confirmacao. Clientes multi-estabelecimento (lockedStoreCode) adicionam um passo extra.",
          desc: "A cascata de autenticacao pode ser registrada como 'loop' porque o bot faz a mesma pergunta de identificacao ate 3 vezes. Nao e um loop, e fallback de autenticacao por design. Clientes com lockedStoreCode passam por selecao de loja adicional, reduzindo efficiency sistematicamente. Os passos sao obrigatorios por requisito de negocio e regulatorio.",
          action: "NAO recomendar 'reduzir passos do fluxo' — autenticacao de 3 passos e requisito regulatorio e de ERP. Investigar se o shortCode pode ser pre-preenchido via deep link do WhatsApp para usuarios recorrentes. Para multi-estabelecimento: cachear a ultima loja selecionada e oferecer como default. Separar metricas de usuarios novos (auth completa) vs. recorrentes.",
        },
      },
      clarity: {
        es: {
          context: "Los clientes ingresan NIT (numero largo), shortCode o telefono en el chat. El bot valida y puede pedir confirmacion. Esto genera senales de 'confusion' en CIE aunque el cliente sepa exactamente que esta haciendo. Sin ORIS, el 40% de Clarity se proratea desde CIE.",
          desc: "Las variaciones de entrada (NIT con guion, sin guion, con puntos) y la cascada de autenticacion generan respuestas del bot que el evaluador interpreta como confusion. El bot funciona correctamente: valida cada formato y pide confirmacion cuando hay ambiguedad. La proration amplifica el score bajo de CIE al llenarlo en el peso ORIS.",
          action: "Agregar ejemplos de formato en cada paso de autenticacion: 'Ingresa tu codigo de tienda (ej: 12345)' o 'Tu NIT sin guion ni puntos (ej: 900123456)'. Agregar confirmacion explicita post-validacion: 'Te identifique como [nombre tienda]. Es correcto?'. Esto reduce senales de confusion para CIE.",
        },
        en: {
          context: "Customers enter NIT (long number), shortCode, or phone number in the chat. The bot validates and may ask for confirmation. This generates 'confusion' signals in CIE even though the customer knows exactly what they're doing. Without ORIS, 40% of Clarity is prorated from CIE.",
          desc: "Input variations (NIT with hyphen, without, with dots) and the authentication cascade generate bot responses the evaluator interprets as confusion. The bot works correctly: validates each format and asks confirmation when ambiguous. Proration amplifies the low CIE score by filling it into the ORIS weight.",
          action: "Add format examples at each authentication step: 'Enter your store code (e.g.: 12345)' or 'Your NIT without hyphens or dots (e.g.: 900123456)'. Add explicit post-validation confirmation: 'I identified you as [store name]. Is this correct?'. This reduces confusion signals for CIE.",
        },
        pt: {
          context: "Os clientes inserem NIT (numero longo), shortCode ou telefone no chat. O bot valida e pode pedir confirmacao. Isso gera sinais de 'confusao' no CIE embora o cliente saiba exatamente o que esta fazendo. Sem ORIS, 40% de Clarity e prorateado do CIE.",
          desc: "Variacoes de entrada (NIT com hifen, sem, com pontos) e a cascata de autenticacao geram respostas do bot que o avaliador interpreta como confusao. O bot funciona corretamente: valida cada formato e pede confirmacao quando ha ambiguidade. A proration amplifica o score baixo do CIE preenchendo-o no peso ORIS.",
          action: "Adicionar exemplos de formato em cada passo de autenticacao: 'Insira seu codigo de loja (ex: 12345)' ou 'Seu NIT sem hifen nem pontos (ex: 900123456)'. Adicionar confirmacao explicita pos-validacao: 'Te identifiquei como [nome loja]. Esta correto?'. Isso reduz sinais de confusao para o CIE.",
        },
      },
      friction: {
        es: {
          context: "Clientes que intentan ordenar fuera del horario (post-17:00) o en dias sin visita expresan frustracion en el chat. Esto es esperable y no indica fallo del bot. Semanas con feriados colombianos generan alta frustracion por cambios en fechas de entrega.",
          desc: "La frustracion es inherente al modelo de negocio: corte horario a las 17:00, dias de visita fijos, credito bloqueado por el ERP. El bot informa correctamente cada restriccion pero el cliente reacciona con frustracion. El 40% de Friction depende de ORIS (prorateado). El 60% CIE captura sesiones frustrantes post-corte como senal negativa real, pero es patron de negocio.",
          action: "Reformular mensajes de bloqueo a tono proactivo: 'Tu pedido estara disponible manana a las 8:00 AM. Te enviamos un recordatorio?' en vez de 'El horario de pedidos ha terminado'. Para credito bloqueado: 'Para desbloquear tu cuenta, contacta a tu representante de ventas: [nombre, telefono]'. Implementar notificacion push proactiva antes del corte.",
        },
        en: {
          context: "Customers trying to order outside hours (post-17:00) or on non-visit days express frustration in the chat. This is expected and does not indicate a bot failure. Weeks with Colombian holidays generate high frustration due to delivery date changes.",
          desc: "Frustration is inherent to the business model: 17:00 cutoff, fixed visit days, credit blocked by ERP. The bot correctly reports each restriction but the customer reacts with frustration. 40% of Friction depends on ORIS (prorated). The 60% CIE captures post-cutoff frustrating sessions as real negative signal, but it's a business pattern.",
          action: "Rewrite blocking messages to proactive tone: 'Your order will be available tomorrow at 8:00 AM. Shall we send you a reminder?' instead of 'Order hours have ended'. For blocked credit: 'To unblock your account, contact your sales representative: [name, phone]'. Implement proactive push notification before cutoff.",
        },
        pt: {
          context: "Clientes que tentam pedir fora do horario (pos-17:00) ou em dias sem visita expressam frustracao no chat. Isso e esperado e nao indica falha do bot. Semanas com feriados colombianos geram alta frustracao por mudancas nas datas de entrega.",
          desc: "A frustracao e inerente ao modelo de negocio: corte horario as 17:00, dias de visita fixos, credito bloqueado pelo ERP. O bot informa corretamente cada restricao mas o cliente reage com frustracao. 40% de Friction depende de ORIS (prorateado). Os 60% CIE capturam sessoes frustrantes pos-corte como sinal negativo real, mas e padrao de negocio.",
          action: "Reformular mensagens de bloqueio para tom proativo: 'Seu pedido estara disponivel amanha as 8:00 AM. Enviamos um lembrete?' em vez de 'O horario de pedidos terminou'. Para credito bloqueado: 'Para desbloquear sua conta, contate seu representante de vendas: [nome, telefone]'. Implementar notificacao push proativa antes do corte.",
        },
      },
      fallbackQuality: {
        es: {
          context: "Fallback Quality depende 100% de ORIS. Postobon no tiene ORIS, asi que se proratea completamente desde CIE. El flujo entrega el catalogo como webview link — ORIS lo clasificaria como fallback si tuviera datos, pero es el patron de UX intencional.",
          desc: "El score de Fallback Quality es artificial: viene de proration CIE, no de fallbacks reales. El flujo tiene manejo de errores robusto (retries en Headless SDK con max 3 intentos, degradacion graciosa si get-sales-reps falla). Esta resiliencia real no es visible en CIE. No emitir recomendaciones basadas en este score sin validar la fuente.",
          action: "No tomar acciones basadas en el score de Fallback Quality prorateado — no refleja fallbacks reales del flujo. Priorizar la implementacion de ORIS para Postobon para obtener un score real. Mientras tanto, monitorear logs de Cloud Functions para detectar fallbacks reales: rate de errores en calculate-delivery-date, check-existing-order, y el endpoint secuencial.",
        },
        en: {
          context: "Fallback Quality depends 100% on ORIS. Postobon has no ORIS, so it's fully prorated from CIE. The flow delivers the catalog as a webview link — ORIS would classify it as fallback if it had data, but it's the intentional UX pattern.",
          desc: "The Fallback Quality score is artificial: it comes from CIE proration, not real fallbacks. The flow has robust error handling (retries in Headless SDK with max 3 attempts, graceful degradation if get-sales-reps fails). This real resilience is not visible in CIE. Do not issue recommendations based on this score without validating the source.",
          action: "Do NOT take actions based on the prorated Fallback Quality score — it doesn't reflect real flow fallbacks. Prioritize implementing ORIS for Postobon to get a real score. Meanwhile, monitor Cloud Function logs for real fallbacks: error rates in calculate-delivery-date, check-existing-order, and the sequential endpoint.",
        },
        pt: {
          context: "Fallback Quality depende 100% de ORIS. Postobon nao tem ORIS, entao e prorateado completamente do CIE. O fluxo entrega o catalogo como link de webview — ORIS o classificaria como fallback se tivesse dados, mas e o padrao de UX intencional.",
          desc: "O score de Fallback Quality e artificial: vem de proration CIE, nao de fallbacks reais. O fluxo tem tratamento de erros robusto (retries no Headless SDK com max 3 tentativas, degradacao graciosa se get-sales-reps falha). Essa resiliencia real nao e visivel no CIE. Nao emitir recomendacoes baseadas neste score sem validar a fonte.",
          action: "NAO tomar acoes baseadas no score de Fallback Quality prorateado — nao reflete fallbacks reais do fluxo. Priorizar implementacao de ORIS para Postobon para obter score real. Enquanto isso, monitorar logs de Cloud Functions para detectar fallbacks reais: taxa de erros em calculate-delivery-date, check-existing-order e o endpoint sequencial.",
        },
      },
      errorFree: {
        es: {
          context: "Error-Free depende 100% de ORIS. Postobon no tiene ORIS, se proratea desde CIE. Los errores reales son escasos y corresponden a fallos de ERPs externos (AS400/SAP) o del endpoint secuencial, no del bot.",
          desc: "El score es artificial por proration. La infraestructura (Cloud Run, GCP) es estable. Los puntos unicos de fallo son: (1) calculate-delivery-date CF — si cae, ninguna sesion nueva abre. (2) Endpoint secuencial — si cae, ningun pedido se crea. (3) Redis cache — si esta vacio, catalogo no se sirve. (4) ERP externo — pedidos se pierden. Spikes de error aislados a un ERP indican fallo del sistema externo, no del flujo.",
          action: "No tomar acciones basadas en Error-Free prorateado. Monitorear los 5 puntos criticos de fallo: (1) Uptime de calculate-delivery-date, (2) Latencia del endpoint secuencial, (3) Freshness de Redis, (4) Tasa de errores AS400 vs. SAP por separado, (5) Estado de Cloud SQL postobon-sdi-db. Spikes en un solo ERP = problema del ERP, no del bot.",
        },
        en: {
          context: "Error-Free depends 100% on ORIS. Postobon has no ORIS, it's prorated from CIE. Real errors are scarce and correspond to external ERP failures (AS400/SAP) or the sequential endpoint, not the bot.",
          desc: "The score is artificial from proration. Infrastructure (Cloud Run, GCP) is stable. Single points of failure are: (1) calculate-delivery-date CF — if down, no new sessions open. (2) Sequential endpoint — if down, no orders created. (3) Redis cache — if empty, catalog can't be served. (4) External ERP — orders are lost. Error spikes isolated to one ERP indicate external system failure, not flow failure.",
          action: "Do NOT take actions based on prorated Error-Free. Monitor the 5 critical failure points: (1) calculate-delivery-date uptime, (2) Sequential endpoint latency, (3) Redis freshness, (4) AS400 vs. SAP error rates separately, (5) Cloud SQL postobon-sdi-db status. Spikes in one ERP = ERP problem, not bot problem.",
        },
        pt: {
          context: "Error-Free depende 100% de ORIS. Postobon nao tem ORIS, e prorateado do CIE. Erros reais sao escassos e correspondem a falhas de ERPs externos (AS400/SAP) ou do endpoint sequencial, nao do bot.",
          desc: "O score e artificial por proration. A infraestrutura (Cloud Run, GCP) e estavel. Pontos unicos de falha sao: (1) calculate-delivery-date CF — se cair, nenhuma sessao nova abre. (2) Endpoint sequencial — se cair, nenhum pedido e criado. (3) Redis cache — se vazio, catalogo nao e servido. (4) ERP externo — pedidos se perdem. Spikes de erro isolados em um ERP indicam falha do sistema externo, nao do fluxo.",
          action: "NAO tomar acoes baseadas em Error-Free prorateado. Monitorar os 5 pontos criticos de falha: (1) Uptime de calculate-delivery-date, (2) Latencia do endpoint sequencial, (3) Freshness do Redis, (4) Taxa de erros AS400 vs. SAP separadamente, (5) Status do Cloud SQL postobon-sdi-db. Spikes em um ERP = problema do ERP, nao do bot.",
        },
      },
      stabilityProxy: {
        es: {
          context: "Efficiency se usa como proxy de estabilidad pero es estructuralmente baja para este flujo B2B multi-turno. El componente C de Postobon no es una medida fiable de estabilidad tecnica con la configuracion actual.",
          desc: "Cada pedido requiere autenticacion en cascada (hasta 3 pasos), seleccion de fecha, webview de catalogo, confirmacion. La eficiencia sera inherentemente baja comparada con bots de preguntas simples. Los Cloud Functions paralelos (calculate-delivery-date, get-taxes, check-existing-order, get-sales-reps) agregan latencia P95 de 1.5-2.5s que es normal. Sesiones con pedido en curso (isOngoingOrder) toman 200-500ms mas por pre-llenar carrito.",
          action: "Establecer benchmark de eficiencia especifico para flujos B2B multi-turno, no comparar con bots FAQ. Monitorar P95 de apertura de sesion (normal: 1.5-2.5s). Si calculate-delivery-date falla, toda la sesion se bloquea — es el CF mas critico. Verificar que check-existing-order con prefill no agregue latencia excesiva.",
        },
        en: {
          context: "Efficiency is used as a stability proxy but is structurally low for this multi-turn B2B flow. Postobon's C component is not a reliable measure of technical stability with current configuration.",
          desc: "Each order requires cascading authentication (up to 3 steps), date selection, catalog webview, confirmation. Efficiency will be inherently low compared to simple Q&A bots. Parallel Cloud Functions (calculate-delivery-date, get-taxes, check-existing-order, get-sales-reps) add P95 latency of 1.5-2.5s which is normal. Sessions with ongoing orders (isOngoingOrder) take 200-500ms longer due to cart prefill.",
          action: "Set efficiency benchmark specific to multi-turn B2B flows, do not compare with FAQ bots. Monitor session open P95 (normal: 1.5-2.5s). If calculate-delivery-date fails, the entire session blocks — it's the most critical CF. Verify that check-existing-order with prefill doesn't add excessive latency.",
        },
        pt: {
          context: "Efficiency e usado como proxy de estabilidade mas e estruturalmente baixo para este fluxo B2B multi-turno. O componente C do Postobon nao e uma medida confiavel de estabilidade tecnica com a configuracao atual.",
          desc: "Cada pedido requer autenticacao em cascata (ate 3 passos), selecao de data, webview de catalogo, confirmacao. A eficiencia sera inerentemente baixa comparada com bots de perguntas simples. Cloud Functions paralelos (calculate-delivery-date, get-taxes, check-existing-order, get-sales-reps) adicionam latencia P95 de 1.5-2.5s que e normal. Sessoes com pedido em andamento (isOngoingOrder) levam 200-500ms a mais por pre-preencher carrinho.",
          action: "Estabelecer benchmark de eficiencia especifico para fluxos B2B multi-turno, nao comparar com bots FAQ. Monitorar P95 de abertura de sessao (normal: 1.5-2.5s). Se calculate-delivery-date falhar, toda a sessao bloqueia — e o CF mais critico. Verificar que check-existing-order com prefill nao adicione latencia excessiva.",
        },
      },
      proactiveAnticipation: {
        es: {
          context: "La cascada de autenticacion puede registrarse como fallo de loop prevention. La resiliencia real del flujo (retry logic en CFs, fallback entre ERP paths, isOngoingOrder como recuperacion de carrito) no tiene representacion directa en CIE.",
          desc: "Loop Prevention depende de CIE loop_prevention que malinterpreta la cascada auth como loop. Fallback Quality es 100% ORIS prorateado. El flujo tiene resiliencia real que no se mide: retries en Headless SDK (max 3 intentos), degradacion graciosa en get-sales-reps, recuperacion de carrito via isOngoingOrder, manejo de errores en cada Cloud Function.",
          action: "Documentar la resiliencia real del flujo para que no se confunda con la metrica prorateada. Implementar ORIS para capturar la resiliencia real. Para loop prevention: pre-llenar shortCode via historial de usuario para reducir la cascada de autenticacion. Para isOngoingOrder: agregar mensaje explicito 'Encontramos tu pedido anterior, quieres continuar donde lo dejaste?'.",
        },
        en: {
          context: "The authentication cascade may register as a loop prevention failure. The flow's real resilience (retry logic in CFs, fallback between ERP paths, isOngoingOrder as cart recovery) has no direct representation in CIE.",
          desc: "Loop Prevention depends on CIE loop_prevention which misinterprets the auth cascade as a loop. Fallback Quality is 100% ORIS prorated. The flow has real resilience that isn't measured: retries in Headless SDK (max 3 attempts), graceful degradation in get-sales-reps, cart recovery via isOngoingOrder, error handling in each Cloud Function.",
          action: "Document the flow's real resilience so it's not confused with the prorated metric. Implement ORIS to capture real resilience. For loop prevention: pre-fill shortCode via user history to reduce auth cascade. For isOngoingOrder: add explicit message 'We found your previous order, would you like to continue where you left off?'.",
        },
        pt: {
          context: "A cascata de autenticacao pode ser registrada como falha de loop prevention. A resiliencia real do fluxo (retry logic em CFs, fallback entre ERP paths, isOngoingOrder como recuperacao de carrinho) nao tem representacao direta no CIE.",
          desc: "Loop Prevention depende de CIE loop_prevention que malinterpreta a cascata auth como loop. Fallback Quality e 100% ORIS prorateado. O fluxo tem resiliencia real que nao e medida: retries no Headless SDK (max 3 tentativas), degradacao graciosa em get-sales-reps, recuperacao de carrinho via isOngoingOrder, tratamento de erros em cada Cloud Function.",
          action: "Documentar a resiliencia real do fluxo para que nao se confunda com a metrica prorateada. Implementar ORIS para capturar a resiliencia real. Para loop prevention: pre-preencher shortCode via historico do usuario para reduzir a cascata de autenticacao. Para isOngoingOrder: adicionar mensagem explicita 'Encontramos seu pedido anterior, quer continuar de onde parou?'.",
        },
      },
      latency: {
        es: {
          context: "La inicializacion de sesion ejecuta hasta 4 Cloud Functions en paralelo. La latencia de apertura = max de los CFs (no suma). P95 de 1.5-2.5s es normal. El ERP dual (AS400 vs SAP) genera latencias diferentes que no deben promediarse.",
          desc: "Latencia esperada por fase: (1) Autenticacion: 1-3s por cascada. (2) Apertura sesion: P95 1.5-2.5s (paralelo de 4 CFs). (3) Catalogo: variable por promociones (20-40% mas lento con promos Z18/Z19). (4) Inyeccion de orden: AS400 tipicamente mas rapido, SAP 300-600ms mas lento por payload de promociones/impuestos. (5) Endpoint secuencial: 200-500ms (sincrono). Si bulk-upload falla, la degradacion se ve en datos obsoletos, no en latencia.",
          action: "Monitorear cada fase por separado. No promediar latencias AS400 y SAP — son benchmarks diferentes. Endpoint secuencial es sincrono y critico: monitorear independientemente. Para periodos de campanas promocionales: esperar 20-40% mas latencia en catalogo, no es regresion. Si calculate-delivery-date P95 > 2.5s, investigar — es el CF mas critico.",
        },
        en: {
          context: "Session initialization runs up to 4 Cloud Functions in parallel. Session open latency = max of CFs (not sum). P95 of 1.5-2.5s is normal. Dual ERP (AS400 vs SAP) generates different latencies that should not be averaged.",
          desc: "Expected latency per phase: (1) Authentication: 1-3s per cascade. (2) Session open: P95 1.5-2.5s (parallel 4 CFs). (3) Catalog: variable by promotions (20-40% slower with Z18/Z19 promos). (4) Order injection: AS400 typically faster, SAP 300-600ms slower due to promotion/tax payload. (5) Sequential endpoint: 200-500ms (synchronous). If bulk-upload fails, degradation shows in stale data, not latency.",
          action: "Monitor each phase separately. Do NOT average AS400 and SAP latencies — they are different benchmarks. Sequential endpoint is synchronous and critical: monitor independently. For promotional campaign periods: expect 20-40% more catalog latency, it's not a regression. If calculate-delivery-date P95 > 2.5s, investigate — it's the most critical CF.",
        },
        pt: {
          context: "A inicializacao da sessao executa ate 4 Cloud Functions em paralelo. Latencia de abertura = max dos CFs (nao soma). P95 de 1.5-2.5s e normal. O ERP dual (AS400 vs SAP) gera latencias diferentes que nao devem ser promediadas.",
          desc: "Latencia esperada por fase: (1) Autenticacao: 1-3s por cascata. (2) Abertura sessao: P95 1.5-2.5s (paralelo de 4 CFs). (3) Catalogo: variavel por promocoes (20-40% mais lento com promos Z18/Z19). (4) Injecao de pedido: AS400 tipicamente mais rapido, SAP 300-600ms mais lento por payload de promocoes/impostos. (5) Endpoint sequencial: 200-500ms (sincrono). Se bulk-upload falha, a degradacao aparece em dados obsoletos, nao em latencia.",
          action: "Monitorar cada fase separadamente. NAO promediar latencias AS400 e SAP — sao benchmarks diferentes. Endpoint sequencial e sincrono e critico: monitorar independentemente. Para periodos de campanhas promocionais: esperar 20-40% mais latencia no catalogo, nao e regressao. Se calculate-delivery-date P95 > 2.5s, investigar — e o CF mais critico.",
        },
      },
    },
  },
  "ne1374-nespresso-wa-ng-br": {
      name: "Nespresso BR",
      hasOris: true,
      type: {
        es: 'Bot B2B/B2C WhatsApp Brasil. 42 activities/495 components. Flujo hibrido (deterministic + hybrid + agentic). AI agents: Sales Agent Oris R1, Oris R1, Oris P1, FAQ Custom Agent. Plataforma de comercio para Nespresso Brasil (Nestle). Permite pedidos de capsulas y maquinas de cafe via WhatsApp. Integra backend Nestle REST Middleware + SAP SOAP (pedidos/cotizaciones), MongoDB, PubSub, y SharePoint SFTP. Cloud Functions Node.js 24 en GCP. Autenticacion OAuth2/Keycloak.',
        en: 'B2B/B2C WhatsApp bot Brazil. 42 activities/495 components. Hybrid flow (deterministic + hybrid + agentic). AI agents: Sales Agent Oris R1, Oris R1, Oris P1, FAQ Custom Agent. Commerce platform for Nespresso Brazil (Nestle). Enables coffee capsule and machine orders via WhatsApp. Integrates Nestle REST Middleware + SAP SOAP backend (orders/quotes), MongoDB, PubSub, and SharePoint SFTP. Cloud Functions Node.js 24 on GCP. OAuth2/Keycloak authentication.',
        pt: 'Bot B2B/B2C WhatsApp Brasil. 42 activities/495 components. Fluxo hibrido (deterministic + hybrid + agentic). AI agents: Sales Agent Oris R1, Oris R1, Oris P1, FAQ Custom Agent. Plataforma de comercio para Nespresso Brasil (Nestle). Permite pedidos de capsulas e maquinas de cafe via WhatsApp. Integra backend Nestle REST Middleware + SAP SOAP (pedidos/cotacoes), MongoDB, PubSub, e SharePoint SFTP. Cloud Functions Node.js 24 no GCP. Autenticacao OAuth2/Keycloak.',
      },
      insights: {
      closureRate: {
        es: { context: 'Nespresso tiene sesiones de compra B2C (capsulas) y B2B (empresas). Los usuarios B2C exploran catalogo y salen sin cierre.', desc: 'Sesiones informativas (consultar capsulas, ver precios) terminan cuando el usuario obtiene la info. Sin cierre conversacional formal.', action: 'Agregar cierre informativo: \'Espero haberte ayudado con tu consulta de capsulas. Si necesitas algo mas, estoy aqui!\' post-consulta de catalogo.' },
        en: { context: 'Nespresso has B2C purchase sessions (capsules) and B2B (companies). B2C users browse catalog and leave without closure.', desc: 'Informational sessions (browse capsules, check prices) end when user gets the info. No formal conversational closure.', action: 'Add informational closing: \'Hope I helped with your capsule inquiry. If you need anything else, I am here!\' post-catalog browse.' },
        pt: { context: 'Nespresso tem sessoes de compra B2C (capsulas) e B2B (empresas). Usuarios B2C exploram catalogo e saem sem fechamento.', desc: 'Sessoes informativas (consultar capsulas, ver precos) terminam quando o usuario obtem a info. Sem fechamento conversacional formal.', action: 'Adicionar encerramento informativo: \'Espero ter ajudado com sua consulta de capsulas. Se precisar de algo mais, estou aqui!\' pos-consulta de catalogo.' },
      },
      latency: {
        es: { context: 'La latencia incluye triple integracion: Nestle REST Middleware + SAP SOAP + OAuth2 Keycloak. Cada pedido requiere cotizacion previa via SAP.', desc: 'Latencias elevadas por cadena: Keycloak OAuth2 -> Nestle Middleware REST -> SAP SOAP (cotizacion/pedido). La cotizacion SOAP es especialmente lenta.', action: 'Cachear token Keycloak entre operaciones. Evaluar si cotizacion SAP puede pre-calcularse para capsulas recurrentes. Monitorear p50 de SAP SOAP.' },
        en: { context: 'Latency includes triple integration: Nestle REST Middleware + SAP SOAP + OAuth2 Keycloak. Each order requires prior SAP quote.', desc: 'High latencies from chain: Keycloak OAuth2 -> Nestle Middleware REST -> SAP SOAP (quote/order). SOAP quote is especially slow.', action: 'Cache Keycloak token between operations. Evaluate if SAP quote can be pre-calculated for recurring capsules. Monitor SAP SOAP p50.' },
        pt: { context: 'A latencia inclui tripla integracao: Nestle REST Middleware + SAP SOAP + OAuth2 Keycloak. Cada pedido requer cotacao previa via SAP.', desc: 'Latencias elevadas pela cadeia: Keycloak OAuth2 -> Nestle Middleware REST -> SAP SOAP (cotacao/pedido). A cotacao SOAP e especialmente lenta.', action: 'Cachear token Keycloak entre operacoes. Avaliar se cotacao SAP pode ser pre-calculada para capsulas recorrentes. Monitorar p50 do SAP SOAP.' },
      },
      errorFree: {
        es: { context: 'Errores del backend Nestle (Middleware REST + SAP SOAP) como zona postal invalida, producto agotado y cotizacion fallida llegan al usuario.', desc: 'Respuestas de error del SAP SOAP (cotizacion fallida, pedido rechazado) y Middleware REST (direccion invalida) se muestran como errores del asistente.', action: 'Reformular errores SAP/Middleware a mensajes de negocio: \'No pudimos cotizar este pedido. Verifica tu direccion e intenta de nuevo.\'' },
        en: { context: 'Nestle backend errors (Middleware REST + SAP SOAP) like invalid postal zone, out-of-stock product and failed quote reach the user.', desc: 'SAP SOAP error responses (failed quote, rejected order) and Middleware REST (invalid address) shown as assistant errors.', action: 'Rewrite SAP/Middleware errors to business messages: \'We could not quote this order. Please verify your address and try again.\'' },
        pt: { context: 'Erros do backend Nestle (Middleware REST + SAP SOAP) como zona postal invalida, produto esgotado e cotacao falha chegam ao usuario.', desc: 'Respostas de erro do SAP SOAP (cotacao falha, pedido rejeitado) e Middleware REST (endereco invalido) mostradas como erros do assistente.', action: 'Reformular erros SAP/Middleware para mensagens de negocio: \'Nao conseguimos cotar este pedido. Verifique seu endereco e tente novamente.\'' },
      },
      stabilityProxy: {
        es: { context: 'Cadena Keycloak + Nestle Middleware + SAP SOAP + MongoDB + PubSub. Arquitectura compleja con autenticacion multi-capa.', desc: 'La dependencia de SAP SOAP para cotizaciones es el punto mas fragil. SAP SOAP tiende a tener mayor variabilidad de latencia y tasa de error que REST.', action: 'Implementar timeout agresivo para SAP SOAP con reintento. Circuit breaker para Middleware REST. Modo degradado con catalogo cacheado cuando SAP no responde.' },
        en: { context: 'Keycloak + Nestle Middleware + SAP SOAP + MongoDB + PubSub chain. Complex architecture with multi-layer authentication.', desc: 'SAP SOAP dependency for quotes is the most fragile point. SAP SOAP tends to have higher latency variability and error rate than REST.', action: 'Implement aggressive timeout for SAP SOAP with retry. Circuit breaker for Middleware REST. Degraded mode with cached catalog when SAP is unresponsive.' },
        pt: { context: 'Cadeia Keycloak + Nestle Middleware + SAP SOAP + MongoDB + PubSub. Arquitetura complexa com autenticacao multi-camada.', desc: 'A dependencia do SAP SOAP para cotacoes e o ponto mais fragil. SAP SOAP tende a ter maior variabilidade de latencia e taxa de erro que REST.', action: 'Implementar timeout agressivo para SAP SOAP com retentativa. Circuit breaker para Middleware REST. Modo degradado com catalogo cacheado quando SAP nao responde.' },
      },
      },
    },
  "wa-g-1948-greal-rmp": {
      name: "Greal RMP",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 24 activities/333 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Plataforma de comercio para Grupo Real (marca RMP), distribuidor de autopartes en Brasil. Pedidos, notas fiscais, cashback, PIX, financeiro, e-commerce online.',
        en: 'B2B WhatsApp bot Brazil. 24 activities/333 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Commerce platform for Grupo Real (RMP brand), Brazilian auto parts distributor. Orders, invoices, cashback, PIX, financeiro, online e-commerce.',
        pt: 'Bot B2B WhatsApp Brasil. 24 activities/333 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Plataforma de comercio para Grupo Real (marca RMP), distribuidor de autopeças no Brasil. Pedidos, notas fiscais, cashback, PIX, financeiro, e-commerce online.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (Digibee). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con Digibee: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (Digibee). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (Digibee). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com Digibee: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (Digibee) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del Digibee (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (Digibee) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "Digibee/Digibee error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (Digibee) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do Digibee (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con Digibee y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with Digibee and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com Digibee e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      },
    },
  "wa-ke1770-kellanova": {
      name: "Kellanova",
      hasOris: false,
      type: {
        es: "Bot B2B WhatsApp Brazil. B2B Commerce platform for Kellanova Brazil enabling retailers and sales representatives to place orders, track deliveries, consult bills, and manage customer.",
        en: "Bot B2B WhatsApp Brazil. B2B Commerce platform for Kellanova Brazil enabling retailers and sales representatives to place orders, track deliveries, consult bills, and manage customer.",
        pt: "Bot B2B WhatsApp Brazil. B2B Commerce platform for Kellanova Brazil enabling retailers and sales representatives to place orders, track deliveries, consult bills, and manage customer.",
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (Mercanet). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con Mercanet: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (Mercanet). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from Mercanet integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (Mercanet). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com Mercanet: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (Mercanet) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del Mercanet (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (Mercanet) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "Mercanet error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (Mercanet) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do Mercanet (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con Mercanet y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with Mercanet and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com Mercanet e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-g-1948-greal-disape": {
      name: "Greal Disape",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 25 activities/333 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Grupo Real Disape, distribuidor de autopartes en Brasil. Pedidos, notas fiscais, loja online, cashback, financeiro, PIX. Integra GReal API, token auth, Yalo Force.',
        en: 'B2B WhatsApp bot Brazil. 25 activities/333 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Grupo Real Disape, auto parts distributor in Brazil. Orders, invoices, online store, cashback, financeiro, PIX. Integrates GReal API, token auth, Yalo Force.',
        pt: 'Bot B2B WhatsApp Brasil. 25 activities/333 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Grupo Real Disape, distribuidor de autopeças no Brasil. Pedidos, notas fiscais, loja online, cashback, financeiro, PIX. Integra GReal API, token auth, Yalo Force.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (Digibee). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con Digibee: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (Digibee). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from sap integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (Digibee). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com Digibee: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (Digibee) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del Digibee (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (Digibee) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "Digibee/Digibee error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (Digibee) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do Digibee (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con Digibee y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with Digibee and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com Digibee e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      },
    },
  "compra-agora-ng-wa-br": {
      name: "Compra Agora BR",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Brasil. Plataforma de e-commerce conversacional para Compra Agora. Flujo hibrido con 41 activities y 483 componentes. Agentes IA: Cora Agent (3 variantes: Cora, Cora ORIS R1, Cora ORIS P1), FAQs Compra Agora CA. Integra Magento (catalogo/carrito GraphQL), Mulesoft (REST API), Solucx (NPS/CSAT), Fresh Chat Webhook, Campanas Salesforce. Actividades clave: make-order, Webview Order, One Chat Buy, Cora Agent, Sales Desk (Fresh Chat), CSAT Portuguese WA Flow v2.',
        en: 'B2B WhatsApp bot Brazil. Conversational e-commerce platform for Compra Agora. Hybrid flow with 41 activities and 483 components. AI Agents: Cora Agent (3 variants: Cora, Cora ORIS R1, Cora ORIS P1), FAQs Compra Agora CA. Integrates Magento (catalog/cart GraphQL), Mulesoft (REST API), Solucx (NPS/CSAT), Fresh Chat Webhook, Salesforce Campaigns. Key activities: make-order, Webview Order, One Chat Buy, Cora Agent, Sales Desk (Fresh Chat), CSAT Portuguese WA Flow v2.',
        pt: 'Bot B2B WhatsApp Brasil. Plataforma de e-commerce conversacional para Compra Agora. Fluxo hibrido com 41 atividades e 483 componentes. Agentes IA: Cora Agent (3 variantes: Cora, Cora ORIS R1, Cora ORIS P1), FAQs Compra Agora CA. Integra Magento (catalogo/carrinho GraphQL), Mulesoft (REST API), Solucx (NPS/CSAT), Fresh Chat Webhook, Campanhas Salesforce. Atividades-chave: make-order, Webview Order, One Chat Buy, Cora Agent, Sales Desk (Fresh Chat), CSAT Portuguese WA Flow v2.',
      },
      insights: {
      closureRate: {
        es: { context: 'Los tenderos B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.', desc: 'El flujo no tiene un paso de despedida explicito post-pedido. Usuarios terminan su transaccion y abandonan sin cierre linguistico, comportamiento esperado en B2B.', action: 'Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.' },
        en: { context: 'B2B retailers complete their order and stop responding. Normal pattern in recurring B2B transactional flows.', desc: 'The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected B2B behavior.', action: 'Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.' },
        pt: { context: 'Lojistas B2B completam o pedido e param de responder. Padrao normal em fluxos transacionais B2B recorrentes.', desc: 'O fluxo nao tem passo de despedida explicito pos-pedido. Usuarios terminam a transacao e saem sem fechamento linguistico, comportamento esperado em B2B.', action: 'Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que CIE reconhece como closure.' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a Magento (GraphQL) + Mulesoft (REST) + Cloud Functions (GCP). Triple round-trip arquitectural.', desc: 'Latencias elevadas provienen de la cadena: Cloud Function -> Magento GraphQL (catalogo/precios) -> Mulesoft (pedidos). Cada paso agrega latencia de red y procesamiento.', action: 'Evaluar cache de catalogo en Magento con TTL corto. Investigar si consultas GraphQL pueden consolidarse para reducir round-trips. Pre-calentar Cloud Functions en horarios pico.' },
        en: { context: 'Latency includes calls to Magento (GraphQL) + Mulesoft (REST) + Cloud Functions (GCP). Triple architectural round-trip.', desc: 'High latencies come from Magento/Mulesoft integration chain: Cloud Function -> Magento GraphQL (catalog/prices) -> Mulesoft (orders). Each step adds network and processing latency.', action: 'Evaluate catalog caching in Magento with short TTL. Investigate if GraphQL queries can be consolidated to reduce round-trips. Warm up Cloud Functions during peak hours.' },
        pt: { context: 'A latencia inclui chamadas a Magento (GraphQL) + Mulesoft (REST) + Cloud Functions (GCP). Triplo round-trip arquitetural.', desc: 'Latencias elevadas vem da cadeia Magento/Mulesoft: Cloud Function -> Magento GraphQL (catalogo/precos) -> Mulesoft (pedidos). Cada passo adiciona latencia de rede e processamento.', action: 'Avaliar cache de catalogo no Magento com TTL curto. Investigar se consultas GraphQL podem ser consolidadas para reduzir round-trips. Pre-aquecer Cloud Functions em horarios de pico.' },
      },
      errorFree: {
        es: { context: 'Errores de Magento (GraphQL) y Mulesoft (REST) como productos sin stock, cliente no encontrado y timeouts de API llegan al usuario.', desc: 'Respuestas de error de Magento/Mulesoft (stock agotado, precio no disponible, sesion expirada) se muestran como errores del asistente. El bot funciona correctamente pero el evaluador las marca como error.', action: 'Reformular mensajes de error de negocio a tono informativo: \'Este producto no esta disponible ahora\' en vez de mostrar error tecnico de Magento.' },
        en: { context: 'Magento (GraphQL) and Mulesoft (REST) errors like out-of-stock products, customer not found, and API timeouts reach the user.', desc: 'Magento/Mulesoft error responses (out of stock, price unavailable, expired session) shown as assistant errors. Bot works correctly but evaluator marks them as errors.', action: 'Rewrite business error messages to informative tone: \'This product is not available right now\' instead of showing Magento technical errors.' },
        pt: { context: 'Erros do Magento (GraphQL) e Mulesoft (REST) como produtos sem estoque, cliente nao encontrado e timeouts de API chegam ao usuario.', desc: 'Respostas de erro do Magento/Mulesoft (estoque esgotado, preco indisponivel, sessao expirada) mostradas como erros do assistente. O bot funciona corretamente mas o avaliador as marca como erro.', action: 'Reformular mensagens de erro de negocio para tom informativo: \'Este produto nao esta disponivel no momento\' em vez de mostrar erro tecnico do Magento.' },
      },
      friction: {
        es: { context: 'Autenticacion via telefono (OTP) + navegacion de catalogo Magento GraphQL + carrito multi-step generan friccion.', desc: 'El flujo de autenticacion OTP mas la busqueda de catalogo y edicion de carrito requieren multiples interacciones. Los usuarios experimentan esperas entre cada operacion GraphQL.', action: 'Implementar \'repetir ultimo pedido\' para usuarios recurrentes. Simplificar mensajes de confirmacion de carrito. Evaluar pre-carga de catalogo para reducir esperas.' },
        en: { context: 'Phone authentication (OTP) + Magento GraphQL catalog navigation + multi-step cart create friction.', desc: 'OTP authentication flow plus catalog browsing and cart editing require multiple interactions. Users experience waits between each GraphQL operation.', action: 'Implement \'repeat last order\' for recurring users. Simplify cart confirmation messages. Evaluate catalog pre-loading to reduce wait times.' },
        pt: { context: 'Autenticacao via telefone (OTP) + navegacao de catalogo Magento GraphQL + carrinho multi-step geram friccao.', desc: 'O fluxo de autenticacao OTP mais busca de catalogo e edicao de carrinho requerem multiplas interacoes. Os usuarios experimentam esperas entre cada operacao GraphQL.', action: 'Implementar \'repetir ultimo pedido\' para usuarios recorrentes. Simplificar mensagens de confirmacao de carrinho. Avaliar pre-carga de catalogo para reduzir esperas.' },
      },
      stabilityProxy: {
        es: { context: 'Integraciones multiples (Magento + Mulesoft + Solucx + GCP Cloud Functions) crean puntos de fallo distribuidos.', desc: 'La cadena Magento GraphQL -> Mulesoft REST -> Cloud Functions tiene multiples puntos de fallo potenciales. Cualquier servicio caido afecta el flujo completo.', action: 'Implementar circuit breaker entre servicios. Agregar health checks automaticos para Magento y Mulesoft. Cachear respuestas de catalogo para servir en modo degradado.' },
        en: { context: 'Multiple integrations (Magento + Mulesoft + Solucx + GCP Cloud Functions) create distributed failure points.', desc: 'The chain Magento GraphQL -> Mulesoft REST -> Cloud Functions has multiple potential failure points. Any service down affects the complete flow.', action: 'Implement circuit breaker between services. Add automatic health checks for Magento and Mulesoft. Cache catalog responses to serve in degraded mode.' },
        pt: { context: 'Integracoes multiplas (Magento + Mulesoft + Solucx + GCP Cloud Functions) criam pontos de falha distribuidos.', desc: 'A cadeia Magento GraphQL -> Mulesoft REST -> Cloud Functions tem multiplos pontos de falha potenciais. Qualquer servico fora afeta o fluxo completo.', action: 'Implementar circuit breaker entre servicos. Adicionar health checks automaticos para Magento e Mulesoft. Cachear respostas de catalogo para servir em modo degradado.' },
      },
      },
    },
  "wa-fr1941-fruki-prd": {
      name: "Fruki BR",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 27 activities/415 components. Flujo hibrido (deterministic + hybrid + agentic). AI agents: Custom Agent 01 (Campaigns), Sales Agent Oris R1, Sales Agent Oris P1, Knowledge Agent (Assistente Virtual Fruki). Comercio conversacional para Fruki (bebidas) en Brasil. Auth Store, Yalo Force, Profiler, CSAT, Headless Commerce.',
        en: 'B2B WhatsApp bot Brazil. 27 activities/415 components. Hybrid flow (deterministic + hybrid + agentic). AI agents: Custom Agent 01 (Campaigns), Sales Agent Oris R1, Sales Agent Oris P1, Knowledge Agent (Assistente Virtual Fruki). Conversational commerce for Fruki (beverages) in Brazil. Auth Store, Yalo Force, Profiler, CSAT, Headless Commerce.',
        pt: 'Bot B2B WhatsApp Brasil. 27 activities/415 components. Fluxo hibrido (deterministic + hybrid + agentic). AI agents: Custom Agent 01 (Campanhas), Sales Agent Oris R1, Sales Agent Oris P1, Knowledge Agent (Assistente Virtual Fruki). Comercio conversacional para Fruki (bebidas) no Brasil. Auth Store, Yalo Force, Profiler, CSAT, Headless Commerce.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (Fruki API). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con Fruki API: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (Fruki API). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from Fruki API integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (Fruki API). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com Fruki API: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (Fruki API) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del Fruki API (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (Fruki API) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "Fruki API error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (Fruki API) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do Fruki API (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con Fruki API y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with Fruki API and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com Fruki API e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "rommac-caboclo-wa-br": {
      name: "Caboclo BR",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 21 activities/315 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Genie Oris R1, Sales Agent. Plataforma de comercio para Rommac/Caboclo Distribuidor en Brasil. Permite a clientes B2B hacer pedidos via WhatsApp con integracion a APIs Rommac y Caboclo (catalogo/precios/stock), SFTP para sincronizacion de datos, y Cloud Functions GCP.',
        en: 'B2B WhatsApp bot Brazil. 21 activities/315 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Genie Oris R1, Sales Agent. Commerce platform for Rommac/Caboclo Distributor in Brazil. Enables B2B customers to place orders via WhatsApp with Rommac and Caboclo API integration (catalog/prices/stock), SFTP for data sync, and GCP Cloud Functions.',
        pt: 'Bot B2B WhatsApp Brasil. 21 activities/315 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Genie Oris R1, Sales Agent. Plataforma de comercio para Rommac/Caboclo Distribuidor no Brasil. Permite a clientes B2B fazer pedidos via WhatsApp com integracao a APIs Rommac e Caboclo (catalogo/precos/estoque), SFTP para sincronizacao de dados, e Cloud Functions GCP.',
      },
      insights: {
      closureRate: {
        es: { context: 'Clientes B2B de Caboclo/Rommac completan pedido y dejan de responder. Patron normal en flujos B2B recurrentes.', desc: 'El flujo tiene Commerce Pre/Post que cierra el ciclo de pedido pero sin despedida explicita. Yalo Force Pro agrega sesiones de venta asistida sin closure.', action: 'Agregar cierre explicito post-pedido y post-sesion de Yalo Force: \'Tu pedido fue enviado. Hasta la proxima!\'' },
        en: { context: 'B2B customers of Caboclo/Rommac complete order and stop responding. Normal pattern in recurring B2B flows.', desc: 'Flow has Commerce Pre/Post closing the order cycle but without explicit farewell. Yalo Force Pro adds assisted sales sessions without closure.', action: 'Add explicit closing post-order and post-Yalo Force session: \'Your order has been sent. See you next time!\'' },
        pt: { context: 'Clientes B2B do Caboclo/Rommac completam pedido e param de responder. Padrao normal em fluxos B2B recorrentes.', desc: 'O fluxo tem Commerce Pre/Post fechando o ciclo de pedido mas sem despedida explicita. Yalo Force Pro adiciona sessoes de venda assistida sem closure.', action: 'Adicionar encerramento explicito pos-pedido e pos-sessao Yalo Force: \'Seu pedido foi enviado. Ate a proxima!\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a APIs Rommac/Caboclo + SFTP sync + Cloud Functions GCP.', desc: 'Latencias provienen de la cadena: Cloud Functions -> APIs Rommac/Caboclo (catalogo/precios/stock). SFTP sync para datos de productos.', action: 'Evaluar cache de catalogo con TTL corto. Optimizar sync-commerce-entity para reducir procesamiento. Pre-calentar Cloud Functions.' },
        en: { context: 'Latency includes calls to Rommac/Caboclo APIs + SFTP sync + GCP Cloud Functions.', desc: 'Latencies come from chain: Cloud Functions -> Rommac/Caboclo APIs (catalog/prices/stock). SFTP sync for product data.', action: 'Evaluate catalog cache with short TTL. Optimize sync-commerce-entity to reduce processing. Warm up Cloud Functions.' },
        pt: { context: 'A latencia inclui chamadas as APIs Rommac/Caboclo + SFTP sync + Cloud Functions GCP.', desc: 'Latencias vem da cadeia: Cloud Functions -> APIs Rommac/Caboclo (catalogo/precos/estoque). SFTP sync para dados de produtos.', action: 'Avaliar cache de catalogo com TTL curto. Otimizar sync-commerce-entity para reduzir processamento. Pre-aquecer Cloud Functions.' },
      },
      errorFree: {
        es: { context: 'Errores de APIs Rommac/Caboclo como cliente no encontrado, producto sin stock y errores de sync llegan al usuario.', desc: 'Respuestas de error de las APIs (stock agotado, precio no disponible) se muestran como errores del asistente.', action: 'Reformular errores de API a tono informativo: \'Este producto no esta disponible ahora\' en vez de error tecnico.' },
        en: { context: 'Rommac/Caboclo API errors like customer not found, out-of-stock product and sync errors reach the user.', desc: 'API error responses (out of stock, price unavailable) shown as assistant errors.', action: 'Rewrite API errors to informative tone: \'This product is not available right now\' instead of technical error.' },
        pt: { context: 'Erros das APIs Rommac/Caboclo como cliente nao encontrado, produto sem estoque e erros de sync chegam ao usuario.', desc: 'Respostas de erro das APIs (estoque esgotado, preco indisponivel) mostradas como erros do assistente.', action: 'Reformular erros de API para tom informativo: \'Este produto nao esta disponivel no momento\' em vez de erro tecnico.' },
      },
      fallbackQuality: {
        es: { context: 'SFTP sincroniza productos/precios/stock/promociones. Si SFTP falla, el catalogo queda desactualizado.', desc: 'La sincronizacion SFTP para sync-commerce-entity puede fallar silenciosamente, causando datos de catalogo obsoletos.', action: 'Implementar monitoreo de frescura de datos SFTP. Alertar cuando sync tiene mas de 24h de antiguedad.' },
        en: { context: 'SFTP syncs products/prices/stock/promotions. If SFTP fails, catalog becomes outdated.', desc: 'SFTP sync for sync-commerce-entity can fail silently, causing obsolete catalog data.', action: 'Implement SFTP data freshness monitoring. Alert when sync is more than 24h old.' },
        pt: { context: 'SFTP sincroniza produtos/precos/estoque/promocoes. Se SFTP falhar, o catalogo fica desatualizado.', desc: 'A sincronizacao SFTP para sync-commerce-entity pode falhar silenciosamente, causando dados de catalogo obsoletos.', action: 'Implementar monitoramento de frescura de dados SFTP. Alertar quando sync tem mais de 24h.' },
      },
      efficiencyLoops: {
        es: { context: 'Yalo Force Pro permite a vendedores asistir la venta, agregando complejidad conversacional.', desc: 'Las sesiones con Yalo Force Pro tienden a ser mas largas y con mas interacciones, lo que puede inflar metricas de ineficiencia.', action: 'Segmentar metricas de eficiencia entre sesiones autoservicio y sesiones asistidas por Yalo Force para evaluar correctamente.' },
        en: { context: 'Yalo Force Pro enables sellers to assist the sale, adding conversational complexity.', desc: 'Sessions with Yalo Force Pro tend to be longer with more interactions, which can inflate inefficiency metrics.', action: 'Segment efficiency metrics between self-service sessions and Yalo Force assisted sessions to evaluate correctly.' },
        pt: { context: 'Yalo Force Pro permite a vendedores assistir a venda, adicionando complexidade conversacional.', desc: 'Sessoes com Yalo Force Pro tendem a ser mais longas com mais interacoes, o que pode inflar metricas de ineficiencia.', action: 'Segmentar metricas de eficiencia entre sessoes autoatendimento e sessoes assistidas pelo Yalo Force para avaliar corretamente.' },
      },
      },
    },
  "rommac-rommac-wa-br": {
    name: "Rommac BR",
    hasOris: true,
    type: {
      es: 'Bot B2B WhatsApp Brasil. 21 activities/314 components. Flujo hibrido (deterministic + hybrid). AI agents: Oris R1 (Sales Agent), Oris P1 (Sales Agent P1). Plataforma de comercio para Rommac Distribuidor en Brasil. Permite a clientes B2B hacer pedidos via WhatsApp con integracion a APIs Rommac (catalogo/precios/stock), Commerce Pre/Post, CSAT, y Yalo Force Pro.',
      en: 'B2B WhatsApp bot Brazil. 21 activities/314 components. Hybrid flow (deterministic + hybrid). AI agents: Oris R1 (Sales Agent), Oris P1 (Sales Agent P1). Commerce platform for Rommac Distributor in Brazil. Enables B2B customers to place orders via WhatsApp with Rommac API integration (catalog/prices/stock), Commerce Pre/Post, CSAT, and Yalo Force Pro.',
      pt: 'Bot B2B WhatsApp Brasil. 21 activities/314 components. Fluxo hibrido (deterministic + hybrid). AI agents: Oris R1 (Sales Agent), Oris P1 (Sales Agent P1). Plataforma de comercio para Rommac Distribuidor no Brasil. Permite a clientes B2B fazer pedidos via WhatsApp com integracao a APIs Rommac (catalogo/precos/estoque), Commerce Pre/Post, CSAT, e Yalo Force Pro.',
    },
    insights: {},
  },
  "wa-ne1777-nestle-professional-production": {
      name: "Nestle Professional",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 24 activities/584 components. Flujo hibrido (deterministic + hybrid). AI agents: Custom Agent 02, FAQ Custom Agent. Sin ORIS. Plataforma de comercio y prospeccion para Nestle Professional Brasil (foodservice). Integra Nestle Backend API (pedidos, catalogo), Pipefy (gestion de prospectos/leads), GCP Cloud Functions (post-order, sync-xlsx-data), GCS Bucket (sincronizacion de datos XLSX), Big Storage NG, Sales Desk. Incluye Home, Menu, Pre Order, Catalog BR, Orders, ATC, OCB, Prospect Foods, Prospect Drinks, Onde Comprar, Sales Desk PT-BR, Service, CSAT, Campanhas, Payment Methods, Notifications.',
        en: 'B2B WhatsApp bot Brazil. 24 activities/584 components. Hybrid flow (deterministic + hybrid). AI agents: Custom Agent 02, FAQ Custom Agent. No ORIS. Commerce and prospecting platform for Nestle Professional Brazil (foodservice). Integrates Nestle Backend API (orders, catalog), Pipefy (prospect/lead management), GCP Cloud Functions (post-order, sync-xlsx-data), GCS Bucket (XLSX data sync), Big Storage NG, Sales Desk. Includes Home, Menu, Pre Order, Catalog BR, Orders, ATC, OCB, Prospect Foods, Prospect Drinks, Onde Comprar, Sales Desk PT-BR, Service, CSAT, Campanhas, Payment Methods, Notifications.',
        pt: 'Bot B2B WhatsApp Brasil. 24 activities/584 components. Fluxo hibrido (deterministic + hybrid). AI agents: Custom Agent 02, FAQ Custom Agent. Sem ORIS. Plataforma de comercio e prospeccao para Nestle Professional Brasil (foodservice). Integra Nestle Backend API (pedidos, catalogo), Pipefy (gestao de prospectos/leads), GCP Cloud Functions (post-order, sync-xlsx-data), GCS Bucket (sincronizacao de dados XLSX), Big Storage NG, Sales Desk. Inclui Home, Menu, Pre Order, Catalog BR, Orders, ATC, OCB, Prospect Foods, Prospect Drinks, Onde Comprar, Sales Desk PT-BR, Service, CSAT, Campanhas, Payment Methods, Notifications.',
      },
      insights: {
      closureRate: {
        es: { context: 'Nestle Professional tiene flujos de comercio Y prospeccion. Prospect Foods/Drinks son flujos de captacion sin transaccion.', desc: 'Sesiones de prospeccion (Prospect Foods/Drinks, Onde Comprar) resuelven sin cierre transaccional. Pedidos (Pre Order, Orders) si completan ciclo.', action: 'Segmentar closure entre sesiones de comercio y prospeccion. Agregar cierre post-prospeccion con seguimiento programado via Pipefy.' },
        en: { context: 'Nestle Professional has commerce AND prospecting flows. Prospect Foods/Drinks are lead capture flows without transaction.', desc: 'Prospecting sessions (Prospect Foods/Drinks, Onde Comprar) resolve without transactional closure. Orders (Pre Order, Orders) do complete the cycle.', action: 'Segment closure between commerce and prospecting sessions. Add post-prospecting closing with scheduled follow-up via Pipefy.' },
        pt: { context: 'Nestle Professional tem fluxos de comercio E prospeccao. Prospect Foods/Drinks sao fluxos de captacao sem transacao.', desc: 'Sessoes de prospeccao (Prospect Foods/Drinks, Onde Comprar) resolvem sem fechamento transacional. Pedidos (Pre Order, Orders) completam o ciclo.', action: 'Segmentar closure entre sessoes de comercio e prospeccao. Adicionar encerramento pos-prospeccao com acompanhamento programado via Pipefy.' },
      },
      latency: {
        es: { context: 'La latencia incluye Nestle Backend API + Cloud Functions (post-order, sync-xlsx-data) + Pipefy API + GCS Bucket.', desc: 'Nestle Backend API para pedidos y sync-xlsx-data via GCS Bucket agregan latencia. Pipefy para prospeccion es llamada adicional externa.', action: 'Cachear catalogo post-sync XLSX. Optimizar post-order Cloud Function. Evaluar si Pipefy puede ser asincrono para no bloquear al usuario.' },
        en: { context: 'Latency includes Nestle Backend API + Cloud Functions (post-order, sync-xlsx-data) + Pipefy API + GCS Bucket.', desc: 'Nestle Backend API for orders and sync-xlsx-data via GCS Bucket add latency. Pipefy for prospecting is additional external call.', action: 'Cache catalog post-XLSX sync. Optimize post-order Cloud Function. Evaluate if Pipefy can be async to not block user.' },
        pt: { context: 'A latencia inclui Nestle Backend API + Cloud Functions (post-order, sync-xlsx-data) + Pipefy API + GCS Bucket.', desc: 'Nestle Backend API para pedidos e sync-xlsx-data via GCS Bucket adicionam latencia. Pipefy para prospeccao e chamada adicional externa.', action: 'Cachear catalogo pos-sync XLSX. Otimizar post-order Cloud Function. Avaliar se Pipefy pode ser assincrono para nao bloquear o usuario.' },
      },
      errorFree: {
        es: { context: 'Errores de Nestle Backend API (pedido rechazado, catalogo no disponible) y Pipefy (lead no creado) llegan al usuario.', desc: 'Fallos de sync-xlsx-data pueden causar catalogo desactualizado sin error visible. Errores de Pipefy al crear prospectos se muestran como fallo del bot.', action: 'Validar frescura de datos XLSX post-sync. Reformular errores de Pipefy. Retry para fallos transitorios de Nestle Backend.' },
        en: { context: 'Nestle Backend API errors (rejected order, unavailable catalog) and Pipefy (lead not created) reach user.', desc: 'sync-xlsx-data failures can cause outdated catalog without visible error. Pipefy errors creating prospects shown as bot failure.', action: 'Validate XLSX data freshness post-sync. Rewrite Pipefy errors. Retry for transient Nestle Backend failures.' },
        pt: { context: 'Erros da Nestle Backend API (pedido rejeitado, catalogo indisponivel) e Pipefy (lead nao criado) chegam ao usuario.', desc: 'Falhas de sync-xlsx-data podem causar catalogo desatualizado sem erro visivel. Erros de Pipefy ao criar prospectos mostrados como falha do bot.', action: 'Validar frescura de dados XLSX pos-sync. Reformular erros de Pipefy. Retry para falhas transitorias do Nestle Backend.' },
      },
      fallbackQuality: {
        es: { context: 'Datos de catalogo provienen de XLSX sincronizado via GCS Bucket. Si sync falla, catalogo queda obsoleto.', desc: 'La cadena sync-xlsx-data -> GCS Bucket -> Nestle Backend puede fallar silenciosamente. BR Sales Genie ORIS R1 agrega capa AI que puede manejar fallbacks.', action: 'Monitorear frescura de datos XLSX. Alertar cuando sync tiene mas de 24h. Usar Genie como fallback inteligente para preguntas fuera de flujo.' },
        en: { context: 'Catalog data comes from XLSX synced via GCS Bucket. If sync fails, catalog becomes stale.', desc: 'sync-xlsx-data -> GCS Bucket -> Nestle Backend chain can fail silently. BR Sales Genie ORIS R1 adds AI layer that can handle fallbacks.', action: 'Monitor XLSX data freshness. Alert when sync is more than 24h old. Use Genie as intelligent fallback for out-of-flow questions.' },
        pt: { context: 'Dados de catalogo vem de XLSX sincronizado via GCS Bucket. Se sync falhar, catalogo fica obsoleto.', desc: 'A cadeia sync-xlsx-data -> GCS Bucket -> Nestle Backend pode falhar silenciosamente. BR Sales Genie ORIS R1 adiciona camada AI que pode tratar fallbacks.', action: 'Monitorar frescura de dados XLSX. Alertar quando sync tem mais de 24h. Usar Genie como fallback inteligente para perguntas fora do fluxo.' },
      },
      stabilityProxy: {
        es: { context: 'Cadena: Nestle Backend API + Cloud Functions + Pipefy + GCS Bucket + Big Storage NG + Sales Desk.', desc: 'Nestle Backend API es la dependencia central. Pipefy como sistema externo de leads agrega punto de fallo independiente. GCS sync puede fallar silenciosamente.', action: 'Circuit breaker para Nestle Backend. Monitorear pipeline XLSX -> GCS. Cola de fallback si Pipefy no responde.' },
        en: { context: 'Chain: Nestle Backend API + Cloud Functions + Pipefy + GCS Bucket + Big Storage NG + Sales Desk.', desc: 'Nestle Backend API is the central dependency. Pipefy as external lead system adds independent failure point. GCS sync can fail silently.', action: 'Circuit breaker for Nestle Backend. Monitor XLSX -> GCS pipeline. Fallback queue if Pipefy unresponsive.' },
        pt: { context: 'Cadeia: Nestle Backend API + Cloud Functions + Pipefy + GCS Bucket + Big Storage NG + Sales Desk.', desc: 'Nestle Backend API e a dependencia central. Pipefy como sistema externo de leads adiciona ponto de falha independente. GCS sync pode falhar silenciosamente.', action: 'Circuit breaker para Nestle Backend. Monitorar pipeline XLSX -> GCS. Fila de fallback se Pipefy nao responder.' },
      },
      },
    },
  "nestle-mx-b2b": {
    name: "Nestle MX B2B",
    hasOris: false,
    type: {
      es: "Bot transaccional B2B WhatsApp para tenderos y distribuidores (Dipar) de Nestle Mexico. 100 activities/1658 components. Flujo hibrido (deterministic + hybrid). AI agents: Genie MKT, Genie Alta NCDT, Sales Agent, Sales Agent 2025, Imagen + Agent, Prompt Genie (Image Recognition + 1-Interaction), Voice Agent Template. Pedidos, catalogo, reordenes y FAQs. Live desde Dic 2020. Plataforma: Yalo Studio + Commerce V3.",
      en: "B2B transactional WhatsApp bot for Nestle Mexico shopkeepers and distributors (Dipar). 100 activities/1658 components. Hybrid flow (deterministic + hybrid). AI agents: Genie MKT, Genie Alta NCDT, Sales Agent, Sales Agent 2025, Imagen + Agent, Prompt Genie (Image Recognition + 1-Interaction), Voice Agent Template. Orders, catalog, reorders and FAQs. Live since Dec 2020. Platform: Yalo Studio + Commerce V3.",
      pt: "Bot transacional B2B WhatsApp para lojistas e distribuidores (Dipar) da Nestle Mexico. 100 activities/1658 components. Fluxo hibrido (deterministic + hybrid). AI agents: Genie MKT, Genie Alta NCDT, Sales Agent, Sales Agent 2025, Imagen + Agent, Prompt Genie (Image Recognition + 1-Interaction), Voice Agent Template. Pedidos, catalogo, reordens e FAQs. Live desde Dez 2020. Plataforma: Yalo Studio + Commerce V3.",
    },
    insights: {
      closureRate: {
        es: {
          context: "Nestle MX B2B tiene 2 segmentos (Tenderos y Dipar) en el mismo bot. Los tenderos hacen pedidos rapidos y dejan de responder sin cierre conversacional, igual que otros B2B transaccionales.",
          desc: "El flujo de pedido (delivery-dates + order-entry) no tiene un mensaje de despedida explicito post-confirmacion. Los usuarios completan su orden y dejan la conversacion abierta.",
          action: "Agregar mensaje de cierre post-confirmacion de pedido: 'Tu pedido fue registrado y sera entregado el [fecha]. Hasta la proxima!' Tambien despues de consultas de FAQ (semantic-ntl-mx).",
        },
        en: {
          context: "Nestle MX B2B has 2 segments (Shopkeepers and Dipar) on the same bot. Shopkeepers place quick orders and stop responding without conversational closure, like other B2B transactional bots.",
          desc: "The order flow (delivery-dates + order-entry) has no explicit farewell message post-confirmation. Users complete their order and leave the conversation open.",
          action: "Add closing message post-order confirmation: 'Your order has been registered and will be delivered on [date]. See you next time!' Also after FAQ queries (semantic-ntl-mx).",
        },
        pt: {
          context: "Nestle MX B2B tem 2 segmentos (Lojistas e Dipar) no mesmo bot. Lojistas fazem pedidos rapidos e param de responder sem encerramento conversacional, como outros B2B transacionais.",
          desc: "O fluxo de pedido (delivery-dates + order-entry) nao tem mensagem de despedida explicita apos confirmacao. Usuarios completam o pedido e deixam a conversa aberta.",
          action: "Adicionar mensagem de encerramento apos confirmacao do pedido: 'Seu pedido foi registrado e sera entregue em [data]. Ate a proxima!' Tambem apos consultas de FAQ (semantic-ntl-mx).",
        },
      },
      resolutionRate: {
        es: {
          context: "El bot maneja pedidos con logica compleja de fechas de entrega (periodoEntrega + idRuta) y horarios restrictivos (5am-5pm L-S). Consultas de fecha/ruta pueden marcarse como no resueltas aunque el sistema respondio correctamente.",
          desc: "La migracion FTPS a API REST de Nestle esta en curso (rollout incremental). Errores de sincronizacion de catalogo o stock pueden causar que productos no aparezcan, generando sesiones marcadas como no resueltas.",
          action: "Verificar que catalog-sync y master-catalogs-sync esten corriendo sin errores. Agregar mensajes explicitos: 'Tu entrega esta programada para el [fecha] segun tu ruta [idRuta]' en vez de solo mostrar la fecha.",
        },
        en: {
          context: "The bot handles orders with complex delivery date logic (periodoEntrega + idRuta) and restrictive hours (5am-5pm Mon-Sat). Date/route queries may be marked as unresolved even though the system responded correctly.",
          desc: "The FTPS to Nestle REST API migration is underway (incremental rollout). Catalog or stock sync errors may cause products to not appear, generating sessions marked as unresolved.",
          action: "Verify catalog-sync and master-catalogs-sync are running without errors. Add explicit messages: 'Your delivery is scheduled for [date] per your route [idRuta]' instead of just showing the date.",
        },
        pt: {
          context: "O bot lida com pedidos com logica complexa de datas de entrega (periodoEntrega + idRuta) e horarios restritivos (5am-5pm Seg-Sab). Consultas de data/rota podem ser marcadas como nao resolvidas mesmo que o sistema tenha respondido corretamente.",
          desc: "A migracao FTPS para API REST da Nestle esta em andamento (rollout incremental). Erros de sincronizacao de catalogo ou estoque podem fazer produtos nao aparecerem, gerando sessoes marcadas como nao resolvidas.",
          action: "Verificar que catalog-sync e master-catalogs-sync estejam rodando sem erros. Adicionar mensagens explicitas: 'Sua entrega esta agendada para [data] conforme sua rota [idRuta]' em vez de apenas mostrar a data.",
        },
      },
      efficiencyLoops: {
        es: {
          context: "El flujo tiene pasos secuenciales obligatorios: validacion de cliente, TyC, seleccion de fecha, navegacion de catalogo (webview), carrito, confirmacion. La navegacion en el webview de ecommerce genera multiples interacciones que parecen loops pero son comportamiento normal de compra.",
          desc: "El webview (webview-ecommerce.yalochat.com) permite explorar categorias y SKUs. Agregar/quitar productos y ajustar cantidades genera eventos que CIE puede interpretar como loops. Dipar navega catalogos mas grandes que tenderos.",
          action: "Separar analisis de sesiones Dipar vs Tenderos si es posible. Los loops reales a investigar son: usuario que vuelve a customer-validation multiples veces (posible error de autenticacion) o flujo que reinicia por timeout sin aviso.",
        },
        en: {
          context: "The flow has mandatory sequential steps: customer validation, T&C, date selection, catalog navigation (webview), cart, confirmation. Navigation in the ecommerce webview generates multiple interactions that look like loops but are normal shopping behavior.",
          desc: "The webview (webview-ecommerce.yalochat.com) allows exploring categories and SKUs. Adding/removing products and adjusting quantities generates events CIE may interpret as loops. Dipar navigates larger catalogs than shopkeepers.",
          action: "Separate Dipar vs Shopkeeper session analysis if possible. Real loops to investigate: user returning to customer-validation multiple times (possible auth error) or flow restarting due to timeout without notice.",
        },
        pt: {
          context: "O fluxo tem etapas sequenciais obrigatorias: validacao de cliente, T&C, selecao de data, navegacao de catalogo (webview), carrinho, confirmacao. A navegacao no webview de ecommerce gera multiplas interacoes que parecem loops mas sao comportamento normal de compra.",
          desc: "O webview (webview-ecommerce.yalochat.com) permite explorar categorias e SKUs. Adicionar/remover produtos e ajustar quantidades gera eventos que o CIE pode interpretar como loops. Dipar navega catalogos maiores que lojistas.",
          action: "Separar analise de sessoes Dipar vs Lojistas se possivel. Loops reais a investigar: usuario voltando ao customer-validation multiplas vezes (possivel erro de autenticacao) ou fluxo reiniciando por timeout sem aviso.",
        },
      },
      clarity: {
        es: {
          context: "El bot maneja logica compleja de rutas de entrega (idRuta, periodoEntrega) que migro de Squidex a Storefront custom fields. Mensajes sobre horarios (solo 5am-5pm L-S) y restricciones de ruta pueden parecer confusos para el evaluador pero son restricciones de negocio reales.",
          desc: "Mensajes como 'No puedes hacer pedidos en este horario' o 'Tu proxima entrega es el [fecha]' cuando el usuario esperaba otro dia son restricciones de negocio, no confusion del bot. La coexistencia FTPS/API puede causar inconsistencias temporales en catalogo.",
          action: "Enriquecer mensajes de restriccion: 'El horario de pedidos es de 5am a 5pm, Lunes a Sabado. Regresa manana a las 5am para hacer tu pedido.' en vez de un simple 'Fuera de horario'. Para rutas: 'Segun tu ruta de distribucion, tu proxima entrega disponible es el [dia].'",
        },
        en: {
          context: "The bot handles complex delivery route logic (idRuta, periodoEntrega) migrated from Squidex to Storefront custom fields. Messages about hours (5am-5pm Mon-Sat only) and route restrictions may seem confusing to the evaluator but are real business constraints.",
          desc: "Messages like 'You cannot place orders at this time' or 'Your next delivery is on [date]' when the user expected a different day are business restrictions, not bot confusion. FTPS/API coexistence may cause temporary catalog inconsistencies.",
          action: "Enrich restriction messages: 'Order hours are 5am to 5pm, Monday to Saturday. Come back tomorrow at 5am to place your order.' instead of a simple 'Outside hours'. For routes: 'Based on your delivery route, your next available delivery is on [day].'",
        },
        pt: {
          context: "O bot lida com logica complexa de rotas de entrega (idRuta, periodoEntrega) migrada do Squidex para campos customizados do Storefront. Mensagens sobre horarios (apenas 5am-5pm Seg-Sab) e restricoes de rota podem parecer confusas para o avaliador mas sao restricoes de negocio reais.",
          desc: "Mensagens como 'Voce nao pode fazer pedidos neste horario' ou 'Sua proxima entrega e em [data]' quando o usuario esperava outro dia sao restricoes de negocio, nao confusao do bot. A coexistencia FTPS/API pode causar inconsistencias temporarias no catalogo.",
          action: "Enriquecer mensagens de restricao: 'O horario de pedidos e de 5am as 5pm, Segunda a Sabado. Volte amanha as 5am para fazer seu pedido.' em vez de um simples 'Fora do horario'. Para rotas: 'Com base na sua rota de distribuicao, sua proxima entrega disponivel e em [dia].'",
        },
      },
      friction: {
        es: {
          context: "Fricciones principales: (1) horario restrictivo rechaza pedidos fuera de 5am-5pm L-S, (2) validacion de cliente puede fallar si el codigo no existe en el FTPS/API, (3) la migracion FTPS->API puede generar errores temporales de catalogo/stock en regiones en transicion.",
          desc: "CustomerSegmentHandler diferencia Tenderos vs Dipar en el mismo flujo. Errores de segmentacion pueden mostrar catalogo incorrecto. El flujo de TyC es obligatorio la primera vez y puede generar friccion si el usuario no entiende por que debe aceptar.",
          action: "Agregar mensajes claros cuando falla la validacion: 'No encontramos tu codigo de cliente. Verifica que sea correcto o contacta a tu representante de ventas.' Para TyC: explicar brevemente por que es necesario antes de pedir aceptacion.",
        },
        en: {
          context: "Main friction points: (1) restrictive hours reject orders outside 5am-5pm Mon-Sat, (2) customer validation may fail if code doesn't exist in FTPS/API, (3) FTPS->API migration may cause temporary catalog/stock errors in transitioning regions.",
          desc: "CustomerSegmentHandler differentiates Shopkeepers vs Dipar in the same flow. Segmentation errors may show incorrect catalog. T&C flow is mandatory first time and may cause friction if user doesn't understand why acceptance is needed.",
          action: "Add clear messages when validation fails: 'We couldn't find your customer code. Verify it's correct or contact your sales representative.' For T&C: briefly explain why it's necessary before requesting acceptance.",
        },
        pt: {
          context: "Principais pontos de friccao: (1) horario restritivo rejeita pedidos fora de 5am-5pm Seg-Sab, (2) validacao de cliente pode falhar se o codigo nao existir no FTPS/API, (3) migracao FTPS->API pode gerar erros temporarios de catalogo/estoque em regioes em transicao.",
          desc: "CustomerSegmentHandler diferencia Lojistas vs Dipar no mesmo fluxo. Erros de segmentacao podem mostrar catalogo incorreto. O fluxo de T&C e obrigatorio na primeira vez e pode gerar friccao se o usuario nao entender por que deve aceitar.",
          action: "Adicionar mensagens claras quando a validacao falha: 'Nao encontramos seu codigo de cliente. Verifique se esta correto ou entre em contato com seu representante de vendas.' Para T&C: explicar brevemente por que e necessario antes de pedir aceitacao.",
        },
      },
      fallbackQuality: {
        es: {
          context: "El bot tiene un flujo de FAQs semantico (semantic-ntl-mx) y escalacion a agente humano (human-ntl-mx / Sales Desk). Los fallbacks deben dirigir al usuario a estos flujos cuando no puede resolver la consulta.",
          desc: "Cuando el bot no entiende una consulta, debe ofrecer el flujo semantico o la opcion de hablar con un agente. Si el catalogo no carga (error de sync), el fallback debe informar al usuario y no dejarlo en un loop.",
          action: "Asegurar que el fallback incluya: (1) sugerencia de reformular la pregunta, (2) opcion de ir a FAQs, (3) opcion de hablar con un agente humano. Para errores de catalogo: 'Estamos teniendo problemas tecnicos. Intenta de nuevo en unos minutos o contacta a tu representante.'",
        },
        en: {
          context: "The bot has a semantic FAQ flow (semantic-ntl-mx) and human agent escalation (human-ntl-mx / Sales Desk). Fallbacks should direct users to these flows when the query can't be resolved.",
          desc: "When the bot doesn't understand a query, it should offer the semantic flow or the option to speak with an agent. If catalog doesn't load (sync error), fallback should inform the user and not leave them in a loop.",
          action: "Ensure fallback includes: (1) suggestion to rephrase the question, (2) option to go to FAQs, (3) option to speak with a human agent. For catalog errors: 'We're experiencing technical issues. Try again in a few minutes or contact your representative.'",
        },
        pt: {
          context: "O bot tem um fluxo de FAQs semantico (semantic-ntl-mx) e escalacao para agente humano (human-ntl-mx / Sales Desk). Os fallbacks devem direcionar usuarios para esses fluxos quando a consulta nao pode ser resolvida.",
          desc: "Quando o bot nao entende uma consulta, deve oferecer o fluxo semantico ou a opcao de falar com um agente. Se o catalogo nao carrega (erro de sync), o fallback deve informar o usuario e nao deixa-lo em loop.",
          action: "Garantir que o fallback inclua: (1) sugestao de reformular a pergunta, (2) opcao de ir para FAQs, (3) opcao de falar com um agente humano. Para erros de catalogo: 'Estamos com problemas tecnicos. Tente novamente em alguns minutos ou entre em contato com seu representante.'",
        },
      },
      errorFree: {
        es: {
          context: "La cuenta tiene dos backends en coexistencia: AWS Lambdas (FTPS, regiones existentes) y GCP Cloud Functions (API REST, regiones nuevas). Errores de sincronizacion entre ambos sistemas pueden afectar la disponibilidad del catalogo y stock.",
          desc: "Las Lambdas AWS corren a las 06:40-06:50 CST diario (bulk uploads). Si fallan, el catalogo del dia queda desactualizado. Las GCP Functions (catalog-sync, master-catalogs-sync) manejan las regiones nuevas. Errores se reportan en el canal Slack nestlemx-b2b-alerts.",
          action: "Monitorear el canal Slack nestlemx-b2b-alerts y CloudWatch para detectar fallos de Lambdas. Verificar que las GCP Functions esten ejecutandose correctamente. Los errores de inyeccion de ordenes (send-order-consumer / POST /presales) son criticos y deben resolverse inmediatamente.",
        },
        en: {
          context: "The account has two coexisting backends: AWS Lambdas (FTPS, existing regions) and GCP Cloud Functions (REST API, new regions). Sync errors between both systems can affect catalog and stock availability.",
          desc: "AWS Lambdas run at 06:40-06:50 CST daily (bulk uploads). If they fail, the day's catalog is outdated. GCP Functions (catalog-sync, master-catalogs-sync) handle new regions. Errors are reported in Slack channel nestlemx-b2b-alerts.",
          action: "Monitor Slack channel nestlemx-b2b-alerts and CloudWatch for Lambda failures. Verify GCP Functions are running correctly. Order injection errors (send-order-consumer / POST /presales) are critical and must be resolved immediately.",
        },
        pt: {
          context: "A conta tem dois backends coexistindo: AWS Lambdas (FTPS, regioes existentes) e GCP Cloud Functions (API REST, regioes novas). Erros de sincronizacao entre ambos sistemas podem afetar a disponibilidade do catalogo e estoque.",
          desc: "As Lambdas AWS rodam as 06:40-06:50 CST diariamente (bulk uploads). Se falharem, o catalogo do dia fica desatualizado. As GCP Functions (catalog-sync, master-catalogs-sync) gerenciam as regioes novas. Erros sao reportados no canal Slack nestlemx-b2b-alerts.",
          action: "Monitorar o canal Slack nestlemx-b2b-alerts e CloudWatch para detectar falhas de Lambdas. Verificar que as GCP Functions estejam executando corretamente. Erros de injecao de pedidos (send-order-consumer / POST /presales) sao criticos e devem ser resolvidos imediatamente.",
        },
      },
      safety: {
        es: {
          context: "El bot maneja datos sensibles: codigos de cliente, pedidos comerciales, informacion de precios/descuentos. La integracion con Nestle usa endpoints autenticados con OAuth tokens y los archivos FTPS estan cifrados con AES-256.",
          desc: "No se han reportado incidentes de seguridad (S1/S2/S3). El bot no genera contenido libre — todas las respuestas son flujos estructurados de Yalo Studio. El riesgo principal es exposicion de precios de descuento entre segmentos (Tendero vs Dipar).",
          action: "Verificar que CustomerSegmentHandler aplique correctamente la logica de segmentacion para evitar que un Tendero vea precios de Dipar y viceversa. Mantener rotacion de credenciales NESTLE_API en GCP Secret Manager.",
        },
        en: {
          context: "The bot handles sensitive data: customer codes, commercial orders, pricing/discount information. Integration with Nestle uses authenticated endpoints with OAuth tokens and FTPS files are AES-256 encrypted.",
          desc: "No security incidents reported (S1/S2/S3). The bot doesn't generate free content — all responses are structured Yalo Studio flows. Main risk is discount pricing exposure between segments (Shopkeeper vs Dipar).",
          action: "Verify CustomerSegmentHandler correctly applies segmentation logic to prevent a Shopkeeper from seeing Dipar prices and vice versa. Maintain NESTLE_API credential rotation in GCP Secret Manager.",
        },
        pt: {
          context: "O bot lida com dados sensiveis: codigos de cliente, pedidos comerciais, informacoes de precos/descontos. A integracao com Nestle usa endpoints autenticados com tokens OAuth e os arquivos FTPS sao criptografados com AES-256.",
          desc: "Nenhum incidente de seguranca reportado (S1/S2/S3). O bot nao gera conteudo livre — todas as respostas sao fluxos estruturados do Yalo Studio. O risco principal e exposicao de precos de desconto entre segmentos (Lojista vs Dipar).",
          action: "Verificar que CustomerSegmentHandler aplique corretamente a logica de segmentacao para evitar que um Lojista veja precos de Dipar e vice-versa. Manter rotacao de credenciais NESTLE_API no GCP Secret Manager.",
        },
      },
    },
  },
  "wa-ne1374-moment-n": {
    name: "Moment N (Nespresso)",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Brasil. 16 activities/277 components. Flujo hibrido (deterministic + hybrid). AI agents: Custom Agent 01, FAQ Custom Agent. Sin ORIS. Comercio conversacional Nespresso Professional (Moment N): autenticacion, catalogo de capsulas/maquinas, pedidos, registro, actualizacion de datos. Integra Headless Commerce (back-commerce webhook), Sales Desk, CSAT.',
      en: 'B2B WhatsApp bot Brazil. 16 activities/277 components. Hybrid flow (deterministic + hybrid). AI agents: Custom Agent 01, FAQ Custom Agent. No ORIS. Nespresso Professional conversational commerce (Moment N): authentication, capsule/machine catalog, orders, registration, data updates. Integrates Headless Commerce (back-commerce webhook), Sales Desk, CSAT.',
      pt: 'Bot B2B WhatsApp Brasil. 16 activities/277 components. Fluxo hibrido (deterministic + hybrid). AI agents: Custom Agent 01, FAQ Custom Agent. Sem ORIS. Comercio conversacional Nespresso Professional (Moment N): autenticacao, catalogo de capsulas/maquinas, pedidos, registro, atualizacao de dados. Integra Headless Commerce (back-commerce webhook), Sales Desk, CSAT.',
    },
    insights: {},
  },
  "ng-femsa-wae-br-prd": {
    name: "FEMSA WAE BR",
    hasOris: true,
    type: {
      es: 'Bot B2B WhatsApp Brasil. 40 activities/559 components. Flujo hibrido (deterministic + hybrid + agentic). AI agents: Sales Agent Template, femsa-oris-voice, Faq-customAgent BR 2026. Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda.',
      en: 'B2B WhatsApp bot Brazil. 40 activities/559 components. Hybrid flow (deterministic + hybrid + agentic). AI agents: Sales Agent Template, femsa-oris-voice, Faq-customAgent BR 2026. FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates KOF APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda.',
      pt: 'Bot B2B WhatsApp Brasil. 40 activities/559 components. Fluxo hibrido (deterministic + hybrid + agentic). AI agents: Sales Agent Template, femsa-oris-voice, Faq-customAgent BR 2026. Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda.',
    },
    insights: {},
  },
  "nadro-mx-b2b": {
      name: "Nadro MX B2B",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 43 activities/520 components. Flujo hibrido (deterministic + hybrid). AI agents: Genie Trainer v1.2.0, YF KnowGenie, faqs-custom-agent, Sales Agent, Oris P1 Template. Distribucion farmaceutica B2B para Nadro Mexico. Permite a farmacias y puntos de venta hacer pedidos de medicamentos y productos de salud via WhatsApp. Integra Magento B2B, SharePoint (Unilever), CCM Services (tickets SAC), Chazki (last mile), SFTP, y programa de lealtad.',
        en: 'B2B WhatsApp bot Mexico. 43 activities/520 components. Hybrid flow (deterministic + hybrid). AI agents: Genie Trainer v1.2.0, YF KnowGenie, faqs-custom-agent, Sales Agent, Oris P1 Template. Pharmaceutical B2B distribution for Nadro Mexico. Enables pharmacies and retail points to order medications and health products via WhatsApp. Integrates Magento B2B, SharePoint (Unilever), CCM Services (SAC tickets), Chazki (last mile delivery), SFTP, and loyalty program.',
        pt: 'Bot B2B WhatsApp Mexico. 43 activities/520 components. Fluxo hibrido (deterministic + hybrid). AI agents: Genie Trainer v1.2.0, YF KnowGenie, faqs-custom-agent, Sales Agent, Oris P1 Template. Distribuicao farmaceutica B2B para Nadro Mexico. Permite a farmacias e pontos de venda fazer pedidos de medicamentos e produtos de saude via WhatsApp. Integra Magento B2B, SharePoint (Unilever), CCM Services (tickets SAC), Chazki (last mile), SFTP, e programa de fidelidade.',
      },
      insights: {
      closureRate: {
        es: { context: 'Las farmacias B2B completan pedidos y cierran la conversacion. El programa de lealtad agrega sesiones no-transaccionales.', desc: 'El flujo tiene entry points de pedido y consulta de lealtad. Las sesiones de lealtad resuelven sin closure tipico.', action: 'Agregar cierre explicito post-consulta de lealtad: \'Tus puntos de lealtad son X. Algo mas en lo que te pueda ayudar?\'' },
        en: { context: 'B2B pharmacies complete orders and close the conversation. Loyalty program adds non-transactional sessions.', desc: 'The flow has order and loyalty inquiry entry points. Loyalty sessions resolve without typical closure.', action: 'Add explicit closing post-loyalty inquiry: \'Your loyalty points are X. Anything else I can help with?\'' },
        pt: { context: 'Farmacias B2B completam pedidos e fecham a conversa. O programa de fidelidade adiciona sessoes nao-transacionais.', desc: 'O fluxo tem pontos de entrada de pedido e consulta de fidelidade. Sessoes de fidelidade resolvem sem closure tipico.', action: 'Adicionar encerramento explicito pos-consulta de fidelidade: \'Seus pontos de fidelidade sao X. Mais alguma coisa que eu possa ajudar?\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a Magento B2B + SharePoint + CCM Services + Chazki. Multiples backends externos.', desc: 'Latencias provienen de la cadena: Cloud Functions -> Magento B2B (catalogo/precios) + SharePoint (datos de clientes). Chazki agrega latencia para consultas de entrega.', action: 'Evaluar cache de catalogo Magento. Consolidar consultas SharePoint. Pre-cargar datos de entrega Chazki para zonas frecuentes.' },
        en: { context: 'Latency includes calls to Magento B2B + SharePoint + CCM Services + Chazki. Multiple external backends.', desc: 'Latencies come from chain: Cloud Functions -> Magento B2B (catalog/prices) + SharePoint (customer data). Chazki adds latency for delivery queries.', action: 'Evaluate Magento catalog cache. Consolidate SharePoint queries. Pre-load Chazki delivery data for frequent zones.' },
        pt: { context: 'A latencia inclui chamadas a Magento B2B + SharePoint + CCM Services + Chazki. Multiplos backends externos.', desc: 'Latencias vem da cadeia: Cloud Functions -> Magento B2B (catalogo/precos) + SharePoint (dados de clientes). Chazki adiciona latencia para consultas de entrega.', action: 'Avaliar cache de catalogo Magento. Consolidar consultas SharePoint. Pre-carregar dados de entrega Chazki para zonas frequentes.' },
      },
      errorFree: {
        es: { context: 'Errores de Magento B2B, SharePoint y CCM Services llegan al usuario como errores del asistente.', desc: 'Respuestas de error de Magento (producto no disponible, precio no encontrado) y CCM (ticket no creado) se muestran al usuario como errores del bot.', action: 'Reformular errores de Magento/CCM a mensajes informativos. Manejar fallo de creacion de ticket SAC con reintento automatico.' },
        en: { context: 'Magento B2B, SharePoint and CCM Services errors reach the user as assistant errors.', desc: 'Magento error responses (product unavailable, price not found) and CCM (ticket not created) shown to user as bot errors.', action: 'Rewrite Magento/CCM errors to informative messages. Handle SAC ticket creation failure with automatic retry.' },
        pt: { context: 'Erros do Magento B2B, SharePoint e CCM Services chegam ao usuario como erros do assistente.', desc: 'Respostas de erro do Magento (produto indisponivel, preco nao encontrado) e CCM (ticket nao criado) mostradas ao usuario como erros do bot.', action: 'Reformular erros do Magento/CCM para mensagens informativas. Tratar falha de criacao de ticket SAC com retentativa automatica.' },
      },
      fallbackQuality: {
        es: { context: 'SFTP sincroniza datos de productos/precios/promociones. Si falla, el catalogo queda desactualizado.', desc: 'La sincronizacion SFTP para bulk-upload de productos, precios y promociones puede fallar silenciosamente, dejando datos obsoletos.', action: 'Implementar monitoreo de frescura de datos SFTP. Alertar cuando la ultima sincronizacion tiene mas de 24h de antiguedad.' },
        en: { context: 'SFTP syncs product/price/promotion data. If it fails, catalog becomes outdated.', desc: 'SFTP sync for bulk-upload of products, prices and promotions can fail silently, leaving obsolete data.', action: 'Implement SFTP data freshness monitoring. Alert when last sync is more than 24h old.' },
        pt: { context: 'SFTP sincroniza dados de produtos/precos/promocoes. Se falhar, o catalogo fica desatualizado.', desc: 'A sincronizacao SFTP para bulk-upload de produtos, precos e promocoes pode falhar silenciosamente, deixando dados obsoletos.', action: 'Implementar monitoramento de frescura de dados SFTP. Alertar quando a ultima sincronizacao tem mais de 24h.' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de Magento B2B + SharePoint + CCM + Chazki + SFTP. Arquitectura con 5+ servicios externos.', desc: 'La arquitectura distribuida con 5+ backends crea multiples puntos de fallo. Cada integracion puede degradar el servicio independientemente.', action: 'Implementar circuit breakers por servicio. Priorizar fallbacks: Magento critico (sin el no hay catalogo), Chazki secundario (entrega puede confirmarse despues).' },
        en: { context: 'Dependency on Magento B2B + SharePoint + CCM + Chazki + SFTP. Architecture with 5+ external services.', desc: 'Distributed architecture with 5+ backends creates multiple failure points. Each integration can degrade service independently.', action: 'Implement per-service circuit breakers. Prioritize fallbacks: Magento critical (no catalog without it), Chazki secondary (delivery can be confirmed later).' },
        pt: { context: 'Dependencia de Magento B2B + SharePoint + CCM + Chazki + SFTP. Arquitetura com 5+ servicos externos.', desc: 'A arquitetura distribuida com 5+ backends cria multiplos pontos de falha. Cada integracao pode degradar o servico independentemente.', action: 'Implementar circuit breakers por servico. Priorizar fallbacks: Magento critico (sem catalogo sem ele), Chazki secundario (entrega pode ser confirmada depois).' },
      },
      },
    },
  "hbc-ng-b2b": {
      name: "HBC B2B",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Nigeria. Plataforma de comercio para Hellenic Bottling Company (HBC/Coca-Cola) en Nigeria. Flujo hibrido con 35 activities y 378 componentes. Agentes IA: Voice Upsell Agent (unico), Sales Genie ORIS R1/P1, FAQs HBC CA. Integra HBC API (ivycpg.com), SFTP para items sugeridos, Redis (ElastiCache), S3. Actividades clave: make-order, suggested items, One Click Buy, Voice Upsell, Sales Genie ORIS, CSAT, Campaign Orchestrator.',
        en: 'B2B WhatsApp bot Nigeria. Commerce platform for Hellenic Bottling Company (HBC/Coca-Cola) in Nigeria. Hybrid flow with 35 activities and 378 components. AI Agents: Voice Upsell Agent (unique), Sales Genie ORIS R1/P1, FAQs HBC CA. Integrates HBC API (ivycpg.com), SFTP for suggested items, Redis (ElastiCache), S3. Key activities: make-order, suggested items, One Click Buy, Voice Upsell, Sales Genie ORIS, CSAT, Campaign Orchestrator.',
        pt: 'Bot B2B WhatsApp Nigeria. Plataforma de comercio para Hellenic Bottling Company (HBC/Coca-Cola) na Nigeria. Fluxo hibrido com 35 atividades e 378 componentes. Agentes IA: Voice Upsell Agent (unico), Sales Genie ORIS R1/P1, FAQs HBC CA. Integra HBC API (ivycpg.com), SFTP para itens sugeridos, Redis (ElastiCache), S3. Atividades-chave: make-order, suggested items, One Click Buy, Voice Upsell, Sales Genie ORIS, CSAT, Campaign Orchestrator.',
      },
      insights: {
      closureRate: {
        es: { context: 'Los distribuidores B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.', desc: 'El flujo tiene multiples entry points (One Click Buy, carrito, items sugeridos) que resuelven la intencion sin cierre conversacional formal.', action: 'Agregar mensaje de confirmacion final con cierre explicito post-pedido. Para items sugeridos, cerrar con resumen de pedido y despedida.' },
        en: { context: 'B2B distributors complete their order and stop responding. Normal pattern in recurring B2B transactional flows.', desc: 'The flow has multiple entry points (One Click Buy, cart, suggested items) that resolve intent without formal conversational closure.', action: 'Add final confirmation message with explicit closing post-order. For suggested items, close with order summary and farewell.' },
        pt: { context: 'Distribuidores B2B completam o pedido e param de responder. Padrao normal em fluxos transacionais B2B recorrentes.', desc: 'O fluxo tem multiplos pontos de entrada (One Click Buy, carrinho, itens sugeridos) que resolvem a intencao sem fechamento conversacional formal.', action: 'Adicionar mensagem de confirmacao final com encerramento explicito pos-pedido. Para itens sugeridos, fechar com resumo do pedido e despedida.' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a HBC API (ivycpg.com) + SFTP + Redis + AWS Lambda. Doble round-trip para autenticacion + consulta.', desc: 'Latencias provienen de la cadena: AWS Lambda -> HBC API (auth + SKU/stock/precios) + lectura SFTP para items sugeridos. Redis cache mitiga parcialmente.', action: 'Evaluar TTL del cache Redis para items sugeridos. Investigar si autenticacion HBC puede usar tokens de larga duracion. Pre-calentar Lambda en horarios pico.' },
        en: { context: 'Latency includes calls to HBC API (ivycpg.com) + SFTP + Redis + AWS Lambda. Double round-trip for auth + query.', desc: 'Latencies come from chain: AWS Lambda -> HBC API (auth + SKU/stock/prices) + SFTP read for suggested items. Redis cache partially mitigates.', action: 'Evaluate Redis cache TTL for suggested items. Investigate if HBC auth can use long-lived tokens. Warm up Lambda during peak hours.' },
        pt: { context: 'A latencia inclui chamadas a HBC API (ivycpg.com) + SFTP + Redis + AWS Lambda. Duplo round-trip para autenticacao + consulta.', desc: 'Latencias vem da cadeia: AWS Lambda -> HBC API (auth + SKU/estoque/precos) + leitura SFTP para itens sugeridos. Cache Redis mitiga parcialmente.', action: 'Avaliar TTL do cache Redis para itens sugeridos. Investigar se autenticacao HBC pode usar tokens de longa duracao. Pre-aquecer Lambda em horarios de pico.' },
      },
      errorFree: {
        es: { context: 'Errores de HBC API (ivycpg.com) como cliente no registrado, SKU sin stock y timeouts llegan al usuario.', desc: 'Respuestas de error de HBC API (cliente invalido, producto no disponible, precio no encontrado) se muestran como errores del asistente.', action: 'Reformular mensajes de error de HBC API a tono informativo. Manejar timeout de SFTP con fallback a cache Redis de items sugeridos.' },
        en: { context: 'HBC API (ivycpg.com) errors like unregistered customer, out-of-stock SKU and timeouts reach the user.', desc: 'HBC API error responses (invalid customer, unavailable product, price not found) shown as assistant errors.', action: 'Rewrite HBC API error messages to informative tone. Handle SFTP timeout with fallback to Redis cache for suggested items.' },
        pt: { context: 'Erros da HBC API (ivycpg.com) como cliente nao registrado, SKU sem estoque e timeouts chegam ao usuario.', desc: 'Respostas de erro da HBC API (cliente invalido, produto indisponivel, preco nao encontrado) mostradas como erros do assistente.', action: 'Reformular mensagens de erro da HBC API para tom informativo. Tratar timeout de SFTP com fallback para cache Redis de itens sugeridos.' },
      },
      fallbackQuality: {
        es: { context: 'SFTP sincroniza items sugeridos a S3/Redis. Si SFTP falla, los items sugeridos no se actualizan.', desc: 'La sincronizacion SFTP a S3 y luego a Redis puede fallar silenciosamente, causando que items sugeridos esten desactualizados sin que el bot lo detecte.', action: 'Implementar alerta cuando SFTP sync tiene mas de 24h de antiguedad. Agregar timestamp visible de ultima sincronizacion en respuestas de items sugeridos.' },
        en: { context: 'SFTP syncs suggested items to S3/Redis. If SFTP fails, suggested items are not updated.', desc: 'SFTP to S3 to Redis sync can fail silently, causing suggested items to be outdated without the bot detecting it.', action: 'Implement alert when SFTP sync is more than 24h old. Add visible last-sync timestamp in suggested items responses.' },
        pt: { context: 'SFTP sincroniza itens sugeridos para S3/Redis. Se SFTP falhar, os itens sugeridos nao sao atualizados.', desc: 'A sincronizacao SFTP para S3 e depois Redis pode falhar silenciosamente, fazendo itens sugeridos ficarem desatualizados sem o bot detectar.', action: 'Implementar alerta quando SFTP sync tem mais de 24h. Adicionar timestamp visivel de ultima sincronizacao nas respostas de itens sugeridos.' },
      },
      stabilityProxy: {
        es: { context: 'Integraciones HBC API + SFTP + Redis + AWS Lambda + S3 crean cadena de dependencias.', desc: 'La arquitectura depende de multiples servicios externos (HBC API, SFTP, Redis, S3). Fallo en cualquiera impacta el flujo.', action: 'Implementar circuit breaker para HBC API. Mantener cache Redis como fallback cuando HBC API no responde. Monitorear latencia de SFTP sync.' },
        en: { context: 'HBC API + SFTP + Redis + AWS Lambda + S3 integrations create dependency chain.', desc: 'Architecture depends on multiple external services (HBC API, SFTP, Redis, S3). Failure in any impacts the flow.', action: 'Implement circuit breaker for HBC API. Maintain Redis cache as fallback when HBC API is unresponsive. Monitor SFTP sync latency.' },
        pt: { context: 'Integracoes HBC API + SFTP + Redis + AWS Lambda + S3 criam cadeia de dependencias.', desc: 'A arquitetura depende de multiplos servicos externos (HBC API, SFTP, Redis, S3). Falha em qualquer um impacta o fluxo.', action: 'Implementar circuit breaker para HBC API. Manter cache Redis como fallback quando HBC API nao responde. Monitorar latencia de SFTP sync.' },
      },
      },
    },
  "wa-cc1661-ccu-cl-b2b": {
      name: "CCU Chile",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Chile. 54 activities/645 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent (R1/P1), Voice Upsell Agent, CCU FAQs CA, Voice Oris. Comercio conversacional para CCU Chile (bebidas/cervezas). Integra CCU API (api.ccu.cl) para catalogo, precios dinamicos, promociones y procesamiento de pedidos con ERP. AWS Lambda, Redis Cache, Headless Storefront.',
        en: 'B2B WhatsApp bot Chile. 54 activities/645 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent (R1/P1), Voice Upsell Agent, CCU FAQs CA, Voice Oris. Conversational commerce for CCU Chile (beverages/beer). Integrates CCU API (api.ccu.cl) for catalog, dynamic pricing, promotions and order processing with ERP. AWS Lambda, Redis Cache, Headless Storefront.',
        pt: 'Bot B2B WhatsApp Chile. 54 activities/645 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent (R1/P1), Voice Upsell Agent, CCU FAQs CA, Voice Oris. Comercio conversacional para CCU Chile (bebidas/cervejas). Integra CCU API (api.ccu.cl) para catalogo, precos dinamicos, promocoes e processamento de pedidos com ERP. AWS Lambda, Redis Cache, Headless Storefront.',
      },
      insights: {
      closureRate: {
        es: { context: 'Clientes B2B de CCU completan pedido de bebidas/cervezas y dejan de responder. 54 intents disponibles.', desc: 'Con 54 intents el bot cubre muchos escenarios. Los clientes terminan al confirmar pedido sin cierre conversacional formal.', action: 'Agregar cierre post-pedido con resumen: precio personalizado aplicado, fecha estimada de entrega.' },
        en: { context: 'CCU B2B customers complete beverage/beer order and stop responding. 54 intents available.', desc: 'With 54 intents the bot covers many scenarios. Customers finish when confirming order without formal conversational closure.', action: 'Add post-order closing with summary: personalized pricing applied, estimated delivery date.' },
        pt: { context: 'Clientes B2B da CCU completam pedido de bebidas/cervejas e param de responder. 54 intents disponiveis.', desc: 'Com 54 intents o bot cobre muitos cenarios. Clientes terminam ao confirmar pedido sem fechamento conversacional formal.', action: 'Adicionar encerramento pos-pedido com resumo: preco personalizado aplicado, data estimada de entrega.' },
      },
      latency: {
        es: { context: 'La latencia incluye CCU API (api.ccu.cl) + AWS Lambda + Redis Cache + Headless Storefront.', desc: 'Precios dinamicos personalizados por cliente requieren consulta individual a CCU API. Redis Cache mitiga pero puede expirar en picos.', action: 'Evaluar TTL de Redis Cache para precios. Pre-cargar precios por segmento de cliente. Optimizar Lambda para reducir cold starts.' },
        en: { context: 'Latency includes CCU API (api.ccu.cl) + AWS Lambda + Redis Cache + Headless Storefront.', desc: 'Dynamic per-customer pricing requires individual CCU API queries. Redis Cache mitigates but may expire at peak times.', action: 'Evaluate Redis Cache TTL for pricing. Pre-load prices by customer segment. Optimize Lambda to reduce cold starts.' },
        pt: { context: 'A latencia inclui CCU API (api.ccu.cl) + AWS Lambda + Redis Cache + Headless Storefront.', desc: 'Precos dinamicos personalizados por cliente requerem consulta individual a CCU API. Redis Cache mitiga mas pode expirar em picos.', action: 'Avaliar TTL do Redis Cache para precos. Pre-carregar precos por segmento de cliente. Otimizar Lambda para reduzir cold starts.' },
      },
      errorFree: {
        es: { context: 'Errores de CCU API (precios no encontrados, stock agotado, cliente no valido) llegan al usuario como errores del bot.', desc: 'Respuestas de error de CCU API (precio no disponible, producto sin stock, pedido rechazado) se muestran como errores del asistente.', action: 'Reformular errores de CCU API a mensajes informativos. Manejar producto sin stock con sugerencia de alternativa similar.' },
        en: { context: 'CCU API errors (pricing not found, out of stock, invalid customer) reach user as bot errors.', desc: 'CCU API error responses (price unavailable, out of stock product, rejected order) shown as assistant errors.', action: 'Rewrite CCU API errors to informative messages. Handle out of stock with similar alternative suggestion.' },
        pt: { context: 'Erros da CCU API (precos nao encontrados, estoque esgotado, cliente invalido) chegam ao usuario como erros do bot.', desc: 'Respostas de erro da CCU API (preco indisponivel, produto sem estoque, pedido rejeitado) mostradas como erros do assistente.', action: 'Reformular erros da CCU API para mensagens informativas. Tratar produto sem estoque com sugestao de alternativa similar.' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de CCU API (api.ccu.cl) + AWS Lambda + Redis Cache + Headless Storefront.', desc: 'CCU API es la dependencia central (catalogo, precios, pedidos). Si CCU API cae, no hay catalogo ni precios. Redis mitiga parcialmente.', action: 'Circuit breaker para CCU API. Modo degradado con catalogo/precios cacheados en Redis. Monitorear Redis memory y TTL.' },
        en: { context: 'Dependency on CCU API (api.ccu.cl) + AWS Lambda + Redis Cache + Headless Storefront.', desc: 'CCU API is the central dependency (catalog, prices, orders). If CCU API goes down, no catalog or prices. Redis partially mitigates.', action: 'Circuit breaker for CCU API. Degraded mode with Redis-cached catalog/prices. Monitor Redis memory and TTL.' },
        pt: { context: 'Dependencia de CCU API (api.ccu.cl) + AWS Lambda + Redis Cache + Headless Storefront.', desc: 'CCU API e a dependencia central (catalogo, precos, pedidos). Se CCU API cair, nao ha catalogo nem precos. Redis mitiga parcialmente.', action: 'Circuit breaker para CCU API. Modo degradado com catalogo/precos cacheados em Redis. Monitorar memoria Redis e TTL.' },
      },
      },
    },
  "wa-mo1662-ecuador-production": {
      name: "Mondelez Ecuador",
      hasOris: false,
      type: {
        es: "Bot B2B WhatsApp Ecuador (ECU). Bot de comercio B2B para Mondelez Ecuador que permite a distribuidores y tiendas realizar pedidos de productos a través de WhatsApp. Integra catálogo de.",
        en: "Bot B2B WhatsApp Ecuador (ECU). Bot de comercio B2B para Mondelez Ecuador que permite a distribuidores y tiendas realizar pedidos de productos a través de WhatsApp. Integra catálogo de.",
        pt: "Bot B2B WhatsApp Ecuador (ECU). Bot de comercio B2B para Mondelez Ecuador que permite a distribuidores y tiendas realizar pedidos de productos a través de WhatsApp. Integra catálogo de.",
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "mo1561-mondelez-peru-b2b": {
      name: "Mondelez Peru B2B",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Peru. Comercio conversacional B2B para Mondelez Peru (CPG/Alimentos). Flujo hibrido con 32 activities y 412 componentes. Agentes IA: Sales Agent ORIS R1/P1, FAQs Mondelez Peru CA. Integra Geosales ERP (api.mdlz.geosales.cloud) para precios/stock/pedidos, AWS Lambda, SalesDesk, Headless Commerce. Actividades clave: make-order, send-order, Multi Promo, WebviewOrder, Campaign Orchestrator, Sales Genie ORIS, CSAT/NPS.',
        en: 'B2B WhatsApp bot Peru. Conversational B2B commerce for Mondelez Peru (CPG/Food). Hybrid flow with 32 activities and 412 components. AI Agents: Sales Agent ORIS R1/P1, FAQs Mondelez Peru CA. Integrates Geosales ERP (api.mdlz.geosales.cloud) for prices/stock/orders, AWS Lambda, SalesDesk, Headless Commerce. Key activities: make-order, send-order, Multi Promo, WebviewOrder, Campaign Orchestrator, Sales Genie ORIS, CSAT/NPS.',
        pt: 'Bot B2B WhatsApp Peru. Comercio conversacional B2B para Mondelez Peru (CPG/Alimentos). Fluxo hibrido com 32 atividades e 412 componentes. Agentes IA: Sales Agent ORIS R1/P1, FAQs Mondelez Peru CA. Integra Geosales ERP (api.mdlz.geosales.cloud) para precos/estoque/pedidos, AWS Lambda, SalesDesk, Headless Commerce. Atividades-chave: make-order, send-order, Multi Promo, WebviewOrder, Campaign Orchestrator, Sales Genie ORIS, CSAT/NPS.',
      },
      insights: {
      closureRate: {
        es: { context: 'Los tenderos B2B completan su pedido y dejan de responder. El sistema multi-distribuidor agrega complejidad al flujo.', desc: 'El flujo tiene validacion de stock por distribuidor y listas de precios multiples. Usuarios terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar mensaje de cierre post-confirmacion de pedido: \'Tu pedido a [distribuidor] fue enviado. Te notificaremos cuando sea despachado.\'' },
        en: { context: 'B2B retailers complete their order and stop responding. Multi-distributor system adds flow complexity.', desc: 'The flow has per-distributor stock validation and multiple price lists. Users finish when confirming order without conversational closure.', action: 'Add closing message post-order confirmation: \'Your order to [distributor] has been sent. We will notify you when dispatched.\'' },
        pt: { context: 'Lojistas B2B completam o pedido e param de responder. O sistema multi-distribuidor adiciona complexidade ao fluxo.', desc: 'O fluxo tem validacao de estoque por distribuidor e listas de precos multiplas. Usuarios terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar mensagem de encerramento pos-confirmacao de pedido: \'Seu pedido para [distribuidor] foi enviado. Notificaremos quando for despachado.\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a Geosales ERP (api.mdlz.geosales.cloud) + AWS Lambda + validacion de stock por distribuidor.', desc: 'Latencias provienen de consultas a Geosales ERP: verPrecios, verPromociones, verificarStock por distribuidor. Cada consulta es un round-trip independiente.', action: 'Evaluar cache de precios/stock con TTL corto. Consolidar consultas de Geosales en una sola llamada donde sea posible. Pre-cargar datos del distribuidor asignado.' },
        en: { context: 'Latency includes calls to Geosales ERP (api.mdlz.geosales.cloud) + AWS Lambda + per-distributor stock validation.', desc: 'Latencies come from Geosales ERP queries: verPrecios, verPromociones, verificarStock per distributor. Each query is an independent round-trip.', action: 'Evaluate price/stock cache with short TTL. Consolidate Geosales queries into single call where possible. Pre-load assigned distributor data.' },
        pt: { context: 'A latencia inclui chamadas ao Geosales ERP (api.mdlz.geosales.cloud) + AWS Lambda + validacao de estoque por distribuidor.', desc: 'Latencias vem de consultas ao Geosales ERP: verPrecios, verPromociones, verificarStock por distribuidor. Cada consulta e um round-trip independente.', action: 'Avaliar cache de precos/estoque com TTL curto. Consolidar consultas ao Geosales em uma unica chamada onde possivel. Pre-carregar dados do distribuidor atribuido.' },
      },
      errorFree: {
        es: { context: 'Errores de Geosales ERP como distribuidor no asignado, lista de precios no encontrada y stock insuficiente llegan al usuario.', desc: 'Respuestas de error de Geosales (sin distribuidor, sin precios, sin stock) se muestran como errores. El bot funciona correctamente pero el evaluador las marca como fallo.', action: 'Reformular errores de Geosales a mensajes de negocio: \'No hay stock disponible de este producto con tu distribuidor actual. Intenta con otro producto.\'' },
        en: { context: 'Geosales ERP errors like unassigned distributor, price list not found and insufficient stock reach the user.', desc: 'Geosales error responses (no distributor, no prices, no stock) shown as errors. Bot works correctly but evaluator marks them as failures.', action: 'Rewrite Geosales errors to business messages: \'No stock available for this product with your current distributor. Try another product.\'' },
        pt: { context: 'Erros do Geosales ERP como distribuidor nao atribuido, lista de precos nao encontrada e estoque insuficiente chegam ao usuario.', desc: 'Respostas de erro do Geosales (sem distribuidor, sem precos, sem estoque) mostradas como erros. O bot funciona corretamente mas o avaliador as marca como falha.', action: 'Reformular erros do Geosales para mensagens de negocio: \'Nao ha estoque disponivel deste produto com seu distribuidor atual. Tente outro produto.\'' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia fuerte de Geosales ERP externo + AWS Lambda + sistema multi-distribuidor.', desc: 'Geosales ERP es punto unico de fallo para precios, stock y pedidos. Si Geosales cae, el bot no puede procesar ningun pedido.', action: 'Implementar modo degradado: cachear ultimo catalogo valido y permitir pedidos pendientes cuando Geosales no responda.' },
        en: { context: 'Strong dependency on external Geosales ERP + AWS Lambda + multi-distributor system.', desc: 'Geosales ERP is single point of failure for prices, stock and orders. If Geosales goes down, bot cannot process any orders.', action: 'Implement degraded mode: cache last valid catalog and allow pending orders when Geosales is unresponsive.' },
        pt: { context: 'Dependencia forte do Geosales ERP externo + AWS Lambda + sistema multi-distribuidor.', desc: 'Geosales ERP e ponto unico de falha para precos, estoque e pedidos. Se Geosales cair, o bot nao pode processar nenhum pedido.', action: 'Implementar modo degradado: cachear ultimo catalogo valido e permitir pedidos pendentes quando Geosales nao responder.' },
      },
      },
    },
  "wa-mo1533-mondelez-argentina": {
      name: "Mondelez Argentina",
      hasOris: false,
      type: {
        es: "Bot B2B WhatsApp Argentina (AR). Bot B2B de comercio conversacional para Mondelez Argentina. Permite a los clientes corporativos realizar pedidos de productos a través de WhatsApp, integrando.",
        en: "Bot B2B WhatsApp Argentina (AR). Bot B2B de comercio conversacional para Mondelez Argentina. Permite a los clientes corporativos realizar pedidos de productos a través de WhatsApp, integrando.",
        pt: "Bot B2B WhatsApp Argentina (AR). Bot B2B de comercio conversacional para Mondelez Argentina. Permite a los clientes corporativos realizar pedidos de productos a través de WhatsApp, integrando.",
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-ga2103-gabrica-colombia": {
      name: "Gabrica Colombia",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Colombia. 25 activities/396 components. Flujo hibrido (deterministic + hybrid). AI agents: FAQs GabricaQA (KnowledgeGenie), Faqs Gabrica Custom Agent, Sales Agent (con Oris integrado). Comercio conversacional para Gabrica Colombia (productos para mascotas). Pedidos, T&C, Yalo Force, CSAT, Headless Commerce.',
        en: 'B2B WhatsApp bot Colombia. 25 activities/396 components. Hybrid flow (deterministic + hybrid). AI agents: FAQs GabricaQA (KnowledgeGenie), Faqs Gabrica Custom Agent, Sales Agent (with integrated Oris). Conversational commerce for Gabrica Colombia (pet products). Orders, T&C, Yalo Force, CSAT, Headless Commerce.',
        pt: 'Bot B2B WhatsApp Colombia. 25 activities/396 components. Fluxo hibrido (deterministic + hybrid). AI agents: FAQs GabricaQA (KnowledgeGenie), Faqs Gabrica Custom Agent, Sales Agent (com Oris integrado). Comercio conversacional para Gabrica Colombia (produtos para pets). Pedidos, T&C, Yalo Force, CSAT, Headless Commerce.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (Dynamics 365). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con Dynamics 365: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (Dynamics 365). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from Dynamics 365 integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (Dynamics 365). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com Dynamics 365: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (Dynamics 365) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del Dynamics 365 (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (Dynamics 365) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "Dynamics 365 error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (Dynamics 365) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do Dynamics 365 (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con Dynamics 365 y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with Dynamics 365 and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com Dynamics 365 e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-mo1564-mondelez-uruguay": {
      name: "Mondelez Uruguay",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Uruguay. Comercio conversacional para Mondelez Uruguay (CPG/Alimentos). Lojistas hacen pedidos de snacks via WhatsApp. Integra VTEX E-commerce (Checkout API, Catalog API, Payments API), GCP Cloud Functions (headless-catalogue, cart-simulation, active-promotions, promotions-converter, credit-service, vtex-client), Redis Cache, Headless Commerce, Promotions Engine, Big Storage NG, Brain API, Commerce Webview. Activities: Home, Make order, Add To Category, Multi ATC, Send order, Last order, Delivery Date v2, CSat commerce, FAQs, SalesDesk, Yalo Force UY, Campaign ATC.',
        en: 'B2B WhatsApp bot Uruguay. Conversational commerce for Mondelez Uruguay (CPG/Food). Retailers order snacks via WhatsApp. Integrates VTEX E-commerce (Checkout API, Catalog API, Payments API), GCP Cloud Functions (headless-catalogue, cart-simulation, active-promotions, promotions-converter, credit-service, vtex-client), Redis Cache, Headless Commerce, Promotions Engine, Big Storage NG, Brain API, Commerce Webview. Activities: Home, Make order, Add To Category, Multi ATC, Send order, Last order, Delivery Date v2, CSat commerce, FAQs, SalesDesk, Yalo Force UY, Campaign ATC.',
        pt: 'Bot B2B WhatsApp Uruguai. Comercio conversacional para Mondelez Uruguai (CPG/Alimentos). Lojistas fazem pedidos de snacks via WhatsApp. Integra VTEX E-commerce (Checkout API, Catalog API, Payments API), GCP Cloud Functions (headless-catalogue, cart-simulation, active-promotions, promotions-converter, credit-service, vtex-client), Redis Cache, Headless Commerce, Promotions Engine, Big Storage NG, Brain API, Commerce Webview. Atividades: Home, Make order, Add To Category, Multi ATC, Send order, Last order, Delivery Date v2, CSat commerce, FAQs, SalesDesk, Yalo Force UY, Campaign ATC.',
      },
      insights: {
        closureRate: {
          es: { context: 'Lojistas B2B completan pedido de snacks y dejan de responder. Yalo Force UY y SalesDesk agregan sesiones asistidas.', desc: 'El flujo tiene multiples entry points (catalogo, pedido, Last order, Campaign ATC, Yalo Force). Las sesiones asistidas y de campana no tienen cierre formal.', action: 'Segmentar closure entre sesiones autoservicio, Yalo Force UY y Campaign ATC. Agregar cierre post-pedido y post-sesion asistida.' },
          en: { context: 'B2B retailers complete snack order and stop responding. Yalo Force UY and SalesDesk add assisted sessions.', desc: 'Flow has multiple entry points (catalog, order, Last order, Campaign ATC, Yalo Force). Assisted and campaign sessions lack formal closure.', action: 'Segment closure between self-service, Yalo Force UY and Campaign ATC sessions. Add closing post-order and post-assisted session.' },
          pt: { context: 'Lojistas B2B completam pedido de snacks e param de responder. Yalo Force UY e SalesDesk adicionam sessoes assistidas.', desc: 'O fluxo tem multiplos pontos de entrada (catalogo, pedido, Last order, Campaign ATC, Yalo Force). Sessoes assistidas e de campanha nao tem encerramento formal.', action: 'Segmentar closure entre sessoes autoatendimento, Yalo Force UY e Campaign ATC. Adicionar encerramento pos-pedido e pos-sessao assistida.' },
        },
        latency: {
          es: { context: 'La latencia incluye VTEX APIs (Checkout/Catalog/Payments) + Cloud Functions (cart-simulation, headless-catalogue, credit-service) + Redis Cache.', desc: 'Cadena de llamadas: Cloud Functions -> VTEX APIs (catalogo, simulacion de carrito, credito) -> Headless Commerce. Redis cachea llamadas a VTEX pero TTL puede expirar en picos.', action: 'Evaluar TTL de Redis Cache para VTEX calls. Optimizar cart-simulation para reducir round-trips. Pre-cargar catalogo en horarios de baja demanda.' },
          en: { context: 'Latency includes VTEX APIs (Checkout/Catalog/Payments) + Cloud Functions (cart-simulation, headless-catalogue, credit-service) + Redis Cache.', desc: 'Call chain: Cloud Functions -> VTEX APIs (catalog, cart simulation, credit) -> Headless Commerce. Redis caches VTEX calls but TTL may expire at peak times.', action: 'Evaluate Redis Cache TTL for VTEX calls. Optimize cart-simulation to reduce round-trips. Pre-load catalog during low-demand hours.' },
          pt: { context: 'A latencia inclui VTEX APIs (Checkout/Catalog/Payments) + Cloud Functions (cart-simulation, headless-catalogue, credit-service) + Redis Cache.', desc: 'Cadeia de chamadas: Cloud Functions -> VTEX APIs (catalogo, simulacao de carrinho, credito) -> Headless Commerce. Redis cacheia chamadas VTEX mas TTL pode expirar em picos.', action: 'Avaliar TTL do Redis Cache para chamadas VTEX. Otimizar cart-simulation para reduzir round-trips. Pre-carregar catalogo em horarios de baixa demanda.' },
        },
        errorFree: {
          es: { context: 'Errores de VTEX APIs (stock agotado, credito insuficiente, fallo de checkout) y Cloud Functions llegan al usuario.', desc: 'Respuestas de error de VTEX (producto sin stock, credito rechazado, fallo de pago) y timeout de Cloud Functions se muestran como errores del bot.', action: 'Reformular errores de VTEX a mensajes informativos. Manejar credito insuficiente con opciones alternativas de pago. Retry para timeouts de Cloud Functions.' },
          en: { context: 'VTEX API errors (out of stock, insufficient credit, checkout failure) and Cloud Functions errors reach the user.', desc: 'VTEX error responses (out of stock, rejected credit, payment failure) and Cloud Functions timeouts shown as bot errors.', action: 'Rewrite VTEX errors to informative messages. Handle insufficient credit with alternative payment options. Retry for Cloud Functions timeouts.' },
          pt: { context: 'Erros de VTEX APIs (estoque esgotado, credito insuficiente, falha de checkout) e Cloud Functions chegam ao usuario.', desc: 'Respostas de erro do VTEX (produto sem estoque, credito rejeitado, falha de pagamento) e timeout de Cloud Functions mostradas como erros do bot.', action: 'Reformular erros do VTEX para mensagens informativas. Tratar credito insuficiente com opcoes alternativas de pagamento. Retry para timeouts de Cloud Functions.' },
        },
        efficiencyLoops: {
          es: { context: 'Yalo Force UY permite venta asistida, aumentando interacciones por sesion. Multi ATC permite agregar multiples productos.', desc: 'Sesiones Yalo Force son naturalmente mas largas. Multi ATC y Add To Category pueden generar loops si el catalogo no carga correctamente.', action: 'Separar metricas de eficiencia entre autoservicio y Yalo Force UY. Monitorear tiempo de Multi ATC para detectar loops de catalogo.' },
          en: { context: 'Yalo Force UY enables assisted sales, increasing interactions per session. Multi ATC allows adding multiple products.', desc: 'Yalo Force sessions are naturally longer. Multi ATC and Add To Category can create loops if catalog does not load correctly.', action: 'Separate efficiency metrics between self-service and Yalo Force UY. Monitor Multi ATC time to detect catalog loops.' },
          pt: { context: 'Yalo Force UY permite venda assistida, aumentando interacoes por sessao. Multi ATC permite adicionar multiplos produtos.', desc: 'Sessoes Yalo Force sao naturalmente mais longas. Multi ATC e Add To Category podem gerar loops se o catalogo nao carrega corretamente.', action: 'Separar metricas de eficiencia entre autoatendimento e Yalo Force UY. Monitorar tempo de Multi ATC para detectar loops de catalogo.' },
        },
        stabilityProxy: {
          es: { context: 'Cadena compleja: VTEX APIs + 6 Cloud Functions + Redis Cache + Headless Commerce + Promotions Engine + Big Storage NG.', desc: 'VTEX es la dependencia central (catalogo, checkout, pagos). Si VTEX cae, no hay catalogo ni checkout. Redis mitiga parcialmente pero no cubre pagos.', action: 'Circuit breaker para VTEX APIs. Modo degradado con catalogo cacheado en Redis. Monitorear health de Cloud Functions y Redis memory.' },
          en: { context: 'Complex chain: VTEX APIs + 6 Cloud Functions + Redis Cache + Headless Commerce + Promotions Engine + Big Storage NG.', desc: 'VTEX is the central dependency (catalog, checkout, payments). If VTEX goes down, no catalog or checkout. Redis partially mitigates but does not cover payments.', action: 'Circuit breaker for VTEX APIs. Degraded mode with Redis-cached catalog. Monitor Cloud Functions health and Redis memory.' },
          pt: { context: 'Cadeia complexa: VTEX APIs + 6 Cloud Functions + Redis Cache + Headless Commerce + Promotions Engine + Big Storage NG.', desc: 'VTEX e a dependencia central (catalogo, checkout, pagamentos). Se VTEX cair, nao ha catalogo nem checkout. Redis mitiga parcialmente mas nao cobre pagamentos.', action: 'Circuit breaker para VTEX APIs. Modo degradado com catalogo cacheado em Redis. Monitorar health de Cloud Functions e memoria Redis.' },
        },
      },
    },
  "wa-un1912-napolita-ecuador": {
    name: "Napolita Ecuador",
    hasOris: false,
    type: {
      es: "Bot B2B Ecuador (Napolita / Unilever)",
      en: "B2B Ecuador bot (Napolita / Unilever)",
      pt: "Bot B2B Equador (Napolita / Unilever)",
    },
    insights: {},
  },
  "mo1569-mondelezbr": {
      name: "Mondelez BR",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Brasil. Comercio conversacional para Mondelez Brasil (CPG/Alimentos). Flujo hibrido con 44 activities y 582 componentes. Agentes IA: Sales Agent, FAQs Mondelez BR CA, Cupones CA. Integra Mulesoft API (us.api.mdlz.com), GCP Cloud Functions (coupon-resolve, data-scheduler, data-fetcher, data-parser, monitor-sync), Headless API, Promotions API, CDP Segments. Actividades clave: make-order, Webview Order, Multi ATC, Multi Promo, Yalo Force, Sales Desk, Coupon system, CSAT Portuguese WA Flow v2.',
        en: 'B2B WhatsApp bot Brazil. Conversational commerce for Mondelez Brazil (CPG/Food). Hybrid flow with 44 activities and 582 components. AI Agents: Sales Agent, FAQs Mondelez BR CA, Coupons CA. Integrates Mulesoft API (us.api.mdlz.com), GCP Cloud Functions (coupon-resolve, data-scheduler, data-fetcher, data-parser, monitor-sync), Headless API, Promotions API, CDP Segments. Key activities: make-order, Webview Order, Multi ATC, Multi Promo, Yalo Force, Sales Desk, Coupon system, CSAT Portuguese WA Flow v2.',
        pt: 'Bot B2B WhatsApp Brasil. Comercio conversacional para Mondelez Brasil (CPG/Alimentos). Fluxo hibrido com 44 atividades e 582 componentes. Agentes IA: Sales Agent, FAQs Mondelez BR CA, Cupons CA. Integra Mulesoft API (us.api.mdlz.com), GCP Cloud Functions (coupon-resolve, data-scheduler, data-fetcher, data-parser, monitor-sync), Headless API, Promotions API, CDP Segments. Atividades-chave: make-order, Webview Order, Multi ATC, Multi Promo, Yalo Force, Sales Desk, sistema de Cupons, CSAT Portuguese WA Flow v2.',
      },
      insights: {
      closureRate: {
        es: { context: 'Lojistas B2B completan pedido y dejan de responder. Yalo Force agrega sesiones de venta asistida.', desc: 'El flujo tiene multiples entry points (catalogo, pedido, cupones, Yalo Force). Las sesiones de venta asistida no tienen cierre formal.', action: 'Segmentar closure entre sesiones autoservicio y Yalo Force. Agregar cierre post-pedido y post-sesion asistida.' },
        en: { context: 'B2B retailers complete order and stop responding. Yalo Force adds assisted sales sessions.', desc: 'Flow has multiple entry points (catalog, order, coupons, Yalo Force). Assisted sales sessions lack formal closure.', action: 'Segment closure between self-service and Yalo Force sessions. Add closing post-order and post-assisted session.' },
        pt: { context: 'Lojistas B2B completam pedido e param de responder. Yalo Force adiciona sessoes de venda assistida.', desc: 'O fluxo tem multiplos pontos de entrada (catalogo, pedido, cupons, Yalo Force). Sessoes de venda assistida nao tem encerramento formal.', action: 'Segmentar closure entre sessoes autoatendimento e Yalo Force. Adicionar encerramento pos-pedido e pos-sessao assistida.' },
      },
      latency: {
        es: { context: 'La latencia incluye Mulesoft API (us.api.mdlz.com) + GCP Cloud Functions (data-pipeline) + Headless API.', desc: 'Latencias provienen del pipeline: Cloud Functions (data-fetcher/parser) -> Mulesoft API (catalogo/precios/stock) -> Headless (pedidos). Monitor-sync agrega overhead.', action: 'Evaluar cache de Mulesoft con TTL corto. Optimizar pipeline data-scheduler/fetcher/parser. Pre-cargar datos de stock en horarios pico.' },
        en: { context: 'Latency includes Mulesoft API (us.api.mdlz.com) + GCP Cloud Functions (data-pipeline) + Headless API.', desc: 'Latencies from pipeline: Cloud Functions (data-fetcher/parser) -> Mulesoft API (catalog/prices/stock) -> Headless (orders). Monitor-sync adds overhead.', action: 'Evaluate Mulesoft cache with short TTL. Optimize data-scheduler/fetcher/parser pipeline. Pre-load stock data at peak hours.' },
        pt: { context: 'A latencia inclui Mulesoft API (us.api.mdlz.com) + GCP Cloud Functions (data-pipeline) + Headless API.', desc: 'Latencias vem do pipeline: Cloud Functions (data-fetcher/parser) -> Mulesoft API (catalogo/precos/estoque) -> Headless (pedidos). Monitor-sync adiciona overhead.', action: 'Avaliar cache do Mulesoft com TTL curto. Otimizar pipeline data-scheduler/fetcher/parser. Pre-carregar dados de estoque em horarios de pico.' },
      },
      errorFree: {
        es: { context: 'Errores de Mulesoft API (Mondelez) como stock insuficiente, cupon invalido y timeout de data-sync llegan al usuario.', desc: 'Respuestas de error de Mulesoft (stock, precios, cupones) y fallos de data-parser se muestran como errores del bot.', action: 'Reformular errores de Mulesoft a mensajes informativos. Manejar cupon invalido con sugerencia de alternativa.' },
        en: { context: 'Mulesoft API (Mondelez) errors like insufficient stock, invalid coupon and data-sync timeout reach the user.', desc: 'Mulesoft error responses (stock, prices, coupons) and data-parser failures shown as bot errors.', action: 'Rewrite Mulesoft errors to informative messages. Handle invalid coupon with alternative suggestion.' },
        pt: { context: 'Erros da Mulesoft API (Mondelez) como estoque insuficiente, cupom invalido e timeout de data-sync chegam ao usuario.', desc: 'Respostas de erro do Mulesoft (estoque, precos, cupons) e falhas do data-parser mostradas como erros do bot.', action: 'Reformular erros do Mulesoft para mensagens informativas. Tratar cupom invalido com sugestao de alternativa.' },
      },
      efficiencyLoops: {
        es: { context: 'Yalo Force permite venta asistida, aumentando numero de interacciones por sesion.', desc: 'Sesiones Yalo Force son naturalmente mas largas. Metricas de eficiencia deben segmentarse.', action: 'Separar metricas de eficiencia entre autoservicio y sesiones Yalo Force para evaluar correctamente cada canal.' },
        en: { context: 'Yalo Force enables assisted sales, increasing interactions per session.', desc: 'Yalo Force sessions are naturally longer. Efficiency metrics should be segmented.', action: 'Separate efficiency metrics between self-service and Yalo Force sessions to correctly evaluate each channel.' },
        pt: { context: 'Yalo Force permite venda assistida, aumentando interacoes por sessao.', desc: 'Sessoes Yalo Force sao naturalmente mais longas. Metricas de eficiencia devem ser segmentadas.', action: 'Separar metricas de eficiencia entre autoatendimento e sessoes Yalo Force para avaliar corretamente cada canal.' },
      },
      stabilityProxy: {
        es: { context: 'Cadena compleja: Mulesoft API + GCP Cloud Functions (9 funciones) + Headless + CDP. Pipeline de datos con monitor-sync.', desc: 'Arquitectura con 9 Cloud Functions y Mulesoft como dependencia central. Monitor-sync detecta inconsistencias pero agrega complejidad.', action: 'Centralizar monitoreo de pipeline. Circuit breaker para Mulesoft. Alertar si monitor-notifier detecta divergencias de datos.' },
        en: { context: 'Complex chain: Mulesoft API + GCP Cloud Functions (9 functions) + Headless + CDP. Data pipeline with monitor-sync.', desc: 'Architecture with 9 Cloud Functions and Mulesoft as central dependency. Monitor-sync detects inconsistencies but adds complexity.', action: 'Centralize pipeline monitoring. Circuit breaker for Mulesoft. Alert if monitor-notifier detects data divergences.' },
        pt: { context: 'Cadeia complexa: Mulesoft API + GCP Cloud Functions (9 funcoes) + Headless + CDP. Pipeline de dados com monitor-sync.', desc: 'Arquitetura com 9 Cloud Functions e Mulesoft como dependencia central. Monitor-sync detecta inconsistencias mas adiciona complexidade.', action: 'Centralizar monitoramento de pipeline. Circuit breaker para Mulesoft. Alertar se monitor-notifier detectar divergencias de dados.' },
      },
      },
    },
  "unilever_b2b": {
      name: "Unilever B2B MX",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 98 activities/1943 components. Flujo hibrido (deterministic + hybrid). AI agents: FAQs custom agent (loyalty, heladio tradicional, heladio six, autoventas), Genie Trainer v1.2.0, human-agent. Comercio conversacional para Unilever Mexico (helados Holanda). Integra APIs Unilever, Magento, Chazki (last mile), SFTP. Segmentos: tradicional + magento.',
        en: 'B2B WhatsApp bot Mexico. 98 activities/1943 components. Hybrid flow (deterministic + hybrid). AI agents: FAQs custom agent (loyalty, heladio tradicional, heladio six, autoventas), Genie Trainer v1.2.0, human-agent. Conversational commerce for Unilever Mexico (Holanda ice cream). Integrates Unilever APIs, Magento, Chazki (last mile), SFTP. Segments: traditional + magento.',
        pt: 'Bot B2B WhatsApp Mexico. 98 activities/1943 components. Fluxo hibrido (deterministic + hybrid). AI agents: FAQs custom agent (loyalty, heladio tradicional, heladio six, autoventas), Genie Trainer v1.2.0, human-agent. Comercio conversacional para Unilever Mexico (sorvetes Holanda). Integra APIs Unilever, Magento, Chazki (last mile), SFTP. Segmentos: tradicional + magento.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (Magento). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con Magento: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (Magento). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from Magento integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (Magento). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com Magento: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (Magento) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del Magento (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (Magento) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "Magento error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (Magento) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do Magento (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con Magento y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with Magento and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com Magento e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      fallbackQuality: {
          es: {
            context: "Datos de catalogo sincronizados via SFTP periodicamente. Productos desactualizados entre sincronizaciones generan fallbacks legitimos.",
            desc: "Cuando la sincronizacion SFTP tiene retraso, productos recien agregados o cambios de precio no estan disponibles. El bot responde con fallback porque los datos no existen aun.",
            action: "Verificar frecuencia de sincronizacion SFTP y monitorear errores. Agregar respuestas especificas para \'producto no encontrado temporalmente\'.",
          },
          en: {
            context: "Catalog data synced via SFTP periodically. Outdated products between syncs generate legitimate fallbacks.",
            desc: "When SFTP sync is delayed, newly added products or price changes are unavailable. Bot responds with fallback because data does not exist yet.",
            action: "Verify SFTP sync frequency and monitor errors. Add specific responses for \'product temporarily not found\'.",
          },
          pt: {
            context: "Dados de catalogo sincronizados via SFTP periodicamente. Produtos desatualizados entre sincronizacoes geram fallbacks legitimos.",
            desc: "Quando a sincronizacao SFTP esta atrasada, produtos recem adicionados ou mudancas de preco nao estao disponiveis. Bot responde com fallback porque dados ainda nao existem.",
            action: "Verificar frequencia de sincronizacao SFTP e monitorar erros. Adicionar respostas especificas para \'produto temporariamente nao encontrado\'.",
          },
        },
      },
    },
  "wa-me1772-mercedes-benz-universo-mb": {
    name: "Mercedes Universo MB",
    hasOris: false,
    type: { es: "Bot B2C (Mercedes-Benz Universo MB)", en: "B2C bot (Mercedes-Benz Universo MB)", pt: "Bot B2C (Mercedes-Benz Universo MB)" },
    insights: {},
  },
  "wa-pe1814-penafiel-mx": {
      name: "Penafiel MX",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 32 activities/387 components. Flujo hibrido (deterministic + hybrid). AI agents: Custom Agent 01, FAQS custom agent. Sin ORIS. Comercio conversacional Penafiel Mexico (distribucion de bebidas). Incluye Home, Customer Validation, TyC, Make Order, Last Order, Order Status, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracion.',
        en: 'B2B WhatsApp bot Mexico. 32 activities/387 components. Hybrid flow (deterministic + hybrid). AI agents: Custom Agent 01, FAQS custom agent. No ORIS. Penafiel Mexico conversational commerce (beverage distribution). Includes Home, Customer Validation, TyC, Make Order, Last Order, Order Status, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integrates Headless Commerce (order webview), integration webhooks.',
        pt: 'Bot B2B WhatsApp Mexico. 32 activities/387 components. Fluxo hibrido (deterministic + hybrid). AI agents: Custom Agent 01, FAQS custom agent. Sem ORIS. Comercio conversacional Penafiel Mexico (distribuicao de bebidas). Inclui Home, Customer Validation, TyC, Make Order, Last Order, Order Status, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracao.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "alpina-wa-col-prd": {
      name: "Alpina Colombia",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Colombia. Comercio conversacional para Alpina Colombia (lacteos/alimentos). Flujo hibrido con 52 activities y 636 componentes. Agentes IA: Sales Agent in Chat 01, FAQs Alpina CA, Sales Agent R1/P1 Regular, Agente chistes Compi. Integra A-movil API (sistema de pedidos), AWS Lambda (place-order), Headless Commerce, Big Storage NG, Brain API, Firehose API, AWS S3. Actividades clave: make-order, send-order, One Chat Buy, Add To Cart, Multi SKU, Campaign Orchestrator, Yalo Force, Commerce Conversational Template v5, Registro dia tendero, Sales Desk (Frontapp).',
        en: 'B2B WhatsApp bot Colombia. Conversational commerce for Alpina Colombia (dairy/food). Hybrid flow with 52 activities and 636 components. AI Agents: Sales Agent in Chat 01, FAQs Alpina CA, Sales Agent R1/P1 Regular, Compi jokes Agent. Integrates A-movil API (order system), AWS Lambda (place-order), Headless Commerce, Big Storage NG, Brain API, Firehose API, AWS S3. Key activities: make-order, send-order, One Chat Buy, Add To Cart, Multi SKU, Campaign Orchestrator, Yalo Force, Commerce Conversational Template v5, Retailer registration, Sales Desk (Frontapp).',
        pt: 'Bot B2B WhatsApp Colombia. Comercio conversacional para Alpina Colombia (laticinios/alimentos). Fluxo hibrido com 52 atividades e 636 componentes. Agentes IA: Sales Agent in Chat 01, FAQs Alpina CA, Sales Agent R1/P1 Regular, Agente chistes Compi. Integra A-movil API (sistema de pedidos), AWS Lambda (place-order), Headless Commerce, Big Storage NG, Brain API, Firehose API, AWS S3. Atividades-chave: make-order, send-order, One Chat Buy, Add To Cart, Multi SKU, Campaign Orchestrator, Yalo Force, Commerce Conversational Template v5, Registro dia tendero, Sales Desk (Frontapp).',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de lacteos y dejan de responder. Yalo Force y Campaign Orchestrator agregan sesiones asistidas.', desc: 'El flujo tiene multiples entry points (One Chat Buy, Multi SKU, Webview Order, Campaign Orchestrator, Yalo Force). Las sesiones de campana y venta asistida no tienen cierre formal.', action: 'Segmentar closure entre autoservicio, Yalo Force y Campaign Orchestrator. Agregar cierre post-pedido con resumen de entrega.' },
        en: { context: 'B2B retailers complete dairy order and stop responding. Yalo Force and Campaign Orchestrator add assisted sessions.', desc: 'Flow has multiple entry points (One Chat Buy, Multi SKU, Webview Order, Campaign Orchestrator, Yalo Force). Campaign and assisted sessions lack formal closure.', action: 'Segment closure between self-service, Yalo Force and Campaign Orchestrator. Add post-order closing with delivery summary.' },
        pt: { context: 'Lojistas B2B completam pedido de laticinios e param de responder. Yalo Force e Campaign Orchestrator adicionam sessoes assistidas.', desc: 'O fluxo tem multiplos pontos de entrada (One Chat Buy, Multi SKU, Webview Order, Campaign Orchestrator, Yalo Force). Sessoes de campanha e assistidas nao tem encerramento formal.', action: 'Segmentar closure entre autoatendimento, Yalo Force e Campaign Orchestrator. Adicionar encerramento pos-pedido com resumo de entrega.' },
      },
      latency: {
        es: { context: 'La latencia incluye A-movil API (sistema de pedidos) + AWS Lambda (place-order) + Headless Commerce.', desc: 'Latencias provienen del pipeline: Lambda (place-order) -> A-movil API (validacion + envio pedido). A-movil como ERP externo agrega round-trip significativo.', action: 'Evaluar cache de catalogo post-sync. Optimizar Lambda place-order para reducir procesamiento. Monitorear p50 de A-movil API.' },
        en: { context: 'Latency includes A-movil API (order system) + AWS Lambda (place-order) + Headless Commerce.', desc: 'Latencies from pipeline: Lambda (place-order) -> A-movil API (validation + order submission). A-movil as external ERP adds significant round-trip.', action: 'Evaluate catalog cache post-sync. Optimize Lambda place-order to reduce processing. Monitor A-movil API p50.' },
        pt: { context: 'A latencia inclui A-movil API (sistema de pedidos) + AWS Lambda (place-order) + Headless Commerce.', desc: 'Latencias vem do pipeline: Lambda (place-order) -> A-movil API (validacao + envio pedido). A-movil como ERP externo adiciona round-trip significativo.', action: 'Avaliar cache de catalogo pos-sync. Otimizar Lambda place-order para reduzir processamento. Monitorar p50 da A-movil API.' },
      },
      errorFree: {
        es: { context: 'Errores de A-movil API (pedido rechazado, cliente no encontrado, stock agotado) llegan al usuario como errores del bot.', desc: 'Respuestas de error de A-movil (validacion de cliente, stock, horario) se muestran como errores del asistente. El bot funciona correctamente.', action: 'Reformular errores de A-movil a mensajes informativos. Manejar cliente no encontrado con flujo de registro.' },
        en: { context: 'A-movil API errors (rejected order, customer not found, out of stock) reach user as bot errors.', desc: 'A-movil error responses (customer validation, stock, schedule) shown as assistant errors. Bot works correctly.', action: 'Rewrite A-movil errors to informative messages. Handle customer not found with registration flow.' },
        pt: { context: 'Erros da A-movil API (pedido rejeitado, cliente nao encontrado, estoque esgotado) chegam ao usuario como erros do bot.', desc: 'Respostas de erro da A-movil (validacao de cliente, estoque, horario) mostradas como erros do assistente. O bot funciona corretamente.', action: 'Reformular erros da A-movil para mensagens informativas. Tratar cliente nao encontrado com fluxo de registro.' },
      },
      efficiencyLoops: {
        es: { context: 'Yalo Force permite venta asistida con mas interacciones. Multi SKU y Add To Cart pueden generar loops si el catalogo falla.', desc: 'Sesiones Yalo Force son naturalmente mas largas. Multi SKU agrega pasos extra de seleccion de producto.', action: 'Separar metricas de eficiencia entre autoservicio y Yalo Force. Monitorear Multi SKU para detectar loops de catalogo.' },
        en: { context: 'Yalo Force enables assisted sales with more interactions. Multi SKU and Add To Cart can create loops if catalog fails.', desc: 'Yalo Force sessions are naturally longer. Multi SKU adds extra product selection steps.', action: 'Separate efficiency metrics between self-service and Yalo Force. Monitor Multi SKU for catalog loops.' },
        pt: { context: 'Yalo Force permite venda assistida com mais interacoes. Multi SKU e Add To Cart podem gerar loops se o catalogo falhar.', desc: 'Sessoes Yalo Force sao naturalmente mais longas. Multi SKU adiciona passos extras de selecao de produto.', action: 'Separar metricas de eficiencia entre autoatendimento e Yalo Force. Monitorar Multi SKU para detectar loops de catalogo.' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de A-movil API + AWS Lambda + Headless Commerce + Big Storage NG + Firehose.', desc: 'A-movil es la dependencia central para pedidos. Si A-movil cae, no se procesan pedidos. Firehose y S3 agregan complejidad de pipeline.', action: 'Circuit breaker para A-movil API. Modo degradado: aceptar pedidos en cola. Monitorear health de Lambda place-order.' },
        en: { context: 'Dependency on A-movil API + AWS Lambda + Headless Commerce + Big Storage NG + Firehose.', desc: 'A-movil is the central dependency for orders. If A-movil goes down, no orders processed. Firehose and S3 add pipeline complexity.', action: 'Circuit breaker for A-movil API. Degraded mode: accept queued orders. Monitor Lambda place-order health.' },
        pt: { context: 'Dependencia de A-movil API + AWS Lambda + Headless Commerce + Big Storage NG + Firehose.', desc: 'A-movil e a dependencia central para pedidos. Se A-movil cair, pedidos nao sao processados. Firehose e S3 adicionam complexidade de pipeline.', action: 'Circuit breaker para A-movil API. Modo degradado: aceitar pedidos em fila. Monitorar health de Lambda place-order.' },
      },
      },
    },
  "at1551-atacadao-wa-br": {
      name: "Atacadao BR",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Brasil. Plataforma de comercio conversacional para Atacadao (cadena mayorista/retail brasilena). Flujo hibrido con 17 activities y 202 componentes. Agentes IA: Sales Agent, FAQ Custom Agent. Integra SFTP -> GCS Bucket -> Headless Admin API (bulk upload). Yalo Brain API. Actividades clave: Commerce Pre/Post, Auth Store, FAQ, CSAT, Suggested Order, Campanhas, Pamphlet, Promo/Leads, Sales Genie ORIS R1, CSAT Portuguese WA Flow v2.',
        en: 'B2B WhatsApp bot Brazil. Conversational commerce platform for Atacadao (Brazilian wholesale/retail chain). Hybrid flow with 17 activities and 202 components. AI Agents: Sales Agent, FAQ Custom Agent. Integrates SFTP -> GCS Bucket -> Headless Admin API (bulk upload). Yalo Brain API. Key activities: Commerce Pre/Post, Auth Store, FAQ, CSAT, Suggested Order, Campaigns, Pamphlet, Promo/Leads, Sales Genie ORIS R1, CSAT Portuguese WA Flow v2.',
        pt: 'Bot B2B WhatsApp Brasil. Plataforma de comercio conversacional para Atacadao (cadeia atacado/varejo brasileira). Fluxo hibrido com 17 atividades e 202 componentes. Agentes IA: Sales Agent, FAQ Custom Agent. Integra SFTP -> GCS Bucket -> Headless Admin API (bulk upload). Yalo Brain API. Atividades-chave: Commerce Pre/Post, Auth Store, FAQ, CSAT, Pedido Sugerido, Campanhas, Pamphlet, Promo/Leads, Sales Genie ORIS R1, CSAT Portuguese WA Flow v2.',
      },
      insights: {
      closureRate: {
        es: { context: 'Atacadao tiene multiples entry points: pedido, FAQ, CSAT, campanas, promo/leads. No todos terminan en transaccion.', desc: 'Las sesiones de FAQ, campanas y promo/leads resuelven sin cierre conversacional tipico. Pedido sugerido y Commerce completan ciclo.', action: 'Agregar cierre explicito por tipo de sesion: post-pedido, post-FAQ, post-campana.' },
        en: { context: 'Atacadao has multiple entry points: order, FAQ, CSAT, campaigns, promo/leads. Not all end in transaction.', desc: 'FAQ, campaigns and promo/leads sessions resolve without typical conversational closure. Suggested Order and Commerce complete the cycle.', action: 'Add explicit closing per session type: post-order, post-FAQ, post-campaign.' },
        pt: { context: 'Atacadao tem multiplos pontos de entrada: pedido, FAQ, CSAT, campanhas, promo/leads. Nem todos terminam em transacao.', desc: 'Sessoes de FAQ, campanhas e promo/leads resolvem sem fechamento conversacional tipico. Pedido Sugerido e Commerce completam o ciclo.', action: 'Adicionar encerramento explicito por tipo de sessao: pos-pedido, pos-FAQ, pos-campanha.' },
      },
      fallbackQuality: {
        es: { context: 'SFTP sincroniza datos del cliente a GCS Bucket y luego a Headless Admin (bulk upload). Si SFTP falla, datos obsoletos.', desc: 'La cadena SFTP -> GCS -> Headless puede fallar silenciosamente, causando catalogo/precios desactualizados sin deteccion.', action: 'Implementar monitoreo de frescura de datos SFTP. Alertar cuando sincronizacion tiene mas de 24h. Validar integridad post-upload.' },
        en: { context: 'SFTP syncs client data to GCS Bucket then to Headless Admin (bulk upload). If SFTP fails, data becomes stale.', desc: 'SFTP -> GCS -> Headless chain can fail silently, causing outdated catalog/prices without detection.', action: 'Implement SFTP data freshness monitoring. Alert when sync is more than 24h old. Validate post-upload integrity.' },
        pt: { context: 'SFTP sincroniza dados do cliente para GCS Bucket e depois para Headless Admin (bulk upload). Se SFTP falhar, dados obsoletos.', desc: 'A cadeia SFTP -> GCS -> Headless pode falhar silenciosamente, causando catalogo/precos desatualizados sem deteccao.', action: 'Implementar monitoramento de frescura de dados SFTP. Alertar quando sincronizacao tem mais de 24h. Validar integridade pos-upload.' },
      },
      stabilityProxy: {
        es: { context: 'Cadena SFTP -> GCS -> Headless Admin API + Yalo Brain API. Menor complejidad que bots con ERP externo.', desc: 'La arquitectura sin ERP externo directo reduce puntos de fallo, pero depende de la cadena SFTP para datos frescos.', action: 'Monitorear pipeline SFTP -> GCS -> Headless. Implementar alerta si bulk upload falla. Mantener datos cacheados como fallback.' },
        en: { context: 'SFTP -> GCS -> Headless Admin API + Yalo Brain API chain. Lower complexity than bots with external ERP.', desc: 'Architecture without direct external ERP reduces failure points, but depends on SFTP chain for fresh data.', action: 'Monitor SFTP -> GCS -> Headless pipeline. Implement alert if bulk upload fails. Keep cached data as fallback.' },
        pt: { context: 'Cadeia SFTP -> GCS -> Headless Admin API + Yalo Brain API. Menor complexidade que bots com ERP externo.', desc: 'A arquitetura sem ERP externo direto reduz pontos de falha, mas depende da cadeia SFTP para dados frescos.', action: 'Monitorar pipeline SFTP -> GCS -> Headless. Implementar alerta se bulk upload falhar. Manter dados cacheados como fallback.' },
      },
      },
    },
  "bepensa-mx-prd": {
      name: "Bepensa MX",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. Comercio conversacional para Bepensa Mexico (distribucion de bebidas). Flujo hibrido con 36 activities y 415 componentes. Agentes IA: FAQs BepensaMX CA, Sales Agent. Integra Big Storage NG (event sourcing, stock tracking), AWS Lambda (headless-catalog-addon), Bepensa Backend (POST /order/send), Brain Feedback API, Firehose. Actividades clave: make-order, send-order, One Chat MX, Add To Cart, Carrusel ATC, Multi ATC, Multi Promo, CSAT WA FLOW V2, Sales Agent Bepensa Mx, CupTour2026.',
        en: 'B2B WhatsApp bot Mexico. Conversational commerce for Bepensa Mexico (beverage distribution). Hybrid flow with 36 activities and 415 components. AI Agents: FAQs BepensaMX CA, Sales Agent. Integrates Big Storage NG (event sourcing, stock tracking), AWS Lambda (headless-catalog-addon), Bepensa Backend (POST /order/send), Brain Feedback API, Firehose. Key activities: make-order, send-order, One Chat MX, Add To Cart, Carousel ATC, Multi ATC, Multi Promo, CSAT WA FLOW V2, Sales Agent Bepensa Mx, CupTour2026.',
        pt: 'Bot B2B WhatsApp Mexico. Comercio conversacional para Bepensa Mexico (distribuicao de bebidas). Fluxo hibrido com 36 atividades e 415 componentes. Agentes IA: FAQs BepensaMX CA, Sales Agent. Integra Big Storage NG (event sourcing, stock tracking), AWS Lambda (headless-catalog-addon), Bepensa Backend (POST /order/send), Brain Feedback API, Firehose. Atividades-chave: make-order, send-order, One Chat MX, Add To Cart, Carrossel ATC, Multi ATC, Multi Promo, CSAT WA FLOW V2, Sales Agent Bepensa Mx, CupTour2026.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente.', desc: 'El flujo incluye pedido normal, One Chat Buy, y carrusel ATC v2. Multiples entry points sin cierre explicito.', action: 'Agregar cierre post-confirmacion de pedido con resumen: \'Pedido #X enviado a Bepensa. Fecha estimada de entrega: [fecha].\'' },
        en: { context: 'B2B retailers complete beverage order and stop responding. Normal pattern in recurring distribution.', desc: 'Flow includes normal order, One Chat Buy, and ATC carousel v2. Multiple entry points without explicit closing.', action: 'Add post-order confirmation closing with summary: \'Order #X sent to Bepensa. Estimated delivery date: [date].\'' },
        pt: { context: 'Lojistas B2B completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente.', desc: 'O fluxo inclui pedido normal, One Chat Buy, e carrossel ATC v2. Multiplos pontos de entrada sem encerramento explicito.', action: 'Adicionar encerramento pos-confirmacao de pedido com resumo: \'Pedido #X enviado a Bepensa. Data estimada de entrega: [data].\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a Bepensa Backend (POST /order/send) + Big Storage NG (event sourcing) + AWS Lambda.', desc: 'Latencias provienen del pipeline: Lambda (headless-catalog-addon) -> Big Storage NG (stock events) -> Bepensa Backend (envio pedido).', action: 'Evaluar cache de catalogo via Big Storage NG. Optimizar headless-catalog-addon para reducir procesamiento. Pre-cargar stock en horarios pico.' },
        en: { context: 'Latency includes calls to Bepensa Backend (POST /order/send) + Big Storage NG (event sourcing) + AWS Lambda.', desc: 'Latencies from pipeline: Lambda (headless-catalog-addon) -> Big Storage NG (stock events) -> Bepensa Backend (order submission).', action: 'Evaluate catalog cache via Big Storage NG. Optimize headless-catalog-addon to reduce processing. Pre-load stock at peak hours.' },
        pt: { context: 'A latencia inclui chamadas ao Bepensa Backend (POST /order/send) + Big Storage NG (event sourcing) + AWS Lambda.', desc: 'Latencias vem do pipeline: Lambda (headless-catalog-addon) -> Big Storage NG (stock events) -> Bepensa Backend (envio pedido).', action: 'Avaliar cache de catalogo via Big Storage NG. Otimizar headless-catalog-addon para reduzir processamento. Pre-carregar estoque em horarios de pico.' },
      },
      errorFree: {
        es: { context: 'Errores del Bepensa Backend (validaciones de pedido, stock agotado) y Big Storage NG (eventos de stock) llegan al usuario.', desc: 'Respuestas de error del backend Bepensa (pedido rechazado, producto sin stock, promocion expirada) se muestran como errores del bot.', action: 'Reformular errores de backend a mensajes informativos. Manejar promocion expirada con sugerencia de alternativa.' },
        en: { context: 'Bepensa Backend errors (order validations, out of stock) and Big Storage NG (stock events) reach the user.', desc: 'Bepensa backend error responses (rejected order, out of stock product, expired promotion) shown as bot errors.', action: 'Rewrite backend errors to informative messages. Handle expired promotion with alternative suggestion.' },
        pt: { context: 'Erros do Bepensa Backend (validacoes de pedido, estoque esgotado) e Big Storage NG (eventos de estoque) chegam ao usuario.', desc: 'Respostas de erro do backend Bepensa (pedido rejeitado, produto sem estoque, promocao expirada) mostradas como erros do bot.', action: 'Reformular erros do backend para mensagens informativas. Tratar promocao expirada com sugestao de alternativa.' },
      },
      stabilityProxy: {
        es: { context: 'Arquitectura con Big Storage NG (event sourcing) + AWS Lambda + Bepensa Backend + Brain API. Event sourcing agrega complejidad.', desc: 'Event sourcing via Big Storage NG puede crear inconsistencias temporales de stock. Si el backend Bepensa cae, no se procesan pedidos.', action: 'Monitorear consistencia de eventos Big Storage NG. Circuit breaker para Bepensa Backend. Alertar si stock diverge del ERP.' },
        en: { context: 'Architecture with Big Storage NG (event sourcing) + AWS Lambda + Bepensa Backend + Brain API. Event sourcing adds complexity.', desc: 'Event sourcing via Big Storage NG can create temporary stock inconsistencies. If Bepensa backend goes down, no orders processed.', action: 'Monitor Big Storage NG event consistency. Circuit breaker for Bepensa Backend. Alert if stock diverges from ERP.' },
        pt: { context: 'Arquitetura com Big Storage NG (event sourcing) + AWS Lambda + Bepensa Backend + Brain API. Event sourcing adiciona complexidade.', desc: 'Event sourcing via Big Storage NG pode criar inconsistencias temporarias de estoque. Se o backend Bepensa cair, pedidos nao sao processados.', action: 'Monitorar consistencia de eventos Big Storage NG. Circuit breaker para Bepensa Backend. Alertar se estoque diverge do ERP.' },
      },
      },
    },
  "bepensa-rd-prd": {
      name: "Bepensa RD",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Republica Dominicana. Comercio conversacional para Bepensa RD (bebidas). Flujo hibrido con 26 activities y 253 componentes. Agente IA: FAQs BepensaRD CA. Integra Big Storage NG (event sourcing), AWS Lambda (headless-catalog-addon), Bepensa Backend (API), Headless Commerce. Actividades clave: make-order, send-order, payment-methods, delivery-date, One Chat Buy, Carrusel ATC v2, Multi ATC, CSAT WA FLOW V2, in-conversation reminder.',
        en: 'B2B WhatsApp bot Dominican Republic. Conversational commerce for Bepensa DR (beverages). Hybrid flow with 26 activities and 253 components. AI Agent: FAQs BepensaRD CA. Integrates Big Storage NG (event sourcing), AWS Lambda (headless-catalog-addon), Bepensa Backend (API), Headless Commerce. Key activities: make-order, send-order, payment-methods, delivery-date, One Chat Buy, Carousel ATC v2, Multi ATC, CSAT WA FLOW V2, in-conversation reminder.',
        pt: 'Bot B2B WhatsApp Republica Dominicana. Comercio conversacional para Bepensa RD (bebidas). Fluxo hibrido com 26 atividades e 253 componentes. Agente IA: FAQs BepensaRD CA. Integra Big Storage NG (event sourcing), AWS Lambda (headless-catalog-addon), Bepensa Backend (API), Headless Commerce. Atividades-chave: make-order, send-order, payment-methods, delivery-date, One Chat Buy, Carrossel ATC v2, Multi ATC, CSAT WA FLOW V2, in-conversation reminder.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tiendas B2B completan pedido y dejan de responder. Arquitectura similar a Bepensa MX.', desc: 'El flujo One Chat Buy y Carrusel ATC v2 permiten pedidos rapidos sin cierre conversacional formal.', action: 'Agregar cierre post-pedido con resumen de entrega.' },
        en: { context: 'B2B stores complete order and stop responding. Architecture similar to Bepensa MX.', desc: 'One Chat Buy and ATC Carousel v2 flow enable quick orders without formal conversational closure.', action: 'Add post-order closing with delivery summary.' },
        pt: { context: 'Lojas B2B completam pedido e param de responder. Arquitetura similar a Bepensa MX.', desc: 'O fluxo One Chat Buy e Carrossel ATC v2 permitem pedidos rapidos sem fechamento conversacional formal.', action: 'Adicionar encerramento pos-pedido com resumo de entrega.' },
      },
      latency: {
        es: { context: 'La latencia incluye Bepensa Backend RD + Big Storage NG + AWS Lambda + Headless Commerce.', desc: 'Cadena similar a Bepensa MX pero con backend RD especifico. Event sourcing de Big Storage NG agrega procesamiento.', action: 'Mismas optimizaciones que Bepensa MX: cache de catalogo, pre-carga de stock, optimizacion de Lambda.' },
        en: { context: 'Latency includes Bepensa Backend RD + Big Storage NG + AWS Lambda + Headless Commerce.', desc: 'Chain similar to Bepensa MX but with RD-specific backend. Big Storage NG event sourcing adds processing.', action: 'Same optimizations as Bepensa MX: catalog cache, stock pre-loading, Lambda optimization.' },
        pt: { context: 'A latencia inclui Bepensa Backend RD + Big Storage NG + AWS Lambda + Headless Commerce.', desc: 'Cadeia similar a Bepensa MX mas com backend RD especifico. Event sourcing do Big Storage NG adiciona processamento.', action: 'Mesmas otimizacoes que Bepensa MX: cache de catalogo, pre-carga de estoque, otimizacao de Lambda.' },
      },
      stabilityProxy: {
        es: { context: 'Misma arquitectura FEMSA-style con Big Storage NG + Bepensa Backend + Lambda.', desc: 'Dependencia del backend Bepensa RD como punto unico de fallo. Si cae, no se procesan pedidos.', action: 'Circuit breaker para backend Bepensa RD. Modo degradado con catalogo cacheado.' },
        en: { context: 'Same FEMSA-style architecture with Big Storage NG + Bepensa Backend + Lambda.', desc: 'Bepensa RD backend dependency as single point of failure. If down, no orders processed.', action: 'Circuit breaker for Bepensa RD backend. Degraded mode with cached catalog.' },
        pt: { context: 'Mesma arquitetura estilo FEMSA com Big Storage NG + Bepensa Backend + Lambda.', desc: 'Dependencia do backend Bepensa RD como ponto unico de falha. Se cair, pedidos nao sao processados.', action: 'Circuit breaker para backend Bepensa RD. Modo degradado com catalogo cacheado.' },
      },
      },
    },
  "ism-dr-beverages": {
      name: "ISM DR Beverages",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Rep. Dominicana. Comercio conversacional para ISM Beverages (distribucion de bebidas). Flujo hibrido con 44 activities y 468 componentes. Agentes IA: FAQs ISM custom agent PRD, Sales Agent, P1. Integra Headless Commerce (catalogo/sesiones), Big Storage NG, Brain API, Custom Promos (pre-custom/display), One Chat Buy, Add To Cart, storefront-validation. Incluye sistema de promociones personalizadas y fecha de entrega con logica de dominical.',
        en: 'B2B WhatsApp bot Dominican Republic. Conversational commerce for ISM Beverages (beverage distribution). Hybrid flow with 44 activities and 468 components. AI Agents: FAQs ISM custom agent PRD, Sales Agent, P1. Integrates Headless Commerce (catalog/sessions), Big Storage NG, Brain API, Custom Promos (pre-custom/display), One Chat Buy, Add To Cart, storefront-validation. Includes custom promotions system and delivery date with Sunday logic.',
        pt: 'Bot B2B WhatsApp Rep. Dominicana. Comercio conversacional para ISM Beverages (distribuicao de bebidas). Fluxo hibrido com 44 atividades e 468 componentes. Agentes IA: FAQs ISM custom agent PRD, Sales Agent, P1. Integra Headless Commerce (catalogo/sessoes), Big Storage NG, Brain API, Custom Promos (pre-custom/display), One Chat Buy, Add To Cart, storefront-validation. Inclui sistema de promocoes personalizadas e data de entrega com logica de domingo.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente B2B.', desc: 'El flujo tiene multiples entry points (One Chat Buy, Add To Cart, Custom Promos, Webview Order, Opt-In). Sesiones de campana y venta asistida via Sales Agent no tienen cierre formal.', action: 'Agregar cierre post-pedido diferenciado: autoservicio con resumen de entrega, Sales Agent con cierre asistido, Custom Promos con resumen de promociones aplicadas.' },
        en: { context: 'B2B retailers complete beverage order and stop responding. Normal pattern in recurring B2B distribution.', desc: 'Flow has multiple entry points (One Chat Buy, Add To Cart, Custom Promos, Webview Order, Opt-In). Campaign and Sales Agent assisted sessions lack formal closure.', action: 'Add differentiated post-order closing: self-service with delivery summary, Sales Agent with assisted closing, Custom Promos with applied promotions summary.' },
        pt: { context: 'Lojistas B2B completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente B2B.', desc: 'O fluxo tem multiplos pontos de entrada (One Chat Buy, Add To Cart, Custom Promos, Webview Order, Opt-In). Sessoes de campanha e venda assistida via Sales Agent nao tem encerramento formal.', action: 'Adicionar encerramento pos-pedido diferenciado: autoatendimento com resumo de entrega, Sales Agent com encerramento assistido, Custom Promos com resumo de promocoes aplicadas.' },
      },
      latency: {
        es: { context: 'La latencia incluye Headless Commerce + Big Storage NG + Brain API + sistema de Custom Promos.', desc: 'La cadena de Custom Promos (pre-custom-promos -> display-custom-promotions) agrega procesamiento extra. Logica de fecha de entrega con excepcion dominical agrega consultas adicionales.', action: 'Cachear catalogo de promociones vigentes. Optimizar logica de entrega dominical. Pre-cargar datos de storefront-validation.' },
        en: { context: 'Latency includes Headless Commerce + Big Storage NG + Brain API + Custom Promos system.', desc: 'Custom Promos chain (pre-custom-promos -> display-custom-promotions) adds extra processing. Delivery date logic with Sunday exception adds additional queries.', action: 'Cache active promotions catalog. Optimize Sunday delivery logic. Pre-load storefront-validation data.' },
        pt: { context: 'A latencia inclui Headless Commerce + Big Storage NG + Brain API + sistema de Custom Promos.', desc: 'A cadeia de Custom Promos (pre-custom-promos -> display-custom-promotions) adiciona processamento extra. Logica de data de entrega com excecao de domingo adiciona consultas adicionais.', action: 'Cachear catalogo de promocoes vigentes. Otimizar logica de entrega de domingo. Pre-carregar dados de storefront-validation.' },
      },
      errorFree: {
        es: { context: 'Errores del sistema de Custom Promos (promocion expirada, stock agotado) y storefront-validation llegan al usuario.', desc: 'Errores en pre-custom-promos (productos no encontrados, stock insuficiente para completar promocion) se muestran como errores del bot. Storefront-validation puede rechazar clientes no registrados.', action: 'Reformular errores de promociones a mensajes informativos. Manejar cliente no encontrado en storefront-validation con flujo de registro.' },
        en: { context: 'Custom Promos system errors (expired promotion, out of stock) and storefront-validation errors reach the user.', desc: 'Errors in pre-custom-promos (products not found, insufficient stock for promotion) shown as bot errors. Storefront-validation can reject unregistered customers.', action: 'Rewrite promotions errors to informative messages. Handle customer not found in storefront-validation with registration flow.' },
        pt: { context: 'Erros do sistema de Custom Promos (promocao expirada, estoque esgotado) e storefront-validation chegam ao usuario.', desc: 'Erros em pre-custom-promos (produtos nao encontrados, estoque insuficiente para completar promocao) mostrados como erros do bot. Storefront-validation pode rejeitar clientes nao registrados.', action: 'Reformular erros de promocoes para mensagens informativas. Tratar cliente nao encontrado em storefront-validation com fluxo de registro.' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de Headless Commerce + Big Storage NG + Brain API + Custom Promos pipeline.', desc: 'El sistema de Custom Promos (pre/display) es el punto mas complejo. Logica dominical de entregas puede crear inconsistencias si los calendarios no estan actualizados.', action: 'Monitorear pipeline de Custom Promos. Validar calendarios de entrega periodicamente. Circuit breaker para Headless Commerce.' },
        en: { context: 'Dependency on Headless Commerce + Big Storage NG + Brain API + Custom Promos pipeline.', desc: 'Custom Promos system (pre/display) is the most complex point. Sunday delivery logic can create inconsistencies if calendars are not updated.', action: 'Monitor Custom Promos pipeline. Validate delivery calendars periodically. Circuit breaker for Headless Commerce.' },
        pt: { context: 'Dependencia de Headless Commerce + Big Storage NG + Brain API + Custom Promos pipeline.', desc: 'O sistema de Custom Promos (pre/display) e o ponto mais complexo. Logica de entrega de domingo pode criar inconsistencias se os calendarios nao estiverem atualizados.', action: 'Monitorar pipeline de Custom Promos. Validar calendarios de entrega periodicamente. Circuit breaker para Headless Commerce.' },
      },
      efficiencyLoops: {
        es: { context: 'Sales Agent y Custom Promos agregan interacciones adicionales. Sistema de 44 activities con flujo hibrido.', desc: 'Sales Agent genera sesiones naturalmente mas largas. Custom Promos agrega ciclos de seleccion/verificacion de promociones. FAQ custom agent puede extender sesiones de soporte.', action: 'Separar metricas de eficiencia entre autoservicio, Sales Agent y FAQ agent. Monitorear Custom Promos para detectar loops de seleccion.' },
        en: { context: 'Sales Agent and Custom Promos add extra interactions. 44-activity system with hybrid flow.', desc: 'Sales Agent generates naturally longer sessions. Custom Promos adds promotion selection/verification cycles. FAQ custom agent can extend support sessions.', action: 'Separate efficiency metrics between self-service, Sales Agent and FAQ agent. Monitor Custom Promos for selection loops.' },
        pt: { context: 'Sales Agent e Custom Promos adicionam interacoes extras. Sistema de 44 atividades com fluxo hibrido.', desc: 'Sales Agent gera sessoes naturalmente mais longas. Custom Promos adiciona ciclos de selecao/verificacao de promocoes. FAQ custom agent pode estender sessoes de suporte.', action: 'Separar metricas de eficiencia entre autoatendimento, Sales Agent e FAQ agent. Monitorar Custom Promos para detectar loops de selecao.' },
      },
      },
    },
  "molitalia-pe-b2b": {
      name: "Molitalia Peru B2B",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Peru. Comercio conversacional para Molitalia Peru (alimentos). Flujo hibrido con 28 activities y 345 componentes. Agentes IA: Sales Agent, FAQs Molitalia CA. Integra ECOM ERP (SOAP Service en myeforce.ecom.com.co), AWS Lambda (ecom-order-injection, sync-csv-promotions), Headless Commerce (molitalia-pe-b2b-fabiana), Brain Feedback, Big Storage NG. Actividades clave: make-order, send-order, Multi Promo, Custom Promos, Webview Order, Campaign Orchestrator, CSAT WA FLOW V2.',
        en: 'B2B WhatsApp bot Peru. Conversational commerce for Molitalia Peru (food). Hybrid flow with 28 activities and 345 components. AI Agents: Sales Agent, FAQs Molitalia CA. Integrates ECOM ERP (SOAP Service at myeforce.ecom.com.co), AWS Lambda (ecom-order-injection, sync-csv-promotions), Headless Commerce (molitalia-pe-b2b-fabiana), Brain Feedback, Big Storage NG. Key activities: make-order, send-order, Multi Promo, Custom Promos, Webview Order, Campaign Orchestrator, CSAT WA FLOW V2.',
        pt: 'Bot B2B WhatsApp Peru. Comercio conversacional para Molitalia Peru (alimentos). Fluxo hibrido com 28 atividades e 345 componentes. Agentes IA: Sales Agent, FAQs Molitalia CA. Integra ECOM ERP (SOAP Service em myeforce.ecom.com.co), AWS Lambda (ecom-order-injection, sync-csv-promotions), Headless Commerce (molitalia-pe-b2b-fabiana), Brain Feedback, Big Storage NG. Atividades-chave: make-order, send-order, Multi Promo, Custom Promos, Webview Order, Campaign Orchestrator, CSAT WA FLOW V2.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de alimentos y dejan de responder. Sistema de multi-promociones agrega complejidad.', desc: 'El flujo Custom Promos y Multi Promo agregan pasos extra. Los usuarios terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar cierre post-pedido con resumen de promociones aplicadas: \'Tu pedido fue enviado con X promociones aplicadas.\'' },
        en: { context: 'B2B retailers complete food order and stop responding. Multi-promotion system adds complexity.', desc: 'Custom Promos and Multi Promo flow add extra steps. Users finish when confirming order without conversational closure.', action: 'Add post-order closing with applied promotions summary: \'Your order was sent with X promotions applied.\'' },
        pt: { context: 'Lojistas B2B completam pedido de alimentos e param de responder. Sistema de multi-promocoes adiciona complexidade.', desc: 'O fluxo Custom Promos e Multi Promo adicionam passos extras. Usuarios terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar encerramento pos-pedido com resumo de promocoes aplicadas: \'Seu pedido foi enviado com X promocoes aplicadas.\'' },
      },
      latency: {
        es: { context: 'La latencia incluye ECOM ERP (SOAP en myeforce.ecom.com.co) + AWS Lambda + Headless Commerce.', desc: 'ECOM ERP usa SOAP (mas lento que REST). La inyeccion de pedidos (ecom-order-injection) requiere serializacion SOAP que agrega latencia.', action: 'Cachear catalogo de productos post-sync. Evaluar si ECOM puede exponer REST como alternativa a SOAP. Monitorear p50 de SOAP calls.' },
        en: { context: 'Latency includes ECOM ERP (SOAP at myeforce.ecom.com.co) + AWS Lambda + Headless Commerce.', desc: 'ECOM ERP uses SOAP (slower than REST). Order injection (ecom-order-injection) requires SOAP serialization adding latency.', action: 'Cache product catalog post-sync. Evaluate if ECOM can expose REST as SOAP alternative. Monitor SOAP calls p50.' },
        pt: { context: 'A latencia inclui ECOM ERP (SOAP em myeforce.ecom.com.co) + AWS Lambda + Headless Commerce.', desc: 'ECOM ERP usa SOAP (mais lento que REST). A injecao de pedidos (ecom-order-injection) requer serializacao SOAP adicionando latencia.', action: 'Cachear catalogo de produtos pos-sync. Avaliar se ECOM pode expor REST como alternativa a SOAP. Monitorar p50 de chamadas SOAP.' },
      },
      errorFree: {
        es: { context: 'Errores del ECOM ERP (SOAP) como pedido rechazado, producto sin stock y fallo de serializacion llegan al usuario.', desc: 'Errores SOAP del ECOM (wsInterfacesMolitalia) pueden ser crípticos. Fallos de serializacion SOAP generan errores tecnicos poco claros.', action: 'Parsear errores SOAP a mensajes de negocio claros. Implementar retry para errores transitorios de SOAP (timeout, connection reset).' },
        en: { context: 'ECOM ERP (SOAP) errors like rejected order, out-of-stock product and serialization failure reach the user.', desc: 'ECOM SOAP errors (wsInterfacesMolitalia) can be cryptic. SOAP serialization failures generate unclear technical errors.', action: 'Parse SOAP errors to clear business messages. Implement retry for transient SOAP errors (timeout, connection reset).' },
        pt: { context: 'Erros do ECOM ERP (SOAP) como pedido rejeitado, produto sem estoque e falha de serializacao chegam ao usuario.', desc: 'Erros SOAP do ECOM (wsInterfacesMolitalia) podem ser cripticos. Falhas de serializacao SOAP geram erros tecnicos pouco claros.', action: 'Parsear erros SOAP para mensagens de negocio claras. Implementar retry para erros transitorios de SOAP (timeout, connection reset).' },
      },
      stabilityProxy: {
        es: { context: 'ECOM ERP (SOAP) + AWS Lambda + Headless Commerce. SOAP tiende a ser menos estable que REST.', desc: 'La dependencia de SOAP para pedidos (ecom-order-injection) es el punto mas fragil. SOAP tiene mayor variabilidad de latencia y errores.', action: 'Circuit breaker agresivo para SOAP calls. Modo degradado: aceptar pedidos en cola cuando ECOM no responde.' },
        en: { context: 'ECOM ERP (SOAP) + AWS Lambda + Headless Commerce. SOAP tends to be less stable than REST.', desc: 'SOAP dependency for orders (ecom-order-injection) is the most fragile point. SOAP has higher latency variability and errors.', action: 'Aggressive circuit breaker for SOAP calls. Degraded mode: accept queued orders when ECOM is unresponsive.' },
        pt: { context: 'ECOM ERP (SOAP) + AWS Lambda + Headless Commerce. SOAP tende a ser menos estavel que REST.', desc: 'A dependencia de SOAP para pedidos (ecom-order-injection) e o ponto mais fragil. SOAP tem maior variabilidade de latencia e erros.', action: 'Circuit breaker agressivo para chamadas SOAP. Modo degradado: aceitar pedidos em fila quando ECOM nao responde.' },
      },
      },
    },
  "mondelez-mx-b2b": {
      name: "Mondelez MX B2B",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Mexico. Comercio conversacional para Mondelez Mexico (CPG/Alimentos). Flujo hibrido con 38 activities y 489 componentes. Agentes IA: Sales Agent ORIS R1/P1, FAQs Mondelez MX CA. Integra Commerce Functions (commerce-functions.yalochat.dev/v1), AWS Lambda (bulk-upload), Commerce Webview, Zapier Webhooks, Brain Feedback API. Actividades clave: Pre Sales, One Chat Buy, new/last-order-entry, visit-day, Business Hours, Yalo Pago, Campaign Orchestrator, Sales Genie ORIS, CSAT WA FLOW V2.',
        en: 'B2B WhatsApp bot Mexico. Conversational commerce for Mondelez Mexico (CPG/Food). Hybrid flow with 38 activities and 489 components. AI Agents: Sales Agent ORIS R1/P1, FAQs Mondelez MX CA. Integrates Commerce Functions (commerce-functions.yalochat.dev/v1), AWS Lambda (bulk-upload), Commerce Webview, Zapier Webhooks, Brain Feedback API. Key activities: Pre Sales, One Chat Buy, new/last-order-entry, visit-day, Business Hours, Yalo Pago, Campaign Orchestrator, Sales Genie ORIS, CSAT WA FLOW V2.',
        pt: 'Bot B2B WhatsApp Mexico. Comercio conversacional para Mondelez Mexico (CPG/Alimentos). Fluxo hibrido com 38 atividades e 489 componentes. Agentes IA: Sales Agent ORIS R1/P1, FAQs Mondelez MX CA. Integra Commerce Functions (commerce-functions.yalochat.dev/v1), AWS Lambda (bulk-upload), Commerce Webview, Zapier Webhooks, Brain Feedback API. Atividades-chave: Pre Sales, One Chat Buy, new/last-order-entry, visit-day, Business Hours, Yalo Pago, Campaign Orchestrator, Sales Genie ORIS, CSAT WA FLOW V2.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tiendas B2B hacen pedidos en horarios de visita. Business Hours y visit-day limitan cuando pueden pedir.', desc: 'El flujo tiene restriccion horaria (Business Hours) y dia de visita. Sesiones fuera de horario o sin dia de visita terminan abruptamente.', action: 'Segmentar closure: sesiones en horario+dia de visita = closure real. Fuera de horario = closure esperado bajo. Agregar mensaje proactivo de horario.' },
        en: { context: 'B2B stores place orders during visit hours. Business Hours and visit-day limit when ordering.', desc: 'Flow has time restriction (Business Hours) and visit-day. Sessions outside hours or without visit day end abruptly.', action: 'Segment closure: in-hours+visit-day sessions = real closure. Outside hours = expected low closure. Add proactive schedule message.' },
        pt: { context: 'Lojas B2B fazem pedidos em horarios de visita. Business Hours e visit-day limitam quando podem pedir.', desc: 'O fluxo tem restricao horaria (Business Hours) e dia de visita. Sessoes fora de horario ou sem dia de visita terminam abruptamente.', action: 'Segmentar closure: sessoes em horario+dia de visita = closure real. Fora de horario = closure esperado baixo. Adicionar mensagem proativa de horario.' },
      },
      latency: {
        es: { context: 'La latencia incluye Commerce Functions (yalochat.dev) + AWS Lambda (bulk-uploads) + Commerce Webview.', desc: 'Latencias provienen de Commerce Functions para catalogo/precios y AWS Lambda para bulk uploads de datos. Webview agrega latencia de carga.', action: 'Optimizar Commerce Functions. Pre-cargar datos via bulk-upload en horarios de baja demanda. Cache de catalogo.' },
        en: { context: 'Latency includes Commerce Functions (yalochat.dev) + AWS Lambda (bulk-uploads) + Commerce Webview.', desc: 'Latencies from Commerce Functions for catalog/prices and AWS Lambda for data bulk uploads. Webview adds loading latency.', action: 'Optimize Commerce Functions. Pre-load data via bulk-upload during low-demand hours. Catalog cache.' },
        pt: { context: 'A latencia inclui Commerce Functions (yalochat.dev) + AWS Lambda (bulk-uploads) + Commerce Webview.', desc: 'Latencias vem de Commerce Functions para catalogo/precos e AWS Lambda para bulk uploads de dados. Webview adiciona latencia de carga.', action: 'Otimizar Commerce Functions. Pre-carregar dados via bulk-upload em horarios de baixa demanda. Cache de catalogo.' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de Commerce Functions + AWS Lambda + Webview + Zapier. Multiple entry points de datos.', desc: 'La arquitectura con bulk-upload de datos (customers/combos/assortments) puede crear inconsistencias temporales si algun upload falla.', action: 'Monitorear status de bulk-uploads. Alertar si upload de assortments/bonifications falla. Validar integridad de datos post-upload.' },
        en: { context: 'Dependency on Commerce Functions + AWS Lambda + Webview + Zapier. Multiple data entry points.', desc: 'Architecture with data bulk-uploads (customers/combos/assortments) can create temporary inconsistencies if any upload fails.', action: 'Monitor bulk-upload status. Alert if assortments/bonifications upload fails. Validate data integrity post-upload.' },
        pt: { context: 'Dependencia de Commerce Functions + AWS Lambda + Webview + Zapier. Multiplos pontos de entrada de dados.', desc: 'A arquitetura com bulk-upload de dados (customers/combos/assortments) pode criar inconsistencias temporarias se algum upload falhar.', action: 'Monitorar status de bulk-uploads. Alertar se upload de assortments/bonifications falhar. Validar integridade de dados pos-upload.' },
      },
      },
    },
  "nestle-chile-b2b": {
    name: "Nestle Chile B2B",
    hasOris: false,
    type: { es: "Bot B2B Chile (Nestle)", en: "B2B Chile bot (Nestle)", pt: "Bot B2B Chile (Nestle)" },
    insights: {},
  },
  "nestle-jmc-prd": {
      name: "Nestle JMC",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Jamaica. Comercio conversacional para Nestle Jamaica. Clientes B2B hacen pedidos via WhatsApp. Integra SFTP (inventario/precios), S3, Headless Commerce (Storefront Admin API), Big Storage NG, Brain API, Commerce Webview. AWS Lambda (bulk-commerce-data: fetch SFTP -> S3 -> sync stocks/prices to Headless). Activities: Authentication, Home, Catalog, One Chat Buy v2, CSAT, Commerce Template v5.',
        en: 'B2B WhatsApp bot Jamaica. Conversational commerce for Nestle Jamaica. B2B customers order via WhatsApp. Integrates SFTP (inventory/prices), S3, Headless Commerce (Storefront Admin API), Big Storage NG, Brain API, Commerce Webview. AWS Lambda (bulk-commerce-data: fetch SFTP -> S3 -> sync stocks/prices to Headless). Activities: Authentication, Home, Catalog, One Chat Buy v2, CSAT, Commerce Template v5.',
        pt: 'Bot B2B WhatsApp Jamaica. Comercio conversacional para Nestle Jamaica. Clientes B2B fazem pedidos via WhatsApp. Integra SFTP (inventario/precos), S3, Headless Commerce (Storefront Admin API), Big Storage NG, Brain API, Commerce Webview. AWS Lambda (bulk-commerce-data: fetch SFTP -> S3 -> sync stocks/precos to Headless). Atividades: Authentication, Home, Catalog, One Chat Buy v2, CSAT, Commerce Template v5.',
      },
      insights: {
      closureRate: {
        es: { context: 'Clientes B2B de Nestle Jamaica completan pedido via One Chat Buy v2 y dejan de responder.', desc: 'One Chat Buy v2 permite pedido rapido sin cierre conversacional formal. Commerce Template v5 tiene flujo estructurado.', action: 'Agregar cierre post-pedido en One Chat Buy v2 y Commerce Template v5: \'Tu pedido fue enviado. Hasta la proxima!\'' },
        en: { context: 'B2B customers of Nestle Jamaica complete order via One Chat Buy v2 and stop responding.', desc: 'One Chat Buy v2 enables quick ordering without formal conversational closure. Commerce Template v5 has structured flow.', action: 'Add post-order closing in One Chat Buy v2 and Commerce Template v5: \'Your order was sent. See you next time!\'' },
        pt: { context: 'Clientes B2B da Nestle Jamaica completam pedido via One Chat Buy v2 e param de responder.', desc: 'One Chat Buy v2 permite pedido rapido sem fechamento conversacional formal. Commerce Template v5 tem fluxo estruturado.', action: 'Adicionar encerramento pos-pedido no One Chat Buy v2 e Commerce Template v5: \'Seu pedido foi enviado. Ate a proxima!\'' },
      },
      fallbackQuality: {
        es: { context: 'SFTP sincroniza inventario y precios -> S3 -> Headless. Si SFTP falla, catalogo/precios quedan desactualizados.', desc: 'La cadena SFTP -> S3 -> bulk-commerce-data -> Headless puede fallar silenciosamente. El bot sirve datos obsoletos sin detectarlo.', action: 'Implementar monitoreo de frescura de datos SFTP. Alertar si sync tiene mas de 24h. Validar integridad de stocks post-sync.' },
        en: { context: 'SFTP syncs inventory and prices -> S3 -> Headless. If SFTP fails, catalog/prices become stale.', desc: 'SFTP -> S3 -> bulk-commerce-data -> Headless chain can fail silently. Bot serves stale data without detection.', action: 'Implement SFTP data freshness monitoring. Alert if sync is more than 24h old. Validate stock integrity post-sync.' },
        pt: { context: 'SFTP sincroniza inventario e precos -> S3 -> Headless. Se SFTP falhar, catalogo/precos ficam desatualizados.', desc: 'A cadeia SFTP -> S3 -> bulk-commerce-data -> Headless pode falhar silenciosamente. O bot serve dados obsoletos sem detectar.', action: 'Implementar monitoramento de frescura de dados SFTP. Alertar se sync tem mais de 24h. Validar integridade de stocks pos-sync.' },
      },
      stabilityProxy: {
        es: { context: 'Cadena SFTP -> S3 -> AWS Lambda (bulk-commerce-data) -> Headless + Big Storage NG.', desc: 'Arquitectura mas sencilla que otros bots Nestle (sin SAP SOAP). El pipeline SFTP es el punto principal de fallo.', action: 'Monitorear pipeline SFTP -> S3 -> Headless. Mantener cache de ultimo catalogo valido como fallback.' },
        en: { context: 'SFTP -> S3 -> AWS Lambda (bulk-commerce-data) -> Headless + Big Storage NG chain.', desc: 'Simpler architecture than other Nestle bots (no SAP SOAP). SFTP pipeline is the main failure point.', action: 'Monitor SFTP -> S3 -> Headless pipeline. Keep cache of last valid catalog as fallback.' },
        pt: { context: 'Cadeia SFTP -> S3 -> AWS Lambda (bulk-commerce-data) -> Headless + Big Storage NG.', desc: 'Arquitetura mais simples que outros bots Nestle (sem SAP SOAP). O pipeline SFTP e o principal ponto de falha.', action: 'Monitorar pipeline SFTP -> S3 -> Headless. Manter cache do ultimo catalogo valido como fallback.' },
      },
      },
    },
  "ng-femsa-wae-ar-prd": {
    name: "FEMSA WAE AR",
    hasOris: false,
    type: { es: "Bot B2B Argentina (FEMSA WAE)", en: "B2B Argentina bot (FEMSA WAE)", pt: "Bot B2B Argentina (FEMSA WAE)" },
    insights: {},
  },
  "ng-femsa-wae-co-prd": {
      name: "FEMSA WAE CO",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Colombia. 47 activities/475 components. Flujo hibrido (deterministic + hybrid). AI agents: oris, Faq-customAgent 2026, human-agent (Frontapp). Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a tenderos y comercios via WhatsApp. Integra Mulesoft/SAP APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda. Pedidos, pagos, promociones, Redimir Puntos, y CSAT WA Flow V2.',
        en: 'B2B WhatsApp bot Colombia. 47 activities/475 components. Hybrid flow (deterministic + hybrid). AI agents: oris, Faq-customAgent 2026, human-agent (Frontapp). FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates Mulesoft/SAP APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda. Orders, payments, promotions, Redeem Points, and CSAT WA Flow V2.',
        pt: 'Bot B2B WhatsApp Colombia. 47 activities/475 components. Fluxo hibrido (deterministic + hybrid). AI agents: oris, Faq-customAgent 2026, human-agent (Frontapp). Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra Mulesoft/SAP APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda. Pedidos, pagamentos, promocoes, Resgatar Pontos, e CSAT WA Flow V2.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente FEMSA.', desc: 'El flujo tiene pedido nuevo, pedido sugerido y cancelacion. Los tenderos terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar mensaje de cierre post-confirmacion de pedido: \'Tu pedido fue enviado. Te notificaremos el dia de entrega.\'' },
        en: { context: 'B2B retailers complete beverage order and stop responding. Normal pattern in recurring FEMSA distribution.', desc: 'Flow has new order, suggested order and cancellation. Retailers finish when confirming order without conversational closure.', action: 'Add closing message post-order confirmation: \'Your order has been sent. We will notify you on delivery day.\'' },
        pt: { context: 'Lojistas B2B completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente FEMSA.', desc: 'O fluxo tem pedido novo, pedido sugerido e cancelamento. Lojistas terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar mensagem de encerramento pos-confirmacao de pedido: \'Seu pedido foi enviado. Notificaremos no dia da entrega.\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a Mulesoft/SAP APIs + Commerce Headless + AWS Lambda. Doble round-trip para autenticacion + pedido.', desc: 'Latencias provienen de la cadena: AWS Lambda -> Mulesoft/SAP APIs (catalogo/precios/stock) + Commerce Headless (gestion de pedido). Pedidos sugeridos agregan consulta adicional.', action: 'Evaluar cache de catalogo con TTL corto. Pre-cargar pedido sugerido basado en historial. Optimizar cold starts de Lambda.' },
        en: { context: 'Latency includes calls to Mulesoft/SAP APIs + Commerce Headless + AWS Lambda. Double round-trip for auth + order.', desc: 'Latencies come from chain: AWS Lambda -> Mulesoft/SAP APIs (catalog/prices/stock) + Commerce Headless (order management). Suggested orders add additional query.', action: 'Evaluate catalog cache with short TTL. Pre-load suggested order based on history. Optimize Lambda cold starts.' },
        pt: { context: 'A latencia inclui chamadas a Mulesoft/SAP APIs + Commerce Headless + AWS Lambda. Duplo round-trip para autenticacao + pedido.', desc: 'Latencias vem da cadeia: AWS Lambda -> Mulesoft/SAP APIs (catalogo/precos/estoque) + Commerce Headless (gestao de pedido). Pedidos sugeridos adicionam consulta adicional.', action: 'Avaliar cache de catalogo com TTL curto. Pre-carregar pedido sugerido baseado em historico. Otimizar cold starts de Lambda.' },
      },
      errorFree: {
        es: { context: 'Errores de Mulesoft/SAP APIs como cliente en blacklist, stock insuficiente y validacion de horario llegan al usuario.', desc: 'Respuestas de error de Mulesoft/SAP APIs (cliente bloqueado, fuera de horario, sin stock) se muestran como errores del asistente. El bot funciona correctamente.', action: 'Reformular errores de negocio a tono informativo: \'No hay stock disponible de este producto. Intenta con otro.\'' },
        en: { context: 'Mulesoft/SAP APIs errors like blacklisted customer, insufficient stock and business hours validation reach the user.', desc: 'Mulesoft/SAP APIs error responses (blocked customer, outside hours, no stock) shown as assistant errors. Bot works correctly.', action: 'Rewrite business errors to informative tone: \'No stock available for this product. Try another one.\'' },
        pt: { context: 'Erros de Mulesoft/SAP APIs como cliente em blacklist, estoque insuficiente e validacao de horario chegam ao usuario.', desc: 'Respostas de erro de Mulesoft/SAP APIs (cliente bloqueado, fora de horario, sem estoque) mostradas como erros do assistente. O bot funciona corretamente.', action: 'Reformular erros de negocio para tom informativo: \'Nao ha estoque disponivel deste produto. Tente outro.\'' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de Mulesoft/SAP APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitectura FEMSA NG estandarizada.', desc: 'La arquitectura FEMSA NG es consistente pero depende de Mulesoft/SAP APIs como punto unico para datos de negocio. Si Mulesoft/SAP APIs cae, no hay catalogo ni precios.', action: 'Implementar modo degradado con catalogo cacheado. Circuit breaker para Mulesoft/SAP APIs. Monitorear latencia de APIs FEMSA por pais.' },
        en: { context: 'Dependency on Mulesoft/SAP APIs + Commerce Headless + BigStorage + AWS Lambda. Standardized FEMSA NG architecture.', desc: 'FEMSA NG architecture is consistent but depends on Mulesoft/SAP APIs as single point for business data. If Mulesoft/SAP APIs goes down, no catalog or prices.', action: 'Implement degraded mode with cached catalog. Circuit breaker for Mulesoft/SAP APIs. Monitor FEMSA API latency per country.' },
        pt: { context: 'Dependencia de Mulesoft/SAP APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitetura FEMSA NG padronizada.', desc: 'A arquitetura FEMSA NG e consistente mas depende de Mulesoft/SAP APIs como ponto unico para dados de negocio. Se Mulesoft/SAP APIs cair, nao ha catalogo nem precos.', action: 'Implementar modo degradado com catalogo cacheado. Circuit breaker para Mulesoft/SAP APIs. Monitorar latencia de APIs FEMSA por pais.' },
      },
      },
    },
  "ng-femsa-wae-cr-prd": {
    name: "FEMSA WAE CR",
    hasOris: true,
    type: {
      es: 'Bot B2B WhatsApp Costa Rica. 30 activities/366 components. Flujo hibrido (deterministic + hybrid). AI agents: Femsa Oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a tenderos y comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda.',
      en: 'B2B WhatsApp bot Costa Rica. 30 activities/366 components. Hybrid flow (deterministic + hybrid). AI agents: Femsa Oris, Faq-customAgent 2026. FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates KOF APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda.',
      pt: 'Bot B2B WhatsApp Costa Rica. 30 activities/366 components. Fluxo hibrido (deterministic + hybrid). AI agents: Femsa Oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda.',
    },
    insights: {},
  },
  "ng-femsa-wae-gt-prd": {
    name: "FEMSA WAE GT",
    hasOris: true,
    type: {
      es: 'Bot B2B WhatsApp Guatemala. 36 activities/445 components. Flujo hibrido (deterministic + hybrid). AI agents: genie-femsa, Sales Agent V1, Femsa Oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a tenderos y comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda.',
      en: 'B2B WhatsApp bot Guatemala. 36 activities/445 components. Hybrid flow (deterministic + hybrid). AI agents: genie-femsa, Sales Agent V1, Femsa Oris, Faq-customAgent 2026. FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates KOF APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda.',
      pt: 'Bot B2B WhatsApp Guatemala. 36 activities/445 components. Fluxo hibrido (deterministic + hybrid). AI agents: genie-femsa, Sales Agent V1, Femsa Oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda.',
    },
    insights: {},
  },
  "ng-femsa-wae-mx-prd": {
      name: "FEMSA WAE MX",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 44 activities/574 components. Flujo hibrido (deterministic + hybrid). AI agents: genie-order, oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a tenderos y comercios via WhatsApp. Integra MuleSoft APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda. Pedidos sugeridos, pagos, cancelacion, Yalo Pago Trigger, y Campaign Orchestrator. Sales Desk instance: femsamx.',
        en: 'B2B WhatsApp bot Mexico. 44 activities/574 components. Hybrid flow (deterministic + hybrid). AI agents: genie-order, oris, Faq-customAgent 2026. FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates MuleSoft APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda. Suggested orders, payments, cancellation, Yalo Pago Trigger, and Campaign Orchestrator. Sales Desk instance: femsamx.',
        pt: 'Bot B2B WhatsApp Mexico. 44 activities/574 components. Fluxo hibrido (deterministic + hybrid). AI agents: genie-order, oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra MuleSoft APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda. Pedidos sugeridos, pagamentos, cancelamento, Yalo Pago Trigger, e Campaign Orchestrator. Sales Desk instance: femsamx.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente FEMSA.', desc: 'El flujo tiene pedido nuevo, pedido sugerido y cancelacion. Los tenderos terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar mensaje de cierre post-confirmacion de pedido: \'Tu pedido fue enviado. Te notificaremos el dia de entrega.\'' },
        en: { context: 'B2B retailers complete beverage order and stop responding. Normal pattern in recurring FEMSA distribution.', desc: 'Flow has new order, suggested order and cancellation. Retailers finish when confirming order without conversational closure.', action: 'Add closing message post-order confirmation: \'Your order has been sent. We will notify you on delivery day.\'' },
        pt: { context: 'Lojistas B2B completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente FEMSA.', desc: 'O fluxo tem pedido novo, pedido sugerido e cancelamento. Lojistas terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar mensagem de encerramento pos-confirmacao de pedido: \'Seu pedido foi enviado. Notificaremos no dia da entrega.\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a MuleSoft APIs + Commerce Headless + AWS Lambda. Doble round-trip para autenticacion + pedido.', desc: 'Latencias provienen de la cadena: AWS Lambda -> MuleSoft APIs (catalogo/precios/stock) + Commerce Headless (gestion de pedido). Pedidos sugeridos agregan consulta adicional.', action: 'Evaluar cache de catalogo con TTL corto. Pre-cargar pedido sugerido basado en historial. Optimizar cold starts de Lambda.' },
        en: { context: 'Latency includes calls to MuleSoft APIs + Commerce Headless + AWS Lambda. Double round-trip for auth + order.', desc: 'Latencies come from chain: AWS Lambda -> MuleSoft APIs (catalog/prices/stock) + Commerce Headless (order management). Suggested orders add additional query.', action: 'Evaluate catalog cache with short TTL. Pre-load suggested order based on history. Optimize Lambda cold starts.' },
        pt: { context: 'A latencia inclui chamadas a MuleSoft APIs + Commerce Headless + AWS Lambda. Duplo round-trip para autenticacao + pedido.', desc: 'Latencias vem da cadeia: AWS Lambda -> MuleSoft APIs (catalogo/precos/estoque) + Commerce Headless (gestao de pedido). Pedidos sugeridos adicionam consulta adicional.', action: 'Avaliar cache de catalogo com TTL curto. Pre-carregar pedido sugerido baseado em historico. Otimizar cold starts de Lambda.' },
      },
      errorFree: {
        es: { context: 'Errores de MuleSoft APIs como cliente en blacklist, stock insuficiente y validacion de horario llegan al usuario.', desc: 'Respuestas de error de MuleSoft APIs (cliente bloqueado, fuera de horario, sin stock) se muestran como errores del asistente. El bot funciona correctamente.', action: 'Reformular errores de negocio a tono informativo: \'No hay stock disponible de este producto. Intenta con otro.\'' },
        en: { context: 'MuleSoft APIs errors like blacklisted customer, insufficient stock and business hours validation reach the user.', desc: 'MuleSoft APIs error responses (blocked customer, outside hours, no stock) shown as assistant errors. Bot works correctly.', action: 'Rewrite business errors to informative tone: \'No stock available for this product. Try another one.\'' },
        pt: { context: 'Erros de MuleSoft APIs como cliente em blacklist, estoque insuficiente e validacao de horario chegam ao usuario.', desc: 'Respostas de erro de MuleSoft APIs (cliente bloqueado, fora de horario, sem estoque) mostradas como erros do assistente. O bot funciona corretamente.', action: 'Reformular erros de negocio para tom informativo: \'Nao ha estoque disponivel deste produto. Tente outro.\'' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de MuleSoft APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitectura FEMSA NG estandarizada.', desc: 'La arquitectura FEMSA NG es consistente pero depende de MuleSoft APIs como punto unico para datos de negocio. Si MuleSoft APIs cae, no hay catalogo ni precios.', action: 'Implementar modo degradado con catalogo cacheado. Circuit breaker para MuleSoft APIs. Monitorear latencia de APIs FEMSA por pais.' },
        en: { context: 'Dependency on MuleSoft APIs + Commerce Headless + BigStorage + AWS Lambda. Standardized FEMSA NG architecture.', desc: 'FEMSA NG architecture is consistent but depends on MuleSoft APIs as single point for business data. If MuleSoft APIs goes down, no catalog or prices.', action: 'Implement degraded mode with cached catalog. Circuit breaker for MuleSoft APIs. Monitor FEMSA API latency per country.' },
        pt: { context: 'Dependencia de MuleSoft APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitetura FEMSA NG padronizada.', desc: 'A arquitetura FEMSA NG e consistente mas depende de MuleSoft APIs como ponto unico para dados de negocio. Se MuleSoft APIs cair, nao ha catalogo nem precos.', action: 'Implementar modo degradado com catalogo cacheado. Circuit breaker para MuleSoft APIs. Monitorar latencia de APIs FEMSA por pais.' },
      },
      },
    },
  "ng-femsa-wae-ni-prd": {
      name: "FEMSA WAE NI",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Nicaragua. 29 activities/373 components. Flujo hibrido (deterministic + hybrid). AI agents: Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a tenderos y comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda. Stock habilitado (enableStock=true), Split habilitado. Sin Quota ni F04.',
        en: 'B2B WhatsApp bot Nicaragua. 29 activities/373 components. Hybrid flow (deterministic + hybrid). AI agents: Faq-customAgent 2026. FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates KOF APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda. Stock enabled, Split enabled. No Quota or F04.',
        pt: 'Bot B2B WhatsApp Nicaragua. 29 activities/373 components. Fluxo hibrido (deterministic + hybrid). AI agents: Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda. Stock habilitado (enableStock=true), Split habilitado. Sem Quota nem F04.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente FEMSA.', desc: 'El flujo tiene pedido nuevo, pedido sugerido y cancelacion. Los tenderos terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar mensaje de cierre post-confirmacion de pedido: \'Tu pedido fue enviado. Te notificaremos el dia de entrega.\'' },
        en: { context: 'B2B retailers complete beverage order and stop responding. Normal pattern in recurring FEMSA distribution.', desc: 'Flow has new order, suggested order and cancellation. Retailers finish when confirming order without conversational closure.', action: 'Add closing message post-order confirmation: \'Your order has been sent. We will notify you on delivery day.\'' },
        pt: { context: 'Lojistas B2B completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente FEMSA.', desc: 'O fluxo tem pedido novo, pedido sugerido e cancelamento. Lojistas terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar mensagem de encerramento pos-confirmacao de pedido: \'Seu pedido foi enviado. Notificaremos no dia da entrega.\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a KOF APIs + Commerce Headless + AWS Lambda. Doble round-trip para autenticacion + pedido.', desc: 'Latencias provienen de la cadena: AWS Lambda -> KOF APIs (catalogo/precios/stock) + Commerce Headless (gestion de pedido). Pedidos sugeridos agregan consulta adicional.', action: 'Evaluar cache de catalogo con TTL corto. Pre-cargar pedido sugerido basado en historial. Optimizar cold starts de Lambda.' },
        en: { context: 'Latency includes calls to KOF APIs + Commerce Headless + AWS Lambda. Double round-trip for auth + order.', desc: 'Latencies come from chain: AWS Lambda -> KOF APIs (catalog/prices/stock) + Commerce Headless (order management). Suggested orders add additional query.', action: 'Evaluate catalog cache with short TTL. Pre-load suggested order based on history. Optimize Lambda cold starts.' },
        pt: { context: 'A latencia inclui chamadas a KOF APIs + Commerce Headless + AWS Lambda. Duplo round-trip para autenticacao + pedido.', desc: 'Latencias vem da cadeia: AWS Lambda -> KOF APIs (catalogo/precos/estoque) + Commerce Headless (gestao de pedido). Pedidos sugeridos adicionam consulta adicional.', action: 'Avaliar cache de catalogo com TTL curto. Pre-carregar pedido sugerido baseado em historico. Otimizar cold starts de Lambda.' },
      },
      errorFree: {
        es: { context: 'Errores de KOF APIs como cliente en blacklist, stock insuficiente y validacion de horario llegan al usuario.', desc: 'Respuestas de error de KOF APIs (cliente bloqueado, fuera de horario, sin stock) se muestran como errores del asistente. El bot funciona correctamente.', action: 'Reformular errores de negocio a tono informativo: \'No hay stock disponible de este producto. Intenta con otro.\'' },
        en: { context: 'KOF APIs errors like blacklisted customer, insufficient stock and business hours validation reach the user.', desc: 'KOF APIs error responses (blocked customer, outside hours, no stock) shown as assistant errors. Bot works correctly.', action: 'Rewrite business errors to informative tone: \'No stock available for this product. Try another one.\'' },
        pt: { context: 'Erros de KOF APIs como cliente em blacklist, estoque insuficiente e validacao de horario chegam ao usuario.', desc: 'Respostas de erro de KOF APIs (cliente bloqueado, fora de horario, sem estoque) mostradas como erros do assistente. O bot funciona corretamente.', action: 'Reformular erros de negocio para tom informativo: \'Nao ha estoque disponivel deste produto. Tente outro.\'' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de KOF APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitectura FEMSA NG estandarizada.', desc: 'La arquitectura FEMSA NG es consistente pero depende de KOF APIs como punto unico para datos de negocio. Si KOF APIs cae, no hay catalogo ni precios.', action: 'Implementar modo degradado con catalogo cacheado. Circuit breaker para KOF APIs. Monitorear latencia de APIs FEMSA por pais.' },
        en: { context: 'Dependency on KOF APIs + Commerce Headless + BigStorage + AWS Lambda. Standardized FEMSA NG architecture.', desc: 'FEMSA NG architecture is consistent but depends on KOF APIs as single point for business data. If KOF APIs goes down, no catalog or prices.', action: 'Implement degraded mode with cached catalog. Circuit breaker for KOF APIs. Monitor FEMSA API latency per country.' },
        pt: { context: 'Dependencia de KOF APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitetura FEMSA NG padronizada.', desc: 'A arquitetura FEMSA NG e consistente mas depende de KOF APIs como ponto unico para dados de negocio. Se KOF APIs cair, nao ha catalogo nem precos.', action: 'Implementar modo degradado com catalogo cacheado. Circuit breaker para KOF APIs. Monitorar latencia de APIs FEMSA por pais.' },
      },
      },
    },
  "ng-femsa-wae-pa-prd": {
      name: "FEMSA WAE PA",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Panama. 35 activities/398 components. Flujo hibrido (deterministic + hybrid). AI agents: Femsa Oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a tenderos y comercios via WhatsApp. Integra Mulesoft APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda. Pedidos, fechas entrega, pagos, cancelacion, blacklist, webview, stock habilitado. Azure File Storage para imagenes.',
        en: 'B2B WhatsApp bot Panama. 35 activities/398 components. Hybrid flow (deterministic + hybrid). AI agents: Femsa Oris, Faq-customAgent 2026. FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates Mulesoft APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda. Orders, delivery dates, payments, cancellation, blacklist, webview, stock enabled. Azure File Storage for images.',
        pt: 'Bot B2B WhatsApp Panama. 35 activities/398 components. Fluxo hibrido (deterministic + hybrid). AI agents: Femsa Oris, Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra Mulesoft APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda. Pedidos, datas de entrega, pagamentos, cancelamento, blacklist, webview, stock habilitado. Azure File Storage para imagens.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente FEMSA.', desc: 'El flujo tiene pedido nuevo, pedido sugerido y cancelacion. Los tenderos terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar mensaje de cierre post-confirmacion de pedido: \'Tu pedido fue enviado. Te notificaremos el dia de entrega.\'' },
        en: { context: 'B2B retailers complete beverage order and stop responding. Normal pattern in recurring FEMSA distribution.', desc: 'Flow has new order, suggested order and cancellation. Retailers finish when confirming order without conversational closure.', action: 'Add closing message post-order confirmation: \'Your order has been sent. We will notify you on delivery day.\'' },
        pt: { context: 'Lojistas B2B completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente FEMSA.', desc: 'O fluxo tem pedido novo, pedido sugerido e cancelamento. Lojistas terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar mensagem de encerramento pos-confirmacao de pedido: \'Seu pedido foi enviado. Notificaremos no dia da entrega.\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a Mulesoft APIs + Commerce Headless + AWS Lambda. Doble round-trip para autenticacion + pedido.', desc: 'Latencias provienen de la cadena: AWS Lambda -> Mulesoft APIs (catalogo/precios/stock) + Commerce Headless (gestion de pedido). Pedidos sugeridos agregan consulta adicional.', action: 'Evaluar cache de catalogo con TTL corto. Pre-cargar pedido sugerido basado en historial. Optimizar cold starts de Lambda.' },
        en: { context: 'Latency includes calls to Mulesoft APIs + Commerce Headless + AWS Lambda. Double round-trip for auth + order.', desc: 'Latencies come from chain: AWS Lambda -> Mulesoft APIs (catalog/prices/stock) + Commerce Headless (order management). Suggested orders add additional query.', action: 'Evaluate catalog cache with short TTL. Pre-load suggested order based on history. Optimize Lambda cold starts.' },
        pt: { context: 'A latencia inclui chamadas a Mulesoft APIs + Commerce Headless + AWS Lambda. Duplo round-trip para autenticacao + pedido.', desc: 'Latencias vem da cadeia: AWS Lambda -> Mulesoft APIs (catalogo/precos/estoque) + Commerce Headless (gestao de pedido). Pedidos sugeridos adicionam consulta adicional.', action: 'Avaliar cache de catalogo com TTL curto. Pre-carregar pedido sugerido baseado em historico. Otimizar cold starts de Lambda.' },
      },
      errorFree: {
        es: { context: 'Errores de Mulesoft APIs como cliente en blacklist, stock insuficiente y validacion de horario llegan al usuario.', desc: 'Respuestas de error de Mulesoft APIs (cliente bloqueado, fuera de horario, sin stock) se muestran como errores del asistente. El bot funciona correctamente.', action: 'Reformular errores de negocio a tono informativo: \'No hay stock disponible de este producto. Intenta con otro.\'' },
        en: { context: 'Mulesoft APIs errors like blacklisted customer, insufficient stock and business hours validation reach the user.', desc: 'Mulesoft APIs error responses (blocked customer, outside hours, no stock) shown as assistant errors. Bot works correctly.', action: 'Rewrite business errors to informative tone: \'No stock available for this product. Try another one.\'' },
        pt: { context: 'Erros de Mulesoft APIs como cliente em blacklist, estoque insuficiente e validacao de horario chegam ao usuario.', desc: 'Respostas de erro de Mulesoft APIs (cliente bloqueado, fora de horario, sem estoque) mostradas como erros do assistente. O bot funciona corretamente.', action: 'Reformular erros de negocio para tom informativo: \'Nao ha estoque disponivel deste produto. Tente outro.\'' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de Mulesoft APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitectura FEMSA NG estandarizada.', desc: 'La arquitectura FEMSA NG es consistente pero depende de Mulesoft APIs como punto unico para datos de negocio. Si Mulesoft APIs cae, no hay catalogo ni precios.', action: 'Implementar modo degradado con catalogo cacheado. Circuit breaker para Mulesoft APIs. Monitorear latencia de APIs FEMSA por pais.' },
        en: { context: 'Dependency on Mulesoft APIs + Commerce Headless + BigStorage + AWS Lambda. Standardized FEMSA NG architecture.', desc: 'FEMSA NG architecture is consistent but depends on Mulesoft APIs as single point for business data. If Mulesoft APIs goes down, no catalog or prices.', action: 'Implement degraded mode with cached catalog. Circuit breaker for Mulesoft APIs. Monitor FEMSA API latency per country.' },
        pt: { context: 'Dependencia de Mulesoft APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitetura FEMSA NG padronizada.', desc: 'A arquitetura FEMSA NG e consistente mas depende de Mulesoft APIs como ponto unico para dados de negocio. Se Mulesoft APIs cair, nao ha catalogo nem precos.', action: 'Implementar modo degradado com catalogo cacheado. Circuit breaker para Mulesoft APIs. Monitorar latencia de APIs FEMSA por pais.' },
      },
      },
    },
  "ng-femsa-wae-uy-prd": {
      name: "FEMSA WAE UY",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Uruguay. 35 activities/417 components. Flujo hibrido (deterministic + hybrid). AI agents: Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribucion de bebidas Coca-Cola a tenderos y comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, y AWS Lambda. Stock habilitado, CSAT WA Flow V2, Frontapp (Sales Desk). Sin Quota.',
        en: 'B2B WhatsApp bot Uruguay. 35 activities/417 components. Hybrid flow (deterministic + hybrid). AI agents: Faq-customAgent 2026. FEMSA/KOF conversational commerce for Coca-Cola beverage distribution to retailers and stores via WhatsApp. Integrates KOF APIs, Commerce Headless (catalog/orders), BigStorage, and AWS Lambda. Stock enabled, CSAT WA Flow V2, Frontapp (Sales Desk). No Quota.',
        pt: 'Bot B2B WhatsApp Uruguai. 35 activities/417 components. Fluxo hibrido (deterministic + hybrid). AI agents: Faq-customAgent 2026. Comercio conversacional FEMSA/KOF para distribuicao de bebidas Coca-Cola a lojistas e comercios via WhatsApp. Integra KOF APIs, Commerce Headless (catalogo/pedidos), BigStorage, e AWS Lambda. Stock habilitado, CSAT WA Flow V2, Frontapp (Sales Desk). Sem Quota.',
      },
      insights: {
      closureRate: {
        es: { context: 'Tenderos B2B completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente FEMSA.', desc: 'El flujo tiene pedido nuevo, pedido sugerido y cancelacion. Los tenderos terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar mensaje de cierre post-confirmacion de pedido: \'Tu pedido fue enviado. Te notificaremos el dia de entrega.\'' },
        en: { context: 'B2B retailers complete beverage order and stop responding. Normal pattern in recurring FEMSA distribution.', desc: 'Flow has new order, suggested order and cancellation. Retailers finish when confirming order without conversational closure.', action: 'Add closing message post-order confirmation: \'Your order has been sent. We will notify you on delivery day.\'' },
        pt: { context: 'Lojistas B2B completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente FEMSA.', desc: 'O fluxo tem pedido novo, pedido sugerido e cancelamento. Lojistas terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar mensagem de encerramento pos-confirmacao de pedido: \'Seu pedido foi enviado. Notificaremos no dia da entrega.\'' },
      },
      latency: {
        es: { context: 'La latencia incluye llamadas a KOF APIs + Commerce Headless + AWS Lambda. Doble round-trip para autenticacion + pedido.', desc: 'Latencias provienen de la cadena: AWS Lambda -> KOF APIs (catalogo/precios/stock) + Commerce Headless (gestion de pedido). Pedidos sugeridos agregan consulta adicional.', action: 'Evaluar cache de catalogo con TTL corto. Pre-cargar pedido sugerido basado en historial. Optimizar cold starts de Lambda.' },
        en: { context: 'Latency includes calls to KOF APIs + Commerce Headless + AWS Lambda. Double round-trip for auth + order.', desc: 'Latencies come from chain: AWS Lambda -> KOF APIs (catalog/prices/stock) + Commerce Headless (order management). Suggested orders add additional query.', action: 'Evaluate catalog cache with short TTL. Pre-load suggested order based on history. Optimize Lambda cold starts.' },
        pt: { context: 'A latencia inclui chamadas a KOF APIs + Commerce Headless + AWS Lambda. Duplo round-trip para autenticacao + pedido.', desc: 'Latencias vem da cadeia: AWS Lambda -> KOF APIs (catalogo/precos/estoque) + Commerce Headless (gestao de pedido). Pedidos sugeridos adicionam consulta adicional.', action: 'Avaliar cache de catalogo com TTL curto. Pre-carregar pedido sugerido baseado em historico. Otimizar cold starts de Lambda.' },
      },
      errorFree: {
        es: { context: 'Errores de KOF APIs como cliente en blacklist, stock insuficiente y validacion de horario llegan al usuario.', desc: 'Respuestas de error de KOF APIs (cliente bloqueado, fuera de horario, sin stock) se muestran como errores del asistente. El bot funciona correctamente.', action: 'Reformular errores de negocio a tono informativo: \'No hay stock disponible de este producto. Intenta con otro.\'' },
        en: { context: 'KOF APIs errors like blacklisted customer, insufficient stock and business hours validation reach the user.', desc: 'KOF APIs error responses (blocked customer, outside hours, no stock) shown as assistant errors. Bot works correctly.', action: 'Rewrite business errors to informative tone: \'No stock available for this product. Try another one.\'' },
        pt: { context: 'Erros de KOF APIs como cliente em blacklist, estoque insuficiente e validacao de horario chegam ao usuario.', desc: 'Respostas de erro de KOF APIs (cliente bloqueado, fora de horario, sem estoque) mostradas como erros do assistente. O bot funciona corretamente.', action: 'Reformular erros de negocio para tom informativo: \'Nao ha estoque disponivel deste produto. Tente outro.\'' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de KOF APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitectura FEMSA NG estandarizada.', desc: 'La arquitectura FEMSA NG es consistente pero depende de KOF APIs como punto unico para datos de negocio. Si KOF APIs cae, no hay catalogo ni precios.', action: 'Implementar modo degradado con catalogo cacheado. Circuit breaker para KOF APIs. Monitorear latencia de APIs FEMSA por pais.' },
        en: { context: 'Dependency on KOF APIs + Commerce Headless + BigStorage + AWS Lambda. Standardized FEMSA NG architecture.', desc: 'FEMSA NG architecture is consistent but depends on KOF APIs as single point for business data. If KOF APIs goes down, no catalog or prices.', action: 'Implement degraded mode with cached catalog. Circuit breaker for KOF APIs. Monitor FEMSA API latency per country.' },
        pt: { context: 'Dependencia de KOF APIs + Commerce Headless + BigStorage + AWS Lambda. Arquitetura FEMSA NG padronizada.', desc: 'A arquitetura FEMSA NG e consistente mas depende de KOF APIs como ponto unico para dados de negocio. Se KOF APIs cair, nao ha catalogo nem precos.', action: 'Implementar modo degradado com catalogo cacheado. Circuit breaker para KOF APIs. Monitorar latencia de APIs FEMSA por pais.' },
      },
      },
    },
  "unilever-ecu-hpc-prd": {
      name: "Unilever ECU HPC",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Ecuador. 31 activities/386 components. Flujo hibrido (deterministic + hybrid). AI agents: FAQs custom agent HPC Ecuador, Oris R1, Oris P1. Comercio conversacional para Unilever Ecuador - Division HPC (Home & Personal Care). Pedidos de productos de cuidado personal y hogar via WhatsApp.',
        en: 'B2B WhatsApp bot Ecuador. 31 activities/386 components. Hybrid flow (deterministic + hybrid). AI agents: FAQs custom agent HPC Ecuador, Oris R1, Oris P1. Conversational commerce for Unilever Ecuador - HPC Division (Home & Personal Care). Home and personal care product orders via WhatsApp.',
        pt: 'Bot B2B WhatsApp Equador. 31 activities/386 components. Fluxo hibrido (deterministic + hybrid). AI agents: FAQs custom agent HPC Ecuador, Oris R1, Oris P1. Comercio conversacional para Unilever Equador - Divisao HPC (Home & Personal Care). Pedidos de produtos de cuidado pessoal e lar via WhatsApp.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "unilever-ecu-ic-prd": {
      name: "Unilever ECU IC",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Ecuador. 79 activities/1210 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent R1/P1 (Regular + Preventa), Voice Agent Template, Voice Oris Final, FAQs KG, Loyalty Support Agent, Utility Oris. Comercio conversacional para Unilever Ecuador - Division Helados (Ice Cream). Pedidos, gestion de cabinets, lealtad.',
        en: 'B2B WhatsApp bot Ecuador. 79 activities/1210 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent R1/P1 (Regular + Preventa), Voice Agent Template, Voice Oris Final, FAQs KG, Loyalty Support Agent, Utility Oris. Conversational commerce for Unilever Ecuador - Ice Cream Division. Orders, cabinet management, loyalty.',
        pt: 'Bot B2B WhatsApp Equador. 79 activities/1210 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent R1/P1 (Regular + Preventa), Voice Agent Template, Voice Oris Final, FAQs KG, Loyalty Support Agent, Utility Oris. Comercio conversacional para Unilever Equador - Divisao Sorvetes (Ice Cream). Pedidos, gestao de cabinets, fidelidade.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-bo1917-bowen-bowen-prod": {
      name: "Bowen Bowen",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Belize. 15 activities/256 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent (B&B), FAQ Custom Agent (Bowen). Comercio conversacional para Bowen & Bowen, distribuidor de bebidas en Belize. Pedidos via WhatsApp con Sales Desk, autenticacion multi-tienda, CSAT.',
        en: 'B2B WhatsApp bot Belize. 15 activities/256 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent (B&B), FAQ Custom Agent (Bowen). Conversational commerce for Bowen & Bowen, beverage distributor in Belize. Orders via WhatsApp with Sales Desk, multi-store authentication, CSAT.',
        pt: 'Bot B2B WhatsApp Belize. 15 activities/256 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent (B&B), FAQ Custom Agent (Bowen). Comercio conversacional para Bowen & Bowen, distribuidor de bebidas em Belize. Pedidos via WhatsApp com Sales Desk, autenticacao multi-loja, CSAT.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-ca1641-carozzi-ch": {
      name: "Carozzi Chile",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Chile. 38 activities/475 components. Flujo hibrido (deterministic + hybrid). AI agents: Custom Agent 02 (Home), Sales Agent R1/P1/Voice, Faq-customAgent 2026. Comercio conversacional para Carozzi Chile (alimentos). Pedidos via WhatsApp. Integra Carozzi API, Frontapp (Sales Desk), Headless Commerce, Yalo Force, CSAT.',
        en: 'B2B WhatsApp bot Chile. 38 activities/475 components. Hybrid flow (deterministic + hybrid). AI agents: Custom Agent 02 (Home), Sales Agent R1/P1/Voice, Faq-customAgent 2026. Conversational commerce for Carozzi Chile (food products). Orders via WhatsApp. Integrates Carozzi API, Frontapp (Sales Desk), Headless Commerce, Yalo Force, CSAT.',
        pt: 'Bot B2B WhatsApp Chile. 38 activities/475 components. Fluxo hibrido (deterministic + hybrid). AI agents: Custom Agent 02 (Home), Sales Agent R1/P1/Voice, Faq-customAgent 2026. Comercio conversacional para Carozzi Chile (alimentos). Pedidos via WhatsApp. Integra Carozzi API, Frontapp (Sales Desk), Headless Commerce, Yalo Force, CSAT.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (RandomERP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con RandomERP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (RandomERP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from RandomERP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (RandomERP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com RandomERP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (RandomERP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del RandomERP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (RandomERP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "RandomERP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (RandomERP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do RandomERP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con RandomERP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with RandomERP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com RandomERP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-ce2212-cesar-iglesias-prod": {
      name: "Cesar Iglesias",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Republica Dominicana. 18 activities/275 components. Flujo hibrido (deterministic + hybrid). AI agents: FAQS Custom Agent, Sales Agent (con Oris R1 integrado). Comercio conversacional para Cesar Iglesias, distribucion en Republica Dominicana. Pedidos, consulta de ordenes, CSAT, T&C.',
        en: 'B2B WhatsApp bot Dominican Republic. 18 activities/275 components. Hybrid flow (deterministic + hybrid). AI agents: FAQS Custom Agent, Sales Agent (with integrated Oris R1). Conversational commerce for Cesar Iglesias, distribution in Dominican Republic. Orders, order inquiries, CSAT, T&C.',
        pt: 'Bot B2B WhatsApp Republica Dominicana. 18 activities/275 components. Fluxo hibrido (deterministic + hybrid). AI agents: FAQS Custom Agent, Sales Agent (com Oris R1 integrado). Comercio conversacional para Cesar Iglesias, distribuicao na Republica Dominicana. Pedidos, consulta de ordens, CSAT, T&C.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-co2107-colgatepalmolive-prd": {
    name: "Colgate Palmolive",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Brasil. 14 activities/125 components. Flujo deterministic. AI agents: Knowledge Genie (KnowGenie). Plataforma de comercio para Colgate Palmolive Brasil. Auth Store, Profiler (perfilador de negocio), T&C, Yalo Force. Sin ORIS. Nuevo bot (2025).',
      en: 'B2B WhatsApp bot Brazil. 14 activities/125 components. Deterministic flow. AI agents: Knowledge Genie (KnowGenie). Commerce platform for Colgate Palmolive Brazil. Auth Store, Profiler (business profiler), T&C, Yalo Force. No ORIS. New bot (2025).',
      pt: 'Bot B2B WhatsApp Brasil. 14 activities/125 components. Fluxo deterministic. AI agents: Knowledge Genie (KnowGenie). Plataforma de comercio para Colgate Palmolive Brasil. Auth Store, Profiler (perfilador de negocio), T&C, Yalo Force. Sem ORIS. Bot novo (2025).',
    },
    insights: {},
  },
  "wa-di1984-diana-sv": {
    name: "Diana SV",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp El Salvador. 18 activities/289 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent, Agente de Atencion Productos Diana (Custom Agent). Comercio conversacional para Diana El Salvador (distribucion). Pedidos via webview, FAQs, estado de ordenes, Business Hours, Sales Desk CSAT.',
      en: 'B2B WhatsApp bot El Salvador. 18 activities/289 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent, Diana Products Support Agent (Custom Agent). Conversational commerce for Diana El Salvador (distribution). Orders via webview, FAQs, order status, Business Hours, Sales Desk CSAT.',
      pt: 'Bot B2B WhatsApp El Salvador. 18 activities/289 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent, Agente de Atendimento Produtos Diana (Custom Agent). Comercio conversacional para Diana El Salvador (distribuicao). Pedidos via webview, FAQs, status de ordens, Business Hours, Sales Desk CSAT.',
    },
    insights: {},
  },
  "wa-en1992-enex-chile": {
      name: "Enex Chile",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Chile. 24 activities/358 components. Flujo hibrido (deterministic + hybrid). AI agents: Faqs Enex PROD (Custom Agent), KnowledgeGenie (Refrigerante, AdBlue, Grasa, Aceite, Faqs Enex), Custom Agent 01 (Home), Sales Agent. Comercio conversacional para Enex Chile (energia/combustibles). Pedidos, Yalo Force, CSAT.',
        en: 'B2B WhatsApp bot Chile. 24 activities/358 components. Hybrid flow (deterministic + hybrid). AI agents: Faqs Enex PROD (Custom Agent), KnowledgeGenie (Refrigerante, AdBlue, Grasa, Aceite, Faqs Enex), Custom Agent 01 (Home), Sales Agent. Conversational commerce for Enex Chile (energy/fuel). Orders, Yalo Force, CSAT.',
        pt: 'Bot B2B WhatsApp Chile. 24 activities/358 components. Fluxo hibrido (deterministic + hybrid). AI agents: Faqs Enex PROD (Custom Agent), KnowledgeGenie (Refrigerante, AdBlue, Grasa, Aceite, Faqs Enex), Custom Agent 01 (Home), Sales Agent. Comercio conversacional para Enex Chile (energia/combustiveis). Pedidos, Yalo Force, CSAT.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      fallbackQuality: {
          es: {
            context: "Datos de catalogo sincronizados via SFTP periodicamente. Productos desactualizados entre sincronizaciones generan fallbacks legitimos.",
            desc: "Cuando la sincronizacion SFTP tiene retraso, productos recien agregados o cambios de precio no estan disponibles. El bot responde con fallback porque los datos no existen aun.",
            action: "Verificar frecuencia de sincronizacion SFTP y monitorear errores. Agregar respuestas especificas para \'producto no encontrado temporalmente\'.",
          },
          en: {
            context: "Catalog data synced via SFTP periodically. Outdated products between syncs generate legitimate fallbacks.",
            desc: "When SFTP sync is delayed, newly added products or price changes are unavailable. Bot responds with fallback because data does not exist yet.",
            action: "Verify SFTP sync frequency and monitor errors. Add specific responses for \'product temporarily not found\'.",
          },
          pt: {
            context: "Dados de catalogo sincronizados via SFTP periodicamente. Produtos desatualizados entre sincronizacoes geram fallbacks legitimos.",
            desc: "Quando a sincronizacao SFTP esta atrasada, produtos recem adicionados ou mudancas de preco nao estao disponiveis. Bot responde com fallback porque dados ainda nao existem.",
            action: "Verificar frequencia de sincronizacao SFTP e monitorar erros. Adicionar respostas especificas para \'produto temporariamente nao encontrado\'.",
          },
        },
      },
    },
  "wa-fe2082-feduro-panama": {
    name: "Feduro Panama",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Panama. 9 activities/183 components. Flujo hibrido (hybrid + deterministic). AI agents: Campaign Sales Agent (Custom Agent), Knowledge Genie, Sales Agent. Comercio conversacional para Feduro Panama (distribucion). Pedidos via webview, estado de ordenes, Business Hours, Sales Desk CSAT.',
      en: 'B2B WhatsApp bot Panama. 9 activities/183 components. Hybrid flow (hybrid + deterministic). AI agents: Campaign Sales Agent (Custom Agent), Knowledge Genie, Sales Agent. Conversational commerce for Feduro Panama (distribution). Orders via webview, order status, Business Hours, Sales Desk CSAT.',
      pt: 'Bot B2B WhatsApp Panama. 9 activities/183 components. Fluxo hibrido (hybrid + deterministic). AI agents: Campaign Sales Agent (Custom Agent), Knowledge Genie, Sales Agent. Comercio conversacional para Feduro Panama (distribuicao). Pedidos via webview, status de ordens, Business Hours, Sales Desk CSAT.',
    },
    insights: {},
  },
  "wa-gr1794-grupo-nieto": {
      name: "Grupo Nieto",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 44 activities/702 components. Flujo hibrido (deterministic + hybrid). AI agents: FAQs Nieto CA (Custom Agent), Sales Agent Oris R1/P1, Voice Agent (orisVoice). Comercio conversacional para Grupo Nieto Mexico. Pedidos, credito, Yalo Pago, Yalo Force, CSAT, Headless Commerce, Sales Desk.',
        en: 'B2B WhatsApp bot Mexico. 44 activities/702 components. Hybrid flow (deterministic + hybrid). AI agents: FAQs Nieto CA (Custom Agent), Sales Agent Oris R1/P1, Voice Agent (orisVoice). Conversational commerce for Grupo Nieto Mexico. Orders, credit, Yalo Pago, Yalo Force, CSAT, Headless Commerce, Sales Desk.',
        pt: 'Bot B2B WhatsApp Mexico. 44 activities/702 components. Fluxo hibrido (deterministic + hybrid). AI agents: FAQs Nieto CA (Custom Agent), Sales Agent Oris R1/P1, Voice Agent (orisVoice). Comercio conversacional para Grupo Nieto Mexico. Pedidos, credito, Yalo Pago, Yalo Force, CSAT, Headless Commerce, Sales Desk.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-hb2210-hbc-egypt": {
      name: "HBC Egypt",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Egipto. 14 activities/376 components. Flujo hibrido (hybrid + deterministic). AI agents: TyC Agents (Custom Agents x3), Sales Agent Oris R1/P1 (English + Arabic), Oris R1-English, Oris P1-English, FAQs Agent (Custom Agent), menu agent. Comercio para Coca-Cola HBC Egypt. Integra SalesBuzz OData, bilingue AR/EN.',
        en: 'B2B WhatsApp bot Egypt. 14 activities/376 components. Hybrid flow (hybrid + deterministic). AI agents: TyC Agents (Custom Agents x3), Sales Agent Oris R1/P1 (English + Arabic), Oris R1-English, Oris P1-English, FAQs Agent (Custom Agent), menu agent. Commerce for Coca-Cola HBC Egypt. Integrates SalesBuzz OData, bilingual AR/EN.',
        pt: 'Bot B2B WhatsApp Egito. 14 activities/376 components. Fluxo hibrido (hybrid + deterministic). AI agents: TyC Agents (Custom Agents x3), Sales Agent Oris R1/P1 (English + Arabic), Oris R1-English, Oris P1-English, FAQs Agent (Custom Agent), menu agent. Comercio para Coca-Cola HBC Egypt. Integra SalesBuzz OData, bilingue AR/EN.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SalesBuzz). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SalesBuzz: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SalesBuzz). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SalesBuzz). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SalesBuzz: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SalesBuzz) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SalesBuzz (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SalesBuzz) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SalesBuzz error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SalesBuzz) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SalesBuzz (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SalesBuzz y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SalesBuzz and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SalesBuzz e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-hi1949-hico-prod": {
    name: "HICO",
    hasOris: false,
    type: { es: "Bot B2B (HICO)", en: "B2B bot (HICO)", pt: "Bot B2B (HICO)" },
    insights: {},
  },
  "wa-it1752-italcol": {
      name: "Italcol",
      hasOris: false,
      type: {
        es: "Bot B2B WhatsApp Colombia. Plataforma de comercio B2B para Italcol, empresa del sector agropecuario colombiano. Permite a tenderos y distribuidores realizar pedidos a través de WhatsApp,.",
        en: "Bot B2B WhatsApp Colombia. Plataforma de comercio B2B para Italcol, empresa del sector agropecuario colombiano. Permite a tenderos y distribuidores realizar pedidos a través de WhatsApp,.",
        pt: "Bot B2B WhatsApp Colombia. Plataforma de comercio B2B para Italcol, empresa del sector agropecuario colombiano. Permite a tenderos y distribuidores realizar pedidos a través de WhatsApp,.",
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (Italcol SOAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con Italcol SOAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (Italcol SOAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SOAP API integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (Italcol SOAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com Italcol SOAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (Italcol SOAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del Italcol SOAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (Italcol SOAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "Italcol SOAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (Italcol SOAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do Italcol SOAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con Italcol SOAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with Italcol SOAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com Italcol SOAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      fallbackQuality: {
          es: {
            context: "Datos de catalogo sincronizados via SFTP periodicamente. Productos desactualizados entre sincronizaciones generan fallbacks legitimos.",
            desc: "Cuando la sincronizacion SFTP tiene retraso, productos recien agregados o cambios de precio no estan disponibles. El bot responde con fallback porque los datos no existen aun.",
            action: "Verificar frecuencia de sincronizacion SFTP y monitorear errores. Agregar respuestas especificas para \'producto no encontrado temporalmente\'.",
          },
          en: {
            context: "Catalog data synced via SFTP periodically. Outdated products between syncs generate legitimate fallbacks.",
            desc: "When SFTP sync is delayed, newly added products or price changes are unavailable. Bot responds with fallback because data does not exist yet.",
            action: "Verify SFTP sync frequency and monitor errors. Add specific responses for \'product temporarily not found\'.",
          },
          pt: {
            context: "Dados de catalogo sincronizados via SFTP periodicamente. Produtos desatualizados entre sincronizacoes geram fallbacks legitimos.",
            desc: "Quando a sincronizacao SFTP esta atrasada, produtos recem adicionados ou mudancas de preco nao estao disponiveis. Bot responde com fallback porque dados ainda nao existem.",
            action: "Verificar frequencia de sincronizacao SFTP e monitorar erros. Adicionar respostas especificas para \'produto temporariamente nao encontrado\'.",
          },
        },
      },
    },
  "wa-ju2133-jumex-prod": {
    name: "Jumex",
    hasOris: false,
    type: { es: "Bot B2B Mexico (Jumex)", en: "B2B Mexico bot (Jumex)", pt: "Bot B2B Mexico (Jumex)" },
    insights: {},
  },
  "wa-me1772-mercedes-b2c": {
      name: "Mercedes B2C",
      hasOris: false,
      type: {
        es: 'Bot B2C WhatsApp Brasil. Plataforma conversacional para Mercedes-Benz Trucks Brasil. Permite a usuarios consultar vehiculos, agendar visitas de venta, acceder a MB Collection, soporte tecnico y activar TAG Sem Parar. Integra Daimler Truck API (Azure AD auth, gestion de leads/clientes), TruckInfoMB API (especificaciones de vehiculos/portafolio), GCP Cloud Functions (commerce-entity-processor, schedule-lead-visit, fetch-vehicle-specifications, vehicle-specifications WA Flow), Headless Commerce (MB Collection), Sales Desk. Activities: Home, Authentication, Dealership Locator, MB Collection, Manual de Bordo Genie, Receba uma visita, Sales Desk, MB Service 24h, TAG Sem Parar, CSAT. AI: FAQ Geral Genie, Genie Duvidas Frequentes.',
        en: 'B2C WhatsApp bot Brazil. Conversational platform for Mercedes-Benz Trucks Brazil. Allows users to browse vehicles, schedule sales visits, access MB Collection, technical support and activate TAG Sem Parar. Integrates Daimler Truck API (Azure AD auth, lead/customer management), TruckInfoMB API (vehicle specs/portfolio), GCP Cloud Functions (commerce-entity-processor, schedule-lead-visit, fetch-vehicle-specifications, vehicle-specifications WA Flow), Headless Commerce (MB Collection), Sales Desk. Activities: Home, Authentication, Dealership Locator, MB Collection, Manual de Bordo Genie, Receba uma visita, Sales Desk, MB Service 24h, TAG Sem Parar, CSAT. AI: FAQ Geral Genie, Genie Duvidas Frequentes.',
        pt: 'Bot B2C WhatsApp Brasil. Plataforma conversacional para Mercedes-Benz Trucks Brasil. Permite a usuarios consultar veiculos, agendar visitas de venda, acessar MB Collection, suporte tecnico e ativar TAG Sem Parar. Integra Daimler Truck API (Azure AD auth, gestao de leads/clientes), TruckInfoMB API (especificacoes de veiculos/portfolio), GCP Cloud Functions (commerce-entity-processor, schedule-lead-visit, fetch-vehicle-specifications, vehicle-specifications WA Flow), Headless Commerce (MB Collection), Sales Desk. Atividades: Home, Authentication, Dealership Locator, MB Collection, Manual de Bordo Genie, Receba uma visita, Sales Desk, MB Service 24h, TAG Sem Parar, CSAT. AI: FAQ Geral Genie, Genie Duvidas Frequentes.',
      },
      insights: {
      closureRate: {
        es: { context: 'Usuarios B2C interactuan de forma exploratoria: consultan vehiculos, agendan visitas, navegan MB Collection y salen sin cierre.', desc: 'Sesiones informativas (especificaciones, FAQ Genie, localizador de concesionarios) terminan cuando el usuario obtiene la info sin cierre formal.', action: 'Agregar cierre contextual por tipo de sesion: post-consulta vehiculo, post-agendamiento visita, post-compra MB Collection.' },
        en: { context: 'B2C users interact exploratorily: browse vehicles, schedule visits, explore MB Collection and leave without closure.', desc: 'Informational sessions (specs, FAQ Genie, dealership locator) end when user gets info without formal closure.', action: 'Add contextual closing per session type: post-vehicle inquiry, post-visit scheduling, post-MB Collection purchase.' },
        pt: { context: 'Usuarios B2C interagem de forma exploratoria: consultam veiculos, agendam visitas, navegam MB Collection e saem sem encerramento.', desc: 'Sessoes informativas (especificacoes, FAQ Genie, localizador de concessionarias) terminam quando o usuario obtem a info sem encerramento formal.', action: 'Adicionar encerramento contextual por tipo de sessao: pos-consulta veiculo, pos-agendamento visita, pos-compra MB Collection.' },
      },
      latency: {
        es: { context: 'La latencia incluye Daimler Truck API (Azure AD auth + gestion de leads) + TruckInfoMB API (specs) + GCP Cloud Functions.', desc: 'Daimler Truck API requiere autenticacion Azure AD previa a cada llamada. TruckInfoMB API para especificaciones agrega round-trip adicional. schedule-lead-visit crea leads en el CRM.', action: 'Cachear token Azure AD entre invocaciones. Cachear especificaciones de vehiculos con TTL largo (cambian poco). Pre-calentar Cloud Functions.' },
        en: { context: 'Latency includes Daimler Truck API (Azure AD auth + lead management) + TruckInfoMB API (specs) + GCP Cloud Functions.', desc: 'Daimler Truck API requires Azure AD auth before each call. TruckInfoMB API for specifications adds extra round-trip. schedule-lead-visit creates leads in CRM.', action: 'Cache Azure AD token between invocations. Cache vehicle specs with long TTL (rarely change). Warm up Cloud Functions.' },
        pt: { context: 'A latencia inclui Daimler Truck API (Azure AD auth + gestao de leads) + TruckInfoMB API (specs) + GCP Cloud Functions.', desc: 'Daimler Truck API requer autenticacao Azure AD antes de cada chamada. TruckInfoMB API para especificacoes adiciona round-trip extra. schedule-lead-visit cria leads no CRM.', action: 'Cachear token Azure AD entre invocacoes. Cachear especificacoes de veiculos com TTL longo (mudam pouco). Pre-aquecer Cloud Functions.' },
      },
      errorFree: {
        es: { context: 'Errores de Daimler Truck API (lead duplicado, Azure AD token expirado) y TruckInfoMB API (vehiculo no encontrado) llegan al usuario.', desc: 'Fallos de autenticacion Azure AD y errores de CRM (lead ya existe, datos invalidos) se muestran como errores del bot. TruckInfoMB puede retornar vehiculo no encontrado.', action: 'Manejar lead duplicado con mensaje informativo. Retry automatico para Azure AD token expirado. Fallback para vehiculo no encontrado.' },
        en: { context: 'Daimler Truck API errors (duplicate lead, expired Azure AD token) and TruckInfoMB API (vehicle not found) reach user.', desc: 'Azure AD auth failures and CRM errors (lead exists, invalid data) shown as bot errors. TruckInfoMB may return vehicle not found.', action: 'Handle duplicate lead with informative message. Auto-retry for expired Azure AD token. Fallback for vehicle not found.' },
        pt: { context: 'Erros da Daimler Truck API (lead duplicado, Azure AD token expirado) e TruckInfoMB API (veiculo nao encontrado) chegam ao usuario.', desc: 'Falhas de autenticacao Azure AD e erros de CRM (lead ja existe, dados invalidos) mostrados como erros do bot. TruckInfoMB pode retornar veiculo nao encontrado.', action: 'Tratar lead duplicado com mensagem informativa. Retry automatico para Azure AD token expirado. Fallback para veiculo nao encontrado.' },
      },
      stabilityProxy: {
        es: { context: 'Dependencia de Daimler Truck API (Azure AD) + TruckInfoMB API + GCP Cloud Functions + Headless Commerce.', desc: 'Daimler Truck API con Azure AD es la dependencia mas fragil (auth externa). TruckInfoMB es de solo lectura, mas estable. MB Collection via Headless Commerce es independiente.', action: 'Circuit breaker para Daimler Truck API. Cache de respuestas de TruckInfoMB. Monitorear Azure AD token refresh rate.' },
        en: { context: 'Dependency on Daimler Truck API (Azure AD) + TruckInfoMB API + GCP Cloud Functions + Headless Commerce.', desc: 'Daimler Truck API with Azure AD is the most fragile dependency (external auth). TruckInfoMB is read-only, more stable. MB Collection via Headless Commerce is independent.', action: 'Circuit breaker for Daimler Truck API. Cache TruckInfoMB responses. Monitor Azure AD token refresh rate.' },
        pt: { context: 'Dependencia de Daimler Truck API (Azure AD) + TruckInfoMB API + GCP Cloud Functions + Headless Commerce.', desc: 'Daimler Truck API com Azure AD e a dependencia mais fragil (auth externa). TruckInfoMB e somente leitura, mais estavel. MB Collection via Headless Commerce e independente.', action: 'Circuit breaker para Daimler Truck API. Cache de respostas do TruckInfoMB. Monitorar Azure AD token refresh rate.' },
      },
      },
    },
  "wa-mi1920-minsa-prod": {
    name: "Minsa",
    hasOris: false,
    type: { es: "Bot B2B (Minsa)", en: "B2B bot (Minsa)", pt: "Bot B2B (Minsa)" },
    insights: {},
  },
  "wa-mo1565-mondelez-col-b2b-prd": {
    name: "Mondelez Colombia B2B",
    hasOris: false,
    type: { es: "Bot B2B Colombia (Mondelez)", en: "B2B Colombia bot (Mondelez)", pt: "Bot B2B Colombia (Mondelez)" },
    insights: {},
  },
  "wa-ne1614-nestle-ven": {
      name: "Nestle Venezuela",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Venezuela. 35 activities/392 components. Flujo hibrido (deterministic + hybrid). AI agent: FAQs NestleVen CA. Sin ORIS. Comercio conversacional Nestle Venezuela (distribucion B2B). Incluye Home, Menu, Make Order, One Chat Buy, TyC, Payment Methods, Delivery, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce, webhooks de integracion.',
        en: 'B2B WhatsApp bot Venezuela. 35 activities/392 components. Hybrid flow (deterministic + hybrid). AI agent: FAQs NestleVen CA. No ORIS. Nestle Venezuela conversational commerce (B2B distribution). Includes Home, Menu, Make Order, One Chat Buy, TyC, Payment Methods, Delivery, Sales Desk, CSAT, Smalltalk, Campanhas. Integrates Headless Commerce, integration webhooks.',
        pt: 'Bot B2B WhatsApp Venezuela. 35 activities/392 components. Fluxo hibrido (deterministic + hybrid). AI agent: FAQs NestleVen CA. Sem ORIS. Comercio conversacional Nestle Venezuela (distribuicao B2B). Inclui Home, Menu, Make Order, One Chat Buy, TyC, Payment Methods, Delivery, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce, webhooks de integracao.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-ne1956-nestle-colombia": {
    name: "Nestle Colombia",
    hasOris: false,
    type: { es: "Bot B2B Colombia (Nestle)", en: "B2B Colombia bot (Nestle)", pt: "Bot B2B Colombia (Nestle)" },
    insights: {},
  },
  "wa-ne2096-nestle-professional-chile": {
      name: "Nestle Prof Chile",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Chile. 26 activities/508 components. Flujo hibrido (deterministic + hybrid). AI agent: FAQ Agent. Sin ORIS. Comercio y prospeccion Nestle Professional Chile (foodservice). Incluye Home, Main Menu, New Customer Registration, TyC, Make Order, Order Check In, Flow Where to Buy, Sales Desk, CSAT, Campanhas. Integra Headless Commerce, webhooks de integracion, Pipefy (prospeccion).',
        en: 'B2B WhatsApp bot Chile. 26 activities/508 components. Hybrid flow (deterministic + hybrid). AI agent: FAQ Agent. No ORIS. Nestle Professional Chile commerce and prospecting (foodservice). Includes Home, Main Menu, New Customer Registration, TyC, Make Order, Order Check In, Flow Where to Buy, Sales Desk, CSAT, Campanhas. Integrates Headless Commerce, integration webhooks, Pipefy (prospecting).',
        pt: 'Bot B2B WhatsApp Chile. 26 activities/508 components. Fluxo hibrido (deterministic + hybrid). AI agent: FAQ Agent. Sem ORIS. Comercio e prospeccao Nestle Professional Chile (foodservice). Inclui Home, Main Menu, New Customer Registration, TyC, Make Order, Order Check In, Flow Where to Buy, Sales Desk, CSAT, Campanhas. Integra Headless Commerce, webhooks de integracao, Pipefy (prospeccao).',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      fallbackQuality: {
          es: {
            context: "Datos de catalogo sincronizados via SFTP periodicamente. Productos desactualizados entre sincronizaciones generan fallbacks legitimos.",
            desc: "Cuando la sincronizacion SFTP tiene retraso, productos recien agregados o cambios de precio no estan disponibles. El bot responde con fallback porque los datos no existen aun.",
            action: "Verificar frecuencia de sincronizacion SFTP y monitorear errores. Agregar respuestas especificas para \'producto no encontrado temporalmente\'.",
          },
          en: {
            context: "Catalog data synced via SFTP periodically. Outdated products between syncs generate legitimate fallbacks.",
            desc: "When SFTP sync is delayed, newly added products or price changes are unavailable. Bot responds with fallback because data does not exist yet.",
            action: "Verify SFTP sync frequency and monitor errors. Add specific responses for \'product temporarily not found\'.",
          },
          pt: {
            context: "Dados de catalogo sincronizados via SFTP periodicamente. Produtos desatualizados entre sincronizacoes geram fallbacks legitimos.",
            desc: "Quando a sincronizacao SFTP esta atrasada, produtos recem adicionados ou mudancas de preco nao estao disponiveis. Bot responde com fallback porque dados ainda nao existem.",
            action: "Verificar frequencia de sincronizacao SFTP e monitorar erros. Adicionar respostas especificas para \'produto temporariamente nao encontrado\'.",
          },
        },
      },
    },
  "wa-ne2120-nestle-professional-mx": {
      name: "Nestle Prof MX",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 26 activities/523 components. Flujo hibrido (deterministic + hybrid). AI agents: faqs Prospecto custom agent, faqs General custom agent, FAQs Agent. Sin ORIS. Plataforma de comercio y prospeccion para Nestle Professional Mexico (foodservice). Integra Nestle Backend APIs (OAuth, Catalog, Presales), Telcel Data Rewards API (elegibilidad de recargas), GCP Cloud Functions (catalog-sync, master-catalogs-sync, send-order-consumer, get-telcel-eligibility, promotions-active-addon), Headless Commerce, Sales Desk. Incluye Home, Main Menu, Customer validation, New Customer Registration, TyC, Make order, Order Check In, Menu Food and Drink, Flow Where to Buy, Sales Desk, CSAT.',
        en: 'B2B WhatsApp bot Mexico. 26 activities/523 components. Hybrid flow (deterministic + hybrid). AI agents: faqs Prospecto custom agent, faqs General custom agent, FAQs Agent. No ORIS. Commerce and prospecting platform for Nestle Professional Mexico (foodservice). Integrates Nestle Backend APIs (OAuth, Catalog, Presales), Telcel Data Rewards API (recharge eligibility), GCP Cloud Functions (catalog-sync, master-catalogs-sync, send-order-consumer, get-telcel-eligibility, promotions-active-addon), Headless Commerce, Sales Desk. Includes Home, Main Menu, Customer validation, New Customer Registration, TyC, Make order, Order Check In, Menu Food and Drink, Flow Where to Buy, Sales Desk, CSAT.',
        pt: 'Bot B2B WhatsApp Mexico. 26 activities/523 components. Fluxo hibrido (deterministic + hybrid). AI agents: faqs Prospecto custom agent, faqs General custom agent, FAQs Agent. Sem ORIS. Plataforma de comercio e prospeccao para Nestle Professional Mexico (foodservice). Integra Nestle Backend APIs (OAuth, Catalog, Presales), Telcel Data Rewards API (elegibilidade de recargas), GCP Cloud Functions (catalog-sync, master-catalogs-sync, send-order-consumer, get-telcel-eligibility, promotions-active-addon), Headless Commerce, Sales Desk. Inclui Home, Main Menu, Customer validation, New Customer Registration, TyC, Make order, Order Check In, Menu Food and Drink, Flow Where to Buy, Sales Desk, CSAT.',
      },
      insights: {
      closureRate: {
        es: { context: 'Nestle Professional MX tiene flujos de comercio, prospeccion y soporte tecnico de maquinas de cafe.', desc: 'Sesiones de prospeccion (Where to Buy, FAQs Genie Prospecto) y soporte tecnico (Coffee Machine Support) resuelven sin cierre transaccional.', action: 'Segmentar closure por tipo: comercio (Make order), prospeccion (Where to Buy) y soporte (Coffee Machine). Cierre diferenciado para cada uno.' },
        en: { context: 'Nestle Professional MX has commerce, prospecting and coffee machine technical support flows.', desc: 'Prospecting sessions (Where to Buy, FAQs Genie Prospecto) and tech support (Coffee Machine Support) resolve without transactional closure.', action: 'Segment closure by type: commerce (Make order), prospecting (Where to Buy) and support (Coffee Machine). Differentiated closing for each.' },
        pt: { context: 'Nestle Professional MX tem fluxos de comercio, prospeccao e suporte tecnico de maquinas de cafe.', desc: 'Sessoes de prospeccao (Where to Buy, FAQs Genie Prospecto) e suporte tecnico (Coffee Machine Support) resolvem sem fechamento transacional.', action: 'Segmentar closure por tipo: comercio (Make order), prospeccao (Where to Buy) e suporte (Coffee Machine). Encerramento diferenciado para cada um.' },
      },
      latency: {
        es: { context: 'La latencia incluye Nestle Backend APIs (OAuth + Catalog + Presales) + Telcel Data Rewards API + 5 Cloud Functions.', desc: 'Nestle Backend requiere OAuth previo a cada llamada. catalog-sync y master-catalogs-sync agregan procesamiento. Telcel eligibility es llamada externa adicional.', action: 'Cachear OAuth token entre invocaciones. Optimizar catalog-sync para ejecutar en horarios de baja demanda. Evaluar si Telcel puede ser asincrono.' },
        en: { context: 'Latency includes Nestle Backend APIs (OAuth + Catalog + Presales) + Telcel Data Rewards API + 5 Cloud Functions.', desc: 'Nestle Backend requires OAuth before each call. catalog-sync and master-catalogs-sync add processing. Telcel eligibility is additional external call.', action: 'Cache OAuth token between invocations. Optimize catalog-sync to run during low-demand hours. Evaluate if Telcel can be async.' },
        pt: { context: 'A latencia inclui Nestle Backend APIs (OAuth + Catalog + Presales) + Telcel Data Rewards API + 5 Cloud Functions.', desc: 'Nestle Backend requer OAuth antes de cada chamada. catalog-sync e master-catalogs-sync adicionam processamento. Telcel eligibility e chamada externa adicional.', action: 'Cachear OAuth token entre invocacoes. Otimizar catalog-sync para executar em horarios de baixa demanda. Avaliar se Telcel pode ser assincrono.' },
      },
      errorFree: {
        es: { context: 'Errores de Nestle Backend APIs (OAuth expirado, catalogo no disponible, presales rechazado) y Telcel API llegan al usuario.', desc: 'Fallos de OAuth generan errores en cadena. Telcel eligibility puede rechazar usuario elegible por timeout. Customer validation puede fallar si datos no coinciden.', action: 'Retry automatico para OAuth expirado. Reformular errores de Telcel a mensajes informativos. Mejorar Customer validation con sugerencias de correccion.' },
        en: { context: 'Nestle Backend API errors (expired OAuth, unavailable catalog, rejected presales) and Telcel API reach user.', desc: 'OAuth failures generate cascading errors. Telcel eligibility may reject eligible user due to timeout. Customer validation can fail if data mismatch.', action: 'Auto-retry for expired OAuth. Rewrite Telcel errors to informative messages. Improve Customer validation with correction suggestions.' },
        pt: { context: 'Erros das Nestle Backend APIs (OAuth expirado, catalogo indisponivel, presales rejeitado) e Telcel API chegam ao usuario.', desc: 'Falhas de OAuth geram erros em cascata. Telcel eligibility pode rejeitar usuario elegivel por timeout. Customer validation pode falhar se dados nao coincidem.', action: 'Retry automatico para OAuth expirado. Reformular erros de Telcel para mensagens informativas. Melhorar Customer validation com sugestoes de correcao.' },
      },
      stabilityProxy: {
        es: { context: 'Cadena compleja: Nestle Backend APIs (3 endpoints) + Telcel API + 5 Cloud Functions + Headless Commerce.', desc: 'Dependencia doble: Nestle Backend (comercio) + Telcel (rewards). Si Nestle Backend cae, no hay catalogo ni pedidos. Si Telcel cae, rewards no funcionan.', action: 'Circuit breaker independiente para Nestle Backend y Telcel. Modo degradado: comercio sin rewards si Telcel no responde.' },
        en: { context: 'Complex chain: Nestle Backend APIs (3 endpoints) + Telcel API + 5 Cloud Functions + Headless Commerce.', desc: 'Double dependency: Nestle Backend (commerce) + Telcel (rewards). If Nestle Backend down, no catalog or orders. If Telcel down, rewards unavailable.', action: 'Independent circuit breaker for Nestle Backend and Telcel. Degraded mode: commerce without rewards if Telcel unresponsive.' },
        pt: { context: 'Cadeia complexa: Nestle Backend APIs (3 endpoints) + Telcel API + 5 Cloud Functions + Headless Commerce.', desc: 'Dependencia dupla: Nestle Backend (comercio) + Telcel (rewards). Se Nestle Backend cair, nao ha catalogo nem pedidos. Se Telcel cair, rewards indisponiveis.', action: 'Circuit breaker independente para Nestle Backend e Telcel. Modo degradado: comercio sem rewards se Telcel nao responder.' },
      },
      },
    },
  "wa-pd1665-pdc-codisa": {
    name: "PDC Codisa",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Guatemala. 40 activities/534 components. Flujo hibrido (deterministic + hybrid). AI agents: Custom Agent 01, Custom Agent 02, Especializado, Prime, 48hrs, custom-especializado-prime-48hrs. Sin ORIS. Comercio conversacional PDC/Codisa Guatemala (distribucion de consumo masivo). Incluye Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracion.',
      en: 'B2B WhatsApp bot Guatemala. 40 activities/534 components. Hybrid flow (deterministic + hybrid). AI agents: Custom Agent 01, Custom Agent 02, Especializado, Prime, 48hrs, custom-especializado-prime-48hrs. No ORIS. PDC/Codisa Guatemala conversational commerce (FMCG distribution). Includes Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integrates Headless Commerce (order webview), integration webhooks.',
      pt: 'Bot B2B WhatsApp Guatemala. 40 activities/534 components. Fluxo hibrido (deterministic + hybrid). AI agents: Custom Agent 01, Custom Agent 02, Especializado, Prime, 48hrs, custom-especializado-prime-48hrs. Sem ORIS. Comercio conversacional PDC/Codisa Guatemala (distribuicao de consumo massivo). Inclui Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracao.',
    },
    insights: {},
  },
  "wa-pd1665-pdc-codisa-el-salvador": {
    name: "PDC Codisa SV",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp El Salvador. 32 activities/635 components. Flujo hibrido (deterministic + hybrid). AI agent: Custom Agent 01. Sin ORIS. Comercio conversacional PDC/Codisa El Salvador (distribucion de consumo masivo). Incluye Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracion.',
      en: 'B2B WhatsApp bot El Salvador. 32 activities/635 components. Hybrid flow (deterministic + hybrid). AI agent: Custom Agent 01. No ORIS. PDC/Codisa El Salvador conversational commerce (FMCG distribution). Includes Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integrates Headless Commerce (order webview), integration webhooks.',
      pt: 'Bot B2B WhatsApp El Salvador. 32 activities/635 components. Fluxo hibrido (deterministic + hybrid). AI agent: Custom Agent 01. Sem ORIS. Comercio conversacional PDC/Codisa El Salvador (distribuicao de consumo massivo). Inclui Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracao.',
    },
    insights: {},
  },
  "wa-pd2191-pdc-lakasa-peru": {
    name: "PDC Lakasa Peru",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Peru. 23 activities/309 components. Flujo hibrido (deterministic + hybrid). AI agent: Custom Agent 01. Sin ORIS. Comercio conversacional PDC/Lakasa Peru (distribucion de consumo masivo). Incluye Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracion.',
      en: 'B2B WhatsApp bot Peru. 23 activities/309 components. Hybrid flow (deterministic + hybrid). AI agent: Custom Agent 01. No ORIS. PDC/Lakasa Peru conversational commerce (FMCG distribution). Includes Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integrates Headless Commerce (order webview), integration webhooks.',
      pt: 'Bot B2B WhatsApp Peru. 23 activities/309 components. Fluxo hibrido (deterministic + hybrid). AI agent: Custom Agent 01. Sem ORIS. Comercio conversacional PDC/Lakasa Peru (distribuicao de consumo massivo). Inclui Home, Hacer un Pedido, Pedidos Pendientes, Multi Add To Cart, One Chat Buy, Mis Promociones, Customer Validation, TyC, Sales Desk, CSAT, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracao.',
    },
    insights: {},
  },
  "pepsico-chile": {
    name: "Pepsico Chile",
    hasOris: false,
    type: { es: "Bot B2B Chile (Pepsico)", en: "B2B Chile bot (Pepsico)", pt: "Bot B2B Chile (Pepsico)" },
    insights: {},
  },
  "wa-pe1786-pepsico-col": {
    name: "Pepsico Colombia",
    hasOris: false,
    type: { es: "Bot B2B Colombia (Pepsico)", en: "B2B Colombia bot (Pepsico)", pt: "Bot B2B Colombia (Pepsico)" },
    insights: {},
  },
  "wa-pe2347-pepsico-peru-prd": {
    name: "Pepsico Peru",
    hasOris: false,
    type: { es: "Bot B2B Peru (Pepsico)", en: "B2B Peru bot (Pepsico)", pt: "Bot B2B Peru (Pepsico)" },
    insights: {},
  },
  "wa-pe2101-pepsico-rep-dominicana": {
    name: "Pepsico RD",
    hasOris: false,
    type: { es: "Bot B2B Rep. Dominicana (Pepsico)", en: "B2B Dominican Republic bot (Pepsico)", pt: "Bot B2B Rep. Dominicana (Pepsico)" },
    insights: {},
  },
  "wa-pr1764-profarco-pgy": {
      name: "Profarco Paraguay",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Paraguay. 33 activities/422 components. Flujo hibrido (deterministic + hybrid). AI agent: Custom Agent- Profarco. Sin ORIS. Comercio conversacional Profarco Paraguay (distribucion farmaceutica). Incluye Home, Make Order, Last Order, Order Status, Customer Validation, TyC, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracion.',
        en: 'B2B WhatsApp bot Paraguay. 33 activities/422 components. Hybrid flow (deterministic + hybrid). AI agent: Custom Agent- Profarco. No ORIS. Profarco Paraguay conversational commerce (pharmaceutical distribution). Includes Home, Make Order, Last Order, Order Status, Customer Validation, TyC, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integrates Headless Commerce (order webview), integration webhooks.',
        pt: 'Bot B2B WhatsApp Paraguai. 33 activities/422 components. Fluxo hibrido (deterministic + hybrid). AI agent: Custom Agent- Profarco. Sem ORIS. Comercio conversacional Profarco Paraguai (distribuicao farmaceutica). Inclui Home, Make Order, Last Order, Order Status, Customer Validation, TyC, Payment Methods, Sales Desk, CSAT, Smalltalk, Campanhas. Integra Headless Commerce (webview pedidos), webhooks de integracao.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      fallbackQuality: {
          es: {
            context: "Datos de catalogo sincronizados via SFTP periodicamente. Productos desactualizados entre sincronizaciones generan fallbacks legitimos.",
            desc: "Cuando la sincronizacion SFTP tiene retraso, productos recien agregados o cambios de precio no estan disponibles. El bot responde con fallback porque los datos no existen aun.",
            action: "Verificar frecuencia de sincronizacion SFTP y monitorear errores. Agregar respuestas especificas para \'producto no encontrado temporalmente\'.",
          },
          en: {
            context: "Catalog data synced via SFTP periodically. Outdated products between syncs generate legitimate fallbacks.",
            desc: "When SFTP sync is delayed, newly added products or price changes are unavailable. Bot responds with fallback because data does not exist yet.",
            action: "Verify SFTP sync frequency and monitor errors. Add specific responses for \'product temporarily not found\'.",
          },
          pt: {
            context: "Dados de catalogo sincronizados via SFTP periodicamente. Produtos desatualizados entre sincronizacoes geram fallbacks legitimos.",
            desc: "Quando a sincronizacao SFTP esta atrasada, produtos recem adicionados ou mudancas de preco nao estao disponiveis. Bot responde com fallback porque dados ainda nao existem.",
            action: "Verificar frequencia de sincronizacao SFTP e monitorar erros. Adicionar respostas especificas para \'produto temporariamente nao encontrado\'.",
          },
        },
      },
    },
  "wa-pr1781-pronaca": {
      name: "Pronaca",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Ecuador. 32 activities/498 components. Flujo hibrido (deterministic + AI). 2 Custom Agents (Knowledge Genies, FAQ recetas). Sin ORIS. Comercio conversacional Pronaca (alimentos Ecuador). Incluye Home, Make Order, One Chat Buy, Knowledge Genies, Campanhas, CSAT, Smalltalk, Yalo Force, Perfilador, Matriculacion. Integra KnowledgeGenie, audiencias, notificaciones, webhooks.',
        en: 'B2B WhatsApp bot Ecuador. 32 activities/498 components. Hybrid flow (deterministic + AI). 2 Custom Agents (Knowledge Genies, FAQ recipes). No ORIS. Pronaca conversational commerce (food Ecuador). Includes Home, Make Order, One Chat Buy, Knowledge Genies, Campaigns, CSAT, Smalltalk, Yalo Force, Profiler, Enrollment. Integrates KnowledgeGenie, audiences, notifications, webhooks.',
        pt: 'Bot B2B WhatsApp Equador. 32 activities/498 components. Fluxo hibrido (deterministic + AI). 2 Custom Agents (Knowledge Genies, FAQ receitas). Sem ORIS. Comercio conversacional Pronaca (alimentos Equador). Inclui Home, Make Order, One Chat Buy, Knowledge Genies, Campanhas, CSAT, Smalltalk, Yalo Force, Perfilador, Matriculacao. Integra KnowledgeGenie, audiencias, notificacoes, webhooks.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      fallbackQuality: {
          es: {
            context: "Datos de catalogo sincronizados via SFTP periodicamente. Productos desactualizados entre sincronizaciones generan fallbacks legitimos.",
            desc: "Cuando la sincronizacion SFTP tiene retraso, productos recien agregados o cambios de precio no estan disponibles. El bot responde con fallback porque los datos no existen aun.",
            action: "Verificar frecuencia de sincronizacion SFTP y monitorear errores. Agregar respuestas especificas para \'producto no encontrado temporalmente\'.",
          },
          en: {
            context: "Catalog data synced via SFTP periodically. Outdated products between syncs generate legitimate fallbacks.",
            desc: "When SFTP sync is delayed, newly added products or price changes are unavailable. Bot responds with fallback because data does not exist yet.",
            action: "Verify SFTP sync frequency and monitor errors. Add specific responses for \'product temporarily not found\'.",
          },
          pt: {
            context: "Dados de catalogo sincronizados via SFTP periodicamente. Produtos desatualizados entre sincronizacoes geram fallbacks legitimos.",
            desc: "Quando a sincronizacao SFTP esta atrasada, produtos recem adicionados ou mudancas de preco nao estao disponiveis. Bot responde com fallback porque dados ainda nao existem.",
            action: "Verificar frequencia de sincronizacao SFTP e monitorar erros. Adicionar respostas especificas para \'produto temporariamente nao encontrado\'.",
          },
        },
      },
    },
  "wa-pr1905-proan": {
      name: "Proan",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 22 activities/273 components. Flujo hibrido (deterministic + AI). 3 Custom Agents (Home, FAQ). Sin ORIS. Comercio conversacional Proan Mexico. Incluye Home, Customer Validation, One Chat Buy, Multi ATC, Carrusel ATC, Sales Desk, CSAT, KG FAQs, Yalo Force, Perfilador, Campanhas. Integra KnowledgeGenie, campanhas, webhooks.',
        en: 'B2B WhatsApp bot Mexico. 22 activities/273 components. Hybrid flow (deterministic + AI). 3 Custom Agents (Home, FAQ). No ORIS. Proan Mexico conversational commerce. Includes Home, Customer Validation, One Chat Buy, Multi ATC, Carousel ATC, Sales Desk, CSAT, KG FAQs, Yalo Force, Profiler, Campaigns. Integrates KnowledgeGenie, campaigns, webhooks.',
        pt: 'Bot B2B WhatsApp Mexico. 22 activities/273 components. Fluxo hibrido (deterministic + AI). 3 Custom Agents (Home, FAQ). Sem ORIS. Comercio conversacional Proan Mexico. Inclui Home, Customer Validation, One Chat Buy, Multi ATC, Carrusel ATC, Sales Desk, CSAT, KG FAQs, Yalo Force, Perfilador, Campanhas. Integra KnowledgeGenie, campanhas, webhooks.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      efficiencyLoops: {
          es: {
            context: "Este bot usa Yalo Force (vendedores) que generan sesiones multi-cliente. Los \'loops\' detectados son navegacion normal, no errores.",
            desc: "Vendedores de Yalo Force navegan multiples clientes en una sesion, explorando catalogo extensamente. El evaluador marca esto como loops repetitivos, pero es comportamiento de compra esperado.",
            action: "Separar sesiones de Yalo Force del analisis general. Investigar loops reales: usuario que repite la misma pregunta 2+ veces sin respuesta diferente.",
          },
          en: {
            context: "This bot uses Yalo Force (salespeople) generating multi-client sessions. Detected \'loops\' are normal navigation, not errors.",
            desc: "Yalo Force salespeople navigate multiple clients in one session, exploring catalog extensively. Evaluator marks as repetitive loops, but is expected shopping behavior.",
            action: "Separate Yalo Force sessions from general analysis. Investigate real loops: user repeating same question 2+ times without different response.",
          },
          pt: {
            context: "Este bot usa Yalo Force (vendedores) que geram sessoes multi-cliente. Os \'loops\' detectados sao navegacao normal, nao erros.",
            desc: "Vendedores do Yalo Force navegam multiplos clientes em uma sessao, explorando catalogo extensamente. Avaliador marca como loops repetitivos, mas e comportamento de compra esperado.",
            action: "Separar sessoes do Yalo Force da analise geral. Investigar loops reais: usuario repetindo mesma pergunta 2+ vezes sem resposta diferente.",
          },
        },
      },
    },
  "wa-ra1675-raizen-flow": {
    name: "Raizen Flow",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Brasil. 21 activities/203 components. Flujo deterministic. Sin agentes AI. Sin ORIS. Comercio conversacional Raizen (Shell Lubes, combustibles Brasil). Incluye Home, Autenticacao, Catalogo Cinnamon, Pagamento, FAQ, List Orders, Boleto, DANFE, Leads, CSAT, Campanhas Shell Lubes. Integra campanhas, webhooks.',
      en: 'B2B WhatsApp bot Brazil. 21 activities/203 components. Deterministic flow. No AI agents. No ORIS. Raizen conversational commerce (Shell Lubes, fuel Brazil). Includes Home, Authentication, Cinnamon Catalog, Payment, FAQ, List Orders, Boleto, DANFE, Leads, CSAT, Shell Lubes Campaigns. Integrates campaigns, webhooks.',
      pt: 'Bot B2B WhatsApp Brasil. 21 activities/203 components. Fluxo deterministic. Sem agentes AI. Sem ORIS. Comercio conversacional Raizen (Shell Lubes, combustiveis Brasil). Inclui Home, Autenticacao, Catalogo Cinnamon, Pagamento, FAQ, List Orders, Boleto, DANFE, Leads, CSAT, Campanhas Shell Lubes. Integra campanhas, webhooks.',
    },
    insights: {},
  },
  "wa-ri1653-rica-mx-b2b": {
      name: "Rica MX B2B",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 39 activities/484 components. Flujo hibrido (deterministic + AI). 1 Custom Agent (FAQ). Sin ORIS. Comercio conversacional Rica Mexico (bebidas). Incluye Home, Validation, Make Order, Send Order, Last Order, Delivery Date, Payment, Multi ATC, Carrusel ATC, One Chat Buy, Sales Agent, CSAT, Yalo Force, Survey, Licencia Alcohol, Report Fridge. Integra audiencias, notificaciones, agent, campanhas, webhooks.',
        en: 'B2B WhatsApp bot Mexico. 39 activities/484 components. Hybrid flow (deterministic + AI). 1 Custom Agent (FAQ). No ORIS. Rica Mexico conversational commerce (beverages). Includes Home, Validation, Make Order, Send Order, Last Order, Delivery Date, Payment, Multi ATC, Carousel ATC, One Chat Buy, Sales Agent, CSAT, Yalo Force, Survey, Alcohol License, Report Fridge. Integrates audiences, notifications, agent, campaigns, webhooks.',
        pt: 'Bot B2B WhatsApp Mexico. 39 activities/484 components. Fluxo hibrido (deterministic + AI). 1 Custom Agent (FAQ). Sem ORIS. Comercio conversacional Rica Mexico (bebidas). Inclui Home, Validation, Make Order, Send Order, Last Order, Delivery Date, Payment, Multi ATC, Carrusel ATC, One Chat Buy, Sales Agent, CSAT, Yalo Force, Survey, Licencia Alcohol, Report Fridge. Integra audiencias, notificacoes, agent, campanhas, webhooks.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      },
    },
  "wa-su1932-production-sukarnemx": {
    name: "Sukarne MX",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Mexico. 58 activities/1626 components. Flujo deterministic. Sin agentes AI. Sin ORIS. Comercio conversacional Sukarne Mexico (carnes, distribucion). Incluye Home, Make Order, Send Order, Previous Orders, Order Status, Delivery Date, Payment, Commerce, Multi ATC, Carrusel ATC, One Chat Buy, Customer Validation, Sales Desk, CSAT, Yalo Force, Human Agent, Credito, Salesforce Chat, Campanhas, Autoprospeccion, Encuestas. Integra KnowledgeGenie, campanhas, webhooks.',
      en: 'B2B WhatsApp bot Mexico. 58 activities/1626 components. Deterministic flow. No AI agents. No ORIS. Sukarne Mexico conversational commerce (meat, distribution). Includes Home, Make Order, Send Order, Previous Orders, Order Status, Delivery Date, Payment, Commerce, Multi ATC, Carousel ATC, One Chat Buy, Customer Validation, Sales Desk, CSAT, Yalo Force, Human Agent, Credit, Salesforce Chat, Campaigns, Auto-prospecting, Surveys. Integrates KnowledgeGenie, campaigns, webhooks.',
      pt: 'Bot B2B WhatsApp Mexico. 58 activities/1626 components. Fluxo deterministic. Sem agentes AI. Sem ORIS. Comercio conversacional Sukarne Mexico (carnes, distribuicao). Inclui Home, Make Order, Send Order, Previous Orders, Order Status, Delivery Date, Payment, Commerce, Multi ATC, Carrusel ATC, One Chat Buy, Customer Validation, Sales Desk, CSAT, Yalo Force, Human Agent, Credito, Salesforce Chat, Campanhas, Autoprospeccao, Pesquisas. Integra KnowledgeGenie, campanhas, webhooks.',
    },
    insights: {},
  },
  "wa-to2105-socios-tosticentro-mx-prd": {
    name: "Tosticentro MX",
    hasOris: false,
    type: {
      es: 'Bot B2B WhatsApp Mexico. 26 activities/557 components. Flujo deterministic. Sin agentes AI. Sin ORIS. Comercio conversacional Socios Tosticentro Mexico (snacks, programa socios Bahia). Incluye Home, Make Order, Send Order, Payment Methods, Delivery Date, Customer Validation, Multi ATC, One Chat Buy, Carrusel ATC, Sales Desk, CSAT, Yalo Force, Perfilador, Referidos Bahia, Registro Bahia, FAQs, Recetas Bahia. Integra Tosticentro API, Socios Tosticentro API, Grupo Nieto API, GCP Cloud Functions, KnowledgeGenie, SalesDesk, campanhas, webhooks.',
      en: 'B2B WhatsApp bot Mexico. 26 activities/557 components. Deterministic flow. No AI agents. No ORIS. Socios Tosticentro Mexico conversational commerce (snacks, Bahia loyalty program). Includes Home, Make Order, Send Order, Payment Methods, Delivery Date, Customer Validation, Multi ATC, One Chat Buy, Carousel ATC, Sales Desk, CSAT, Yalo Force, Profiler, Bahia Referrals, Bahia Registration, FAQs, Bahia Recipes. Integrates Tosticentro API, Socios Tosticentro API, Grupo Nieto API, GCP Cloud Functions, KnowledgeGenie, SalesDesk, campaigns, webhooks.',
      pt: 'Bot B2B WhatsApp Mexico. 26 activities/557 components. Fluxo deterministic. Sem agentes AI. Sem ORIS. Comercio conversacional Socios Tosticentro Mexico (snacks, programa socios Bahia). Inclui Home, Make Order, Send Order, Payment Methods, Delivery Date, Customer Validation, Multi ATC, One Chat Buy, Carrusel ATC, Sales Desk, CSAT, Yalo Force, Perfilador, Referidos Bahia, Registro Bahia, FAQs, Receitas Bahia. Integra Tosticentro API, Socios Tosticentro API, Grupo Nieto API, GCP Cloud Functions, KnowledgeGenie, SalesDesk, campanhas, webhooks.',
    },
    insights: {},
  },
  "wa-si2185-sirvis-italy": {
      name: "Sirvis Italy",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Italia. 10 activities/165 components. Flujo hibrido (deterministic + AI). 6 Custom Agents (Home, Menu, Commerce Post Oris, FAQ Agent). Sin ORIS. Comercio conversacional Sirvis Italia. Incluye Home, Authentication, Menu, Commerce Post Oris, FAQ Agent, End of Journey, Active NPS, Sales Agent Oris, Commerce Template. Integra agent, campanhas, webhooks.',
        en: 'B2B WhatsApp bot Italy. 10 activities/165 components. Hybrid flow (deterministic + AI). 6 Custom Agents (Home, Menu, Commerce Post Oris, FAQ Agent). No ORIS. Sirvis Italy conversational commerce. Includes Home, Authentication, Menu, Commerce Post Oris, FAQ Agent, End of Journey, Active NPS, Sales Agent Oris, Commerce Template. Integrates agent, campaigns, webhooks.',
        pt: 'Bot B2B WhatsApp Italia. 10 activities/165 components. Fluxo hibrido (deterministic + AI). 6 Custom Agents (Home, Menu, Commerce Post Oris, FAQ Agent). Sem ORIS. Comercio conversacional Sirvis Italia. Inclui Home, Authentication, Menu, Commerce Post Oris, FAQ Agent, End of Journey, Active NPS, Sales Agent Oris, Commerce Template. Integra agent, campanhas, webhooks.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      fallbackQuality: {
          es: {
            context: "Datos de catalogo sincronizados via SFTP periodicamente. Productos desactualizados entre sincronizaciones generan fallbacks legitimos.",
            desc: "Cuando la sincronizacion SFTP tiene retraso, productos recien agregados o cambios de precio no estan disponibles. El bot responde con fallback porque los datos no existen aun.",
            action: "Verificar frecuencia de sincronizacion SFTP y monitorear errores. Agregar respuestas especificas para \'producto no encontrado temporalmente\'.",
          },
          en: {
            context: "Catalog data synced via SFTP periodically. Outdated products between syncs generate legitimate fallbacks.",
            desc: "When SFTP sync is delayed, newly added products or price changes are unavailable. Bot responds with fallback because data does not exist yet.",
            action: "Verify SFTP sync frequency and monitor errors. Add specific responses for \'product temporarily not found\'.",
          },
          pt: {
            context: "Dados de catalogo sincronizados via SFTP periodicamente. Produtos desatualizados entre sincronizacoes geram fallbacks legitimos.",
            desc: "Quando a sincronizacao SFTP esta atrasada, produtos recem adicionados ou mudancas de preco nao estao disponiveis. Bot responde com fallback porque dados ainda nao existem.",
            action: "Verificar frequencia de sincronizacao SFTP e monitorar erros. Adicionar respostas especificas para \'produto temporariamente nao encontrado\'.",
          },
        },
      },
    },
  "wa-un2089-blito": {
      name: "Blito (Unilever)",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 20 activities/413 components. Flujo deterministic. Sin agentes AI. Sin ORIS. Plataforma Blito para representantes de ventas Kibon (Unilever Brasil). Incluye Home, Auth Sales Rep, Boletos e Cobrancas, Boost Order, Check-in, Cleaning, Order History, Planogram, Trax, Freezer, Checklist, Check-out, Daily Route, Customer Data, Orders, Sales Desk, Performance Report. Integra SalesDesk, webhooks.',
        en: 'B2B WhatsApp bot Brazil. 20 activities/413 components. Deterministic flow. No AI agents. No ORIS. Blito platform for Kibon ice cream sales representatives (Unilever Brazil). Includes Home, Auth Sales Rep, Boletos & Collections, Boost Order, Check-in, Cleaning, Order History, Planogram, Trax, Freezer, Checklist, Check-out, Daily Route, Customer Data, Orders, Sales Desk, Performance Report. Integrates SalesDesk, webhooks.',
        pt: 'Bot B2B WhatsApp Brasil. 20 activities/413 components. Fluxo deterministic. Sem agentes AI. Sem ORIS. Plataforma Blito para representantes de vendas Kibon (Unilever Brasil). Inclui Home, Auth Sales Rep, Boletos e Cobrancas, Boost Order, Check-in, Cleaning, Order History, Planogram, Trax, Freezer, Checklist, Check-out, Daily Route, Customer Data, Orders, Sales Desk, Performance Report. Integra SalesDesk, webhooks.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      },
    },
  "wa-un2089-kiki-production": {
      name: "Kiki (Unilever)",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 29 activities/405 components. Flujo deterministic. Sin agentes AI. Sin ORIS. Plataforma Kiki para tenderos Kibon (Unilever Brasil). Incluye Home, Auth Store Owner, Menu Store Owner, Commerce Pre/Post, Knowledge Genie, Payment Method, Sales Desk, CSAT, Tabela de Precos, Profiler, Menu Freezer, Campanhas, Sales Agent Oris, Tamo Junto, Boletos e Cobrancas, Meus Pedidos. Integra KnowledgeGenie, SalesDesk, agent, campanhas, webhooks.',
        en: 'B2B WhatsApp bot Brazil. 29 activities/405 components. Deterministic flow. No AI agents. No ORIS. Kiki platform for Kibon ice cream store owners (Unilever Brazil). Includes Home, Auth Store Owner, Menu Store Owner, Commerce Pre/Post, Knowledge Genie, Payment Method, Sales Desk, CSAT, Price Table, Profiler, Freezer Menu, Campaigns, Sales Agent Oris, Tamo Junto, Boletos & Collections, My Orders. Integrates KnowledgeGenie, SalesDesk, agent, campaigns, webhooks.',
        pt: 'Bot B2B WhatsApp Brasil. 29 activities/405 components. Fluxo deterministic. Sem agentes AI. Sem ORIS. Plataforma Kiki para lojistas Kibon (Unilever Brasil). Inclui Home, Auth Store Owner, Menu Store Owner, Commerce Pre/Post, Knowledge Genie, Payment Method, Sales Desk, CSAT, Tabela de Precos, Profiler, Menu Freezer, Campanhas, Sales Agent Oris, Tamo Junto, Boletos e Cobrancas, Meus Pedidos. Integra KnowledgeGenie, SalesDesk, agent, campanhas, webhooks.',
      },
      insights: {
        closureRate: {
          es: {
            context: "Los usuarios B2B completan su pedido y dejan de responder. Patron normal en flujos transaccionales B2B recurrentes.",
            desc: "El flujo no tiene un paso de despedida explicito post-pedido. Los usuarios terminan su transaccion y abandonan la conversacion sin cierre linguistico, comportamiento esperado en B2B.",
            action: "Agregar mensaje de confirmacion final con cierre explicito: \'Tu pedido fue enviado correctamente. Hasta la proxima!\' para generar el patron que CIE reconoce como closure.",
          },
          en: {
            context: "B2B users complete their order and stop responding. Normal pattern in recurring B2B transactional flows.",
            desc: "The flow has no explicit farewell step post-order. Users finish their transaction and leave without linguistic closure, expected behavior in B2B.",
            action: "Add final confirmation message with explicit closing: \'Your order has been sent successfully. See you next time!\' to generate the pattern CIE recognizes as closure.",
          },
          pt: {
            context: "Usuarios B2B completam seu pedido e param de responder. Padrao normal em fluxos B2B transacionais recorrentes.",
            desc: "O fluxo nao tem etapa de despedida explicita apos o pedido. Usuarios finalizam a transacao e abandonam a conversa sem encerramento linguistico, comportamento esperado em B2B.",
            action: "Adicionar mensagem de confirmacao final com encerramento explicito: \'Seu pedido foi enviado com sucesso. Ate a proxima!\' para gerar o padrao que o CIE reconhece como closure.",
          },
        },
      stabilityProxy: {
          es: {
            context: "La eficiencia conversacional es penalizada por la longitud obligatoria del flujo B2B (autenticacion, catalogo, carrito, confirmacion).",
            desc: "Cada pedido requiere multiples turnos de conversacion por diseno. Esto reduce el score de eficiencia vs bots mas cortos, pero no indica un problema real.",
            action: "Optimizar pasos donde sea posible: opcion de repetir ultimo pedido para usuarios recurrentes, mensajes de confirmacion mas concisos.",
          },
          en: {
            context: "Conversational efficiency is penalized by the mandatory B2B ordering flow length (auth, catalog, cart, confirmation).",
            desc: "Each order requires multiple conversation turns by design. This reduces efficiency score vs shorter bots, but does not indicate a real problem.",
            action: "Optimize steps where possible: repeat last order option for recurring users, more concise confirmation messages.",
          },
          pt: {
            context: "A eficiencia conversacional e penalizada pelo comprimento obrigatorio do fluxo B2B (autenticacao, catalogo, carrinho, confirmacao).",
            desc: "Cada pedido requer multiplos turnos de conversa por design. Isso reduz o score de eficiencia vs bots mais curtos, mas nao indica um problema real.",
            action: "Otimizar etapas onde possivel: opcao repetir ultimo pedido para usuarios recorrentes, mensagens de confirmacao mais concisas.",
          },
        },
      latency: {
          es: {
            context: "La latencia incluye llamadas al backend externo (SAP). Cada operacion requiere autenticacion + consulta (doble round-trip), arquitectural.",
            desc: "Latencias elevadas provienen de la integracion con SAP: autenticacion previa, consultas de catalogo/precios y envio de pedidos. Cold starts suman tiempo extra.",
            action: "Evaluar cache de tokens entre invocaciones para eliminar login repetido. Implementar cache de catalogo con TTL corto. Pre-calentar Cloud Functions en horarios pico.",
          },
          en: {
            context: "Latency includes calls to external backend (SAP). Each operation requires auth + query (double round-trip), architectural.",
            desc: "High latencies come from SAP integration: prior auth, catalog/price queries, and order submission. Cold starts add extra time.",
            action: "Evaluate token caching between invocations to eliminate repeated login. Implement catalog cache with short TTL. Warm up Cloud Functions during peak hours.",
          },
          pt: {
            context: "A latencia inclui chamadas ao backend externo (SAP). Cada operacao requer autenticacao + consulta (dupla ida e volta), arquitetural.",
            desc: "Latencias elevadas vem da integracao com SAP: autenticacao previa, consultas de catalogo/precos e envio de pedidos. Cold starts adicionam tempo extra.",
            action: "Avaliar cache de tokens entre invocacoes para eliminar login repetido. Implementar cache de catalogo com TTL curto. Pre-aquecer Cloud Functions em horarios de pico.",
          },
        },
      errorFree: {
          es: {
            context: "Errores del backend (SAP) como validaciones de negocio y sesiones expiradas llegan al usuario pero no son errores del bot.",
            desc: "Respuestas de error del SAP (cantidad minima, cliente no encontrado, sin stock) se muestran como errores del asistente. El evaluador las marca como error_detected pero el bot funciona correctamente.",
            action: "Reformular mensajes de error de negocio a tono informativo: \'La cantidad minima es X unidades\' en vez de \'Error: Cantidad minima no cumplida\'.",
          },
          en: {
            context: "Backend errors (SAP) like business validations and expired sessions reach the user but are not bot errors.",
            desc: "SAP error responses (minimum quantity, customer not found, out of stock) shown as assistant errors. Evaluator marks as error_detected but bot works correctly.",
            action: "Rewrite business error messages to informative tone: \'Minimum quantity is X units\' instead of \'Error: Minimum quantity not met\'.",
          },
          pt: {
            context: "Erros do backend (SAP) como validacoes de negocio e sessoes expiradas chegam ao usuario mas nao sao erros do bot.",
            desc: "Respostas de erro do SAP (quantidade minima, cliente nao encontrado, sem estoque) mostrados como erros do assistente. Avaliador marca como error_detected mas o bot funciona corretamente.",
            action: "Reformular mensagens de erro de negocio para tom informativo: \'A quantidade minima e X unidades\' em vez de \'Erro: Quantidade minima nao atingida\'.",
          },
        },
      friction: {
          es: {
            context: "La latencia de integracion con SAP y respuestas negativas del sistema generan senales de friccion que no son problemas conversacionales.",
            desc: "Respuestas negativas del backend (sin entrega, pedido rechazado) son correctas pero el evaluador las marca como friccion. Mensajes con \'Lo sentimos\' elevan agent_apology.",
            action: "Reformular mensajes que empiecen con \'Lo sentimos\' a tono informativo neutral. Agregar indicadores de espera durante llamadas al backend.",
          },
          en: {
            context: "Integration latency with SAP and negative system responses generate friction signals that are not conversational problems.",
            desc: "Negative backend responses (no delivery, rejected order) are correct but evaluator marks as friction. Messages with \'Sorry\' raise agent_apology.",
            action: "Rewrite messages starting with \'Sorry\' to neutral informative tone. Add wait indicators during backend calls.",
          },
          pt: {
            context: "A latencia de integracao com SAP e respostas negativas do sistema geram sinais de friccao que nao sao problemas conversacionais.",
            desc: "Respostas negativas do backend (sem entrega, pedido rejeitado) sao corretas mas o avaliador marca como friccao. Mensagens com \'Desculpe\' elevam agent_apology.",
            action: "Reformular mensagens com \'Desculpe\' para tom informativo neutro. Adicionar indicadores de espera durante chamadas ao backend.",
          },
        },
      },
    },
  "wa-un2093-unilever-ecu-ice-b2b2c": {
    name: "Unilever ECU ICE",
    hasOris: false,
    type: { es: "Bot B2B2C Ecuador (Unilever ICE)", en: "B2B2C Ecuador bot (Unilever ICE)", pt: "Bot B2B2C Equador (Unilever ICE)" },
    insights: {},
  },
    "ln-su2319-suntory": {
      name: "Suntory TH",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Tailandia. Plataforma de comercio para Suntory Thailand (bebidas). Flujo hibrido con 22 activities y 274 componentes. Agentes IA: Sales Agent ORIS P1, FAQs Suntory CA. Integra SFTP (productos/clientes/promociones), Redis Cache, PubSub (send-order-consumer), GCP Cloud Functions (addon-catalog con precios dinamicos, promotions-active-addon, sync-commerce-entity). Commerce Webview + Headless Commerce. Actividades clave: make-order, send-order, One Click Buy, Sales Genie ORIS P1, CSAT, promotions catalog.',
        en: 'B2B WhatsApp bot Thailand. Commerce platform for Suntory Thailand (beverages). Hybrid flow with 22 activities and 274 components. AI Agents: Sales Agent ORIS P1, FAQs Suntory CA. Integrates SFTP (products/customers/promotions), Redis Cache, PubSub (send-order-consumer), GCP Cloud Functions (addon-catalog with dynamic pricing, promotions-active-addon, sync-commerce-entity). Commerce Webview + Headless Commerce. Key activities: make-order, send-order, One Click Buy, Sales Genie ORIS P1, CSAT, promotions catalog.',
        pt: 'Bot B2B WhatsApp Tailandia. Plataforma de comercio para Suntory Thailand (bebidas). Fluxo hibrido com 22 atividades e 274 componentes. Agentes IA: Sales Agent ORIS P1, FAQs Suntory CA. Integra SFTP (produtos/clientes/promocoes), Redis Cache, PubSub (send-order-consumer), GCP Cloud Functions (addon-catalog com precos dinamicos, promotions-active-addon, sync-commerce-entity). Commerce Webview + Headless Commerce. Atividades-chave: make-order, send-order, One Click Buy, Sales Genie ORIS P1, CSAT, catalogo de promocoes.',
      },
      insights: {
        closureRate: {
          es: { context: 'Tiendas B2B en Tailandia completan pedido de bebidas y dejan de responder. Patron normal en distribucion recurrente.', desc: 'El flujo tiene Commerce Webview para catalogo y pedido. Los usuarios terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar cierre post-pedido con resumen: \'Tu pedido fue enviado a Suntory. Fecha estimada de entrega: [fecha].\'' },
          en: { context: 'B2B stores in Thailand complete beverage order and stop responding. Normal pattern in recurring distribution.', desc: 'Flow has Commerce Webview for catalog and ordering. Users finish when confirming order without conversational closure.', action: 'Add post-order closing with summary: \'Your order was sent to Suntory. Estimated delivery date: [date].\'' },
          pt: { context: 'Lojas B2B na Tailandia completam pedido de bebidas e param de responder. Padrao normal em distribuicao recorrente.', desc: 'O fluxo tem Commerce Webview para catalogo e pedido. Usuarios terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar encerramento pos-pedido com resumo: \'Seu pedido foi enviado a Suntory. Data estimada de entrega: [data].\'' },
        },
        latency: {
          es: { context: 'La latencia incluye GCP Cloud Functions (addon-catalog con precios dinamicos por rango de fecha) + SFTP sync + Redis Cache + PubSub.', desc: 'Addon-catalog aplica logica de precios dinamicos con rango de fecha y stock management, agregando procesamiento. PubSub para send-order agrega latencia asíncrona.', action: 'Evaluar cache de precios dinamicos con TTL por rango de fecha. Optimizar addon-catalog para reducir procesamiento. Monitorear latencia de SFTP sync.' },
          en: { context: 'Latency includes GCP Cloud Functions (addon-catalog with dynamic date-range pricing) + SFTP sync + Redis Cache + PubSub.', desc: 'Addon-catalog applies dynamic pricing logic with date ranges and stock management, adding processing. PubSub for send-order adds async latency.', action: 'Evaluate dynamic pricing cache with TTL per date range. Optimize addon-catalog to reduce processing. Monitor SFTP sync latency.' },
          pt: { context: 'A latencia inclui GCP Cloud Functions (addon-catalog com precos dinamicos por faixa de data) + SFTP sync + Redis Cache + PubSub.', desc: 'Addon-catalog aplica logica de precos dinamicos com faixa de data e gestao de estoque, adicionando processamento. PubSub para send-order adiciona latencia assincrona.', action: 'Avaliar cache de precos dinamicos com TTL por faixa de data. Otimizar addon-catalog para reduzir processamento. Monitorar latencia de SFTP sync.' },
        },
        fallbackQuality: {
          es: { context: 'SFTP sincroniza productos, clientes y promociones via sync-commerce-entity. Si falla, datos quedan desactualizados.', desc: 'La sincronizacion SFTP para productos/clientes/promociones puede fallar silenciosamente. Redis cache de promociones ignoradas puede divergir.', action: 'Implementar monitoreo de frescura de datos SFTP. Alertar cuando sync tiene mas de 24h. Validar consistencia Redis vs SFTP.' },
          en: { context: 'SFTP syncs products, customers and promotions via sync-commerce-entity. If it fails, data becomes stale.', desc: 'SFTP sync for products/customers/promotions can fail silently. Redis cache of ignored promotions can diverge.', action: 'Implement SFTP data freshness monitoring. Alert when sync is more than 24h old. Validate Redis vs SFTP consistency.' },
          pt: { context: 'SFTP sincroniza produtos, clientes e promocoes via sync-commerce-entity. Se falhar, dados ficam desatualizados.', desc: 'A sincronizacao SFTP para produtos/clientes/promocoes pode falhar silenciosamente. Cache Redis de promocoes ignoradas pode divergir.', action: 'Implementar monitoramento de frescura de dados SFTP. Alertar quando sync tem mais de 24h. Validar consistencia Redis vs SFTP.' },
        },
        stabilityProxy: {
          es: { context: 'Cadena SFTP + Redis + PubSub + GCP Cloud Functions (5 funciones). Arquitectura con multiples capas de cache y sync.', desc: 'Redis como cache de sesiones y promociones es critico. Si Redis cae, sesiones se pierden y promociones no se aplican correctamente.', action: 'Implementar persistencia de sesion como fallback si Redis falla. Monitorear Redis memory y TTL de promociones.' },
          en: { context: 'SFTP + Redis + PubSub + GCP Cloud Functions (5 functions) chain. Architecture with multiple cache and sync layers.', desc: 'Redis as session and promotion cache is critical. If Redis goes down, sessions are lost and promotions are not applied correctly.', action: 'Implement session persistence as fallback if Redis fails. Monitor Redis memory and promotions TTL.' },
          pt: { context: 'Cadeia SFTP + Redis + PubSub + GCP Cloud Functions (5 funcoes). Arquitetura com multiplas camadas de cache e sync.', desc: 'Redis como cache de sessoes e promocoes e critico. Se Redis cair, sessoes sao perdidas e promocoes nao sao aplicadas corretamente.', action: 'Implementar persistencia de sessao como fallback se Redis falhar. Monitorar memoria Redis e TTL de promocoes.' },
        },
      },
    },
    "wa-yu1673-yupi-co-b2b": {
      name: "Yupi CO",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Colombia. 33 activities/415 components. Flujo deterministic. Sin agentes AI. Sin ORIS. Comercio conversacional Yupi Colombia (snacks). Incluye Home, Customer Validation, Make Order, Send Order, Last Order, Order Status, Delivery Date, Payment Methods, One Chat Buy, Multi ATC, Carrusel ATC, Sales Desk, CSAT, Yalo Force, FAQs, Registry, Webview Order, Order Tracking, DC Terms, Carrito Abandonado. Integra Headless Commerce, Commerce Webview, AWS Lambda, campanhas, webhooks.',
        en: 'B2B WhatsApp bot Colombia. 33 activities/415 components. Deterministic flow. No AI agents. No ORIS. Yupi Colombia conversational commerce (snacks). Includes Home, Customer Validation, Make Order, Send Order, Last Order, Order Status, Delivery Date, Payment Methods, One Chat Buy, Multi ATC, Carousel ATC, Sales Desk, CSAT, Yalo Force, FAQs, Registry, Webview Order, Order Tracking, DC Terms, Abandoned Cart. Integrates Headless Commerce, Commerce Webview, AWS Lambda, campaigns, webhooks.',
        pt: 'Bot B2B WhatsApp Colombia. 33 activities/415 components. Fluxo deterministic. Sem agentes AI. Sem ORIS. Comercio conversacional Yupi Colombia (snacks). Inclui Home, Customer Validation, Make Order, Send Order, Last Order, Order Status, Delivery Date, Payment Methods, One Chat Buy, Multi ATC, Carrusel ATC, Sales Desk, CSAT, Yalo Force, FAQs, Registry, Webview Order, Order Tracking, DC Terms, Carrinho Abandonado. Integra Headless Commerce, Commerce Webview, AWS Lambda, campanhas, webhooks.',
      },
      insights: {
        closureRate: {
          es: { context: 'Tenderos B2B completan pedido de snacks y dejan de responder. 33 activities disponibles.', desc: 'Multiples entry points via Commerce Webview y catalogo. Tenderos terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar cierre post-pedido con resumen de entrega y siguiente fecha de visita.' },
          en: { context: 'B2B retailers complete snack order and stop responding. 33 activities available.', desc: 'Multiple entry points via Commerce Webview and catalog. Retailers finish when confirming order without conversational closure.', action: 'Add post-order closing with delivery summary and next visit date.' },
          pt: { context: 'Lojistas B2B completam pedido de snacks e param de responder. 33 atividades disponiveis.', desc: 'Multiplos pontos de entrada via Commerce Webview e catalogo. Lojistas terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar encerramento pos-pedido com resumo de entrega e proxima data de visita.' },
        },
        stabilityProxy: {
          es: { context: 'Dependencia de Headless Commerce + Big Storage NG + AWS Lambda (YupicoService).', desc: 'Arquitectura relativamente sencilla sin ERP externo directo. YupicoService como Lambda es el punto principal de procesamiento.', action: 'Monitorear health de YupicoService Lambda. Mantener catalogo cacheado como fallback.' },
          en: { context: 'Dependency on Headless Commerce + Big Storage NG + AWS Lambda (YupicoService).', desc: 'Relatively simple architecture without direct external ERP. YupicoService Lambda is the main processing point.', action: 'Monitor YupicoService Lambda health. Keep cached catalog as fallback.' },
          pt: { context: 'Dependencia de Headless Commerce + Big Storage NG + AWS Lambda (YupicoService).', desc: 'Arquitetura relativamente simples sem ERP externo direto. YupicoService Lambda e o principal ponto de processamento.', action: 'Monitorar health do YupicoService Lambda. Manter catalogo cacheado como fallback.' },
        },
      },
    },
    "wa-ra1768-rabbit": {
      name: "Rabbit",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 30 activities/426 components. Flujo deterministic. Sin agentes AI. Sin ORIS. Comercio conversacional Rabbit Mexico. Incluye Home, Authentication, Make Order, Send Order, Last Order, Order History, Payment Method, Delivery Date, Sales Desk, CSAT, One Chat Buy, Multi ATC, Carrusel ATC, Yalo Force, Cupones, Recuperar Cuenta. Integra campanhas, webhooks.',
        en: 'B2B WhatsApp bot Mexico. 30 activities/426 components. Deterministic flow. No AI agents. No ORIS. Rabbit Mexico conversational commerce. Includes Home, Authentication, Make Order, Send Order, Last Order, Order History, Payment Method, Delivery Date, Sales Desk, CSAT, One Chat Buy, Multi ATC, Carousel ATC, Yalo Force, Coupons, Recover Account. Integrates campaigns, webhooks.',
        pt: 'Bot B2B WhatsApp Mexico. 30 activities/426 components. Fluxo deterministic. Sem agentes AI. Sem ORIS. Comercio conversacional Rabbit Mexico. Inclui Home, Authentication, Make Order, Send Order, Last Order, Order History, Payment Method, Delivery Date, Sales Desk, CSAT, One Chat Buy, Multi ATC, Carrusel ATC, Yalo Force, Cupoes, Recuperar Conta. Integra campanhas, webhooks.',
      },
      insights: {},
    },
    "wa-co1753-compre-ahora-mx": {
      name: "Compre Ahora MX",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Mexico. 31 activities/433 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent R1, Oris P1. Comercio conversacional para Compre Ahora Mexico (distribucion). Integra Keymonsoft API (keymon.net: autenticacion dinamica fecha-base64, pedidos, limites, clientes), Bocampana/TORO API, Headless Commerce, Big Storage NG, Firehose, Yalo Force.',
        en: 'B2B WhatsApp bot Mexico. 31 activities/433 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent R1, Oris P1. Conversational commerce for Compre Ahora Mexico (distribution). Integrates Keymonsoft API (keymon.net: dynamic date-base64 auth, orders, limits, customers), Bocampana/TORO API, Headless Commerce, Big Storage NG, Firehose, Yalo Force.',
        pt: 'Bot B2B WhatsApp Mexico. 31 activities/433 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent R1, Oris P1. Comercio conversacional para Compre Ahora Mexico (distribuicao). Integra Keymonsoft API (keymon.net: autenticacao dinamica data-base64, pedidos, limites, clientes), Bocampana/TORO API, Headless Commerce, Big Storage NG, Firehose, Yalo Force.',
      },
      insights: {
        closureRate: {
          es: { context: 'Clientes B2B hacen pedidos via Keymonsoft y Bocampana APIs. Dos sistemas de pedidos paralelos.', desc: 'El bot maneja dos backends de pedidos (Keymonsoft + Bocampana/TORO), lo que puede confundir metricas de cierre si una falla y la otra completa.', action: 'Segmentar closure por backend de pedido (Keymonsoft vs Bocampana). Agregar cierre explicito post-confirmacion.' },
          en: { context: 'B2B customers place orders via Keymonsoft and Bocampana APIs. Two parallel order systems.', desc: 'Bot handles two order backends (Keymonsoft + Bocampana/TORO), which can confuse closure metrics if one fails and the other completes.', action: 'Segment closure by order backend (Keymonsoft vs Bocampana). Add explicit post-confirmation closing.' },
          pt: { context: 'Clientes B2B fazem pedidos via Keymonsoft e Bocampana APIs. Dois sistemas de pedidos paralelos.', desc: 'O bot gerencia dois backends de pedidos (Keymonsoft + Bocampana/TORO), o que pode confundir metricas de fechamento se um falha e o outro completa.', action: 'Segmentar closure por backend de pedido (Keymonsoft vs Bocampana). Adicionar encerramento explicito pos-confirmacao.' },
        },
        latency: {
          es: { context: 'La latencia incluye Keymonsoft API (autenticacion dinamica fecha-base64) + Bocampana/TORO API (Basic Auth) + Headless Commerce.', desc: 'Keymonsoft requiere autenticacion con fecha actual en base64 antes de cada llamada. Bocampana tiene paginacion para promociones que agrega latencia.', action: 'Cachear token Keymonsoft entre invocaciones. Optimizar paginacion de promociones Bocampana. Pre-cargar catalogo.' },
          en: { context: 'Latency includes Keymonsoft API (dynamic date-base64 auth) + Bocampana/TORO API (Basic Auth) + Headless Commerce.', desc: 'Keymonsoft requires auth with current date in base64 before each call. Bocampana has pagination for promotions adding latency.', action: 'Cache Keymonsoft token between invocations. Optimize Bocampana promotions pagination. Pre-load catalog.' },
          pt: { context: 'A latencia inclui Keymonsoft API (autenticacao dinamica data-base64) + Bocampana/TORO API (Basic Auth) + Headless Commerce.', desc: 'Keymonsoft requer autenticacao com data atual em base64 antes de cada chamada. Bocampana tem paginacao para promocoes adicionando latencia.', action: 'Cachear token Keymonsoft entre invocacoes. Otimizar paginacao de promocoes Bocampana. Pre-carregar catalogo.' },
        },
        stabilityProxy: {
          es: { context: 'Dependencia doble: Keymonsoft API + Bocampana/TORO API + Headless Commerce.', desc: 'Dos backends externos independientes (Keymonsoft y Bocampana) son puntos de fallo separados. Si uno cae, parte de la funcionalidad se pierde.', action: 'Circuit breaker independiente para Keymonsoft y Bocampana. Modo degradado si uno no responde.' },
          en: { context: 'Double dependency: Keymonsoft API + Bocampana/TORO API + Headless Commerce.', desc: 'Two independent external backends (Keymonsoft and Bocampana) are separate failure points. If one goes down, partial functionality is lost.', action: 'Independent circuit breaker for Keymonsoft and Bocampana. Degraded mode if one unresponsive.' },
          pt: { context: 'Dependencia dupla: Keymonsoft API + Bocampana/TORO API + Headless Commerce.', desc: 'Dois backends externos independentes (Keymonsoft e Bocampana) sao pontos de falha separados. Se um cair, parte da funcionalidade se perde.', action: 'Circuit breaker independente para Keymonsoft e Bocampana. Modo degradado se um nao responder.' },
        },
      },
    },
    "wa-he1658-heineken-wa-mx-prd": {
      name: "Heineken MX",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. Plataforma de comercio conversacional para Heineken Mexico (cervezas/bebidas). 13 modulos activos.',
        en: 'B2B WhatsApp bot Mexico. Conversational commerce platform for Heineken Mexico (beer/beverages). 13 active modules.',
        pt: 'Bot B2B WhatsApp Mexico. Plataforma de comercio conversacional para Heineken Mexico (cervejas/bebidas). 13 modulos ativos.',
      },
      insights: {},
    },
    "wa-to2105-socios-tosticentro-prd": {
      name: "Tosticentro MX",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. Comercio conversacional para Socios Tosticentro Mexico. Integra Tosticentro API (autenticacion, pedidos en /clients/sales/orders, inventario en /inventory/products), Socios Tosticentro API (login, consulta de socios, cobertura por codigo postal), Grupo Nieto API (integraciones.nicosa.com.mx), GCP Cloud Functions + API Gateway (tosticentro-mx), Headless Commerce, Big Storage NG, Firehose, Notifications API.',
        en: 'B2B WhatsApp bot Mexico. Conversational commerce for Socios Tosticentro Mexico. Integrates Tosticentro API (auth, orders at /clients/sales/orders, inventory at /inventory/products), Socios Tosticentro API (login, partner lookup, zip code coverage), Grupo Nieto API (integraciones.nicosa.com.mx), GCP Cloud Functions + API Gateway (tosticentro-mx), Headless Commerce, Big Storage NG, Firehose, Notifications API.',
        pt: 'Bot B2B WhatsApp Mexico. Comercio conversacional para Socios Tosticentro Mexico. Integra Tosticentro API (autenticacao, pedidos em /clients/sales/orders, inventario em /inventory/products), Socios Tosticentro API (login, consulta de socios, cobertura por codigo postal), Grupo Nieto API (integraciones.nicosa.com.mx), GCP Cloud Functions + API Gateway (tosticentro-mx), Headless Commerce, Big Storage NG, Firehose, Notifications API.',
      },
      insights: {
        closureRate: {
          es: { context: 'Socios Tosticentro hacen pedidos via multiples APIs (Tosticentro + Socios + Grupo Nieto).', desc: 'Validacion de cobertura por codigo postal puede rechazar usuarios antes de completar pedido, afectando closure.', action: 'Segmentar closure: con cobertura vs sin cobertura. Agregar cierre informativo para usuarios fuera de cobertura.' },
          en: { context: 'Socios Tosticentro place orders via multiple APIs (Tosticentro + Socios + Grupo Nieto).', desc: 'Zip code coverage validation may reject users before completing order, affecting closure.', action: 'Segment closure: with coverage vs without. Add informative closing for users outside coverage.' },
          pt: { context: 'Socios Tosticentro fazem pedidos via multiplas APIs (Tosticentro + Socios + Grupo Nieto).', desc: 'Validacao de cobertura por codigo postal pode rejeitar usuarios antes de completar pedido, afetando closure.', action: 'Segmentar closure: com cobertura vs sem cobertura. Adicionar encerramento informativo para usuarios fora de cobertura.' },
        },
        latency: {
          es: { context: 'La latencia incluye Tosticentro API + Socios API + Grupo Nieto API + GCP Cloud Functions + API Gateway.', desc: 'Tres APIs externas (Tosticentro, Socios, Grupo Nieto) agregan latencia acumulativa. API Gateway de GCP agrega hop adicional.', action: 'Cachear resultados de cobertura por codigo postal. Paralelizar llamadas independientes a las 3 APIs. Evaluar reduccion de hops.' },
          en: { context: 'Latency includes Tosticentro API + Socios API + Grupo Nieto API + GCP Cloud Functions + API Gateway.', desc: 'Three external APIs (Tosticentro, Socios, Grupo Nieto) add cumulative latency. GCP API Gateway adds additional hop.', action: 'Cache zip code coverage results. Parallelize independent calls to the 3 APIs. Evaluate hop reduction.' },
          pt: { context: 'A latencia inclui Tosticentro API + Socios API + Grupo Nieto API + GCP Cloud Functions + API Gateway.', desc: 'Tres APIs externas (Tosticentro, Socios, Grupo Nieto) adicionam latencia cumulativa. API Gateway do GCP adiciona hop adicional.', action: 'Cachear resultados de cobertura por codigo postal. Paralelizar chamadas independentes as 3 APIs. Avaliar reducao de hops.' },
        },
        stabilityProxy: {
          es: { context: 'Triple dependencia: Tosticentro API + Socios API + Grupo Nieto API + GCP Cloud Functions + API Gateway.', desc: 'Tres backends externos independientes son puntos de fallo separados. Grupo Nieto en integraciones.nicosa.com.mx es tercero adicional.', action: 'Circuit breaker independiente por API. Modo degradado si Grupo Nieto no responde (usar Tosticentro directo).' },
          en: { context: 'Triple dependency: Tosticentro API + Socios API + Grupo Nieto API + GCP Cloud Functions + API Gateway.', desc: 'Three independent external backends are separate failure points. Grupo Nieto at integraciones.nicosa.com.mx is additional third party.', action: 'Independent circuit breaker per API. Degraded mode if Grupo Nieto unresponsive (use Tosticentro direct).' },
          pt: { context: 'Tripla dependencia: Tosticentro API + Socios API + Grupo Nieto API + GCP Cloud Functions + API Gateway.', desc: 'Tres backends externos independentes sao pontos de falha separados. Grupo Nieto em integraciones.nicosa.com.mx e terceiro adicional.', action: 'Circuit breaker independente por API. Modo degradado se Grupo Nieto nao responder (usar Tosticentro direto).' },
        },
      },
    },
    "wa-gr2086-gruporeal-realduasrodas": {
      name: "Grupo Real Duas Rodas",
      hasOris: true,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 25 activities/339 components. Flujo hibrido (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Comercio conversacional para Grupo Real / Duas Rodas Brasil (distribucion de alimentos). Pedidos, notas fiscais, loja online, cashback, financeiro, PIX. Token auth, Yalo Force.',
        en: 'B2B WhatsApp bot Brazil. 25 activities/339 components. Hybrid flow (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Conversational commerce for Grupo Real / Duas Rodas Brazil (food distribution). Orders, invoices, online store, cashback, financeiro, PIX. Token auth, Yalo Force.',
        pt: 'Bot B2B WhatsApp Brasil. 25 activities/339 components. Fluxo hibrido (deterministic + hybrid). AI agents: Sales Agent Oris R1, Post Agent (Custom Agent). Comercio conversacional para Grupo Real / Duas Rodas Brasil (distribuicao de alimentos). Pedidos, notas fiscais, loja online, cashback, financeiro, PIX. Token auth, Yalo Force.',
      },
      insights: {},
    },
    "wa-la2332-la-costena-prod": {
      name: "La Costena MX",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Mexico. Comercio conversacional para La Costena Mexico (alimentos). Integra SFTP Server (sincronizacion de productos, precios, stock, vendedores), GCP Cloud Functions, GCS Buckets (prod-yalo-main-us-delivery-commerce-data, prod-yalo-main-us-commerce para CSVs e imagenes), Sales Desk (rc-profarco.yalochat.com), Yalo Force Notifications, Headless Commerce.',
        en: 'B2B WhatsApp bot Mexico. Conversational commerce for La Costena Mexico (food). Integrates SFTP Server (product, price, stock, salesperson sync), GCP Cloud Functions, GCS Buckets (prod-yalo-main-us-delivery-commerce-data, prod-yalo-main-us-commerce for CSVs and images), Sales Desk (rc-profarco.yalochat.com), Yalo Force Notifications, Headless Commerce.',
        pt: 'Bot B2B WhatsApp Mexico. Comercio conversacional para La Costena Mexico (alimentos). Integra SFTP Server (sincronizacao de produtos, precos, estoque, vendedores), GCP Cloud Functions, GCS Buckets (prod-yalo-main-us-delivery-commerce-data, prod-yalo-main-us-commerce para CSVs e imagens), Sales Desk (rc-profarco.yalochat.com), Yalo Force Notifications, Headless Commerce.',
      },
      insights: {
        closureRate: {
          es: { context: 'Clientes B2B de La Costena completan pedido de alimentos y dejan de responder.', desc: 'El flujo incluye catalogo con imagenes de GCS y pedidos. Los usuarios terminan al confirmar pedido sin cierre conversacional.', action: 'Agregar cierre post-pedido con resumen y fecha estimada de entrega.' },
          en: { context: 'La Costena B2B customers complete food order and stop responding.', desc: 'Flow includes catalog with GCS images and orders. Users finish when confirming order without conversational closure.', action: 'Add post-order closing with summary and estimated delivery date.' },
          pt: { context: 'Clientes B2B da La Costena completam pedido de alimentos e param de responder.', desc: 'O fluxo inclui catalogo com imagens do GCS e pedidos. Usuarios terminam ao confirmar pedido sem fechamento conversacional.', action: 'Adicionar encerramento pos-pedido com resumo e data estimada de entrega.' },
        },
        fallbackQuality: {
          es: { context: 'SFTP sincroniza productos, precios, stock y vendedores. Si SFTP falla, datos quedan obsoletos.', desc: 'La cadena SFTP -> GCS Buckets -> Headless Commerce puede fallar silenciosamente. CSVs e imagenes dependen de la sincronizacion.', action: 'Implementar monitoreo de frescura de datos SFTP. Alertar cuando sync tiene mas de 24h. Validar integridad de CSVs post-sync.' },
          en: { context: 'SFTP syncs products, prices, stock and salespersons. If SFTP fails, data becomes stale.', desc: 'SFTP -> GCS Buckets -> Headless Commerce chain can fail silently. CSVs and images depend on sync.', action: 'Implement SFTP data freshness monitoring. Alert when sync is more than 24h old. Validate CSV integrity post-sync.' },
          pt: { context: 'SFTP sincroniza produtos, precos, estoque e vendedores. Se SFTP falhar, dados ficam obsoletos.', desc: 'A cadeia SFTP -> GCS Buckets -> Headless Commerce pode falhar silenciosamente. CSVs e imagens dependem da sincronizacao.', action: 'Implementar monitoramento de frescura de dados SFTP. Alertar quando sync tem mais de 24h. Validar integridade de CSVs pos-sync.' },
        },
        stabilityProxy: {
          es: { context: 'Cadena SFTP -> GCS Buckets -> Cloud Functions -> Headless Commerce + Sales Desk.', desc: 'Pipeline SFTP es el punto principal de fallo. Sin sync, catalogo/precios/stock quedan desactualizados. Sales Desk depende de instancia compartida (rc-profarco).', action: 'Monitorear pipeline SFTP -> GCS. Mantener cache de ultimo catalogo valido. Alertar si sync falla.' },
          en: { context: 'SFTP -> GCS Buckets -> Cloud Functions -> Headless Commerce + Sales Desk chain.', desc: 'SFTP pipeline is the main failure point. Without sync, catalog/prices/stock become stale. Sales Desk depends on shared instance (rc-profarco).', action: 'Monitor SFTP -> GCS pipeline. Keep cache of last valid catalog. Alert if sync fails.' },
          pt: { context: 'Cadeia SFTP -> GCS Buckets -> Cloud Functions -> Headless Commerce + Sales Desk.', desc: 'Pipeline SFTP e o principal ponto de falha. Sem sync, catalogo/precos/estoque ficam desatualizados. Sales Desk depende de instancia compartilhada (rc-profarco).', action: 'Monitorar pipeline SFTP -> GCS. Manter cache do ultimo catalogo valido. Alertar se sync falhar.' },
        },
      },
    },
    "wa-gr2084-gruporeal-per": {
      name: "Grupo Real Peru",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Peru. 14 activities/250 components. Flujo hibrido (deterministic + hybrid). AI agents: PER Custom Agent, Taxas Custom Agent, Taxas NEW Custom Agent. Sin ORIS. Comercio para Grupo Real Peru (distribucion/retail). Integra Godigibee Integration (API Gateway, retry max 3), GCP Cloud Functions (addon-catalog-v2 con OpenAI gpt-4.1-mini), Headless Commerce, Sales Desk, cashback, PIX.',
        en: 'B2B WhatsApp bot Peru. 14 activities/250 components. Hybrid flow (deterministic + hybrid). AI agents: PER Custom Agent, Taxas Custom Agent, Taxas NEW Custom Agent. No ORIS. Commerce for Grupo Real Peru (distribution/retail). Integrates Godigibee Integration (API Gateway, retry max 3), GCP Cloud Functions (addon-catalog-v2 with OpenAI gpt-4.1-mini), Headless Commerce, Sales Desk, cashback, PIX.',
        pt: 'Bot B2B WhatsApp Peru. 14 activities/250 components. Fluxo hibrido (deterministic + hybrid). AI agents: PER Custom Agent, Taxas Custom Agent, Taxas NEW Custom Agent. Sem ORIS. Comercio para Grupo Real Peru (distribuicao/varejo). Integra Godigibee Integration (API Gateway, retry max 3), GCP Cloud Functions (addon-catalog-v2 com OpenAI gpt-4.1-mini), Headless Commerce, Sales Desk, cashback, PIX.',
      },
      insights: {
        closureRate: {
          es: { context: 'Clientes B2B de Grupo Real Peru hacen pedidos con busqueda inteligente OpenAI (gpt-4.1-mini).', desc: 'addon-catalog-v2 usa AI para buscar productos, mejorando eficiencia pero pueden generar sesiones mas exploratorias.', action: 'Monitorear si la busqueda AI mejora closure vs catalogo manual. Agregar cierre post-pedido.' },
          en: { context: 'Grupo Real Peru B2B customers place orders with OpenAI intelligent search (gpt-4.1-mini).', desc: 'addon-catalog-v2 uses AI for product search, improving efficiency but may generate more exploratory sessions.', action: 'Monitor if AI search improves closure vs manual catalog. Add post-order closing.' },
          pt: { context: 'Clientes B2B do Grupo Real Peru fazem pedidos com busca inteligente OpenAI (gpt-4.1-mini).', desc: 'addon-catalog-v2 usa AI para busca de produtos, melhorando eficiencia mas pode gerar sessoes mais exploratorias.', action: 'Monitorar se busca AI melhora closure vs catalogo manual. Adicionar encerramento pos-pedido.' },
        },
        latency: {
          es: { context: 'La latencia incluye Godigibee API Gateway + Cloud Functions (addon-catalog-v2 con OpenAI) + Headless Commerce. REQUEST_TIMEOUT: 30s.', desc: 'addon-catalog-v2 con OpenAI gpt-4.1-mini agrega latencia de inferencia AI. Godigibee con retry (max 3 intentos) puede multiplicar latencia en fallos.', action: 'Optimizar prompt de OpenAI para reducir tokens. Evaluar timeout de 30s vs latencia real. Monitorear retries de Godigibee.' },
          en: { context: 'Latency includes Godigibee API Gateway + Cloud Functions (addon-catalog-v2 with OpenAI) + Headless Commerce. REQUEST_TIMEOUT: 30s.', desc: 'addon-catalog-v2 with OpenAI gpt-4.1-mini adds AI inference latency. Godigibee with retry (max 3 attempts) can multiply latency on failures.', action: 'Optimize OpenAI prompt to reduce tokens. Evaluate 30s timeout vs actual latency. Monitor Godigibee retries.' },
          pt: { context: 'A latencia inclui Godigibee API Gateway + Cloud Functions (addon-catalog-v2 com OpenAI) + Headless Commerce. REQUEST_TIMEOUT: 30s.', desc: 'addon-catalog-v2 com OpenAI gpt-4.1-mini adiciona latencia de inferencia AI. Godigibee com retry (max 3 tentativas) pode multiplicar latencia em falhas.', action: 'Otimizar prompt OpenAI para reduzir tokens. Avaliar timeout de 30s vs latencia real. Monitorar retries do Godigibee.' },
        },
        stabilityProxy: {
          es: { context: 'Dependencia de Godigibee + OpenAI + Cloud Functions + Headless Commerce + Sales Desk.', desc: 'Doble dependencia externa: Godigibee (pedidos) + OpenAI (busqueda de productos). Si OpenAI falla, busqueda inteligente no funciona. Si Godigibee falla, pedidos no se procesan.', action: 'Fallback a busqueda manual si OpenAI no responde. Circuit breaker para Godigibee. Monitorear tasa de retry.' },
          en: { context: 'Dependency on Godigibee + OpenAI + Cloud Functions + Headless Commerce + Sales Desk.', desc: 'Double external dependency: Godigibee (orders) + OpenAI (product search). If OpenAI fails, intelligent search unavailable. If Godigibee fails, orders not processed.', action: 'Fallback to manual search if OpenAI unresponsive. Circuit breaker for Godigibee. Monitor retry rate.' },
          pt: { context: 'Dependencia de Godigibee + OpenAI + Cloud Functions + Headless Commerce + Sales Desk.', desc: 'Dupla dependencia externa: Godigibee (pedidos) + OpenAI (busca de produtos). Se OpenAI falhar, busca inteligente indisponivel. Se Godigibee falhar, pedidos nao processados.', action: 'Fallback para busca manual se OpenAI nao responder. Circuit breaker para Godigibee. Monitorar taxa de retry.' },
        },
      },
    },
    "wa-ne1374-contact-leads-nespresso-pro": {
      name: "Nespresso Pro Leads",
      hasOris: false,
      type: {
        es: 'Bot B2B WhatsApp Brasil. 19 activities/465 components. Flujo deterministico. Sin AI agents. Sin ORIS. Captacion de leads y prospeccion receptiva para Nespresso Professional. Incluye Home, Prospeccao Receptivo, Sales Desk, CSAT Sales Desk, Campanhas, Notifications. Integra Sales Desk (atencion humana), webhooks de integracion.',
        en: 'B2B WhatsApp bot Brazil. 19 activities/465 components. Deterministic flow. No AI agents. No ORIS. Lead capture and receptive prospecting for Nespresso Professional. Includes Home, Prospeccao Receptivo, Sales Desk, CSAT Sales Desk, Campanhas, Notifications. Integrates Sales Desk (human support), integration webhooks.',
        pt: 'Bot B2B WhatsApp Brasil. 19 activities/465 components. Fluxo deterministico. Sem AI agents. Sem ORIS. Captacao de leads e prospeccao receptiva para Nespresso Professional. Inclui Home, Prospeccao Receptivo, Sales Desk, CSAT Sales Desk, Campanhas, Notifications. Integra Sales Desk (atendimento humano), webhooks de integracao.',
      },
      insights: {},
    },
    "wa-me1772-mercedes-benz-garantistas": {
      name: "Mercedes Garantistas",
      hasOris: false,
      type: {
        es: 'Bot B2C WhatsApp Brasil. Plataforma de garantias para Mercedes-Benz Trucks Brasil. Gestion de garantias y soporte post-venta. 4 modulos activos.',
        en: 'B2C WhatsApp bot Brazil. Warranty platform for Mercedes-Benz Trucks Brazil. Warranty management and after-sales support. 4 active modules.',
        pt: 'Bot B2C WhatsApp Brasil. Plataforma de garantias para Mercedes-Benz Trucks Brasil. Gestao de garantias e suporte pos-venda. 4 modulos ativos.',
      },
      insights: {},
    },
};

export function getBotContext(botId: string): BotContextData | null {
  return BOT_CONTEXTS[botId] || null;
}

export function getBotInsightOverride(botId: string, subKey: string, lang: Lang): BotInsightOverride | null {
  const ctx = BOT_CONTEXTS[botId];
  if (!ctx) return null;
  const insightData = ctx.insights[subKey];
  if (!insightData) return null;
  return insightData[lang] || null;
}

export function getBotType(botId: string, lang: Lang): string | null {
  const ctx = BOT_CONTEXTS[botId];
  if (!ctx) return null;
  return ctx.type[lang] || null;
}

export function botExpectsOris(botId: string): boolean {
  const ctx = BOT_CONTEXTS[botId];
  if (!ctx) return true;
  return ctx.hasOris;
}
