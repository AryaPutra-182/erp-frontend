export interface Customer {
  id?: number;
  name: string;
  company_name?: string;
  email?: string;
  phone_number?: string;
  status?: string;
}

export interface Product {
  id?: number;
  name: string;
  type?: string;
  salePrice?: number;
  cost?: number;
  category?: string;
  internalReference?: string;
  image?: string;
}

export interface Manufacturing {
  id?: number;
  order_number?: string; 
}

export interface QuotationItem {
  product_id: number;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface Quotation {
  id?: number;
  quotation_number?: string;
  customer_id?: number;
  customer_name?: string;
  quotation_date?: string;
  expiration_date?: string;
  items?: QuotationItem[];
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  status?: string;
}
