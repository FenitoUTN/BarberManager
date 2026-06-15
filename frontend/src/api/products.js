import axiosClient from './axiosClient';

export async function getProducts({ includeInactive = false } = {}) {
  const { data } = await axiosClient.get('/productos', {
    params: includeInactive ? { includeInactive: 'true' } : {},
  });
  return data.products;
}

export async function getProduct(id) {
  const products = await getProducts({ includeInactive: true });
  return products.find((product) => product.id === Number(id)) || null;
}

export async function createProduct(payload) {
  const { data } = await axiosClient.post('/productos', payload);
  return data.product;
}

export async function updateProduct(id, payload) {
  const { data } = await axiosClient.put(`/productos/${id}`, payload);
  return data.product;
}

export async function deleteProduct(id) {
  const { data } = await axiosClient.delete(`/productos/${id}`);
  return data;
}
