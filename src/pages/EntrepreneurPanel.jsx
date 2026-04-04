import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import {
  createMicrotiendaRequest,
  createProductRequest,
  deleteMicrotiendaRequest,
  deleteProductRequest,
  getCategoriesRequest,
  getEntrepreneurMetricsRequest,
  getMyMicrotiendaRequest,
  getMyProductsRequest,
  updateMicrotiendaRequest,
  updateProductRequest,
  changeMyPasswordRequest,
} from '../utils/api.js';
import { clearSession, getSession, getSessionRole, updateSessionUser } from '../utils/session.js';

const emptyMicrotiendaForm = {
  nombre: '',
  descripcion: '',
  sectorEconomico: '',
  whatsapp: '',
  redesSociales: '',
  logoImagen: '',
  idCategoria: '',
  estado: true,
};

const emptyProductForm = {
  id: null,
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagenUrl: '',
  idCategoria: '',
  estado: true,
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No fue posible leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });

export default function EntrepreneurPanel() {
  const navigate = useNavigate();
  const sessionRole = getSessionRole();
  const session = getSession();
  const [categories, setCategories] = useState([]);
  const [microtienda, setMicrotienda] = useState(null);
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [microtiendaForm, setMicrotiendaForm] = useState(emptyMicrotiendaForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [pageError, setPageError] = useState('');
  const [pageMessage, setPageMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const loadDashboard = async () => {
    try {
      const [fetchedCategories, myMicrotienda, myMetrics] = await Promise.all([
        getCategoriesRequest(true),
        getMyMicrotiendaRequest(),
        getEntrepreneurMetricsRequest(),
      ]);

      setCategories(fetchedCategories);
      setMicrotienda(myMicrotienda);
      setMetrics(myMetrics);

      if (myMicrotienda) {
        const microtiendaProducts = await getMyProductsRequest();
        setProducts(microtiendaProducts);
        setMicrotiendaForm({
          nombre: myMicrotienda.nombre,
          descripcion: myMicrotienda.descripcion,
          sectorEconomico: myMicrotienda.sectorEconomico,
          whatsapp: myMicrotienda.whatsapp,
          redesSociales: myMicrotienda.redesSociales,
          logoImagen: myMicrotienda.logoImagen || '',
          idCategoria: myMicrotienda.categoriaId,
          estado: myMicrotienda.estado,
        });
      } else {
        setProducts([]);
        setMicrotiendaForm(emptyMicrotiendaForm);
      }

      setPageError('');
    } catch (error) {
      setPageError(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      await loadDashboard();
    })();
  }, []);

  if (sessionRole !== 'entrepreneur') {
    return <Navigate to="/login" replace />;
  }

  const mustChangePassword = Boolean(session?.user?.mustChangePassword);

  const handleMicrotiendaImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imageData = await readFileAsDataUrl(file);
      setMicrotiendaForm((current) => ({ ...current, logoImagen: imageData }));
      setPageError('');
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleProductImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imageData = await readFileAsDataUrl(file);
      setProductForm((current) => ({ ...current, imagenUrl: imageData }));
      setPageError('');
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleSaveMicrotienda = async (event) => {
    event.preventDefault();

    try {
      const savedMicrotienda = microtienda
        ? await updateMicrotiendaRequest(microtienda.id, microtiendaForm)
        : await createMicrotiendaRequest(microtiendaForm);

      setMicrotienda(savedMicrotienda);
      setPageMessage(microtienda ? 'Microtienda actualizada.' : 'Microtienda creada.');
      setPageError('');
      await loadDashboard();
    } catch (error) {
      setPageError(error.message);
      setPageMessage('');
    }
  };

  const handleDeleteMicrotienda = async () => {
    if (!microtienda) {
      return;
    }

    try {
      await deleteMicrotiendaRequest(microtienda.id);
      setMicrotienda(null);
      setProducts([]);
      setMetrics(null);
      setMicrotiendaForm(emptyMicrotiendaForm);
      setPageMessage('Microtienda eliminada correctamente.');
      setPageError('');
    } catch (error) {
      setPageError(error.message);
      setPageMessage('');
    }
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    try {
      const savedProduct = productForm.id
        ? await updateProductRequest(productForm.id, productForm)
        : await createProductRequest(productForm);

      setProducts((currentProducts) => {
        if (productForm.id) {
          return currentProducts.map((item) => (item.id === savedProduct.id ? savedProduct : item));
        }

        return [savedProduct, ...currentProducts];
      });

      setProductForm({
        ...emptyProductForm,
        idCategoria: microtienda?.categoriaId || '',
      });
      setPageMessage(productForm.id ? 'Producto actualizado.' : 'Producto creado.');
      setPageError('');
      await loadDashboard();
    } catch (error) {
      setPageError(error.message);
      setPageMessage('');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProductRequest(productId);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
      setPageMessage('Producto eliminado.');
      setPageError('');
      await loadDashboard();
    } catch (error) {
      setPageError(error.message);
      setPageMessage('');
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPageError('La nueva contrasena y la confirmacion no coinciden.');
      setPageMessage('');
      return;
    }

    try {
      const updatedUser = await changeMyPasswordRequest({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      updateSessionUser({
        mustChangePassword: updatedUser.mustChangePassword,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPageMessage('Contrasena actualizada correctamente.');
      setPageError('');
      window.location.reload();
    } catch (error) {
      setPageError(error.message);
      setPageMessage('');
    }
  };

  return (
    <main className="portal admin-page">
      <header className="portal-header">
        <BrandLogo />
        <nav className="header-actions" aria-label="Navegacion emprendedor">
          <button
            type="button"
            className="logout-button"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      <section className="admin-hero">
        <div className="hero-copy">
          <span className="eyebrow">Panel Emprendedor</span>
          <h1>Microtienda y metricas del emprendimiento</h1>
          <p className="hero-text">
            Espacio del emprendedor para administrar la microtienda digital,
            productos y revisar indicadores reales de su negocio.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Acceso empresarial</h2>
          <p>
            Desde este panel el emprendedor puede gestionar productos, precios,
            inventario, logo e informacion del negocio.
          </p>
          <p>
            Usuario autenticado: <strong>{session?.user?.nombre}</strong>
          </p>
        </aside>
      </section>

      {pageMessage ? <p className="form-success">{pageMessage}</p> : null}
      {pageError ? <p className="login-error">{pageError}</p> : null}

      {mustChangePassword ? (
        <section className="users-section">
          <div className="section-heading">
            <p className="section-kicker">Seguridad inicial</p>
            <h2>Cambia la contrasena generada antes de continuar</h2>
          </div>

          <form className="admin-user-form" onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Contrasena actual"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
            />
            <input
              type="password"
              placeholder="Nueva contrasena"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
            />
            <input
              type="password"
              placeholder="Confirmar nueva contrasena"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            />
            <button type="submit" className="primary-button">
              Guardar nueva contrasena
            </button>
          </form>
        </section>
      ) : null}

      {mustChangePassword ? (
        <SiteFooter />
      ) : (
        <>
          <section className="microstore-section">
            <div className="section-heading">
              <p className="section-kicker">Modulo 3</p>
              <h2>Microtienda Empresarial</h2>
            </div>

            <div className="admin-user-layout">
              <form className="admin-user-form" onSubmit={handleSaveMicrotienda}>
                <div className="section-heading">
                  <p className="section-kicker">{microtienda ? 'Edicion' : 'Registro'}</p>
                  <h3>{microtienda ? 'Actualizar microtienda' : 'Crear microtienda'}</h3>
                </div>

                <input type="text" placeholder="Nombre del negocio" value={microtiendaForm.nombre} onChange={(event) => setMicrotiendaForm((current) => ({ ...current, nombre: event.target.value }))} />
                <textarea rows="4" placeholder="Descripcion" value={microtiendaForm.descripcion} onChange={(event) => setMicrotiendaForm((current) => ({ ...current, descripcion: event.target.value }))}></textarea>
                <input type="text" placeholder="Sector economico" value={microtiendaForm.sectorEconomico} onChange={(event) => setMicrotiendaForm((current) => ({ ...current, sectorEconomico: event.target.value }))} />
                <input type="text" placeholder="WhatsApp" value={microtiendaForm.whatsapp} onChange={(event) => setMicrotiendaForm((current) => ({ ...current, whatsapp: event.target.value }))} />
                <input type="text" placeholder="Redes sociales" value={microtiendaForm.redesSociales} onChange={(event) => setMicrotiendaForm((current) => ({ ...current, redesSociales: event.target.value }))} />
                <label className="upload-field">
                  <span>Logo del emprendimiento</span>
                  <input type="file" accept="image/*" onChange={handleMicrotiendaImageChange} />
                </label>
                {microtiendaForm.logoImagen ? (
                  <img src={microtiendaForm.logoImagen} alt="Preview del logo" className="upload-preview" />
                ) : null}
                <select value={microtiendaForm.idCategoria} onChange={(event) => setMicrotiendaForm((current) => ({ ...current, idCategoria: event.target.value }))}>
                  <option value="">Selecciona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
                <button type="submit" className="primary-button">
                  {microtienda ? 'Actualizar microtienda' : 'Crear microtienda'}
                </button>
                {microtienda ? (
                  <button type="button" className="secondary-button" onClick={handleDeleteMicrotienda}>
                    Eliminar microtienda
                  </button>
                ) : null}
                <p className="status-chip">
                  Estado de revision: {microtienda?.estadoRevision || 'Sin solicitud'}
                </p>
              </form>

              <div className="microstore-business-card">
                <div className="microstore-business-header">
                  <div>
                    <p className="section-kicker">Ficha del negocio</p>
                    <h3>{microtienda?.nombre || 'Tu negocio aun no esta registrado'}</h3>
                  </div>
                  <span className="shop-badge">{microtienda?.categoria || 'Pendiente'}</span>
                </div>
                {microtienda?.estadoRevision ? (
                  <p className="review-note">
                    Revision actual: <strong>{microtienda.estadoRevision}</strong>
                  </p>
                ) : null}

                {microtienda?.logoImagen ? (
                  <img
                    src={microtienda.logoImagen}
                    alt={`Logo de ${microtienda.nombre}`}
                    className="business-logo-preview"
                  />
                ) : null}

                <div className="business-details">
                  <div><strong>Empresa</strong><p>{microtienda?.nombre || 'Sin registro'}</p></div>
                  <div><strong>Sector economico</strong><p>{microtienda?.sectorEconomico || 'Sin registro'}</p></div>
                  <div><strong>WhatsApp</strong><p>{microtienda?.whatsapp || 'Sin registro'}</p></div>
                  <div><strong>Redes sociales</strong><p>{microtienda?.redesSociales || 'Sin registro'}</p></div>
                </div>
              </div>
            </div>

          </section>

          <section className="users-section">
            <div className="section-heading">
              <p className="section-kicker">Productos</p>
              <h2>CRUD de productos</h2>
            </div>

            <div className="admin-user-layout">
              <form className="admin-user-form" onSubmit={handleSaveProduct}>
                <div className="section-heading">
                  <p className="section-kicker">{productForm.id ? 'Edicion' : 'Registro'}</p>
                  <h3>{productForm.id ? 'Editar producto' : 'Agregar producto'}</h3>
                </div>

                <input type="text" placeholder="Nombre del producto" value={productForm.nombre} onChange={(event) => setProductForm((current) => ({ ...current, nombre: event.target.value }))} />
                <textarea rows="4" placeholder="Descripcion" value={productForm.descripcion} onChange={(event) => setProductForm((current) => ({ ...current, descripcion: event.target.value }))}></textarea>
                <input type="number" placeholder="Precio" value={productForm.precio} onChange={(event) => setProductForm((current) => ({ ...current, precio: event.target.value }))} />
                <input type="number" placeholder="Inventario" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
                <label className="upload-field">
                  <span>Imagen del producto</span>
                  <input type="file" accept="image/*" onChange={handleProductImageChange} />
                </label>
                {productForm.imagenUrl ? (
                  <img src={productForm.imagenUrl} alt="Preview del producto" className="upload-preview product-upload-preview" />
                ) : null}
                <select value={productForm.idCategoria} onChange={(event) => setProductForm((current) => ({ ...current, idCategoria: event.target.value }))}>
                  <option value="">Selecciona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
                <button type="submit" className="primary-button" disabled={!microtienda}>
                  {productForm.id ? 'Actualizar producto' : 'Crear producto'}
                </button>
                <p className="review-note">
                  Los productos nuevos o editados quedan en revision hasta aprobacion del administrador.
                </p>
              </form>

              <div className="users-table-card">
                <div className="table-card-header">
                  <h3>Productos y servicios</h3>
                </div>

                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Inventario</th>
                      <th>Categoria</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.imagenUrl ? (
                              <img src={product.imagenUrl} alt={product.nombre} className="table-image-preview" />
                            ) : (
                              'Sin imagen'
                            )}
                          </td>
                          <td>{product.nombre}</td>
                          <td>${product.precio.toLocaleString('es-CO')}</td>
                          <td>{product.stock}</td>
                          <td>{product.categoria}</td>
                          <td>
                            <span className="status-chip">Estado: {product.estadoRevision}</span>
                          </td>
                          <td>
                            <button type="button" className="secondary-button" onClick={() => setProductForm(product)}>Editar</button>
                            <button type="button" className="secondary-button" onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7">No hay productos registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="metrics-section">
            <div className="section-heading">
              <p className="section-kicker">Modulo 5</p>
              <h2>Metricas de tu microtienda</h2>
            </div>

            <div className="metrics-grid">
              <article className="metric-card">
                <p className="metric-label">Microtienda</p>
                <h3>{metrics?.microtienda || 'Sin registro'}</h3>
                <p>Nombre activo del negocio en la base de datos.</p>
              </article>
              <article className="metric-card">
                <p className="metric-label">Productos</p>
                <h3>{metrics?.totalProductos || 0}</h3>
                <p>Total de productos activos publicados.</p>
              </article>
              <article className="metric-card">
                <p className="metric-label">Inventario</p>
                <h3>{metrics?.inventarioTotal || 0}</h3>
                <p>Suma del stock disponible en tus productos.</p>
              </article>
              <article className="metric-card">
                <p className="metric-label">Promedio de calificacion</p>
                <h3>{metrics?.promedioCalificacion || 0}</h3>
                <p>Promedio calculado desde calificaciones reales.</p>
              </article>
            </div>
          </section>

          <SiteFooter />
        </>
      )}
    </main>
  );
}
