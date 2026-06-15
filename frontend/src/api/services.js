import axiosClient from './axiosClient';

export async function getServices() {
  const { data } = await axiosClient.get('/servicios');
  return data.services;
}
