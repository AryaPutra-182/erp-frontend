'use client'
import { useState, useMemo, useEffect, useRef } from 'react';

interface Product {
    id: number;
    name: string;
    sku?: string;
}

interface SearchableProductSelectProps {
  products: Product[];
  selectedValue: number | string;
  onChange: (id: number | string) => void;
  disabled: boolean;
}

export default function SearchableProductSelect({
  products,
  selectedValue,
  onChange,
  disabled,
}: SearchableProductSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // 1. Ref untuk mendeteksi area komponen
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const selectedProductName = useMemo(() => {
    const selected = products.find(p => p.id === Number(selectedValue));
    return selected ? selected.name : '';
  }, [products, selectedValue]);

  const handleSelect = (product: Product) => {
    onChange(product.id);
    setSearchTerm(''); // Reset pencarian
    setIsOpen(false);  // Tutup dropdown
  };

  // 2. Logic Klik di Luar (DIPERBAIKI)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Jika dropdown terbuka DAN yang diklik BUKAN bagian dari wrapperRef, maka tutup
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
    // Jangan hapus selectedValue saat mengetik agar UX lebih halus, 
    // cukup ubah searchTerm. Ganti hanya jika user memilih opsi baru.
  };
  
  // Handle fokus input untuk membuka dropdown
  const onInputFocus = () => {
     setIsOpen(true);
  }

  return (
    // 3. Pasang ref di div terluar
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        // Tampilkan search term jika sedang ngetik/buka, atau nama produk jika tertutup
        value={isOpen ? searchTerm : selectedProductName}
        placeholder={disabled ? "Product loaded via BOM" : "Search Product or SKU..."}
        disabled={disabled}
        onFocus={onInputFocus}
        onChange={handleInputChange}
        // Klik input juga memicu buka (jika belum buka)
        onClick={() => !isOpen && setIsOpen(true)}
        className={`w-full bg-[#0D1117] border px-4 py-2.5 rounded-lg text-white outline-none transition ${
          disabled ? 'border-gray-700 opacity-70 cursor-not-allowed' : 'border-gray-600 focus:border-blue-500'
        }`}
      />
      
      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-[#161b22] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="p-3 text-gray-500 text-sm">No results found</div>
          ) : (
            filteredProducts.map(p => (
              <div
                key={p.id}
                onClick={() => handleSelect(p)}
                className="p-3 cursor-pointer hover:bg-gray-700/50 flex justify-between items-center text-sm border-b border-gray-800 last:border-0"
              >
                <span className="text-white font-medium">{p.name}</span>
                <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-0.5 rounded">{p.sku}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}