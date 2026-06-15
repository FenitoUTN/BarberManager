import axiosClient from './axiosClient';

export async function getApartados({ estado, clienteId } = {}) {
  const params = {};
  if (estado) params.estado = estado;
  if (clienteId) params.clienteId = clienteId;

  const { data } = await axiosClient.get('/apartados', { params });
  return data.apartados;
}

export async function getApartado(id) {
  const { data } = await axiosClient.get(`/apartados/${id}`);
  return data;
}

export async function createApartado(payload) {
  const { data } = await axiosClient.post('/apartados', payload);
  return data.apartado;
}

export async function addAbono(id, payload) {
  const { data } = await axiosClient.post(`/apartados/${id}/abonos`, payload);
  return data.apartado;
}
