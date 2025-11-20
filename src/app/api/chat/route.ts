import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    let responseMessage = 'Lo siento, no entiendo tu pregunta. Por favor, intenta con otra pregunta o contacta a un agente.';

    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('hola')) {
      responseMessage = '¡Hola! ¿Cómo puedo ayudarte hoy?';
    } else if (lowerCaseMessage.includes('seguro') && lowerCaseMessage.includes('vehículo')) {
      responseMessage = 'Claro, puedes cotizar el seguro para tu vehículo en nuestra página de cotización de vehículos. ¿Necesitas el enlace?';
    } else if (lowerCaseMessage.includes('soat')) {
      responseMessage = 'Puedes comprar tu SOAT directamente desde nuestro portal. Te redirigiremos a la página de nuestro aliado Seguros Mundial.';
    } else if (lowerCaseMessage.includes('horario')) {
      responseMessage = 'Nuestros horarios de atención son de Lunes a Viernes de 8:00 AM a 5:00 PM.';
    } else if (lowerCaseMessage.includes('gracias')) {
        responseMessage = '¡De nada! ¿Hay algo más en lo que pueda ayudarte?';
    } else if (lowerCaseMessage.includes('puedes hacer') || lowerCaseMessage.includes('sirves') || lowerCaseMessage.includes('ayudar')) {
        responseMessage = 'Soy un asistente virtual diseñado para ayudarte con preguntas frecuentes sobre nuestros seguros, cotizaciones, horarios de atención y cómo usar nuestro sitio web. ¡Pregúntame lo que necesites!';
    } else if (lowerCaseMessage.includes('adiós')) {
        responseMessage = '¡Que tengas un buen día!';
    }

    return NextResponse.json({ reply: responseMessage });

  } catch (error) {
    return NextResponse.json({ error: 'Error processing your request' }, { status: 500 });
  }
}
