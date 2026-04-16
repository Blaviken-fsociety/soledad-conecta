import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Star, Edit, Trash2, Plus, Upload, Eye, DollarSign } from 'lucide-react';
import { Link } from 'react-router';

import {
  createMicrotiendaRequest,
  createProductRequest,
  deleteProductRequest,
  getCategoriesRequest,
  getEntrepreneurMetricsRequest,
  getMyMicrotiendaRequest,
  getMyProductsRequest,
  updateMicrotiendaRequest,
  updateProductRequest,
} from '../utils/api.js';

const initialProductForm = {
  nombre: '',
  precio: '',
  stock: '',
  descripcion: '',
  imagenUrl: '',
  idCategoria: '',
  estado: true,
};

const initialProfileForm = {
  nombre: '',
  descripcion: '',
  sectorEconomico: '',
  whatsapp: '',
  redesSociales: '',
  logoImagen: '',
  idCategoria: '',
  estado: true,
};

const MAX_IMAGE_SIZE_MB = 50;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const cardClass =
  'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]';
const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#152E4D] hover:shadow-[0_4px_12px_rgba(27,58,95,0.25)] disabled:cursor-not-allowed disabled:opacity-60';
const accentButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60';
const outlineButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)] disabled:cursor-not-allowed disabled:opacity-60';
const smallOutlineButtonClass =
  'inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60';
const smallDangerButtonClass =
  'inline-flex items-center justify-center gap-1 rounded-[var(--radius)] border border-[#DC2626] px-3 py-2 text-sm font-semibold text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626] hover:text-[var(--white)] disabled:cursor-not-allowed disabled:opacity-60';
const inputClass =
  'w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]';
const labelClass = 'mb-2 block font-semibold text-[var(--foreground)]';
const tableWrapperClass = 'overflow-x-auto';
const tableClass = 'min-w-full border-collapse';
const thClass = 'border-b-2 border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-left font-[var(--font-heading)] text-sm font-bold text-[var(--foreground)]';
const tdClass = 'border-b border-[var(--border)] px-4 py-3 align-top text-sm';
const tabClass = 'rounded-[var(--radius)] px-5 py-2.5 text-sm font-semibold transition-all duration-200';

function Badge({ children, bg = 'var(--primary)', color = 'var(--primary-foreground)' }) {
  return (
    <span
      className="inline-flex items-center rounded-[calc(var(--radius)-2px)] px-3 py-1 text-sm font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatReviewStatus = (status) => {
  if (status === 'APROBADO') return 'Aprobado';
  if (status === 'RECHAZADO') return 'Rechazado';
  return 'Pendiente';
};

const getStockLabel = (stock) => {
  const numericStock = Number(stock || 0);

  if (numericStock <= 0) return 'Sin stock';
  if (numericStock <= 5) return 'Bajo stock';
  return 'En stock';
};

const mapProductToForm = (product) => ({
  nombre: product?.nombre || '',
  precio: product?.precio ?? '',
  stock: product?.stock ?? '',
  descripcion: product?.descripcion || '',
  imagenUrl: product?.imagenUrl || '',
  idCategoria: product?.categoriaId ? String(product.categoriaId) : '',
  estado: Boolean(product?.estado),
});

const mapMicrotiendaToForm = (microtienda) => ({
  nombre: microtienda?.nombre || '',
  descripcion: microtienda?.descripcion || '',
  sectorEconomico: microtienda?.sectorEconomico || '',
  whatsapp: microtienda?.whatsapp || '',
  redesSociales: microtienda?.redesSociales || '',
  logoImagen: microtienda?.logoImagen || '',
  idCategoria: microtienda?.categoriaId ? String(microtienda.categoriaId) : '',
  estado: microtienda ? Boolean(microtienda.estado) : true,
});

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No fue posible leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });

const validateImageFile = (file) => {
  if (!file) {
    return;
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error('Solo puedes adjuntar archivos de imagen.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`La imagen supera el límite de ${MAX_IMAGE_SIZE_MB} MB.`);
  }
};

export function EntrepreneurDashboard() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [microtienda, setMicrotienda] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState(initialProductForm);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productImageName, setProductImageName] = useState('');
  const [editProductImageName, setEditProductImageName] = useState('');
  const [businessImageName, setBusinessImageName] = useState('');

  const loadDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError('');

    try {
      const [metricsResult, microtiendaResult, productsResult, categoriesResult] = await Promise.allSettled([
        getEntrepreneurMetricsRequest(),
        getMyMicrotiendaRequest(),
        getMyProductsRequest(),
        getCategoriesRequest(true),
      ]);

      const metricsResponse = metricsResult.status === 'fulfilled' ? metricsResult.value : null;
      const microtiendaResponse = microtiendaResult.status === 'fulfilled' ? microtiendaResult.value : null;
      const productsResponse = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
      const fallbackCategoryId = categoriesResponse?.[0]?.id ? String(categoriesResponse[0].id) : '';

      setMetrics(metricsResponse || null);
      setMicrotienda(microtiendaResponse || null);
      setProducts(Array.isArray(productsResponse) ? productsResponse : []);
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      setProfileForm({
        ...mapMicrotiendaToForm(microtiendaResponse),
        idCategoria: microtiendaResponse?.categoriaId
          ? String(microtiendaResponse.categoriaId)
          : fallbackCategoryId,
      });
      setBusinessImageName('');
      setProductForm((current) => ({
        ...current,
        idCategoria:
          current.idCategoria ||
          (microtiendaResponse?.categoriaId
            ? String(microtiendaResponse.categoriaId)
            : fallbackCategoryId),
      }));
    } catch (error) {
      setDashboardError(error.message || 'No fue posible cargar la información del panel.');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (categories.length && !productForm.idCategoria) {
      setProductForm((current) => ({
        ...current,
        idCategoria: microtienda?.categoriaId ? String(microtienda.categoriaId) : String(categories[0].id),
      }));
    }
  }, [categories, microtienda, productForm.idCategoria]);

  useEffect(() => {
    if (categories.length && !profileForm.idCategoria) {
      setProfileForm((current) => ({
        ...current,
        idCategoria: microtienda?.categoriaId ? String(microtienda.categoriaId) : String(categories[0].id),
      }));
    }
  }, [categories, microtienda, profileForm.idCategoria]);

  const stats = useMemo(() => {
    const totalProductos = Number(metrics?.totalProductos || products.length || 0);
    const inventarioTotal = Number(metrics?.inventarioTotal || 0);
    const promedioCalificacion = Number(metrics?.promedioCalificacion || microtienda?.promedioCalificacion || 0);
    const totalCalificaciones = Number(metrics?.totalCalificaciones || microtienda?.totalCalificaciones || 0);

    return [
      {
        icon: Eye,
        label: 'Mi negocio',
        value: microtienda?.nombre || 'Sin registro',
        helper: microtienda?.estadoRevision ? `Revision: ${formatReviewStatus(microtienda.estadoRevision)}` : 'Crea tu espacio comercial',
        color: 'var(--primary)',
      },
      {
        icon: Star,
        label: 'Calificacion',
        value: promedioCalificacion ? promedioCalificacion.toFixed(1) : '0.0',
        helper: `${totalCalificaciones} reseñas aprobadas`,
        color: 'var(--accent)',
      },
      {
        icon: Package,
        label: 'Productos activos',
        value: String(totalProductos),
        helper: products.filter((product) => product.estadoRevision === 'APROBADO').length
          ? `${products.filter((product) => product.estadoRevision === 'APROBADO').length} aprobados`
          : 'Sin productos aprobados',
        color: 'var(--primary)',
      },
      {
        icon: DollarSign,
        label: 'Inventario total',
        value: String(inventarioTotal),
        helper: `${products.length} productos registrados`,
        color: 'var(--accent)',
      },
    ];
  }, [metrics, microtienda, products]);

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((left, right) => new Date(right.fechaCreacion || 0) - new Date(left.fechaCreacion || 0))
      .slice(0, 6);
  }, [products]);

  const handleProductFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setProductForm((current) => ({
      ...current,
      [field]: nextValue,
    }));

    if (field === 'imagenUrl') {
      setProductImageName('');
    }
  };

  const handleEditProductFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setEditProductForm((current) => ({
      ...current,
      [field]: nextValue,
    }));

    if (field === 'imagenUrl') {
      setEditProductImageName('');
    }
  };

  const handleProfileFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setProfileForm((current) => ({
      ...current,
      [field]: nextValue,
    }));

    if (field === 'logoImagen') {
      setBusinessImageName('');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      ...initialProductForm,
      idCategoria: microtienda?.categoriaId ? String(microtienda.categoriaId) : categories[0]?.id ? String(categories[0].id) : '',
      estado: true,
    });
    setProductImageName('');
  };

  const applyBusinessImage = async (file) => {
    if (!file) {
      return;
    }

    try {
      validateImageFile(file);
      const dataUrl = await readFileAsDataUrl(file);

      setProfileForm((current) => ({
        ...current,
        logoImagen: dataUrl,
      }));
      setBusinessImageName(file.name);
    } catch (error) {
      setDashboardError(error.message || 'No fue posible cargar la imagen del negocio.');
    }
  };

  const applyProductImage = async (file, mode = 'create') => {
    if (!file) {
      return;
    }

    try {
      validateImageFile(file);
      const dataUrl = await readFileAsDataUrl(file);

      if (mode === 'edit') {
        setEditProductForm((current) => ({
          ...current,
          imagenUrl: dataUrl,
        }));
        setEditProductImageName(file.name);
        return;
      }

      setProductForm((current) => ({
        ...current,
        imagenUrl: dataUrl,
      }));
      setProductImageName(file.name);
    } catch (error) {
      setDashboardError(error.message || 'No fue posible cargar la imagen.');
    }
  };

  const handleProductFileChange = async (event) => {
    const file = event.target.files?.[0];
    await applyProductImage(file, 'create');
    event.target.value = '';
  };

  const handleBusinessFileChange = async (event) => {
    const file = event.target.files?.[0];
    await applyBusinessImage(file);
    event.target.value = '';
  };

  const handleEditProductFileChange = async (event) => {
    const file = event.target.files?.[0];
    await applyProductImage(file, 'edit');
    event.target.value = '';
  };

  const handleProductDrop = async (event, mode = 'create') => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    await applyProductImage(file, mode);
  };

  const handleBusinessDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    await applyBusinessImage(file);
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    setDashboardError('');

    try {
      await createProductRequest({
        nombre: productForm.nombre.trim(),
        descripcion: productForm.descripcion.trim(),
        precio: Number(productForm.precio || 0),
        stock: Number(productForm.stock || 0),
        imagenUrl: productForm.imagenUrl.trim(),
        estado: Boolean(productForm.estado),
        idCategoria: Number(productForm.idCategoria),
      });

      setShowProductForm(false);
      resetProductForm();
      await loadDashboardData();
    } catch (error) {
      setDashboardError(error.message || 'No fue posible registrar el producto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setEditProductForm(mapProductToForm(product));
    setEditProductImageName('');
    setDashboardError('');
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    setEditProductForm(initialProductForm);
    setEditProductImageName('');
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    setSavingProduct(true);
    setDashboardError('');

    try {
      await updateProductRequest(editingProduct.id, {
        nombre: editProductForm.nombre.trim(),
        descripcion: editProductForm.descripcion.trim(),
        precio: Number(editProductForm.precio || 0),
        stock: Number(editProductForm.stock || 0),
        imagenUrl: editProductForm.imagenUrl.trim(),
        estado: Boolean(editProductForm.estado),
        idCategoria: Number(editProductForm.idCategoria),
      });

      closeEditProduct();
      await loadDashboardData();
    } catch (error) {
      setDashboardError(error.message || 'No fue posible actualizar el producto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) {
      return;
    }

    setDeletingProductId(productToDelete.id);
    setDashboardError('');

    try {
      await deleteProductRequest(productToDelete.id);
      setProductToDelete(null);
      await loadDashboardData();
    } catch (error) {
      setDashboardError(error.message || 'No fue posible eliminar el producto.');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setDashboardError('');

    try {
      const payload = {
        nombre: profileForm.nombre.trim(),
        descripcion: profileForm.descripcion.trim(),
        sectorEconomico: profileForm.sectorEconomico.trim(),
        whatsapp: profileForm.whatsapp.trim(),
        redesSociales: profileForm.redesSociales.trim(),
        logoImagen: profileForm.logoImagen.trim(),
        estado: Boolean(profileForm.estado),
        idCategoria: Number(profileForm.idCategoria),
      };

      if (microtienda?.id) {
        await updateMicrotiendaRequest(microtienda.id, payload);
      } else {
        await createMicrotiendaRequest(payload);
      }

      await loadDashboardData();
    } catch (error) {
      setDashboardError(error.message || 'No fue posible guardar la informacion del negocio.');
    } finally {
      setSavingProfile(false);
    }
  };

  const businessButton = microtienda?.id ? (
    <Link to={`/negocio/${microtienda.id}`} className={accentButtonClass}>
      Ver mi Negocio
    </Link>
  ) : (
    <button type="button" className={accentButtonClass} disabled title="Debes registrar tu negocio primero">
      Ver mi Negocio
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-[var(--ivory)]">
      <section className="w-full bg-[var(--primary)] px-6 py-8 text-[var(--primary-foreground)] lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-[var(--white)]">Panel de Emprendedor</h1>
            <p className="m-0 text-[rgba(255,255,255,0.9)]">Gestiona tu negocio y productos con información real.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {businessButton}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[rgba(255,255,255,0.78)] bg-transparent px-6 py-3 text-base font-semibold text-[var(--white)] transition-all duration-200 hover:bg-[rgba(255,255,255,0.08)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.18)]"
            >
              Volver al portal
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full px-6 py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ['overview', 'Resumen'],
            ['products', 'Productos'],
            ['profile', 'Perfil del Negocio'],
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

        {dashboardError ? (
          <div className="mb-6 rounded-[var(--radius)] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
            {dashboardError}
          </div>
        ) : null}

        {dashboardLoading ? (
          <div className="rounded-[var(--radius)] bg-[var(--card)] px-6 py-16 text-center text-sm text-[var(--muted-foreground)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            Cargando información del panel...
          </div>
        ) : null}

        {!dashboardLoading && activeTab === 'overview' ? (
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
                  <div
                    className="mb-2 text-[2rem] leading-none font-bold text-[var(--primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="mb-2 text-sm font-semibold text-[var(--foreground)]">{stat.label}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{stat.helper}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <div className={cardClass}>
                <h3 className="mb-6">Productos del catálogo</h3>
                <div className={tableWrapperClass}>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Producto</th>
                        <th className={thClass}>Precio</th>
                        <th className={thClass}>Stock</th>
                        <th className={thClass}>Revision</th>
                        <th className={thClass}>Calificacion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.length ? (
                        recentProducts.map((product) => (
                          <tr key={product.id}>
                            <td className={`${tdClass} font-semibold`}>{product.nombre}</td>
                            <td className={tdClass}>{formatPrice(product.precio)}</td>
                            <td className={tdClass}>
                              <Badge
                                bg={getStockLabel(product.stock) === 'En stock' ? 'var(--primary)' : '#F59E0B'}
                                color="var(--white)"
                              >
                                {getStockLabel(product.stock)}
                              </Badge>
                            </td>
                            <td className={tdClass}>
                              <Badge
                                bg={
                                  product.estadoRevision === 'APROBADO'
                                    ? '#10B981'
                                    : product.estadoRevision === 'RECHAZADO'
                                      ? '#DC2626'
                                      : '#F59E0B'
                                }
                                color="var(--white)"
                              >
                                {formatReviewStatus(product.estadoRevision)}
                              </Badge>
                            </td>
                            <td className={tdClass}>
                              <div className="flex items-center gap-2">
                                <Star size={16} color="var(--accent)" />
                                {Number(product.promedioCalificacion || 0).toFixed(1)} ({product.totalCalificaciones || 0})
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={tdClass} colSpan={5}>
                            Todavía no hay productos registrados en tu catálogo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className={cardClass}>
                  <h3 className="mb-4">Estado del negocio</h3>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge
                      bg={
                        microtienda?.estadoRevision === 'APROBADO'
                          ? '#10B981'
                          : microtienda?.estadoRevision === 'RECHAZADO'
                            ? '#DC2626'
                            : '#F59E0B'
                      }
                      color="var(--white)"
                    >
                      {microtienda ? formatReviewStatus(microtienda.estadoRevision) : 'Sin registrar'}
                    </Badge>
                    {microtienda?.categoria ? <Badge bg="var(--secondary)" color="var(--primary)">{microtienda.categoria}</Badge> : null}
                  </div>
                  <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                    {microtienda
                      ? microtienda.descripcion || 'Tu negocio ya está conectado al backend y listo para ser gestionado.'
                      : 'Completa el perfil para registrar tu negocio en la plataforma institucional.'}
                  </p>
                  <button className={`${smallOutlineButtonClass} w-full`} onClick={() => setActiveTab('profile')}>
                    {microtienda ? 'Actualizar perfil' : 'Registrar negocio'}
                  </button>
                </div>

                <div
                  className="rounded-[var(--radius)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  <h3 className="mb-4">Consejo del dia</h3>
                  <p className="m-0 leading-[1.6]">
                    Mantener tus productos con stock actualizado y descripciones claras mejora la revisión y la confianza de los visitantes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        {!dashboardLoading && activeTab === 'products' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2>Gestion de Productos</h2>
              <button onClick={() => setShowProductForm((current) => !current)} className={accentButtonClass}>
                <Plus size={18} />
                Nuevo Producto
              </button>
            </div>

            {showProductForm ? (
              <div className={`${cardClass} mb-6`}>
                <h3 className="mb-6">Agregar producto</h3>
                <form onSubmit={handleCreateProduct}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Nombre del producto *</label>
                      <input type="text" className={inputClass} value={productForm.nombre} onChange={handleProductFormChange('nombre')} required />
                    </div>
                    <div>
                      <label className={labelClass}>Categoria *</label>
                      <select className={inputClass} value={productForm.idCategoria} onChange={handleProductFormChange('idCategoria')} required>
                        <option value="">Selecciona una categoría</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Precio *</label>
                      <input type="number" className={inputClass} min="0" value={productForm.precio} onChange={handleProductFormChange('precio')} required />
                    </div>
                    <div>
                      <label className={labelClass}>Stock *</label>
                      <input type="number" className={inputClass} min="0" value={productForm.stock} onChange={handleProductFormChange('stock')} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Descripcion *</label>
                      <textarea className={`${inputClass} min-h-[120px]`} rows={3} value={productForm.descripcion} onChange={handleProductFormChange('descripcion')} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Imagen del producto</label>
                      <input
                        type="url"
                        className={inputClass}
                        value={productForm.imagenUrl}
                        onChange={handleProductFormChange('imagenUrl')}
                        placeholder="Pega una URL de imagen o adjunta un archivo"
                      />
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        Puedes usar un enlace o subir una imagen de hasta {MAX_IMAGE_SIZE_MB} MB.
                      </p>
                      <div
                        className="mt-3 rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-[var(--secondary)] p-6 text-center transition-all duration-200 hover:border-[var(--accent)]"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleProductDrop(event, 'create')}
                      >
                        <Upload size={32} color="var(--muted-foreground)" className="mx-auto mb-3" />
                        <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                          Arrastra una imagen aquí o selecciona un archivo desde tu equipo.
                        </p>
                        <label className={smallOutlineButtonClass} htmlFor="create-product-image-input">
                          Elegir archivo
                        </label>
                        <input
                          id="create-product-image-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProductFileChange}
                        />
                        {productImageName || productForm.imagenUrl ? (
                          <p className="mt-3 text-sm font-semibold text-[var(--primary)]">
                            {productImageName || 'Imagen cargada correctamente'}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] md:col-span-2">
                      <input type="checkbox" checked={productForm.estado} onChange={handleProductFormChange('estado')} />
                      Producto visible cuando sea aprobado
                    </label>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="submit" className={accentButtonClass} disabled={savingProduct}>
                      {savingProduct ? 'Guardando...' : 'Guardar producto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        resetProductForm();
                      }}
                      className={outlineButtonClass}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            <div className={cardClass}>
              <div className={tableWrapperClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Producto</th>
                      <th className={thClass}>Categoria</th>
                      <th className={thClass}>Precio</th>
                      <th className={thClass}>Stock</th>
                      <th className={thClass}>Revision</th>
                      <th className={thClass}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length ? (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td className={tdClass}>
                            <div className="flex items-start gap-3">
                              {product.imagenUrl ? (
                                <img
                                  src={product.imagenUrl}
                                  alt={product.nombre}
                                  className="h-12 w-12 rounded-[12px] object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--secondary)]">
                                  <Package size={18} color="var(--primary)" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold">{product.nombre}</div>
                                <div className="text-xs text-[var(--muted-foreground)]">{product.descripcion || 'Sin descripción'}</div>
                              </div>
                            </div>
                          </td>
                          <td className={tdClass}>{product.categoria || 'Sin categoría'}</td>
                          <td className={tdClass}>{formatPrice(product.precio)}</td>
                          <td className={tdClass}>{product.stock}</td>
                          <td className={tdClass}>
                            <Badge
                              bg={
                                product.estadoRevision === 'APROBADO'
                                  ? '#10B981'
                                  : product.estadoRevision === 'RECHAZADO'
                                    ? '#DC2626'
                                    : '#F59E0B'
                              }
                              color="var(--white)"
                            >
                              {formatReviewStatus(product.estadoRevision)}
                            </Badge>
                          </td>
                          <td className={tdClass}>
                            <div className="flex flex-wrap gap-2">
                              <button className={smallOutlineButtonClass} onClick={() => openEditProduct(product)} type="button">
                                <Edit size={16} />
                                Editar
                              </button>
                              <button className={smallDangerButtonClass} onClick={() => setProductToDelete(product)} type="button">
                                <Trash2 size={16} />
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className={tdClass} colSpan={6}>
                          No hay productos registrados todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : null}

        {!dashboardLoading && activeTab === 'profile' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={cardClass}>
              <h2 className="mb-6">{microtienda ? 'Informacion del negocio' : 'Registrar negocio'}</h2>
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nombre del negocio *</label>
                    <input type="text" className={inputClass} value={profileForm.nombre} onChange={handleProfileFormChange('nombre')} required />
                  </div>
                  <div>
                    <label className={labelClass}>Categoria *</label>
                    <select className={inputClass} value={profileForm.idCategoria} onChange={handleProfileFormChange('idCategoria')} required>
                      <option value="">Selecciona una categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Descripcion *</label>
                    <textarea className={`${inputClass} min-h-[140px]`} rows={4} value={profileForm.descripcion} onChange={handleProfileFormChange('descripcion')} required />
                  </div>
                  <div>
                    <label className={labelClass}>Sector económico</label>
                    <input type="text" className={inputClass} value={profileForm.sectorEconomico} onChange={handleProfileFormChange('sectorEconomico')} />
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp</label>
                    <input type="tel" className={inputClass} value={profileForm.whatsapp} onChange={handleProfileFormChange('whatsapp')} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Redes sociales</label>
                    <input type="text" className={inputClass} value={profileForm.redesSociales} onChange={handleProfileFormChange('redesSociales')} placeholder="Instagram, Facebook o sitio web" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Imagen del negocio</label>
                    <input
                      type="url"
                      className={inputClass}
                      value={profileForm.logoImagen}
                      onChange={handleProfileFormChange('logoImagen')}
                      placeholder="Pega una URL de imagen o adjunta un archivo"
                    />
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Puedes usar un enlace o subir una imagen de hasta {MAX_IMAGE_SIZE_MB} MB.
                    </p>
                    <div
                      className="mt-3 rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-[var(--secondary)] p-6 text-center transition-all duration-200 hover:border-[var(--accent)]"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleBusinessDrop}
                    >
                      <Upload size={32} color="var(--muted-foreground)" className="mx-auto mb-2" />
                      <p className="mb-3 text-[var(--muted-foreground)]">
                        Arrastra el logo o una foto del negocio aquí, o selecciónala desde tu equipo.
                      </p>
                      <label className={smallOutlineButtonClass} htmlFor="business-image-input">
                        Elegir archivo
                      </label>
                      <input
                        id="business-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBusinessFileChange}
                      />
                      {businessImageName || profileForm.logoImagen ? (
                        <p className="mt-3 text-sm font-semibold text-[var(--primary)]">
                          {businessImageName || 'Imagen cargada correctamente'}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] md:col-span-2">
                    <input type="checkbox" checked={profileForm.estado} onChange={handleProfileFormChange('estado')} />
                    Negocio visible cuando sea aprobado
                  </label>
                </div>
                <div className="mt-6">
                  <button type="submit" className={accentButtonClass} disabled={savingProfile}>
                    {savingProfile ? 'Guardando...' : microtienda ? 'Guardar cambios' : 'Registrar negocio'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : null}
      </div>

      {editingProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[720px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">Editar producto</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Actualiza la información del producto seleccionado.
                </p>
              </div>
              <button className={outlineButtonClass} onClick={closeEditProduct} type="button">
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleUpdateProduct}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input className={inputClass} value={editProductForm.nombre} onChange={handleEditProductFormChange('nombre')} required />
                </div>
                <div>
                  <label className={labelClass}>Categoria</label>
                  <select className={inputClass} value={editProductForm.idCategoria} onChange={handleEditProductFormChange('idCategoria')} required>
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Precio</label>
                  <input className={inputClass} type="number" min="0" value={editProductForm.precio} onChange={handleEditProductFormChange('precio')} required />
                </div>
                <div>
                  <label className={labelClass}>Stock</label>
                  <input className={inputClass} type="number" min="0" value={editProductForm.stock} onChange={handleEditProductFormChange('stock')} required />
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripcion</label>
                <textarea className={`${inputClass} min-h-[120px]`} rows={3} value={editProductForm.descripcion} onChange={handleEditProductFormChange('descripcion')} required />
              </div>

              <div>
                <label className={labelClass}>Imagen del producto</label>
                <input
                  type="url"
                  className={inputClass}
                  value={editProductForm.imagenUrl}
                  onChange={handleEditProductFormChange('imagenUrl')}
                  placeholder="Pega una URL de imagen o adjunta un archivo"
                />
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Puedes usar un enlace o subir una imagen de hasta {MAX_IMAGE_SIZE_MB} MB.
                </p>
                <div
                  className="mt-3 rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-[var(--secondary)] p-6 text-center transition-all duration-200 hover:border-[var(--accent)]"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleProductDrop(event, 'edit')}
                >
                  <Upload size={32} color="var(--muted-foreground)" className="mx-auto mb-3" />
                  <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                    Arrastra una imagen aquí o elige un archivo para reemplazar la actual.
                  </p>
                  <label className={smallOutlineButtonClass} htmlFor="edit-product-image-input">
                    Elegir archivo
                  </label>
                  <input
                    id="edit-product-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditProductFileChange}
                  />
                  {editProductImageName || editProductForm.imagenUrl ? (
                    <p className="mt-3 text-sm font-semibold text-[var(--primary)]">
                      {editProductImageName || 'Imagen cargada correctamente'}
                    </p>
                  ) : null}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
                <input type="checkbox" checked={editProductForm.estado} onChange={handleEditProductFormChange('estado')} />
                Producto visible cuando sea aprobado
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className={outlineButtonClass} onClick={closeEditProduct}>
                  Cancelar
                </button>
                <button type="submit" className={primaryButtonClass} disabled={savingProduct}>
                  {savingProduct ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {productToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[560px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-4">
              <h3 className="mb-2">Eliminar producto</h3>
              <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                Estas a punto de eliminar <span className="font-semibold text-[var(--foreground)]">{productToDelete.nombre}</span>.
                Esta acción no se puede deshacer. ¿Seguro que deseas continuar?
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button type="button" className={outlineButtonClass} onClick={() => setProductToDelete(null)} disabled={Boolean(deletingProductId)}>
                Cancelar
              </button>
              <button type="button" className={smallDangerButtonClass} onClick={handleDeleteProduct} disabled={Boolean(deletingProductId)}>
                {deletingProductId ? 'Eliminando...' : 'Si, eliminar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
