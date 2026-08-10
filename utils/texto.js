export const lista = valor => String(valor || '').split(',').map(item => item.trim()).filter(Boolean);
export const regexSegura = valor => String(valor || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const podeModerar = usuario => ['professor', 'administrador'].includes(usuario?.perfil);
export const ehDono = (id, usuario) => String(id || '') === String(usuario?._id || usuario?.id || '');
