import axiosClient from './axiosClient';

export async function getNotifications() {
  const { data } = await axiosClient.get('/notificaciones');
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await axiosClient.put(`/notificaciones/${id}/leida`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await axiosClient.put('/notificaciones/leidas');
  return data;
}
