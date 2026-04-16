import { Fragment, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Store, MessageSquare, CheckCircle, XCircle, Eye, Award, Pencil, Trash2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import {
  createCategoryRequest,
  createUserRequest,
  deletePqrsRequest,
  deleteRatingRequest,
  deleteCategoryRequest,
  deleteUserRequest,
  getAdminMetricsRequest,
  getCategoriesRequest,
  getMicrotiendasRequest,
  getPqrsRequest,
  getProductsRequest,
  getRatingsRequest,
  getUsersRequest,
  reviewMicrotiendaRequest,
  reviewProductRequest,
  reviewRatingRequest,
  updatePqrsStatusRequest,
  updateCategoryRequest,
  updateUserRequest,
} from '../utils/api';
import { clearSession } from '../utils/session.js';

const cardClass =
  'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]';
const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#152E4D] hover:shadow-[0_4px_12px_rgba(27,58,95,0.25)]';
const accentButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)]';
const outlineButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';
const smallOutlineButtonClass =
  'inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]';
const inputClass =
  'w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]';
const tableWrapperClass = 'overflow-x-auto';
const tableClass = 'min-w-full border-collapse';
const thClass = 'border-b-2 border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-left font-[var(--font-heading)] text-sm font-bold text-[var(--foreground)]';
const tdClass = 'border-b border-[var(--border)] px-4 py-3 align-top text-sm';
const tabClass = 'rounded-[var(--radius)] px-5 py-2.5 text-sm font-semibold transition-all duration-200';
const labelClass = 'mb-2 block text-sm font-semibold text-[var(--foreground)]';

const initialEditForm = {
  nombre: '',
  correo: '',
  telefono: '',
  direccion: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  rol: 'entrepreneur',
  estado: true,
  estadoRevision: 'PENDIENTE',
};

const initialCreateForm = {
  nombre: '',
  correo: '',
  telefono: '',
  direccion: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  rol: 'entrepreneur',
  password: '',
  estado: true,
};

const formatRole = (role) => (role === 'admin' ? 'Administrador' : 'Emprendedor');
const formatState = (user) => (user.estado ? 'Activo' : 'Inactivo');
const formatRevisionState = (state) => {
  if (state === 'APROBADO') return 'Aprobado';
  if (state === 'RECHAZADO') return 'Rechazado';
  return 'Pendiente';
};

const formatPqrsType = (type) => {
  if (type === 'PETICION') return 'Petición';
  if (type === 'QUEJA') return 'Queja';
  if (type === 'RECLAMO') return 'Reclamo';
  if (type === 'SUGERENCIA') return 'Sugerencia';
  return type || 'Sin tipo';
};

const getRelativeTime = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  const diffInHours = Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Hace menos de 1h';
  }

  if (diffInHours < 24) {
    return `Hace ${Math.floor(diffInHours)}h`;
  }

  return `Hace ${Math.floor(diffInHours / 24)}d`;
};

function Badge({ children, bg = 'var(--accent)', color = 'var(--accent-foreground)' }) {
  return (
    <span
      className="inline-flex items-center rounded-[calc(var(--radius)-2px)] px-3 py-1 text-sm font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [microstores, setMicrostores] = useState([]);
  const [products, setProducts] = useState([]);
  const [pqrsItems, setPqrsItems] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [reviewActionLoading, setReviewActionLoading] = useState('');
  const [expandedPqrsId, setExpandedPqrsId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReview, setConfirmReview] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const loadDashboardData = async ({ withUsersLoading = false } = {}) => {
    if (withUsersLoading) {
      setUsersLoading(true);
    }

    setDashboardLoading(true);
    setUsersError('');

    try {
      const [metricsResponse, usersResponse, microstoresResponse, productsResponse, pqrsResponse, ratingsResponse, categoriesResponse] = await Promise.all([
        getAdminMetricsRequest(),
        getUsersRequest(),
        getMicrotiendasRequest(true),
        getProductsRequest(undefined, true),
        getPqrsRequest(),
        getRatingsRequest({ includePending: true, includePrivate: true }),
        getCategoriesRequest(),
      ]);

      setAdminMetrics(metricsResponse || null);
      setUsers(Array.isArray(usersResponse) ? usersResponse : []);
      setMicrostores(Array.isArray(microstoresResponse) ? microstoresResponse : []);
      setProducts(Array.isArray(productsResponse) ? productsResponse : []);
      setPqrsItems(Array.isArray(pqrsResponse) ? pqrsResponse : []);
      setRatings(Array.isArray(ratingsResponse) ? ratingsResponse : []);
      setCategoriesData(Array.isArray(categoriesResponse) ? categoriesResponse : []);
    } catch (error) {
      setUsersError(error.message || 'No fue posible cargar la información de usuarios.');
    } finally {
      setDashboardLoading(false);

      if (withUsersLoading) {
        setUsersLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDashboardData({ withUsersLoading: true });
  }, []);

  const usersWithBusiness = useMemo(() => {
    return users.map((user) => {
      const linkedMicrostore = microstores.find((store) => Number(store.propietarioId) === Number(user.id));

      return {
        ...user,
        negocio: linkedMicrostore?.nombre || 'Sin microtienda registrada',
      };
    });
  }, [users, microstores]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) {
      return usersWithBusiness;
    }

    return usersWithBusiness.filter((user) =>
      [user.nombre, user.correo, user.negocio, user.numeroDocumento, user.telefono, user.rolNombre]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [userSearch, usersWithBusiness]);

  const pendingUsers = useMemo(
    () => usersWithBusiness.filter((user) => user.rol === 'entrepreneur' && user.estadoRevision === 'PENDIENTE'),
    [usersWithBusiness],
  );

  const pendingMicrostores = useMemo(
    () => microstores.filter((store) => store.estadoRevision === 'PENDIENTE'),
    [microstores],
  );

  const pendingProducts = useMemo(
    () => products.filter((product) => product.estadoRevision === 'PENDIENTE'),
    [products],
  );

  const pendingRatings = useMemo(
    () => ratings.filter((rating) => rating.estadoRevision === 'PENDIENTE'),
    [ratings],
  );

  const pendingPqrs = useMemo(
    () => pqrsItems.filter((item) => item.estado === 'PENDIENTE' || item.estado === 'EN_PROCESO'),
    [pqrsItems],
  );

  const totalPendingCount = useMemo(
    () =>
      pendingUsers.length +
      pendingMicrostores.length +
      pendingProducts.length +
      pendingRatings.length +
      pendingPqrs.length,
    [pendingUsers.length, pendingMicrostores.length, pendingProducts.length, pendingRatings.length, pendingPqrs.length],
  );

  const approvedRatings = useMemo(
    () => ratings.filter((rating) => rating.estadoRevision === 'APROBADO'),
    [ratings],
  );

  const averageRating = useMemo(() => {
    if (!approvedRatings.length) return 0;

    const total = approvedRatings.reduce((accumulator, item) => accumulator + Number(item.puntuacion || 0), 0);
    return total / approvedRatings.length;
  }, [approvedRatings]);

  const stats = useMemo(
    () => [
      {
        icon: Users,
        label: 'Usuarios Totales',
        value: (adminMetrics?.resumen?.totalUsuarios ?? users.length).toLocaleString('es-CO'),
        change: `${pendingUsers.length} pendientes de revisión`,
        color: 'var(--primary)',
      },
      {
        icon: Store,
        label: 'Emprendimientos',
        value: (adminMetrics?.resumen?.microtiendasActivas ?? microstores.filter((store) => store.estadoRevision === 'APROBADO').length).toLocaleString('es-CO'),
        change: `${pendingMicrostores.length + pendingProducts.length} solicitudes pendientes`,
        color: 'var(--accent)',
      },
      {
        icon: MessageSquare,
        label: 'PQRs Pendientes',
        value: pendingPqrs.length.toLocaleString('es-CO'),
        change: `${pqrsItems.length} solicitudes en total`,
        color: '#F59E0B',
      },
      {
        icon: Award,
        label: 'Calificación Promedio',
        value: averageRating ? averageRating.toFixed(1) : '0.0',
        change: `${pendingRatings.length} comentarios por revisar`,
        color: '#10B981',
      },
    ],
    [adminMetrics, averageRating, microstores, pendingMicrostores.length, pendingProducts.length, pendingPqrs.length, pendingRatings.length, pendingUsers.length, pqrsItems.length, users.length],
  );

  const recentActivity = useMemo(() => {
    const now = Date.now();
    const last48Hours = 48 * 60 * 60 * 1000;

    const userActivity = usersWithBusiness.map((user) => ({
      key: `user-${user.id}`,
      icon: Users,
      bg: 'var(--primary)',
      iconColor: 'var(--primary-foreground)',
      title: user.estadoRevision === 'PENDIENTE' ? 'Nueva solicitud de usuario' : 'Actualización de usuario',
      text:
        user.estadoRevision === 'PENDIENTE'
          ? `${user.nombre} solicitó acceso como emprendedor`
          : `${user.nombre} figura como ${formatRole(user.rol).toLowerCase()}`,
      timestamp: user.fechaCreacion,
    }));

    const microstoreActivity = microstores.map((store) => ({
      key: `store-${store.id}`,
      icon: Store,
      bg: 'var(--accent)',
      iconColor: 'var(--accent-foreground)',
      title: store.estadoRevision === 'PENDIENTE' ? 'Nueva microtienda registrada' : 'Actualización de microtienda',
      text:
        store.estadoRevision === 'PENDIENTE'
          ? `${store.nombre} quedó pendiente de aprobación`
          : `${store.nombre} está en estado ${formatRevisionState(store.estadoRevision).toLowerCase()}`,
      timestamp: store.fechaCreacion,
    }));

    const pqrsActivity = pqrsItems.map((item) => ({
      key: `pqrs-${item.id}`,
      icon: MessageSquare,
      bg: '#F59E0B',
      iconColor: 'var(--white)',
      title: `Nueva ${formatPqrsType(item.tipo).toLowerCase()}`,
      text: item.asunto || item.mensaje,
      timestamp: item.fecha,
    }));

    const ratingActivity = ratings.map((rating) => ({
      key: `rating-${rating.id}`,
      icon: Award,
      bg: '#10B981',
      iconColor: 'var(--white)',
      title: rating.estadoRevision === 'PENDIENTE' ? 'Nuevo comentario por revisar' : 'Actualización de comentario',
      text:
        rating.estadoRevision === 'PENDIENTE'
          ? `${rating.nombreVisitante} calificó a ${rating.microtienda || 'una microtienda'}`
          : `${rating.microtienda || 'Una microtienda'} recibió ${rating.puntuacion}/5`,
      timestamp: rating.fecha,
    }));

    return [...userActivity, ...microstoreActivity, ...pqrsActivity, ...ratingActivity]
      .filter((item) => item.timestamp && now - new Date(item.timestamp).getTime() <= last48Hours)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [microstores, pqrsItems, ratings, usersWithBusiness]);

  const actionRequiredItems = useMemo(
    () => [
      ['Microtiendas', pendingMicrostores.length, 'Emprendimientos esperando aprobación'],
      ['Productos', pendingProducts.length, 'Productos pendientes de revisión'],
      ['Usuarios', pendingUsers.length, 'Solicitudes de emprendedor pendientes'],
      ['Comentarios', pendingRatings.length, 'Reseñas pendientes de moderación'],
      ['PQRs', pendingPqrs.length, 'Solicitudes pendientes de respuesta'],
    ],
    [pendingMicrostores.length, pendingProducts.length, pendingPqrs.length, pendingRatings.length, pendingUsers.length],
  );

  const handleReviewMicrostore = async (id, estadoRevision) => {
    setReviewActionLoading(`microstore-${id}-${estadoRevision}`);
    setUsersError('');

    try {
      await reviewMicrotiendaRequest(id, { estadoRevision });
      await loadDashboardData();
    } catch (error) {
      setUsersError(error.message || 'No fue posible actualizar la microtienda.');
    } finally {
      setReviewActionLoading('');
    }
  };

  const handleReviewProduct = async (id, estadoRevision) => {
    setReviewActionLoading(`product-${id}-${estadoRevision}`);
    setUsersError('');

    try {
      await reviewProductRequest(id, { estadoRevision });
      await loadDashboardData();
    } catch (error) {
      setUsersError(error.message || 'No fue posible actualizar el producto.');
    } finally {
      setReviewActionLoading('');
    }
  };

  const openReviewConfirmation = ({ type, id, name, estadoRevision }) => {
    setConfirmReview({
      type,
      id,
      estadoRevision,
      title: estadoRevision === 'APROBADO' ? 'Aprobar solicitud' : 'Rechazar solicitud',
      message: `¿Seguro que deseas ${estadoRevision === 'APROBADO' ? 'aprobar' : 'rechazar'} ${name}?`,
      confirmLabel: estadoRevision === 'APROBADO' ? 'Sí, aprobar' : 'Sí, rechazar',
    });
  };

  const handleConfirmReview = async () => {
    if (!confirmReview) {
      return;
    }

    if (confirmReview.type === 'microstore') {
      await handleReviewMicrostore(confirmReview.id, confirmReview.estadoRevision);
    }

    if (confirmReview.type === 'product') {
      await handleReviewProduct(confirmReview.id, confirmReview.estadoRevision);
    }

    setConfirmReview(null);
  };

  const handleConfirmLogout = () => {
    clearSession();
    navigate('/');
  };

  const handleReviewRating = async (id, estadoRevision) => {
    setReviewActionLoading(`rating-${id}-${estadoRevision}`);
    setUsersError('');

    try {
      await reviewRatingRequest(id, { estadoRevision });
      await loadDashboardData();
    } catch (error) {
      setUsersError(error.message || 'No fue posible actualizar el comentario.');
    } finally {
      setReviewActionLoading('');
    }
  };

  const handleCreateCategory = async () => {
    setCreatingCategory(true);
    setNewCategoryName('');
    setUsersError('');
  };

  const closeCreateCategory = () => {
    setCreatingCategory(false);
    setNewCategoryName('');
  };

  const handleSaveNewCategory = async (event) => {
    event.preventDefault();

    if (!newCategoryName.trim()) {
      return;
    }

    setReviewActionLoading('category-create');
    setUsersError('');

    try {
      await createCategoryRequest({ nombre: newCategoryName.trim(), descripcion: '', estado: true });
      closeCreateCategory();
      await loadDashboardData();
    } catch (error) {
      setUsersError(error.message || 'No fue posible crear la categoría.');
    } finally {
      setReviewActionLoading('');
    }
  };

  const handleEditCategory = async (category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.nombre || '');
    setUsersError('');
  };

  const closeEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleSaveCategoryName = async (event) => {
    event.preventDefault();

    if (!editingCategory || !editingCategoryName.trim()) {
      return;
    }

    setReviewActionLoading(`category-edit-${editingCategory.id}`);
    setUsersError('');

    try {
      await updateCategoryRequest(editingCategory.id, {
        nombre: editingCategoryName.trim(),
        descripcion: editingCategory.descripcion || '',
        estado: editingCategory.estado,
      });
      closeEditCategory();
      await loadDashboardData();
    } catch (error) {
      setUsersError(error.message || 'No fue posible actualizar la categoría.');
    } finally {
      setReviewActionLoading('');
    }
  };

  const handleDeleteCategory = async (category) => {
    setConfirmDelete({
      type: 'category',
      id: category.id,
      title: 'Eliminar categoría',
      message: `¿Seguro que deseas eliminar la categoría ${category.nombre}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar',
    });
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      nombre: user.nombre || '',
      correo: user.correo || '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      tipoDocumento: user.tipoDocumento || 'CC',
      numeroDocumento: user.numeroDocumento || '',
      rol: user.rol || 'entrepreneur',
      estado: Boolean(user.estado),
      estadoRevision: user.estadoRevision || 'PENDIENTE',
    });
    setUsersError('');
  };

  const closeEditUser = () => {
    setEditingUser(null);
    setEditForm(initialEditForm);
  };

  const openCreateUser = () => {
    setCreatingUser(true);
    setCreateForm(initialCreateForm);
    setUsersError('');
  };

  const closeCreateUser = () => {
    setCreatingUser(false);
    setCreateForm(initialCreateForm);
  };

  const handleEditFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setEditForm((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const handleCreateFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setCreateForm((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setSavingUser(true);
    setUsersError('');

    try {
      await updateUserRequest(editingUser.id, {
        nombre: editForm.nombre.trim(),
        correo: editForm.correo.trim(),
        telefono: editForm.telefono.trim(),
        direccion: editForm.direccion.trim(),
        tipoDocumento: editForm.tipoDocumento.trim(),
        numeroDocumento: editForm.numeroDocumento.trim(),
        rol: editForm.rol,
        estado: Boolean(editForm.estado),
        estadoRevision: editForm.estadoRevision,
      });

      closeEditUser();
      await loadDashboardData({ withUsersLoading: true });
    } catch (error) {
      setUsersError(error.message || 'No fue posible actualizar el usuario.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (user) => {
    setConfirmDelete({
      type: 'user',
      id: user.id,
      title: 'Eliminar usuario',
      message: `¿Seguro que deseas eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar',
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSavingUser(true);
    setUsersError('');

    try {
      await createUserRequest({
        nombre: createForm.nombre.trim(),
        correo: createForm.correo.trim(),
        telefono: createForm.telefono.trim(),
        direccion: createForm.direccion.trim(),
        tipoDocumento: createForm.tipoDocumento.trim(),
        numeroDocumento: createForm.numeroDocumento.trim(),
        rol: createForm.rol,
        password: createForm.password.trim(),
        estado: Boolean(createForm.estado),
      });

      closeCreateUser();
      await loadDashboardData({ withUsersLoading: true });
    } catch (error) {
      setUsersError(error.message || 'No fue posible crear el usuario.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteRating = async (rating) => {
    setConfirmDelete({
      type: 'rating',
      id: rating.id,
      title: 'Eliminar comentario',
      message: `¿Seguro que deseas eliminar el comentario de ${rating.nombreVisitante}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar',
    });
  };

  const handleUpdatePqrsStatus = async (pqrsId, estado) => {
    setReviewActionLoading(`pqrs-${pqrsId}-${estado}`);
    setUsersError('');

    try {
      await updatePqrsStatusRequest(pqrsId, { estado });
      await loadDashboardData();
    } catch (error) {
      setUsersError(error.message || 'No fue posible actualizar la PQR.');
    } finally {
      setReviewActionLoading('');
    }
  };

  const handleDeletePqrs = async (pqr) => {
    setConfirmDelete({
      type: 'pqrs',
      id: pqr.id,
      title: 'Eliminar PQR',
      message: `¿Seguro que deseas eliminar la solicitud "${pqr.asunto}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar',
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) {
      return;
    }

    setUsersError('');

    try {
      if (confirmDelete.type === 'user') {
        setDeletingUserId(confirmDelete.id);
        await deleteUserRequest(confirmDelete.id);
        await loadDashboardData({ withUsersLoading: true });
      }

      if (confirmDelete.type === 'category') {
        setReviewActionLoading(`category-delete-${confirmDelete.id}`);
        await deleteCategoryRequest(confirmDelete.id);
        await loadDashboardData();
      }

      if (confirmDelete.type === 'rating') {
        setReviewActionLoading(`rating-delete-${confirmDelete.id}`);
        await deleteRatingRequest(confirmDelete.id);
        await loadDashboardData();
      }

      if (confirmDelete.type === 'pqrs') {
        setReviewActionLoading(`pqrs-delete-${confirmDelete.id}`);
        await deletePqrsRequest(confirmDelete.id);
        await loadDashboardData();
      }

      setConfirmDelete(null);
    } catch (error) {
      if (confirmDelete.type === 'user') {
        setUsersError(error.message || 'No fue posible eliminar el usuario.');
      } else if (confirmDelete.type === 'category') {
        setUsersError(error.message || 'No fue posible eliminar la categoría.');
      } else if (confirmDelete.type === 'rating') {
        setUsersError(error.message || 'No fue posible eliminar el comentario.');
      } else {
        setUsersError(error.message || 'No fue posible eliminar la PQR.');
      }
    } finally {
      setDeletingUserId(null);
      setReviewActionLoading('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--ivory)]">
      <section className="w-full bg-[var(--primary)] px-6 py-8 text-[var(--primary-foreground)] lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-[var(--white)]">Panel de Administración</h1>
            <p className="m-0 text-[rgba(255,255,255,0.9)]">
              Gestiona usuarios, emprendimientos y contenido
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className="inline-flex min-h-[50px] items-center justify-center rounded-[var(--radius)] px-6 py-3 text-base font-semibold"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              {totalPendingCount} Pendientes
            </span>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[rgba(255,255,255,0.78)] bg-transparent px-6 py-3 text-base font-semibold text-[var(--white)] transition-all duration-200 hover:bg-[rgba(255,255,255,0.08)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.18)]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>

      <div className="w-full px-6 py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ['overview', 'Resumen'],
            ['pending', 'Aprobaciones Pendientes'],
            ['users', 'Usuarios'],
            ['pqrs', 'PQRs'],
            ['comments', 'Comentarios'],
            ['categories', 'Categorías'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={tabClass}
              style={
                activeTab === key
                  ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { border: '2px solid var(--primary)', color: 'var(--primary)', backgroundColor: 'transparent' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {usersError ? (
          <div className="mb-6 rounded-[var(--radius)] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
            {usersError}
          </div>
        ) : null}

        {dashboardLoading ? (
          <div className="mb-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
            Actualizando información del panel...
          </div>
        ) : null}

        {activeTab === 'overview' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className={cardClass}>
                  <div className="mb-3 flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)]"
                      style={{ backgroundColor: stat.color }}
                    >
                      <stat.icon size={24} color="var(--white)" />
                    </div>
                  </div>
                  <div className="mb-2 text-[2rem] leading-none font-bold text-[var(--primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.value}
                  </div>
                  <div className="mb-1 text-sm text-[var(--muted-foreground)]">{stat.label}</div>
                  <div className="text-xs font-semibold text-[#10B981]">{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <div className={cardClass}>
                <h3 className="mb-6">Actividad Reciente</h3>
                <div className="flex flex-col gap-3">
                  {recentActivity.length ? recentActivity.map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-[var(--radius)] bg-[var(--secondary)] p-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: item.bg }}
                      >
                        <item.icon size={20} color={item.iconColor} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 font-semibold">{item.title}</p>
                        <p className="m-0 text-sm text-[var(--muted-foreground)]">{item.text}</p>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">{getRelativeTime(item.timestamp)}</span>
                    </div>
                  )) : (
                    <div className="rounded-[var(--radius)] bg-[var(--secondary)] px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                      No hay actividad registrada en las últimas 48 horas.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[var(--radius)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                <h3 className="mb-6">Acción Requerida</h3>
                <div className="flex flex-col gap-5">
                  {actionRequiredItems.map(([title, count, text]) => (
                    <div key={title}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold">{title}</span>
                        <span
                          className="rounded-[calc(var(--radius)-4px)] px-2 py-1 text-sm font-semibold"
                          style={{ backgroundColor: 'var(--primary)', color: 'var(--white)' }}
                        >
                          {count}
                        </span>
                      </div>
                      <p className="m-0 text-sm">{text}</p>
                    </div>
                  ))}
                </div>
                <button className={`${primaryButtonClass} mt-4 w-full`} onClick={() => setActiveTab('pending')}>
                  Ver pendientes
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'pending' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`${cardClass} mb-6`}>
              <h2 className="mb-6">Emprendimientos Pendientes de Aprobación</h2>
              <div className={tableWrapperClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Nombre</th>
                      <th className={thClass}>Propietario</th>
                      <th className={thClass}>Categoría</th>
                      <th className={thClass}>Fecha</th>
                      <th className={thClass}>Estado</th>
                      <th className={thClass}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMicrostores.length ? pendingMicrostores.map((business) => (
                      <tr key={business.id}>
                        <td className={`${tdClass} font-semibold`}>{business.nombre}</td>
                        <td className={tdClass}>{business.propietario || 'Sin propietario'}</td>
                        <td className={tdClass}><Badge>{business.categoria || 'Sin categoría'}</Badge></td>
                        <td className={tdClass}>{business.fechaCreacion ? new Date(business.fechaCreacion).toLocaleDateString('es-CO') : 'Sin fecha'}</td>
                        <td className={tdClass}><Badge bg="#F59E0B" color="var(--white)">{formatRevisionState(business.estadoRevision)}</Badge></td>
                        <td className={tdClass}>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                openReviewConfirmation({
                                  type: 'microstore',
                                  id: business.id,
                                  name: `la microtienda ${business.nombre}`,
                                  estadoRevision: 'APROBADO',
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-transparent bg-[#10B981] px-3 py-2 text-sm font-semibold text-[var(--white)]"
                              disabled={reviewActionLoading === `microstore-${business.id}-APROBADO`}
                            >
                              <CheckCircle size={16} />
                              {reviewActionLoading === `microstore-${business.id}-APROBADO` ? 'Aprobando...' : 'Aprobar'}
                            </button>
                            <button
                              onClick={() =>
                                openReviewConfirmation({
                                  type: 'microstore',
                                  id: business.id,
                                  name: `la microtienda ${business.nombre}`,
                                  estadoRevision: 'RECHAZADO',
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-transparent bg-[#DC2626] px-3 py-2 text-sm font-semibold text-[var(--white)]"
                              disabled={reviewActionLoading === `microstore-${business.id}-RECHAZADO`}
                            >
                              <XCircle size={16} />
                              {reviewActionLoading === `microstore-${business.id}-RECHAZADO` ? 'Rechazando...' : 'Rechazar'}
                            </button>
                            <button className={smallOutlineButtonClass}><Eye size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className={tdClass} colSpan={6}>
                          <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                            No hay emprendimientos pendientes por aprobar.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className="mb-6">Productos Pendientes de Aprobación</h2>
              <div className={tableWrapperClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Producto</th>
                      <th className={thClass}>Microtienda</th>
                      <th className={thClass}>Categoría</th>
                      <th className={thClass}>Precio</th>
                      <th className={thClass}>Stock</th>
                      <th className={thClass}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProducts.length ? pendingProducts.map((product) => (
                      <tr key={`pending-product-${product.id}`}>
                        <td className={tdClass}>
                          <div className="flex items-start gap-3">
                            {product.imagenUrl ? (
                              <img src={product.imagenUrl} alt={product.nombre} className="h-12 w-12 rounded-[12px] object-cover" />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--secondary)] text-xs font-semibold text-[var(--muted-foreground)]">
                                IMG
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-[var(--foreground)]">{product.nombre}</div>
                              <div className="text-xs text-[var(--muted-foreground)]">
                                {product.descripcion || 'Sin descripción'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>{product.microtiendaNombre || product.microtienda || 'Sin microtienda'}</td>
                        <td className={tdClass}>
                          <Badge>{product.categoriaNombre || product.categoria || 'Sin categoría'}</Badge>
                        </td>
                        <td className={tdClass}>
                          {Number(product.precio || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                        </td>
                        <td className={tdClass}>{product.stock ?? 0}</td>
                        <td className={tdClass}>
                          <div className="flex flex-wrap gap-2">
                            <button className={smallOutlineButtonClass} onClick={() => setPreviewProduct(product)}>
                              <Eye size={16} />
                              Vista previa
                            </button>
                            <button
                              onClick={() =>
                                openReviewConfirmation({
                                  type: 'product',
                                  id: product.id,
                                  name: `el producto ${product.nombre}`,
                                  estadoRevision: 'APROBADO',
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-transparent bg-[#10B981] px-3 py-2 text-sm font-semibold text-[var(--white)]"
                              disabled={reviewActionLoading === `product-${product.id}-APROBADO`}
                            >
                              <CheckCircle size={16} />
                              {reviewActionLoading === `product-${product.id}-APROBADO` ? 'Aprobando...' : 'Aprobar'}
                            </button>
                            <button
                              onClick={() =>
                                openReviewConfirmation({
                                  type: 'product',
                                  id: product.id,
                                  name: `el producto ${product.nombre}`,
                                  estadoRevision: 'RECHAZADO',
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-transparent bg-[#DC2626] px-3 py-2 text-sm font-semibold text-[var(--white)]"
                              disabled={reviewActionLoading === `product-${product.id}-RECHAZADO`}
                            >
                              <XCircle size={16} />
                              {reviewActionLoading === `product-${product.id}-RECHAZADO` ? 'Rechazando...' : 'Rechazar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className={tdClass} colSpan={6}>
                          <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                            No hay productos pendientes por aprobar.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'users' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={cardClass}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="m-0">Gestión de usuarios</h2>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="search"
                    className={`${inputClass} max-w-[260px] lg:max-w-[280px]`}
                    placeholder="Buscar por nombre, correo o negocio..."
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                  />
                  <button className={accentButtonClass} onClick={openCreateUser}>
                    <Plus size={18} />
                    Nuevo usuario
                  </button>
                </div>
              </div>
              {usersLoading ? (
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  Cargando usuarios registrados...
                </div>
              ) : (
                <div className={tableWrapperClass}>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Nombre</th>
                        <th className={thClass}>Correo</th>
                        <th className={thClass}>Rol</th>
                        <th className={thClass}>Negocio</th>
                        <th className={thClass}>Estado</th>
                        <th className={thClass}>Revisión</th>
                        <th className={thClass}>Registro</th>
                        <th className={thClass}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className={`${tdClass} font-semibold`}>{user.nombre}</td>
                            <td className={tdClass}>{user.correo}</td>
                            <td className={tdClass}>
                              <Badge bg="var(--primary)" color="var(--primary-foreground)">
                                {formatRole(user.rol)}
                              </Badge>
                            </td>
                            <td className={tdClass}>{user.negocio}</td>
                            <td className={tdClass}>
                              <Badge bg={user.estado ? '#10B981' : '#6B7280'} color="var(--white)">
                                {formatState(user)}
                              </Badge>
                            </td>
                            <td className={tdClass}>
                              <Badge
                                bg={
                                  user.estadoRevision === 'APROBADO'
                                    ? '#10B981'
                                    : user.estadoRevision === 'RECHAZADO'
                                      ? '#DC2626'
                                      : '#F59E0B'
                                }
                                color="var(--white)"
                              >
                                {formatRevisionState(user.estadoRevision)}
                              </Badge>
                            </td>
                            <td className={tdClass}>
                              {user.fechaCreacion
                                ? new Date(user.fechaCreacion).toLocaleDateString('es-CO')
                                : 'Sin fecha'}
                            </td>
                            <td className={tdClass}>
                              <div className="flex flex-wrap gap-2">
                                <button className={smallOutlineButtonClass} onClick={() => openEditUser(user)}>
                                  <Pencil size={16} />
                                  Editar
                                </button>
                                <button
                                  className="inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-[#DC2626] px-3 py-2 text-sm font-semibold text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626] hover:text-[var(--white)]"
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={deletingUserId === user.id}
                                >
                                  <Trash2 size={16} />
                                  {deletingUserId === user.id ? 'Eliminando...' : 'Eliminar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={tdClass} colSpan={8}>
                            <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                              No hay usuarios que coincidan con la búsqueda actual.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'pqrs' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={cardClass}>
              <h2 className="mb-6">Gestión de PQRs</h2>
              <div className={tableWrapperClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Tipo</th>
                      <th className={thClass}>Asunto</th>
                      <th className={thClass}>Autor</th>
                      <th className={thClass}>Fecha</th>
                      <th className={thClass}>Estado</th>
                      <th className={thClass}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pqrsItems.length ? pqrsItems.map((pqr) => (
                      <Fragment key={`pqrs-${pqr.id}`}>
                        <tr key={`pqrs-row-${pqr.id}`}>
                          <td className={tdClass}>
                            <Badge bg={pqr.tipo === 'QUEJA' ? '#DC2626' : 'var(--accent)'} color={pqr.tipo === 'QUEJA' ? 'var(--white)' : 'var(--accent-foreground)'}>
                              {formatPqrsType(pqr.tipo)}
                            </Badge>
                          </td>
                          <td className={`${tdClass} font-semibold`}>{pqr.asunto}</td>
                          <td className={tdClass}>{pqr.nombre}</td>
                          <td className={tdClass}>{pqr.fecha ? new Date(pqr.fecha).toLocaleDateString('es-CO') : 'Sin fecha'}</td>
                          <td className={tdClass}>
                            <Badge
                              bg={pqr.estado === 'PENDIENTE' ? '#F59E0B' : pqr.estado === 'EN_PROCESO' ? 'var(--primary)' : '#10B981'}
                              color="var(--white)"
                            >
                              {pqr.estado}
                            </Badge>
                          </td>
                          <td className={tdClass}>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className={smallOutlineButtonClass}
                                onClick={() => setExpandedPqrsId((current) => (current === pqr.id ? null : pqr.id))}
                              >
                                Ver detalles
                              </button>
                              <button
                                className="inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--white)]"
                                onClick={() => handleUpdatePqrsStatus(pqr.id, 'EN_PROCESO')}
                                disabled={reviewActionLoading === `pqrs-${pqr.id}-EN_PROCESO` || reviewActionLoading === `pqrs-delete-${pqr.id}` || pqr.estado === 'EN_PROCESO'}
                              >
                                En revisión
                              </button>
                              <button
                                className="inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-transparent bg-[#10B981] px-3 py-2 text-sm font-semibold text-[var(--white)]"
                                onClick={() => handleUpdatePqrsStatus(pqr.id, 'COMPLETADO')}
                                disabled={reviewActionLoading === `pqrs-${pqr.id}-COMPLETADO` || reviewActionLoading === `pqrs-delete-${pqr.id}` || pqr.estado === 'COMPLETADO'}
                              >
                                Completado
                              </button>
                              <button
                                className="inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-[#DC2626] px-3 py-2 text-sm font-semibold text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626] hover:text-[var(--white)]"
                                onClick={() => handleDeletePqrs(pqr)}
                                disabled={reviewActionLoading === `pqrs-delete-${pqr.id}`}
                              >
                                <Trash2 size={16} />
                                {reviewActionLoading === `pqrs-delete-${pqr.id}` ? 'Eliminando...' : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedPqrsId === pqr.id ? (
                          <tr key={`pqrs-detail-${pqr.id}`}>
                            <td className={tdClass} colSpan={6}>
                              <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Correo</p>
                                    <p className="m-0 text-sm">{pqr.correo}</p>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Teléfono</p>
                                    <p className="m-0 text-sm">{pqr.telefono || 'No registrado'}</p>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Mensaje</p>
                                  <p className="m-0 text-sm leading-6 text-[var(--foreground)]">{pqr.mensaje}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    )) : (
                      <tr>
                        <td className={tdClass} colSpan={6}>
                          <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                            No hay PQRs registradas.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'comments' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={cardClass}>
              <h2 className="mb-6">Moderación de comentarios</h2>
              <div className={tableWrapperClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Visitante</th>
                      <th className={thClass}>Microtienda</th>
                      <th className={thClass}>Puntuación</th>
                      <th className={thClass}>Comentario</th>
                      <th className={thClass}>Fecha</th>
                      <th className={thClass}>Estado</th>
                      <th className={thClass}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.length ? ratings.map((rating) => (
                      <tr key={rating.id}>
                        <td className={`${tdClass} font-semibold`}>{rating.nombreVisitante}</td>
                        <td className={tdClass}>{rating.microtienda || 'Sin microtienda'}</td>
                        <td className={tdClass}>{rating.puntuacion}/5</td>
                        <td className={tdClass}>{rating.comentario}</td>
                        <td className={tdClass}>{rating.fecha ? new Date(rating.fecha).toLocaleDateString('es-CO') : 'Sin fecha'}</td>
                        <td className={tdClass}>
                          <Badge
                            bg={
                              rating.estadoRevision === 'APROBADO'
                                ? '#10B981'
                                : rating.estadoRevision === 'RECHAZADO'
                                  ? '#DC2626'
                                  : '#F59E0B'
                            }
                            color="var(--white)"
                          >
                            {formatRevisionState(rating.estadoRevision)}
                          </Badge>
                        </td>
                        <td className={tdClass}>
                          <div className="flex flex-wrap gap-2">
                            {rating.estadoRevision === 'APROBADO' ? (
                              <button
                                onClick={() => handleDeleteRating(rating)}
                                className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-[#DC2626] px-3 py-2 text-sm font-semibold text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626] hover:text-[var(--white)]"
                                disabled={reviewActionLoading === `rating-delete-${rating.id}`}
                              >
                                <Trash2 size={16} />
                                {reviewActionLoading === `rating-delete-${rating.id}` ? 'Eliminando...' : 'Eliminar'}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleReviewRating(rating.id, 'APROBADO')}
                                  className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-transparent bg-[#10B981] px-3 py-2 text-sm font-semibold text-[var(--white)]"
                                  disabled={reviewActionLoading === `rating-${rating.id}-APROBADO`}
                                >
                                  <CheckCircle size={16} />
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleReviewRating(rating.id, 'RECHAZADO')}
                                  className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-transparent bg-[#DC2626] px-3 py-2 text-sm font-semibold text-[var(--white)]"
                                  disabled={reviewActionLoading === `rating-${rating.id}-RECHAZADO`}
                                >
                                  <XCircle size={16} />
                                  Rechazar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className={tdClass} colSpan={7}>
                          <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                            No hay comentarios registrados.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'categories' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={cardClass}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="m-0">Gestión de Categorías</h2>
                <button className={accentButtonClass} onClick={handleCreateCategory}>
                  <Plus size={18} />
                  Agregar Categoría
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {categoriesData.length ? categoriesData.map((category) => (
                  <div key={category.id} className={cardClass}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="mb-1">{category.nombre}</h4>
                        <p className="m-0 text-sm text-[var(--muted-foreground)]">
                          {category.totalMicrotiendas} emprendimientos · {category.totalProductos} productos
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className={smallOutlineButtonClass} onClick={() => handleEditCategory(category)}>Editar</button>
                        <button
                          className="inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-[#DC2626] px-3 py-2 text-sm font-semibold text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626] hover:text-[var(--white)]"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={reviewActionLoading === `category-delete-${category.id}`}
                        >
                          {reviewActionLoading === `category-delete-${category.id}` ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="md:col-span-2 xl:col-span-3 rounded-[var(--radius)] bg-[var(--secondary)] px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                    No hay categorías registradas.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[560px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-4">
              <h3 className="mb-2">{confirmDelete.title}</h3>
              <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                {confirmDelete.message}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                className={outlineButtonClass}
                onClick={() => setConfirmDelete(null)}
                disabled={Boolean(deletingUserId) || Boolean(reviewActionLoading)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[#DC2626] px-6 py-3 text-base font-semibold text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626] hover:text-[var(--white)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingUserId) || Boolean(reviewActionLoading)}
              >
                {confirmDelete.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmLogout ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[560px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-4">
              <h3 className="mb-2">Cerrar sesión</h3>
              <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                ¿Seguro que deseas cerrar sesión y volver al portal?
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button type="button" className={outlineButtonClass} onClick={() => setConfirmLogout(false)}>
                Cancelar
              </button>
              <button type="button" className={primaryButtonClass} onClick={handleConfirmLogout}>
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmReview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[560px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-4">
              <h3 className="mb-2">{confirmReview.title}</h3>
              <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                {confirmReview.message}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                className={outlineButtonClass}
                onClick={() => setConfirmReview(null)}
                disabled={Boolean(reviewActionLoading)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={confirmReview.estadoRevision === 'APROBADO' ? primaryButtonClass : "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[#DC2626] px-6 py-3 text-base font-semibold text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626] hover:text-[var(--white)] disabled:cursor-not-allowed disabled:opacity-60"}
                onClick={handleConfirmReview}
                disabled={Boolean(reviewActionLoading)}
              >
                {confirmReview.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.56)] px-4 py-8">
          <div className="w-full max-w-[760px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="mb-1">{previewProduct.nombre}</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  {previewProduct.microtiendaNombre || previewProduct.microtienda || 'Sin microtienda'}
                </p>
              </div>
              <button className={outlineButtonClass} type="button" onClick={() => setPreviewProduct(null)}>
                Cerrar
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
              <div className="overflow-hidden rounded-[var(--radius)] bg-[var(--secondary)]">
                {previewProduct.imagenUrl ? (
                  <img src={previewProduct.imagenUrl} alt={previewProduct.nombre} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center text-sm font-semibold text-[var(--muted-foreground)]">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Categoría</p>
                  <Badge>{previewProduct.categoriaNombre || previewProduct.categoria || 'Sin categoría'}</Badge>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Descripción</p>
                  <p className="m-0 text-sm leading-6 text-[var(--foreground)]">{previewProduct.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Precio</p>
                    <p className="m-0 text-sm font-semibold text-[var(--foreground)]">
                      {Number(previewProduct.precio || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Stock</p>
                    <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{previewProduct.stock ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editingCategory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[560px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">Editar categoría</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Actualiza el nombre visible de la categoría seleccionada.
                </p>
              </div>
              <button className={outlineButtonClass} onClick={closeEditCategory} type="button">
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSaveCategoryName}>
              <div>
                <label className={labelClass}>Nombre de la categoría</label>
                <input
                  className={inputClass}
                  value={editingCategoryName}
                  onChange={(event) => setEditingCategoryName(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className={outlineButtonClass} onClick={closeEditCategory}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={reviewActionLoading === `category-edit-${editingCategory.id}`}
                >
                  {reviewActionLoading === `category-edit-${editingCategory.id}` ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {creatingCategory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[560px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">Agregar categoría</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Crea una nueva categoría para organizar emprendimientos y productos.
                </p>
              </div>
              <button className={outlineButtonClass} onClick={closeCreateCategory} type="button">
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSaveNewCategory}>
              <div>
                <label className={labelClass}>Nombre de la categoría</label>
                <input
                  className={inputClass}
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className={outlineButtonClass} onClick={closeCreateCategory}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={reviewActionLoading === 'category-create'}
                >
                  {reviewActionLoading === 'category-create' ? 'Guardando...' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {creatingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[720px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">Crear usuario</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Registra un nuevo usuario directamente desde el panel de administración.
                </p>
              </div>
              <button className={outlineButtonClass} onClick={closeCreateUser} type="button">
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input className={inputClass} value={createForm.nombre} onChange={handleCreateFormChange('nombre')} required />
                </div>
                <div>
                  <label className={labelClass}>Correo</label>
                  <input className={inputClass} type="email" value={createForm.correo} onChange={handleCreateFormChange('correo')} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Tipo de documento</label>
                  <select className={inputClass} value={createForm.tipoDocumento} onChange={handleCreateFormChange('tipoDocumento')}>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="TI">TI</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Número de documento</label>
                  <input className={inputClass} value={createForm.numeroDocumento} onChange={handleCreateFormChange('numeroDocumento')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input className={inputClass} value={createForm.telefono} onChange={handleCreateFormChange('telefono')} />
                </div>
                <div>
                  <label className={labelClass}>Dirección</label>
                  <input className={inputClass} value={createForm.direccion} onChange={handleCreateFormChange('direccion')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Rol</label>
                  <select className={inputClass} value={createForm.rol} onChange={handleCreateFormChange('rol')}>
                    <option value="entrepreneur">Emprendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Contraseña inicial</label>
                  <input className={inputClass} value={createForm.password} onChange={handleCreateFormChange('password')} placeholder="Opcional para emprendedor" />
                </div>
                <label className="flex items-center gap-3 pt-8 text-sm font-semibold text-[var(--foreground)]">
                  <input type="checkbox" checked={createForm.estado} onChange={handleCreateFormChange('estado')} />
                  Usuario activo
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className={outlineButtonClass} onClick={closeCreateUser}>
                  Cancelar
                </button>
                <button type="submit" className={primaryButtonClass} disabled={savingUser}>
                  {savingUser ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[720px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">Editar usuario</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Actualiza la información y el estado del usuario seleccionado.
                </p>
              </div>
              <button className={outlineButtonClass} onClick={closeEditUser} type="button">
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSaveUser}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input className={inputClass} value={editForm.nombre} onChange={handleEditFormChange('nombre')} required />
                </div>
                <div>
                  <label className={labelClass}>Correo</label>
                  <input className={inputClass} type="email" value={editForm.correo} onChange={handleEditFormChange('correo')} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Tipo de documento</label>
                  <select className={inputClass} value={editForm.tipoDocumento} onChange={handleEditFormChange('tipoDocumento')}>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="TI">TI</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Número de documento</label>
                  <input className={inputClass} value={editForm.numeroDocumento} onChange={handleEditFormChange('numeroDocumento')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input className={inputClass} value={editForm.telefono} onChange={handleEditFormChange('telefono')} />
                </div>
                <div>
                  <label className={labelClass}>Dirección</label>
                  <input className={inputClass} value={editForm.direccion} onChange={handleEditFormChange('direccion')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Rol</label>
                  <select className={inputClass} value={editForm.rol} onChange={handleEditFormChange('rol')}>
                    <option value="entrepreneur">Emprendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Revisión</label>
                  <select className={inputClass} value={editForm.estadoRevision} onChange={handleEditFormChange('estadoRevision')}>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 pt-8 text-sm font-semibold text-[var(--foreground)]">
                  <input type="checkbox" checked={editForm.estado} onChange={handleEditFormChange('estado')} />
                  Usuario activo
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className={outlineButtonClass} onClick={closeEditUser}>
                  Cancelar
                </button>
                <button type="submit" className={primaryButtonClass} disabled={savingUser}>
                  {savingUser ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

