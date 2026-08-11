import axiosClient from './axiosClient';

export async function getServices({ includeInactive = false } = {}) {
  const { data } = await axiosClient.get('/servicios', {
    params: includeInactive ? { includeInactive: 'true' } : {},
  });
  return data.services;
}

export async function getService(id) {
  const services = await getServices({ includeInactive: true });
  return services.find((service) => service.id === Number(id)) || null;
}

export async function createService(payload) {
  const { data } = await axiosClient.post('/servicios', payload);
  return data.service;
}

export async function updateService(id, payload) {
  const { data } = await axiosClient.put(`/servicios/${id}`, payload);
  return data.service;
}

export async function deleteService(id) {
  const { data } = await axiosClient.delete(`/servicios/${id}`);
  return data;
}
