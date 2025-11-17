"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ShoppingBag, Heart, Star, Plus, Minus, X, Settings, GripVertical, ArrowRight } from "lucide-react"
import { useStore } from "@/lib/store"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DeliveryMethodStep } from "@/components/checkout/DeliveryMethodStep"
import { PaymentMethodStep } from "@/components/checkout/PaymentMethodStep"
import { OrderStatus } from "@/components/checkout/OrderStatus"
import type { DeliveryMethod, DeliveryAddress, PaymentMethod } from "@/lib/types"

// Componente para grupo arrastável
function SortableCategory({ 
  category, 
  products, 
  categoryRefs, 
  config, 
  cart, 
  addToCart, 
  removeFromCart 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={category.id}
      className="mb-8"
    >
      {/* Category Title with Drag Handle */}
      <div className="mb-4 flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors touch-none"
          title="Arrastar para reorganizar"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {category.icon && `${category.icon} `}{category.name}
          </h2>
          <div className="h-1 w-16 rounded-full mt-2" style={{ backgroundColor: config.primaryColor }} />
        </div>
      </div>

      {/* Products in this category */}
      <div className="space-y-4">
        {products.map((product: any) => {
          const cartItem = cart.find((item: any) => item.productId === product.id)
          const finalPrice = product.discount
            ? product.price * (1 - product.discount / 100)
            : product.price

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row"
            >
              {/* Product Image */}
              <div className="relative w-full sm:w-40 h-40 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <span 
                    className="absolute top-2 left-2 text-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {product.badge}
                  </span>
                )}
                {product.discount && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div>
                    {product.discount ? (
                      <div>
                        <span className="text-sm text-gray-400 line-through block">
                          R$ {product.price.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          R$ {finalPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {cartItem ? (
                    <div 
                      className="flex items-center gap-2 rounded-full px-2 py-1"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-white hover:bg-black/10 rounded-full p-1 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-semibold min-w-[20px] text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="text-white hover:bg-black/10 rounded-full p-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      className="text-white px-6 py-2 rounded-full hover:opacity-90 transition-colors font-semibold"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const { config, categories, products, cart, addToCart, removeFromCart, getCartTotal, reorderCategories, createOrder, updateOrderStatus, updateOrderPayment, clearCart, getOrder } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCart, setShowCart] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "delivery" | "payment" | "status">("cart")
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [deliveryData, setDeliveryData] = useState<{ method: DeliveryMethod; address?: DeliveryAddress } | null>(null)
  
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Configurar Intersection Observer para detectar categoria visível
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-100px 0px -70% 0px",
        threshold: 0
      }
    )

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observerRef.current?.observe(ref)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [categories])

  // Filtrar produtos por busca
  const filteredProducts = products.filter(product => {
    if (!product.available) return false
    
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  // Agrupar produtos por categoria
  const groupedProducts = categories
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      category,
      products: filteredProducts.filter(p => p.categoryId === category.id)
    }))
    .filter(group => group.products.length > 0)

  // Adicionar grupo de promoções se houver produtos com desconto
  const promoProducts = filteredProducts.filter(p => p.discount || p.badge === 'Promoção')
  if (promoProducts.length > 0) {
    groupedProducts.unshift({
      category: { id: 'promocoes', name: 'Promoções', icon: '🔥', order: -1 },
      products: promoProducts
    })
  }

  // Calcular itens do carrinho
  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product)

  const cartTotal = getCartTotal()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Função para rolar até categoria
  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId)
    if (element) {
      const headerOffset = 180 // Altura do header + menu
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  // Handler para quando o drag termina
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = groupedProducts.findIndex(g => g.category.id === active.id)
      const newIndex = groupedProducts.findIndex(g => g.category.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedGroups = arrayMove(groupedProducts, oldIndex, newIndex)
        
        // Atualizar a ordem das categorias
        const updatedCategories = reorderedGroups.map((group, index) => ({
          ...group.category,
          order: index
        }))
        
        reorderCategories(updatedCategories)
      }
    }
  }

  // Iniciar checkout
  const startCheckout = () => {
    if (cartItems.length === 0) return
    setCheckoutStep("delivery")
  }

  // Avançar para pagamento
  const handleDeliveryNext = (method: DeliveryMethod, address?: DeliveryAddress) => {
    setDeliveryData({ method, address })
    
    // Criar pedido
    const order = createOrder(method, "pix", address) // Método de pagamento será definido depois
    setCurrentOrder(order)
    
    setCheckoutStep("payment")
  }

  // Voltar para escolha de entrega
  const handlePaymentBack = () => {
    setCheckoutStep("delivery")
  }

  // Finalizar pagamento
  const handlePaymentComplete = (method: PaymentMethod, paymentId?: string) => {
    if (currentOrder) {
      // Atualizar método de pagamento do pedido
      const updatedOrder = {
        ...currentOrder,
        paymentMethod: method,
        paymentId,
        status: method === "cash" ? "payment_confirmed" : "pending_payment"
      }
      
      if (paymentId) {
        updateOrderPayment(currentOrder.id, paymentId)
      }
      
      if (method === "cash" || paymentId) {
        updateOrderStatus(currentOrder.id, "payment_confirmed")
      }
      
      setCurrentOrder(updatedOrder)
      clearCart()
      setCheckoutStep("status")
    }
  }

  // Fechar status e voltar ao início
  const handleCloseStatus = () => {
    setCheckoutStep("cart")
    setShowCart(false)
    setCurrentOrder(null)
    setDeliveryData(null)
  }

  // Renderizar conteúdo do carrinho baseado no step
  const renderCartContent = () => {
    if (checkoutStep === "delivery") {
      return (
        <DeliveryMethodStep
          onNext={handleDeliveryNext}
          primaryColor={config.primaryColor}
        />
      )
    }

    if (checkoutStep === "payment" && currentOrder) {
      return (
        <PaymentMethodStep
          orderId={currentOrder.id}
          total={currentOrder.total}
          onBack={handlePaymentBack}
          onPaymentComplete={handlePaymentComplete}
          primaryColor={config.primaryColor}
        />
      )
    }

    // Cart view
    return (
      <>
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(({ productId, quantity, product }) => {
                const finalPrice = product.discount
                  ? product.price * (1 - product.discount / 100)
                  : product.price

                return (
                  <div key={productId} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                      <p 
                        className="font-bold"
                        style={{ color: config.primaryColor }}
                      >
                        R$ {(finalPrice * quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold min-w-[20px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(productId)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span 
                className="text-2xl font-bold"
                style={{ color: config.primaryColor }}
              >
                R$ {cartTotal.toFixed(2)}
              </span>
            </div>
            <button 
              onClick={startCheckout}
              className="w-full text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: config.primaryColor }}
            >
              Finalizar Pedido
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </>
    )
  }

  // Se estiver na tela de status, mostrar em tela cheia
  if (checkoutStep === "status" && currentOrder) {
    return (
      <OrderStatus
        order={currentOrder}
        products={products}
        primaryColor={config.primaryColor}
        onClose={handleCloseStatus}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold" style={{ color: config.primaryColor }}>
              {config.appName}
            </h1>
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setShowCart(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar no cardápio"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 transition-all"
              style={{ '--tw-ring-color': config.primaryColor } as any}
            />
          </div>
        </div>

        {/* Categories Horizontal Menu */}
        <div className="overflow-x-auto scrollbar-hide border-t">
          <div className="flex gap-4 px-4 max-w-7xl mx-auto py-3">
            {groupedProducts.map(({ category }) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`py-2 px-4 whitespace-nowrap font-medium transition-all rounded-full ${
                  activeCategory === category.id
                    ? "text-white shadow-md"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                style={activeCategory === category.id ? { backgroundColor: config.primaryColor } : {}}
              >
                {category.icon && `${category.icon} `}{category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Products List - Vertical Scroll with Drag and Drop */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={groupedProducts.map(g => g.category.id)}
            strategy={verticalListSortingStrategy}
          >
            {groupedProducts.map(({ category, products: categoryProducts }) => (
              <SortableCategory
                key={category.id}
                category={category}
                products={categoryProducts}
                categoryRefs={categoryRefs}
                config={config}
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            ))}
          </SortableContext>
        </DndContext>

        {groupedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (checkoutStep === "cart") {
                setShowCart(false)
              }
            }}
          />
          
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">
                {checkoutStep === "cart" ? "Carrinho" :
                 checkoutStep === "delivery" ? "Forma de Recebimento" :
                 "Pagamento"}
              </h2>
              <button
                onClick={() => {
                  if (checkoutStep === "cart") {
                    setShowCart(false)
                  } else if (checkoutStep === "delivery") {
                    setCheckoutStep("cart")
                  } else if (checkoutStep === "payment") {
                    setCheckoutStep("delivery")
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderCartContent()}
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-2xl hover:opacity-90 transition-all hover:scale-110 z-40 md:hidden"
          style={{ backgroundColor: config.primaryColor }}
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <span 
              className="absolute -top-2 -right-2 bg-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
              style={{ color: config.primaryColor }}
            >
              {cartCount}
            </span>
          </div>
        </button>
      )}
    </div>
  )
}
