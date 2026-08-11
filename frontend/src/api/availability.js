import axiosClient from './axiosClient';

export async function getSlots(fecha, servicioId) {
  const { data } = await axiosClient.get('/disponibilidad/slots', {
    params: { fecha, servicioId },
  });
  return data.slots;
}

export async function getWeeklySchedule() {
  const { data } = await axiosClient.get('/disponibilidad/horarios');
  return data.horario;
}

export async function updateWeeklySchedule(horario) {
  const { data } = await axiosClient.put('/disponibilidad/horarios', { horario });
  return data.horario;
}

export async function getExceptions(filters = {}) {
  const { data } = await axiosClient.get('/disponibilidad/excepciones', { params: filters });
  return data.excepciones;
}

export async function createException(payload) {
  const { data } = await axiosClient.post('/disponibilidad/excepciones', payload);
  return data;
}

export async function deleteException(id) {
  const { data } = await axiosClient.delete(`/disponibilidad/excepciones/${id}`);
  return data;
}
