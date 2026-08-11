import axiosClient from './axiosClient';

export async function getClients(search = '', { page = 1, pageSize = 20 } = {}) {
  const params = { page, pageSize };
  if (search) params.search = search;
  const { data } = await axiosClient.get('/clientes', { params });
  return data;
}

// Lista completa de clientes (hasta el máximo permitido por el backend), para
// selects/pickers que necesitan todas las opciones en vez de una página.
export async function getClientOptions() {
  const { data } = await axiosClient.get('/clientes', { params: { page: 1, pageSize: 100 } });
  return data.clients;
}

export async function getClient(id) {
  const { data } = await axiosClient.get(`/clientes/${id}`);
  return data.client;
}

export async function createClient(payload) {
  const { data } = await axiosClient.post('/clientes', payload);
  return data.client;
}

export async function updateClient(id, payload) {
  const { data } = await axiosClient.put(`/clientes/${id}`, payload);
  return data.client;
}

export async function deleteClient(id) {
  const { data } = await axiosClient.delete(`/clientes/${id}`);
  return data;
}
