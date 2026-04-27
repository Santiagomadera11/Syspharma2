import { apiClient } from '../../shared/utils/apiClient';

export const rolesService = {
  getAll: () => apiClient.get('/RolMaestro'),

  getPermisosMaestros: () => apiClient.get('/Permiso'),

  save: async (roleData) => {
    // 1. Crear o actualizar el rol
    let response;
    if (roleData.id) {
      response = await apiClient.put('/RolMaestro', roleData);
    } else {
      response = await apiClient.post('/RolMaestro', roleData);
    }

    // 2. Obtener el ID del rol recién creado o el existente
    const rolId = response?.data?.id || response?.id || roleData.id;

    // 3. Asignar permisos si hay un ID válido
    if (rolId && roleData.permisos?.length >= 0) {
      await apiClient.post(`/RolMaestro/${rolId}/permisos`, roleData.permisos);
    }

    return response;
  },

  delete: (id) => apiClient.delete(`/RolMaestro/${id}`),

  toggleStatus: (id, status) => apiClient.patch(`/RolMaestro/${id}/estado`, status)
};