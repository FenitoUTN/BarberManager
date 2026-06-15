import axiosClient from './axiosClient';

export async function getMyAppointments() {
  const { data } = await axiosClient.get('/citas/mias');
  return data.citas;
}

export async function getAgenda(fecha) {
  const { data } = await axiosClient.get('/citas', { params: { fecha } });
  return data.citas;
}

export async function getAppointmentHistory(filters = {}) {
  const { data } = await axiosClient.get('/citas', { params: filters });
  return data.citas;
}

export async function bookAppointment(payload) {
  const { data } = await axiosClient.post('/citas', payload);
  return data.cita;
}

export async function cancelAppointment(id) {
  const { data } = await axiosClient.patch(`/citas/${id}/cancelar`);
  return data.cita;
}

export async function updateAppointmentStatus(id, estado) {
  const { data } = await axiosClient.patch(`/citas/${id}/estado`, { estado });
  return data.cita;
}
