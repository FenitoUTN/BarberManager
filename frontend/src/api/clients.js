import axiosClient from './axiosClient';

export async function getClients(search = '') {
  const { data } = await axiosClient.get('/clientes', { params: search ? { search } : {} });
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
