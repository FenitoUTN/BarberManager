import axiosClient from './axiosClient';

export async function getCitasPorDia({ desde, hasta } = {}) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  const { data } = await axiosClient.get('/reportes/citas-por-dia', { params });
  return data.resumen;
}

export async function getApartadosActivos() {
  const { data } = await axiosClient.get('/reportes/apartados-activos');
  return data.apartados;
}
