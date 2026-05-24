import { apiClient } from '../../shared/utils/apiClient';

export const rolesService = {
  getAll: () => apiClient.get('/RolMaestro'),

  getPermisosMaestros: () => apiClient.get('/Permiso'),

  save: async (roleData) => {
  let response;
  if (roleData.id && roleData.id !== 0) {
    response = await apiClient.put('/RolMaestro', roleData);
  } else {
    response = await apiClient.post('/RolMaestro', roleData);
  }

  const rolId = response?.data?.id || response?.id || roleData.id;

  if (rolId) {
    try {
      const permRes = await apiClient.post(`/RolMaestro/${rolId}/permisos`, roleData.permisos ?? []);
      console.log("PERMISOS GUARDADOS:", permRes);
    } catch (err) {
      console.error("ERROR GUARDANDO PERMISOS:", err.response?.data || err.message);
    }
  }

  return response;
},

  delete: (id) => apiClient.delete(`/RolMaestro/${id}`),

  toggleStatus: (id, status) => apiClient.patch(`/RolMaestro/${id}/estado`, status)
};