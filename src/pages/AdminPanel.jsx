import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import {
  createCategoryRequest,
  createUserRequest,
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
  updateCategoryRequest,
  updateUserRequest,
} from '../utils/api.js';
import { clearSession, getSession, getSessionRole } from '../utils/session.js';

const emptyUserForm = {
  id: null,
  nombre: '',
  tipoDocumento: '',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  correo: '',
  password: '',
  rol: 'entrepreneur',
  estado: true,
  estadoRevision: 'APROBADO',
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const sessionRole = getSessionRole();
  const session = getSession();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [pqrs, setPqrs] = useState([]);
  const [pendingMicrotiendas, setPendingMicrotiendas] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    estado: true,
  });
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      const [
        fetchedUsers,
        fetchedCategories,
        fetchedMetrics,
        fetchedPqrs,
        fetchedMicrotiendas,
        fetchedProducts,
        fetchedRatings,
      ] = await Promise.all([
        getUsersRequest(),
        getCategoriesRequest(false),
        getAdminMetricsRequest(),
        getPqrsRequest(),
        getMicrotiendasRequest(true),
        getProductsRequest(undefined, true),
        getRatingsRequest({ includePending: true, includePrivate: true }),
      ]);

      setUsers(fetchedUsers);
      setCategories(fetchedCategories);
      setMetrics(fetchedMetrics);
      setPqrs(fetchedPqrs);
      setPendingMicrotiendas(fetchedMicrotiendas.filter((item) => item.estadoRevision === 'PENDIENTE'));
      setPendingProducts(fetchedProducts.filter((item) => item.estadoRevision === 'PENDIENTE'));
      setPendingRatings(fetchedRatings.filter((item) => item.estadoRevision === 'PENDIENTE'));
      setFormError('');
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));

    if (elements.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -50px 0px' },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  if (sessionRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleSaveUser = async (event) => {
    event.preventDefault();

    try {
      const savedUser = userForm.id
        ? await updateUserRequest(userForm.id, userForm)
        : await createUserRequest(userForm);

      setUsers((currentUsers) => {
        if (userForm.id) {
          return currentUsers.map((item) => (item.id === savedUser.id ? savedUser : item));
        }

        return [savedUser, ...currentUsers];
      });

      setUserForm(emptyUserForm);
      setFormMessage(
        savedUser.generatedPassword
          ? `Usuario guardado correctamente. Contrasena generada: ${savedUser.generatedPassword}`
          : userForm.id
            ? 'Usuario actualizado correctamente.'
            : 'Usuario creado correctamente.',
      );
      setFormError('');
      await loadData();
    } catch (error) {
      setFormError(error.message);
      setFormMessage('');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserRequest(userId);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
      setFormMessage('Usuario eliminado correctamente.');
      setFormError('');
      if (userForm.id === userId) {
        setUserForm(emptyUserForm);
      }
      await loadData();
    } catch (error) {
      setFormError(error.message);
      setFormMessage('');
    }
  };

  const handleApproveApplicant = async (user) => {
    try {
      const approvedUser = await updateUserRequest(user.id, {
        ...user,
        estado: true,
        estadoRevision: 'APROBADO',
      });
      setFormMessage(
        approvedUser.generatedPassword
          ? `Solicitud aprobada. Contrasena generada: ${approvedUser.generatedPassword}`
          : 'Solicitud de emprendedor aprobada.',
      );
      setFormError('');
      setUserForm(emptyUserForm);
      await loadData();
    } catch (error) {
      setFormError(error.message);
      setFormMessage('');
    }
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();

    try {
      const savedCategory = categoryForm.id
        ? await updateCategoryRequest(categoryForm.id, categoryForm)
        : await createCategoryRequest(categoryForm);

      setCategories((currentCategories) => {
        if (categoryForm.id) {
          return currentCategories.map((category) => (category.id === savedCategory.id ? savedCategory : category));
        }

        return [...currentCategories, savedCategory];
      });

      setCategoryForm({
        id: null,
        nombre: '',
        descripcion: '',
        estado: true,
      });
      setFormMessage(categoryForm.id ? 'Categoria actualizada correctamente.' : 'Categoria creada correctamente.');
      setFormError('');
    } catch (error) {
      setFormError(error.message);
      setFormMessage('');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategoryRequest(categoryId);
      setCategories((currentCategories) => currentCategories.filter((category) => category.id !== categoryId));
      setFormMessage('Categoria eliminada correctamente.');
      setFormError('');
    } catch (error) {
      setFormError(error.message);
      setFormMessage('');
    }
  };

  const handleReview = async (reviewer, id, estadoRevision) => {
    try {
      await reviewer(id, { estadoRevision });
      setFormMessage(`Solicitud ${estadoRevision.toLowerCase()} correctamente.`);
      setFormError('');
      await loadData();
    } catch (error) {
      setFormError(error.message);
      setFormMessage('');
    }
  };

  const pendingApplicants = users.filter(
    (user) => user.rol === 'entrepreneur' && user.estadoRevision === 'PENDIENTE',
  );

  const metricsCards = metrics
    ? [
        { label: 'Usuarios registrados', value: metrics.resumen.totalUsuarios, detail: `${metrics.resumen.totalEmprendedores} emprendedores en la plataforma.` },
        { label: 'Microtiendas aprobadas', value: metrics.resumen.microtiendasActivas, detail: `${metrics.resumen.microtiendasPendientes} pendientes por revisar.` },
        { label: 'Productos aprobados', value: metrics.resumen.productosActivos, detail: `${metrics.resumen.productosPendientes} pendientes por revisar.` },
        { label: 'Calificaciones aprobadas', value: metrics.resumen.totalCalificaciones, detail: `${metrics.resumen.calificacionesPendientes} pendientes por revisar.` },
        { label: 'Categorias activas', value: metrics.resumen.categoriasActivas, detail: 'Categorias administrables desde este panel.' },
        { label: 'PQRS registradas', value: metrics.resumen.totalPqrs, detail: 'Solicitudes almacenadas para seguimiento.' },
      ]
    : [];

  return (
    <main className="portal portal-service-page portal-dashboard-page admin-page">
      <header className="portal-header portal-home-header portal-home-toolbar dashboard-header">
        <div className="container-xxl">
          <div className="navbar-shell home-toolbar-shell">
            <div className="navbar-brand-slot">
              <BrandLogo />
            </div>

            <div className="navbar-actions-slot">
              <nav className="header-actions service-header-actions home-toolbar-actions dashboard-header-actions" aria-label="Navegacion administrativa">
                <button type="button" className="btn portal-btn portal-btn-dark logout-button" onClick={() => { clearSession(); navigate('/'); }}>
                  Cierre de sesion
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <section className="service-hero-section dashboard-hero-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="admin-hero dashboard-hero-grid">
            <div className="hero-copy dashboard-hero-copy">
              <h1>Gestion institucional del sistema con una interfaz mas clara y ordenada.</h1>
              <p className="hero-text">
                Desde aqui el administrador valida postulaciones, asigna contrasenas,
                administra usuarios y aprueba contenido antes de publicarlo.
              </p>
            </div>

            <aside className="hero-panel dashboard-hero-panel">
              <h2>Acceso seguro</h2>
              <p>Sesion activa: <strong>{session?.user?.nombre}</strong></p>
              <p>Los datos personales privados solo son visibles en este panel.</p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container-xxl dashboard-feedback-stack">
        {formMessage ? <p className="form-success">{formMessage}</p> : null}
        {formError ? <p className="login-error">{formError}</p> : null}
      </div>

      <section className="users-section service-section dashboard-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="section-heading">
            <p className="section-kicker">Solicitudes</p>
            <h2>Postulaciones de nuevos emprendedores</h2>
          </div>

          <div className="users-table-card dashboard-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Direccion</th>
                <th>Telefono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingApplicants.length > 0 ? (
                pendingApplicants.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nombre}</td>
                    <td>{user.tipoDocumento} {user.numeroDocumento}</td>
                    <td>{user.direccion}</td>
                    <td>{user.telefono}</td>
                    <td>{user.correo}</td>
                    <td>{user.estadoRevision}</td>
                    <td>
                      <div className="table-actions-stack">
                        <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => setUserForm({ ...emptyUserForm, ...user, password: '' })}>Preparar aprobacion</button>
                        <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7">No hay solicitudes pendientes.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      <section className="users-section service-section dashboard-section" data-reveal="fade-left">
        <div className="container-xxl">
          <div className="section-heading">
            <p className="section-kicker">Gestion de usuarios</p>
            <h2>Crear, aprobar y actualizar perfiles del sistema</h2>
          </div>

          <div className="admin-user-layout dashboard-split-layout">
          <form className="admin-user-form dashboard-form-card" onSubmit={handleSaveUser}>
            <div className="section-heading">
              <p className="section-kicker">{userForm.id ? 'Edicion' : 'Registro'}</p>
              <h3>{userForm.id ? 'Editar o aprobar usuario' : 'Crear nuevo usuario'}</h3>
            </div>

            <input className="form-control" type="text" placeholder="Nombre completo" value={userForm.nombre} onChange={(event) => setUserForm((current) => ({ ...current, nombre: event.target.value }))} />
            <div className="service-form-grid">
              <select className="form-select" value={userForm.tipoDocumento} onChange={(event) => setUserForm((current) => ({ ...current, tipoDocumento: event.target.value }))}>
                <option value="">Tipo de documento</option>
                <option value="CC">Cedula</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="CE">Cedula de extranjeria</option>
                <option value="PAS">Pasaporte</option>
              </select>
              <input className="form-control" type="text" placeholder="Numero de documento" value={userForm.numeroDocumento} onChange={(event) => setUserForm((current) => ({ ...current, numeroDocumento: event.target.value }))} />
            </div>
            <input className="form-control" type="text" placeholder="Direccion" value={userForm.direccion} onChange={(event) => setUserForm((current) => ({ ...current, direccion: event.target.value }))} />
            <input className="form-control" type="text" placeholder="Telefono" value={userForm.telefono} onChange={(event) => setUserForm((current) => ({ ...current, telefono: event.target.value }))} />
            <input className="form-control" type="email" placeholder="Correo del usuario" value={userForm.correo} onChange={(event) => setUserForm((current) => ({ ...current, correo: event.target.value }))} />
            <input className="form-control" type="password" placeholder={userForm.id ? 'Nueva contrasena opcional' : 'Contrasena opcional'} value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
            <select className="form-select" value={userForm.rol} onChange={(event) => setUserForm((current) => ({ ...current, rol: event.target.value }))}>
              <option value="entrepreneur">Emprendedor</option>
              <option value="admin">Administrador</option>
            </select>
            <select className="form-select" value={userForm.estadoRevision} onChange={(event) => setUserForm((current) => ({ ...current, estadoRevision: event.target.value }))}>
              <option value="APROBADO">Aprobado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
            <button type="submit" className="btn portal-btn portal-btn-primary">
              {userForm.id ? 'Guardar cambios' : 'Crear usuario'}
            </button>
            {userForm.id && userForm.rol === 'entrepreneur' ? (
              <button type="button" className="btn portal-btn portal-btn-secondary" onClick={() => handleApproveApplicant(userForm)}>
                Aprobar con contrasena
              </button>
            ) : null}
          </form>

          <div className="users-table-card dashboard-card users-table-card-fill">
            <div className="table-card-header"><h3>Usuarios registrados</h3></div>
            <div className="users-table-scroll users-table-scroll-panel" aria-label="Desplazamiento de usuarios registrados">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Revision</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="6">Cargando usuarios...</td></tr>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.nombre}</td>
                        <td>{user.tipoDocumento} {user.numeroDocumento}</td>
                        <td>{user.correo}</td>
                        <td>{user.rol === 'admin' ? 'Administrador' : 'Emprendedor'}</td>
                        <td>{user.estadoRevision}</td>
                        <td>
                          <div className="table-actions-stack">
                            <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => setUserForm({ ...emptyUserForm, ...user, password: '' })}>Editar</button>
                            <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6">No hay usuarios registrados todavia.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="users-section service-section dashboard-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="section-heading">
            <p className="section-kicker">Validaciones</p>
            <h2>Solicitudes de microtiendas y productos</h2>
          </div>

        <div className="users-table-card dashboard-card stacked-table-card">
          <div className="table-card-header"><h3>Microtiendas pendientes</h3></div>
          <table className="users-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Negocio</th>
                <th>Propietario</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingMicrotiendas.length > 0 ? pendingMicrotiendas.map((item) => (
                <tr key={item.id}>
                  <td>{item.logoImagen ? <img src={item.logoImagen} alt={item.nombre} className="table-image-preview" /> : 'Sin logo'}</td>
                  <td>{item.nombre}</td>
                  <td>{item.propietario}</td>
                  <td>{item.categoria}</td>
                  <td>{item.estadoRevision}</td>
                  <td>
                    <div className="table-actions-stack">
                      <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleReview(reviewMicrotiendaRequest, item.id, 'APROBADO')}>Aprobar</button>
                      <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleReview(reviewMicrotiendaRequest, item.id, 'RECHAZADO')}>Rechazar</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="6">No hay microtiendas pendientes.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="users-table-card dashboard-card stacked-table-card">
          <div className="table-card-header"><h3>Productos pendientes</h3></div>
          <table className="users-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Descripcion</th>
                <th>Microtienda</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.length > 0 ? pendingProducts.map((item) => (
                <tr key={item.id}>
                  <td>{item.imagenUrl ? <img src={item.imagenUrl} alt={item.nombre} className="table-image-preview" /> : 'Sin imagen'}</td>
                  <td>{item.nombre}</td>
                  <td>{item.descripcion}</td>
                  <td>{item.microtienda}</td>
                  <td>{item.categoria}</td>
                  <td>{item.estadoRevision}</td>
                  <td>
                    <div className="table-actions-stack">
                      <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleReview(reviewProductRequest, item.id, 'APROBADO')}>Aprobar</button>
                      <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleReview(reviewProductRequest, item.id, 'RECHAZADO')}>Rechazar</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="7">No hay productos pendientes.</td></tr>}
            </tbody>
          </table>
        </div>
        </div>
      </section>

      <section className="users-section service-section dashboard-section" data-reveal="fade-left">
        <div className="container-xxl">
          <div className="section-heading">
            <p className="section-kicker">Calificaciones</p>
            <h2>Revision con datos personales privados</h2>
          </div>

        <div className="users-table-card dashboard-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Direccion</th>
                <th>Telefono</th>
                <th>Microtienda</th>
                <th>Puntuacion</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingRatings.length > 0 ? pendingRatings.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombreVisitante}</td>
                  <td>{item.tipoDocumento} {item.numeroDocumento}</td>
                  <td>{item.direccion}</td>
                  <td>{item.telefono}</td>
                  <td>{item.microtienda}</td>
                  <td>{item.puntuacion}</td>
                  <td>{item.estadoRevision}</td>
                  <td>
                    <div className="table-actions-stack">
                      <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleReview(reviewRatingRequest, item.id, 'APROBADO')}>Aprobar</button>
                      <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleReview(reviewRatingRequest, item.id, 'RECHAZADO')}>Rechazar</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="8">No hay calificaciones pendientes.</td></tr>}
            </tbody>
          </table>
        </div>
        </div>
      </section>

      <section className="users-section service-section dashboard-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="section-heading">
            <p className="section-kicker">Categorias</p>
            <h2>Gestiona la estructura base del portal</h2>
          </div>

        <div className="admin-user-layout dashboard-split-layout">
          <form className="admin-user-form dashboard-form-card" onSubmit={handleSaveCategory}>
            <div className="section-heading">
              <p className="section-kicker">{categoryForm.id ? 'Edicion' : 'Registro'}</p>
              <h3>{categoryForm.id ? 'Editar categoria' : 'Crear categoria'}</h3>
            </div>

            <input className="form-control" type="text" placeholder="Nombre de la categoria" value={categoryForm.nombre} onChange={(event) => setCategoryForm((current) => ({ ...current, nombre: event.target.value }))} />
            <textarea className="form-control" rows="4" placeholder="Descripcion" value={categoryForm.descripcion} onChange={(event) => setCategoryForm((current) => ({ ...current, descripcion: event.target.value }))}></textarea>
            <select className="form-select" value={categoryForm.estado ? 'activo' : 'inactivo'} onChange={(event) => setCategoryForm((current) => ({ ...current, estado: event.target.value === 'activo' }))}>
              <option value="activo">Activa</option>
              <option value="inactivo">Inactiva</option>
            </select>
            <button type="submit" className="btn portal-btn portal-btn-primary">
              {categoryForm.id ? 'Actualizar categoria' : 'Crear categoria'}
            </button>
          </form>

          <div className="users-table-card dashboard-card users-table-card-fill">
            <div className="table-card-header"><h3>Categorias registradas</h3></div>
            <div className="users-table-scroll users-table-scroll-panel" aria-label="Desplazamiento de categorias registradas">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Microtiendas</th>
                    <th>Productos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.nombre}</td>
                      <td>{category.estado ? 'Activa' : 'Inactiva'}</td>
                      <td>{category.totalMicrotiendas}</td>
                      <td>{category.totalProductos}</td>
                      <td>
                        <div className="table-actions-stack">
                          <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => setCategoryForm(category)}>Editar</button>
                          <button type="button" className="btn portal-btn portal-btn-secondary table-action-btn" onClick={() => handleDeleteCategory(category.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
      </div>
      </section>

      <section className="metrics-section service-section dashboard-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="section-heading">
            <p className="section-kicker">Metricas institucionales</p>
            <h2>Resumen operativo del portal</h2>
          </div>

          <div className="metrics-grid">
          {metricsCards.map((metric) => (
            <article key={metric.label} className="metric-card">
              <p className="metric-label">{metric.label}</p>
              <h3>{metric.value}</h3>
              <p>{metric.detail}</p>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="users-section service-section dashboard-section" data-reveal="fade-left">
        <div className="container-xxl">
          <div className="section-heading">
            <p className="section-kicker">Solicitudes PQRS</p>
            <h2>Mensajes institucionales recibidos</h2>
          </div>

          <div className="users-table-card dashboard-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {pqrs.length > 0 ? (
                pqrs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.tipo}</td>
                    <td>{item.nombre}</td>
                    <td>{item.correo}</td>
                    <td>{item.estado}</td>
                    <td>{item.mensaje}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No hay PQRS registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
