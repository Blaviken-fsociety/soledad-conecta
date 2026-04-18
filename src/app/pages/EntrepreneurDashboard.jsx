import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Star, Edit, Trash2, Plus, Upload, Eye, DollarSign, ChevronLeft, ChevronRight, MousePointerClick, BarChart3, MessageSquareQuote, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { downloadAnalyticsReport } from '../services/metricasService.js';

import {
  createMicrotiendaRequest,
  createProductRequest,
  deleteProductRequest,
  getCategoriesRequest,
  getEntrepreneurMetricsRequest,
  getMyMicrotiendaRequest,
  getMyProductsRequest,
  getMyRatingsRequest,
  updateMicrotiendaRequest,
  updateProductRequest,
} from '../utils/api.js';
import { clearSession } from '../utils/session.js';

const initialProductForm = {
  nombre: '',
  precio: '',
  stock: '',
  descripcion: '',
  imagenes: [],
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
const MAX_PRODUCT_IMAGES = 5;

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

const entrepreneurMetricChartColors = ['#1B3A5F', '#FFDD1A', '#10B981', '#F59E0B', '#8B5CF6'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
      {label ? <p className="mb-2 font-semibold text-[var(--foreground)]">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium text-[var(--foreground)]">{entry.name || entry.dataKey}</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrowthMetricCard({ label, growth }) {
  const currentValue = Number(growth?.current || 0);
  const percentage = Number(growth?.percentage || 0);
  const direction = growth?.direction || 'steady';
  const growthColor =
    direction === 'up' ? '#0F8A5F' : direction === 'down' ? '#C2410C' : 'var(--muted-foreground)';

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mb-2 text-[2rem] leading-none font-bold text-[var(--primary)]">{currentValue}</p>
      <p className="m-0 text-sm font-semibold" style={{ color: growthColor }}>
        {percentage > 0 ? '+' : ''}
        {percentage.toFixed(1)}% frente al periodo anterior
      </p>
    </div>
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

const formatReviewDate = (value) =>
  value ? new Date(value).toLocaleDateString('es-CO', { dateStyle: 'medium' }) : 'Sin fecha';

const normalizeProductImages = (product) => {
  if (Array.isArray(product?.imagenes) && product.imagenes.length) {
    return product.imagenes.filter(Boolean);
  }

  return product?.imagenUrl ? [product.imagenUrl] : [];
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
  imagenes: normalizeProductImages(product),
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
    throw new Error(`La imagen supera el lí­mite de ${MAX_IMAGE_SIZE_MB} MB.`);
  }
};

export function EntrepreneurDashboard() {
  const navigate = useNavigate();
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [microtienda, setMicrotienda] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [profileFormError, setProfileFormError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState(initialProductForm);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewProductImageIndex, setPreviewProductImageIndex] = useState(0);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [productImageNames, setProductImageNames] = useState([]);
  const [editProductImageNames, setEditProductImageNames] = useState([]);
  const [businessImageName, setBusinessImageName] = useState('');
  const [metricsReportFormat, setMetricsReportFormat] = useState('csv');
  const [downloadingMetricsReport, setDownloadingMetricsReport] = useState(false);
  const [metricsRange, setMetricsRange] = useState('weekly');
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [previewReview, setPreviewReview] = useState(null);

  const loadDashboardData = async (targetReviewsPage = reviewsPage) => {
    setDashboardLoading(true);
    setDashboardError('');

    try {
      const [metricsResult, microtiendaResult, productsResult, categoriesResult, reviewsResult] = await Promise.allSettled([
        getEntrepreneurMetricsRequest(metricsRange),
        getMyMicrotiendaRequest(),
        getMyProductsRequest(),
        getCategoriesRequest(true),
        getMyRatingsRequest({ page: targetReviewsPage, limit: 10 }),
      ]);

      const metricsResponse = metricsResult.status === 'fulfilled' ? metricsResult.value : null;
      const microtiendaResponse = microtiendaResult.status === 'fulfilled' ? microtiendaResult.value : null;
      const productsResponse = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
      const reviewsResponse =
        reviewsResult.status === 'fulfilled'
          ? reviewsResult.value
          : { items: [], pagination: reviewsPagination };
      const fallbackCategoryId = categoriesResponse?.[0]?.id ? String(categoriesResponse[0].id) : '';

      setMetrics(metricsResponse || null);
      setMicrotienda(microtiendaResponse || null);
      setProducts(Array.isArray(productsResponse) ? productsResponse : []);
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      setReviews(Array.isArray(reviewsResponse?.items) ? reviewsResponse.items : []);
      setReviewsPagination(
        reviewsResponse?.pagination || {
          page: targetReviewsPage,
          limit: 10,
          total: 0,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      );
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
    loadDashboardData(reviewsPage);
  }, [metricsRange, reviewsPage]);

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

  const metricsCards = useMemo(
    () => [
      {
        icon: Package,
        label: 'Total de productos',
        value: Number(metrics?.totalProductos || 0),
        helper: `${products.filter((product) => product.estadoRevision === 'APROBADO').length} aprobados`,
        color: 'var(--primary)',
      },
      {
        icon: Eye,
        label: 'Visitas a la microtienda',
        value: Number(metrics?.totalVisitasMicrotienda || 0),
        helper: `${Number(metrics?.visitasDirectasMicrotienda || 0)} visitas directas`,
        color: 'var(--accent)',
      },
      {
        icon: MousePointerClick,
        label: 'Visualizaciones de productos',
        value: Number(metrics?.visualizacionesProductos || 0),
        helper: `${(metrics?.productosMasVistos || []).length} productos con tráfico`,
        color: '#10B981',
      },
      {
        icon: MessageSquareQuote,
        label: 'Total de reseñas',
        value: Number(metrics?.totalResenasAprobadas || metrics?.totalCalificaciones || 0),
        helper: `${Number(metrics?.totalResenasRecibidas || 0)} registradas en total`,
        color: '#F59E0B',
      },
      {
        icon: Star,
        label: 'Promedio de calificación',
        value: Number(metrics?.promedioCalificacion || 0).toFixed(1),
        helper: `${Number(metrics?.totalCalificaciones || 0)} reseñas aprobadas`,
        color: 'var(--primary)',
      },
      {
        icon: BarChart3,
        label: 'Tasa de interacción',
        value: `${Number(metrics?.tasaInteraccion || 0).toFixed(1)}%`,
        helper: 'Reseñas aprobadas frente a visitas y vistas',
        color: 'var(--accent)',
      },
    ],
    [metrics, products],
  );

  const growthCards = useMemo(
    () => [
      { label: 'Crecimiento general', value: metrics?.growth?.general },
      { label: 'Crecimiento de microtiendas', value: metrics?.growth?.microtienda },
      { label: 'Crecimiento de productos', value: metrics?.growth?.productos },
    ],
    [metrics],
  );

  const reviewPageNumbers = useMemo(
    () => Array.from({ length: reviewsPagination.totalPages || 1 }, (_, index) => index + 1),
    [reviewsPagination.totalPages],
  );

  const handleDownloadMetricsReport = async (format = metricsReportFormat) => {
    setDownloadingMetricsReport(true);
    setDashboardError('');

    try {
      await downloadAnalyticsReport({
        format,
        range: metricsRange,
        scope: 'entrepreneur',
      });
    } catch (error) {
      setDashboardError(error.message || 'No fue posible generar el reporte de métricas.');
    } finally {
      setDownloadingMetricsReport(false);
    }
  };

  const handleProductFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setProductForm((current) => ({
      ...current,
      [field]: nextValue,
    }));

  };

  const handleEditProductFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setEditProductForm((current) => ({
      ...current,
      [field]: nextValue,
    }));

  };

  const handleProfileFormChange = (field) => (event) => {
    const nextValue = field === 'estado' ? event.target.checked : event.target.value;

    setProfileFormError('');
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
    setProductImageNames([]);
  };

  const applyBusinessImage = async (file) => {
    if (!file) {
      return;
    }

    try {
      setProfileFormError('');
      validateImageFile(file);
      const dataUrl = await readFileAsDataUrl(file);

      setProfileForm((current) => ({
        ...current,
        logoImagen: dataUrl,
      }));
      setBusinessImageName(file.name);
    } catch (error) {
      setProfileFormError(error.message || 'No fue posible cargar la imagen del negocio.');
    }
  };

  const applyProductImages = async (files, mode = 'create') => {
    const incomingFiles = Array.from(files || []);

    if (!incomingFiles.length) {
      return;
    }

    try {
      setDashboardError('');

      const validFiles = incomingFiles.slice(0, MAX_PRODUCT_IMAGES);
      validFiles.forEach(validateImageFile);

      if (mode === 'edit') {
        const availableSlots = MAX_PRODUCT_IMAGES - editProductForm.imagenes.length;

        if (availableSlots <= 0) {
          throw new Error(`Solo puedes cargar hasta ${MAX_PRODUCT_IMAGES} imágenes por producto.`);
        }

        const filesToRead = validFiles.slice(0, availableSlots);
        const dataUrls = await Promise.all(filesToRead.map(readFileAsDataUrl));

        setEditProductForm((current) => ({
          ...current,
          imagenes: [...current.imagenes, ...dataUrls],
        }));
        setEditProductImageNames((current) => [...current, ...filesToRead.map((file) => file.name)]);
        return;
      }

      const availableSlots = MAX_PRODUCT_IMAGES - productForm.imagenes.length;

      if (availableSlots <= 0) {
        throw new Error(`Solo puedes cargar hasta ${MAX_PRODUCT_IMAGES} imágenes por producto.`);
      }

      const filesToRead = validFiles.slice(0, availableSlots);
      const dataUrls = await Promise.all(filesToRead.map(readFileAsDataUrl));

      setProductForm((current) => ({
        ...current,
        imagenes: [...current.imagenes, ...dataUrls],
      }));
      setProductImageNames((current) => [...current, ...filesToRead.map((file) => file.name)]);
    } catch (error) {
      setDashboardError(error.message || 'No fue posible cargar las imágenes.');
    }
  };

  const removeProductImage = (index, mode = 'create') => {
    if (mode === 'edit') {
      setEditProductForm((current) => ({
        ...current,
        imagenes: current.imagenes.filter((_, imageIndex) => imageIndex !== index),
      }));
      setEditProductImageNames((current) => current.filter((_, imageIndex) => imageIndex !== index));
      return;
    }

    setProductForm((current) => ({
      ...current,
      imagenes: current.imagenes.filter((_, imageIndex) => imageIndex !== index),
    }));
    setProductImageNames((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleProductFileChange = async (event) => {
    const files = event.target.files;
    await applyProductImages(files, 'create');
    event.target.value = '';
  };

  const handleBusinessFileChange = async (event) => {
    const file = event.target.files?.[0];
    await applyBusinessImage(file);
    event.target.value = '';
  };

  const handleEditProductFileChange = async (event) => {
    const files = event.target.files;
    await applyProductImages(files, 'edit');
    event.target.value = '';
  };

  const handleProductDrop = async (event, mode = 'create') => {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    await applyProductImages(files, mode);
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

    if (!productForm.imagenes.length) {
      setDashboardError('Debes cargar al menos una imagen del producto para enviarlo a aprobación.');
      setSavingProduct(false);
      return;
    }

    try {
      await createProductRequest({
        nombre: productForm.nombre.trim(),
        descripcion: productForm.descripcion.trim(),
        precio: Number(productForm.precio || 0),
        stock: Number(productForm.stock || 0),
        imagenUrl: productForm.imagenes[0] || '',
        imagenes: productForm.imagenes,
        estado: Boolean(productForm.estado),
        idCategoria: Number(productForm.idCategoria),
      });

      setShowProductForm(false);
      resetProductForm();
      await loadDashboardData();
    } catch (error) {
      setDashboardError(error.message || 'No fue posible enviar el producto a aprobación.');
    } finally {
      setSavingProduct(false);
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setEditProductForm(mapProductToForm(product));
    setEditProductImageNames([]);
    setDashboardError('');
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    setEditProductForm(initialProductForm);
    setEditProductImageNames([]);
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    setSavingProduct(true);
    setDashboardError('');

    if (!editProductForm.imagenes.length) {
      setDashboardError('Debes conservar al menos una imagen del producto para guardar los cambios.');
      setSavingProduct(false);
      return;
    }

    try {
      await updateProductRequest(editingProduct.id, {
        nombre: editProductForm.nombre.trim(),
        descripcion: editProductForm.descripcion.trim(),
        precio: Number(editProductForm.precio || 0),
        stock: Number(editProductForm.stock || 0),
        imagenUrl: editProductForm.imagenes[0] || '',
        imagenes: editProductForm.imagenes,
        estado: Boolean(editProductForm.estado),
        idCategoria: Number(editProductForm.idCategoria),
      });

      closeEditProduct();
      await loadDashboardData();
    } catch (error) {
      setDashboardError(error.message || 'No fue posible enviar la edición del producto a revisión.');
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
    setProfileFormError('');

    if (!profileForm.logoImagen.trim()) {
      setProfileFormError('Debes cargar una imagen del negocio para enviar la solicitud.');
      setSavingProfile(false);
      return;
    }

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
      setProfileFormError(error.message || 'No fue posible guardar la información del negocio.');
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

  const handleConfirmLogout = () => {
    clearSession();
    navigate('/');
  };

  const openProductPreview = (product, initialIndex = 0) => {
    setPreviewProduct(product);
    setPreviewProductImageIndex(initialIndex);
  };

  const closeProductPreview = () => {
    setPreviewProduct(null);
    setPreviewProductImageIndex(0);
  };

  const closeReviewPreview = () => {
    setPreviewReview(null);
  };

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
            ['products', 'Productos'],
            ['reviews', 'Reseñas'],
            ['profile', 'Perfil del Negocio'],
            ['metrics', 'Métricas'],
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
                                      : '#ffdd1a'
                                }
                                color="var(--white)"
                              >
                                {formatReviewStatus(product.estadoRevision)}
                              </Badge>
                              {product.estadoRevision === 'RECHAZADO' && product.observacionRevision ? (
                                <p className="mt-2 mb-0 max-w-[240px] text-xs leading-5 text-[#B91C1C]">
                                  Motivo: {product.observacionRevision}
                                </p>
                              ) : null}
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
                            Todaví­a no hay productos registrados en tu catálogo.
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
                            : '#ffdd1a'
                      }
                      color="var(--white)"
                    >
                      {microtienda ? formatReviewStatus(microtienda.estadoRevision) : 'Sin registrar'}
                    </Badge>
                    {microtienda?.categoria ? <Badge bg="var(--secondary)" color="var(--primary)">{microtienda.categoria}</Badge> : null}
                  </div>
                  <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                    {microtienda
                      ? microtienda.descripcion || 'Tu negocio ya está¡ conectado al backend y listo para ser gestionado.'
                      : 'Completa el perfil para registrar tu negocio en la plataforma institucional.'}
                  </p>
                  {microtienda?.estadoRevision === 'RECHAZADO' && microtienda?.observacionRevision ? (
                    <div className="mb-4 rounded-[var(--radius)] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#B91C1C]">
                        Motivo del rechazo
                      </p>
                      <p className="m-0 text-sm leading-6 text-[#991B1B]">{microtienda.observacionRevision}</p>
                    </div>
                  ) : null}
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
                        <option value="">Selecciona una categorí­a</option>
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
                      <label className={labelClass}>Imágenes del producto *</label>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        Carga hasta {MAX_PRODUCT_IMAGES} imágenes de hasta {MAX_IMAGE_SIZE_MB} MB. Puedes arrastrarlas o elegirlas desde tu equipo.
                      </p>
                      <div
                        className="mt-3 rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-[var(--secondary)] p-6 text-center transition-all duration-200 hover:border-[var(--accent)]"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleProductDrop(event, 'create')}
                      >
                        <Upload size={32} color="var(--muted-foreground)" className="mx-auto mb-3" />
                        <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                          Arrastra una imagen aquí­ o selecciona un archivo desde tu equipo.
                        </p>
                        <label className={smallOutlineButtonClass} htmlFor="create-product-image-input">
                          Elegir archivo
                        </label>
                        <input
                          id="create-product-image-input"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleProductFileChange}
                        />
                        <p className="mt-3 text-sm font-semibold text-[var(--primary)]">
                          {productForm.imagenes.length}/{MAX_PRODUCT_IMAGES} imágenes cargadas
                        </p>
                      </div>
                      {productForm.imagenes.length ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {productForm.imagenes.map((image, index) => (
                            <div key={`${image.slice(0, 20)}-${index}`} className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]">
                              <button type="button" className="block w-full border-none bg-transparent p-0" onClick={() => openProductPreview({ ...productForm, imagenUrl: image }, index)}>
                                <img src={image} alt={`Vista previa ${index + 1}`} className="h-28 w-full object-cover" />
                              </button>
                              <div className="flex items-center justify-between gap-2 px-3 py-2">
                                <span className="truncate text-xs font-medium text-[var(--muted-foreground)]">
                                  {productImageNames[index] || `Imagen ${index + 1}`}
                                </span>
                                <button type="button" className={smallDangerButtonClass} onClick={() => removeProductImage(index, 'create')}>
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] md:col-span-2">
                      <input type="checkbox" checked={productForm.estado} onChange={handleProductFormChange('estado')} />
                      El producto quedará pendiente de revisión administrativa antes de publicarse
                    </label>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="submit" className={accentButtonClass} disabled={savingProduct}>
                      {savingProduct ? 'Enviando...' : 'Enviar a aprobación'}
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
                                  src={normalizeProductImages(product)[0]}
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
                          <td className={tdClass}>{product.categoria || 'Sin categorí­a'}</td>
                          <td className={tdClass}>{formatPrice(product.precio)}</td>
                          <td className={tdClass}>{product.stock}</td>
                          <td className={tdClass}>
                            <Badge
                              bg={
                                product.estadoRevision === 'APROBADO'
                                  ? '#10B981'
                                  : product.estadoRevision === 'RECHAZADO'
                                    ? '#DC2626'
                                    : '#ffdd1a'
                              }
                              color="var(--white)"
                            >
                              {formatReviewStatus(product.estadoRevision)}
                            </Badge>
                            {product.estadoRevision === 'RECHAZADO' && product.observacionRevision ? (
                              <p className="mt-2 mb-0 max-w-[280px] text-xs leading-5 text-[#B91C1C]">
                                Motivo: {product.observacionRevision}
                              </p>
                            ) : null}
                          </td>
                          <td className={tdClass}>
                            <div className="flex flex-wrap gap-2">
                              <button className={smallOutlineButtonClass} onClick={() => openProductPreview(product)} type="button">
                                <Eye size={16} />
                                Vista previa
                              </button>
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
                          No hay productos registrados todaví­a.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : null}

        {!dashboardLoading && activeTab === 'reviews' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`${cardClass} mb-6`}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="mb-1">Reseñas de tu microtienda</h2>
                  <p className="m-0 text-sm text-[var(--muted-foreground)]">
                    Consulta todas las opiniones recibidas desde tu perfil de emprendedor.
                  </p>
                </div>
                <Badge bg="var(--accent)" color="var(--accent-foreground)">
                  {reviewsPagination.total} reseñas
                </Badge>
              </div>

              <div className={tableWrapperClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Usuario</th>
                      <th className={thClass}>Calificación</th>
                      <th className={thClass}>Comentario</th>
                      <th className={thClass}>Fecha</th>
                      <th className={thClass}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.length ? (
                      reviews.map((review) => (
                        <tr key={review.id}>
                          <td className={tdClass}>
                            <div className="font-semibold">{review.nombreVisitante || 'Visitante'}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              {review.producto ? `Producto: ${review.producto}` : 'Reseña general'}
                            </div>
                          </td>
                          <td className={tdClass}>
                            <div className="flex items-center gap-2">
                              <Star size={16} color="var(--accent)" fill="var(--accent)" />
                              {review.puntuacion}/5
                            </div>
                          </td>
                          <td className={tdClass}>
                            <p className="m-0 max-w-[320px] truncate text-[var(--foreground)]">{review.comentario}</p>
                          </td>
                          <td className={tdClass}>{formatReviewDate(review.fecha)}</td>
                          <td className={tdClass}>
                            <button
                              type="button"
                              className={smallOutlineButtonClass}
                              onClick={() => setPreviewReview(review)}
                            >
                              <Eye size={16} />
                              Vista
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className={tdClass} colSpan={5}>
                          Todavía no has recibido reseñas en tu perfil.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {reviews.length ? (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewsPage((current) => Math.max(current - 1, 1))}
                    disabled={!reviewsPagination.hasPreviousPage}
                    className={smallOutlineButtonClass}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>
                  {reviewPageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setReviewsPage(pageNumber)}
                      className={tabClass}
                      style={
                        reviewsPage === pageNumber
                          ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                          : { border: '2px solid var(--primary)', color: 'var(--primary)', backgroundColor: 'transparent' }
                      }
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReviewsPage((current) => Math.min(current + 1, reviewsPagination.totalPages || 1))}
                    disabled={!reviewsPagination.hasNextPage}
                    className={smallOutlineButtonClass}
                  >
                    Siguiente
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}

        {!dashboardLoading && activeTab === 'metrics' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#17324F_0%,#1F4C77_58%,#2F6B8F_100%)] px-6 py-8 text-white shadow-[0_24px_56px_rgba(15,23,42,0.16)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-[760px]">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.78)]">
                    Emprendedor · Métricas
                  </p>
                  <h2 className="mb-2 text-[2rem] leading-tight text-white">Panel institucional de analítica del negocio</h2>
                  <p className="m-0 text-sm leading-7 text-[rgba(255,255,255,0.84)]">
                    Consolida visitas, visualizaciones y reseñas de tu emprendimiento para detectar crecimiento y exportar reportes operativos.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex rounded-full bg-[rgba(255,255,255,0.12)] p-1">
                    {[
                      ['weekly', 'Semanal'],
                      ['monthly', 'Mensual'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMetricsRange(value)}
                        className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                        style={{
                          backgroundColor: metricsRange === value ? 'white' : 'transparent',
                          color: metricsRange === value ? 'var(--primary)' : 'white',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricsReportFormat('csv');
                      handleDownloadMetricsReport('csv');
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.28)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[rgba(255,255,255,0.08)]"
                    disabled={downloadingMetricsReport}
                  >
                    <Download size={16} />
                    {downloadingMetricsReport && metricsReportFormat === 'csv' ? 'Generando CSV...' : 'Reporte CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricsReportFormat('excel');
                      handleDownloadMetricsReport('excel');
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_18px_rgba(255,255,255,0.18)]"
                    disabled={downloadingMetricsReport}
                  >
                    <Download size={16} />
                    {downloadingMetricsReport && metricsReportFormat === 'excel' ? 'Generando Excel...' : 'Generar reporte'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {growthCards.map((item) => (
                <GrowthMetricCard key={item.label} label={item.label} growth={item.value} />
              ))}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metricsCards.map((item) => (
                <div key={item.label} className={cardClass}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)]"
                      style={{ backgroundColor: item.color }}
                    >
                      <item.icon size={24} color="var(--white)" />
                    </div>
                    <div className="text-right">
                      <div
                        className="text-[2rem] leading-none font-bold text-[var(--primary)]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 text-sm font-semibold text-[var(--foreground)]">{item.label}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{item.helper}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className={cardClass}>
                <div className="mb-4">
                  <h3 className="mb-1">Actividad en el tiempo</h3>
                  <p className="m-0 text-sm text-[var(--muted-foreground)]">
                    {metricsRange === 'monthly'
                      ? 'Visitas, visualizaciones y reseñas aprobadas de los últimos 30 días.'
                      : 'Visitas, visualizaciones y reseñas aprobadas de los últimos 7 días.'}
                  </p>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics?.actividadSemanal || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,58,95,0.12)" />
                      <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="microtiendaViews" name="Visitas" stroke="#1B3A5F" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="productViews" name="Visualizaciones" stroke="#FFDD1A" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="reviews" name="Reseñas" stroke="#10B981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={cardClass}>
                <div className="mb-4">
                  <h3 className="mb-1">Productos más vistos</h3>
                  <p className="m-0 text-sm text-[var(--muted-foreground)]">
                    Ranking de productos con mayor número de visualizaciones.
                  </p>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics?.productosMasVistos || []} layout="vertical" margin={{ left: 12, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,58,95,0.12)" />
                      <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        width={120}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="vistas" name="Visualizaciones" radius={[0, 8, 8, 0]} fill="#1B3A5F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={cardClass}>
                <div className="mb-4">
                  <h3 className="mb-1">Distribución por categoría</h3>
                  <p className="m-0 text-sm text-[var(--muted-foreground)]">
                    Participación de tus productos por categoría registrada.
                  </p>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics?.distribucionCategorias || []}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={68}
                        outerRadius={108}
                        paddingAngle={3}
                      >
                        {(metrics?.distribucionCategorias || []).map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={entrepreneurMetricChartColors[index % entrepreneurMetricChartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={cardClass}>
                <div className="mb-4">
                  <h3 className="mb-1">Distribución de calificaciones</h3>
                  <p className="m-0 text-sm text-[var(--muted-foreground)]">
                    Reseñas aprobadas agrupadas por estrellas.
                  </p>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics?.distribucionCalificaciones || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,58,95,0.12)" />
                      <XAxis dataKey="estrella" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="total" name="Reseñas" radius={[8, 8, 0, 0]}>
                        {(metrics?.distribucionCalificaciones || []).map((entry, index) => (
                          <Cell key={`${entry.estrella}-${index}`} fill={entrepreneurMetricChartColors[index % entrepreneurMetricChartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={`${cardClass} mt-6`}>
              <div className="mb-4">
                <h3 className="mb-1">Detalle por producto</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Visualizaciones, reseñas, promedio de calificación y stock por producto.
                </p>
              </div>
              <div className={tableWrapperClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Producto</th>
                      <th className={thClass}>Visualizaciones</th>
                      <th className={thClass}>Reseñas</th>
                      <th className={thClass}>Rating promedio</th>
                      <th className={thClass}>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics?.tablaProductos || []).length ? (
                      metrics.tablaProductos.map((product) => (
                        <tr key={product.id}>
                          <td className={`${tdClass} font-semibold`}>{product.nombre}</td>
                          <td className={tdClass}>{product.visualizaciones}</td>
                          <td className={tdClass}>{product.resenas}</td>
                          <td className={tdClass}>{Number(product.promedioCalificacion || 0).toFixed(1)}</td>
                          <td className={tdClass}>{product.stock}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className={tdClass} colSpan={5}>
                          Todavía no hay datos suficientes para mostrar métricas por producto.
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
                      <option value="">Selecciona una categorí­a</option>
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
                    <label className={labelClass}>Imagen del negocio *</label>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Carga el logo o una imagen principal del negocio. Este archivo es obligatorio para enviar la solicitud.
                    </p>
                    <div
                      className="mt-3 rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-[var(--secondary)] p-6 text-center transition-all duration-200 hover:border-[var(--accent)]"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleBusinessDrop}
                    >
                      <Upload size={32} color="var(--muted-foreground)" className="mx-auto mb-2" />
                      <p className="mb-3 text-[var(--muted-foreground)]">
                        Arrastra el logo o una foto del negocio aquí­, o selecciónala desde tu equipo.
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
                {profileFormError ? (
                  <div className="mt-6 rounded-[var(--radius)] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                    {profileFormError}
                  </div>
                ) : null}
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
          <div className="max-h-[88vh] w-full max-w-[720px] overflow-y-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
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
                    <option value="">Selecciona una categorí­a</option>
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
                <label className={labelClass}>Imágenes del producto</label>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Agrega o reemplaza imágenes del producto. Puedes mantener las existentes, sumar nuevas o quitar las que no quieras.
                </p>
                <div
                  className="mt-3 rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-[var(--secondary)] p-6 text-center transition-all duration-200 hover:border-[var(--accent)]"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleProductDrop(event, 'edit')}
                >
                  <Upload size={32} color="var(--muted-foreground)" className="mx-auto mb-3" />
                  <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                    Arrastra una imagen aquí­ o elige un archivo para reemplazar la actual.
                  </p>
                  <label className={smallOutlineButtonClass} htmlFor="edit-product-image-input">
                    Elegir archivo
                  </label>
                  <input
                    id="edit-product-image-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleEditProductFileChange}
                  />
                  <p className="mt-3 text-sm font-semibold text-[var(--primary)]">
                    {editProductForm.imagenes.length}/{MAX_PRODUCT_IMAGES} imágenes cargadas
                  </p>
                </div>
                {editProductForm.imagenes.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {editProductForm.imagenes.map((image, index) => (
                      <div key={`${image.slice(0, 20)}-${index}`} className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]">
                        <button type="button" className="block w-full border-none bg-transparent p-0" onClick={() => openProductPreview({ ...editProductForm, imagenUrl: image, nombre: editProductForm.nombre, descripcion: editProductForm.descripcion, precio: editProductForm.precio, stock: editProductForm.stock }, index)}>
                          <img src={image} alt={`Vista previa ${index + 1}`} className="h-28 w-full object-cover" />
                        </button>
                        <div className="flex items-center justify-between gap-2 px-3 py-2">
                          <span className="truncate text-xs font-medium text-[var(--muted-foreground)]">
                            {editProductImageNames[index] || `Imagen ${index + 1}`}
                          </span>
                          <button type="button" className={smallDangerButtonClass} onClick={() => removeProductImage(index, 'edit')}>
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
                <input type="checkbox" checked={editProductForm.estado} onChange={handleEditProductFormChange('estado')} />
                El producto seguirá sujeto a revisión administrativa
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className={outlineButtonClass} onClick={closeEditProduct}>
                  Cancelar
                </button>
                <button type="submit" className={primaryButtonClass} disabled={savingProduct}>
                  {savingProduct ? 'Enviando...' : 'Enviar cambios a aprobación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {previewProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[760px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">{previewProduct.nombre || 'Vista previa del producto'}</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Revisa las imágenes del producto una por una antes de enviarlo o actualizarlo.
                </p>
              </div>
              <button className={outlineButtonClass} onClick={closeProductPreview} type="button">
                Cerrar
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)]">
                  {normalizeProductImages(previewProduct)[previewProductImageIndex] ? (
                    <div className="relative">
                      <img
                        src={normalizeProductImages(previewProduct)[previewProductImageIndex]}
                        alt={`${previewProduct.nombre || 'Producto'} ${previewProductImageIndex + 1}`}
                        className="h-[320px] w-full object-cover"
                      />

                      {normalizeProductImages(previewProduct).length > 1 ? (
                        <>
                          <button
                            type="button"
                            className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.72)] bg-[rgba(15,23,42,0.58)] text-[var(--white)] shadow-[0_8px_24px_rgba(15,23,42,0.22)] transition-all duration-200 hover:bg-[rgba(15,23,42,0.82)]"
                            onClick={() =>
                              setPreviewProductImageIndex((current) =>
                                current === 0 ? normalizeProductImages(previewProduct).length - 1 : current - 1,
                              )
                            }
                            aria-label="Imagen anterior"
                          >
                            <ChevronLeft size={22} />
                          </button>
                          <button
                            type="button"
                            className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.72)] bg-[rgba(15,23,42,0.58)] text-[var(--white)] shadow-[0_8px_24px_rgba(15,23,42,0.22)] transition-all duration-200 hover:bg-[rgba(15,23,42,0.82)]"
                            onClick={() =>
                              setPreviewProductImageIndex((current) =>
                                current === normalizeProductImages(previewProduct).length - 1 ? 0 : current + 1,
                              )
                            }
                            aria-label="Imagen siguiente"
                          >
                            <ChevronRight size={22} />
                          </button>
                          <div className="absolute right-3 bottom-3 rounded-full bg-[rgba(15,23,42,0.72)] px-3 py-1 text-xs font-semibold text-[var(--white)]">
                            {previewProductImageIndex + 1} / {normalizeProductImages(previewProduct).length}
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex h-[320px] items-center justify-center text-sm font-semibold text-[var(--muted-foreground)]">
                      Sin imagen
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Descripción</p>
                  <p className="m-0 text-sm leading-6 text-[var(--foreground)]">{previewProduct.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Categoría</p>
                    <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{previewProduct.categoria || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Precio</p>
                    <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{formatPrice(previewProduct.precio)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Stock</p>
                    <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{previewProduct.stock ?? 0}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Imágenes</p>
                    <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{normalizeProductImages(previewProduct).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {previewReview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-8">
          <div className="w-full max-w-[640px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">Vista previa de la reseña</h3>
                <p className="m-0 text-sm text-[var(--muted-foreground)]">
                  Revisa el comentario completo recibido en tu negocio.
                </p>
              </div>
              <button className={outlineButtonClass} onClick={closeReviewPreview} type="button">
                Cerrar
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Usuario</p>
                  <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{previewReview.nombreVisitante || 'Visitante'}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Fecha</p>
                  <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{formatReviewDate(previewReview.fecha)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Producto</p>
                  <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{previewReview.producto || 'Reseña general'}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Calificación</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <Star size={16} color="var(--accent)" fill="var(--accent)" />
                    {previewReview.puntuacion}/5
                  </div>
                </div>
              </div>

              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Comentario</p>
                <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
                  {previewReview.comentario || 'Sin comentario'}
                </p>
              </div>
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
