"use client"

import { useState, useRef } from "react"
import { useStore } from "@/lib/store"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X,
  GripVertical,
  Eye,
  EyeOff,
  Palette,
  Settings as SettingsIcon,
  Upload,
  Camera,
  Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import type { Category, Product } from "@/lib/types"

export default function AdminPage() {
  const { 
    config, 
    categories, 
    products, 
    updateConfig,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability
  } = useStore()

  const [activeTab, setActiveTab] = useState<'config' | 'categories' | 'products'>('config')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '', order: 0 })
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    categoryId: '',
    available: true,
    rating: 0,
    badge: '',
    discount: 0
  })

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file) return

    setUploadingImage(true)
    setShowUploadOptions(false)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      // Upload to Vercel Blob
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem')
      }

      const data = await response.json()
      
      // Set image URL in form and preview
      setProductForm({ ...productForm, image: data.url })
      setImagePreview(data.url)
      
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle file selection from gallery
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // Handle camera capture
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // Config handlers
  const handleConfigSave = (field: string, value: string) => {
    updateConfig({ [field]: value })
  }

  // Category handlers
  const handleAddCategory = () => {
    if (categoryForm.name) {
      addCategory({
        name: categoryForm.name,
        icon: categoryForm.icon,
        order: categories.length
      })
      setCategoryForm({ name: '', icon: '', order: 0 })
      setShowCategoryForm(false)
    }
  }

  const handleUpdateCategory = () => {
    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryForm.name,
        icon: categoryForm.icon
      })
      setEditingCategory(null)
      setCategoryForm({ name: '', icon: '', order: 0 })
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      icon: category.icon || '',
      order: category.order
    })
  }

  // Product handlers
  const handleAddProduct = () => {
    if (productForm.name && productForm.categoryId) {
      addProduct(productForm)
      setProductForm({
        name: '',
        description: '',
        price: 0,
        image: '',
        categoryId: '',
        available: true,
        rating: 0,
        badge: '',
        discount: 0
      })
      setImagePreview('')
      setShowProductForm(false)
    }
  }

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productForm)
      setEditingProduct(null)
      setProductForm({
        name: '',
        description: '',
        price: 0,
        image: '',
        categoryId: '',
        available: true,
        rating: 0,
        badge: '',
        discount: 0
      })
      setImagePreview('')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      categoryId: product.categoryId,
      available: product.available,
      rating: product.rating || 0,
      badge: product.badge || '',
      discount: product.discount || 0
    })
    setImagePreview(product.image)
    setShowProductForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Gerencie seu cardápio e configurações</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-2 font-medium transition-all border-b-2 ${
                activeTab === 'config'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600'
              }`}
            >
              <SettingsIcon className="w-4 h-4 inline mr-2" />
              Configurações
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-2 font-medium transition-all border-b-2 ${
                activeTab === 'categories'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600'
              }`}
            >
              Categorias ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 font-medium transition-all border-b-2 ${
                activeTab === 'products'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600'
              }`}
            >
              Produtos ({products.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Configurações Gerais</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Aplicativo
                  </label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) => handleConfigSave('appName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Cheirinho Bom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Cor Principal (Hex)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => handleConfigSave('primaryColor', e.target.value)}
                      className="w-16 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => handleConfigSave('primaryColor', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#EA1D2C"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do WhatsApp (com DDD)
                  </label>
                  <input
                    type="text"
                    value={config.whatsappNumber || ''}
                    onChange={(e) => handleConfigSave('whatsappNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 5511999999999"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: código do país + DDD + número (sem espaços ou caracteres especiais)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Categorias</h2>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Categoria
              </button>
            </div>

            {/* Category Form */}
            {(showCategoryForm || editingCategory) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Categoria
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Pizzas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ícone (Emoji)
                    </label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 🍕"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      {editingCategory ? 'Salvar' : 'Adicionar'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCategoryForm(false)
                        setEditingCategory(null)
                        setCategoryForm({ name: '', icon: '', order: 0 })
                      }}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.sort((a, b) => a.order - b.order).map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="font-bold text-gray-900">{category.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
                          deleteCategory(category.id)
                        }
                      }}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Produtos</h2>
              <button
                onClick={() => {
                  setShowProductForm(true)
                  setEditingProduct(null)
                  setImagePreview('')
                  setProductForm({
                    name: '',
                    description: '',
                    price: 0,
                    image: '',
                    categoryId: categories[0]?.id || '',
                    available: true,
                    rating: 0,
                    badge: '',
                    discount: 0
                  })
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Produto
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Pizza Margherita"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descreva o produto..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desconto (%)
                    </label>
                    <input
                      type="number"
                      value={productForm.discount}
                      onChange={(e) => setProductForm({ ...productForm, discount: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagem do Produto
                    </label>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mb-4 relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setImagePreview('')
                            setProductForm({ ...productForm, image: '' })
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productForm.image}
                        onChange={(e) => {
                          setProductForm({ ...productForm, image: e.target.value })
                          setImagePreview(e.target.value)
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Cole a URL da imagem ou use o botão ao lado"
                      />
                      
                      {/* Upload Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowUploadOptions(!showUploadOptions)}
                          disabled={uploadingImage}
                          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                          {uploadingImage ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Enviar Imagem
                            </>
                          )}
                        </button>
                        
                        {/* Upload Options Dropdown */}
                        {showUploadOptions && !uploadingImage && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 rounded-t-lg"
                            >
                              <ImageIcon className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">Galeria</div>
                                <div className="text-xs text-gray-500">Escolher da galeria</div>
                              </div>
                            </button>
                            <button
                              onClick={() => cameraInputRef.current?.click()}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 rounded-b-lg border-t"
                            >
                              <Camera className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">Câmera</div>
                                <div className="text-xs text-gray-500">Tirar uma foto</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Hidden file inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleGallerySelect}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                      className="hidden"
                    />
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Clique em "Enviar Imagem" para escolher da galeria ou tirar uma foto. A URL será preenchida automaticamente.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação (0-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={productForm.rating}
                      onChange={(e) => setProductForm({ ...productForm, rating: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge (opcional)
                    </label>
                    <input
                      type="text"
                      value={productForm.badge}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Mais pedido, Promoção"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    {editingProduct ? 'Salvar' : 'Adicionar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowProductForm(false)
                      setEditingProduct(null)
                      setImagePreview('')
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const category = categories.find(c => c.id === product.categoryId)
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                      !product.available ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {product.badge}
                        </span>
                      )}
                      {product.discount && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{product.name}</h3>
                          <p className="text-xs text-gray-500">
                            {category?.icon} {category?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleProductAvailability(product.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.available
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {product.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.rating && (
                          <span className="text-sm text-gray-600">⭐ {product.rating}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este produto?')) {
                              deleteProduct(product.id)
                            }
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
