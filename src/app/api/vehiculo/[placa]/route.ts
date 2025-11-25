// src/app/api/vehiculo/[placa]/route.ts

import { NextResponse } from 'next/server';

// This interface should match the data structure of the real vehicle API response.
// Adjust it as necessary.
interface VehiculoData {
  placa: string;
  marca: string;
  linea: string;
  modelo: number;
  cilindraje: number;
  clase: string;
  tipoServicio: string;
  color: string;
  propietario: string;
  identificacionPropietario: string;
}

export async function GET(request: Request, { params }: { params: { placa: string } }) {
  const placa = params.placa;

  if (!placa || placa.length < 5) {
    return NextResponse.json({ message: 'Placa inválida.' }, { status: 400 });
  }

  // --- CONEXIÓN A LA API REAL ---
  // Reemplaza la URL de ejemplo con la URL de tu API real.
  const API_URL = `https://api.ejemplo.com/vehiculos/${placa}`;
  
  // Si tu API necesita una clave (API Key), agrégala aquí.
  // const API_KEY = 'TU_API_KEY_AQUI';

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${API_KEY}` // Descomenta y ajusta si tu API usa autenticación.
      },
    });

    if (!apiResponse.ok) {
      // Si la API externa responde con un error (ej. 404, 500), lo capturamos aquí.
      const errorData = await apiResponse.json().catch(() => ({})); // Intenta obtener el cuerpo del error
      console.error(`Error from external API: ${apiResponse.status}`, errorData);
      return NextResponse.json({ message: `Error al consultar la placa en el servicio externo. Estatus: ${apiResponse.status}` }, { status: apiResponse.status });
    }

    const dataFromApi = await apiResponse.json();

    // --- ADAPTACIÓN DE DATOS ---
    // La estructura de 'dataFromApi' puede ser diferente a 'VehiculoData'.
    // Aquí debes mapear los campos de la respuesta de la API a nuestra interfaz.
    // Ejemplo:
    const vehiculoData: VehiculoData = {
      placa: dataFromApi.placa || placa.toUpperCase(),
      marca: dataFromApi.info_vehiculo?.marca || 'Marca no encontrada',
      linea: dataFromApi.info_vehiculo?.linea || 'Línea no encontrada',
      modelo: dataFromApi.anio || 0,
      cilindraje: dataFromApi.motor?.cilindraje || 0,
      clase: dataFromApi.clase_vehiculo || 'No especificada',
      tipoServicio: dataFromApi.tipo_servicio || 'No especificado',
      color: dataFromApi.color_primario || 'No especificado',
      propietario: `${dataFromApi.propietario?.nombres || ''} ${dataFromApi.propietario?.apellidos || ''}`.trim(),
      identificacionPropietario: dataFromApi.propietario?.documento || 'No especificada',
    };
    // FIN DEL EJEMPLO DE MAPEADO - AJÚSTALO A TUS NECESIDADES

    return NextResponse.json(vehiculoData);

  } catch (error) {
    console.error('Failed to fetch vehicle data:', error);
    return NextResponse.json({ message: 'Error interno del servidor al intentar conectar con la API de vehículos.' }, { status: 500 });
  }
}
