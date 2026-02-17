import { Database } from './supabase/types'

// Base row types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Basket = Database['public']['Tables']['baskets']['Row']
export type BasketInsert = Database['public']['Tables']['baskets']['Insert']
export type BasketUpdate = Database['public']['Tables']['baskets']['Update']

export type BasketItem = Database['public']['Tables']['basket_items']['Row']
export type BasketItemInsert = Database['public']['Tables']['basket_items']['Insert']


export type Customer = Database['public']['Tables']['customers']['Row']

// New order types
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  image_url?: string | null;
}

// Composite types
export type BasketItemWithProduct = BasketItem & {
  product: Product
}

export type BasketWithItems = Basket & {
  items: BasketItemWithProduct[]
}

export type OrderWithItems = Order & {
  items: OrderItem[]
}

// Status unions
export type BasketStatus = 'pending' | 'paid' | 'shipped' | 'invalid'
export type DeliveryStatus = 'pending' | 'shipped' | 'completed'