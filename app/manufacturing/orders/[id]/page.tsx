'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SearchableProductSelect from '../../../../components/SearchableProductSelect'

export default function ManufacturingOrderProcess({ params }: any) {
  const { id } = params 
  const router = useRouter()
  const searchParams = useSearchParams()
  const referenceParam = searchParams.get('ref')

  const isCreateMode = id === 'new';

  // --- STATE ---
  const [products, setProducts] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  
  const [productId, setProductId] = useState<number | string>("") 
  const [productName, setProductName] = useState<string>("") 
  const [quantity, setQuantity] = useState(1.0)
  const [reference, setReference] = useState(referenceParam || '')
  
  const [components, setComponents] = useState<any[]>([])
  const [moData, setMoData] = useState<any>(null)
  const [componentStatus, setComponentStatus] = useState<string>("Checking...")
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // --- HELPER FORMAT ---
  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num || 0);
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString("id-ID") : "-";
  
  const getStatusColor = (status: string) => {
      const s = String(status || "").toLowerCase();
      if(s === "done") return "bg-blue-600 text-white border-blue-500";
      if(s === "draft") return "bg-yellow-600 text-white border-yellow-500";
      return "bg-emerald-600 text-white border-emerald-500";
  }

  // --- 1. LOAD MASTER DATA ---
  useEffect(() => {
    Promise.all([
        fetch('http://localhost:5000/api/inventory/products').then(r=>r.json()),
        fetch('http://localhost:5000/api/materials').then(r=>r.json())
    ]).then(([p, m]) => { 
        setProducts(Array.isArray(p) ? p : p.data || []); 
        setMaterials(Array.isArray(m) ? m : m.data || []); 
    }).catch(e => console.error("Master Data Error:", e));
  }, []);

  // --- 2. LOAD TRANSACTION DATA ---
  useEffect(() => {
     const loadData = async () => {
        setLoading(true);
        try {
            if (isCreateMode && referenceParam) {
                // CREATE BY BOM
                const res = await fetch(`http://localhost:5000/api/manufacturing-materials/${referenceParam}`);
                const data = await res.json();
                const bomList = Array.isArray(data) ? data : (data.data || []);

                if(bomList.length > 0) {
                    const first = bomList[0];
                    setProductId(first.productId || first.product?.id);
                    setProductName(first.product?.name || ""); 
                    setReference(referenceParam);
                    setComponents(bomList.map((d:any) => ({ 
                        materialId: d.materialId, 
                        qty: Number(d.requiredQty) 
                    })));
                }
            } else if (!isCreateMode) {
                // VIEW EXISTING MO
                const res = await fetch(`http://localhost:5000/api/manufacturing/mo/${id}`);
                if(res.ok) {
                    const json = await res.json();
                    const data = json.data || json;
                    
                    setMoData(data);
                    setProductId(data.productId);
                    setProductName(data.product?.name || "");
                    setQuantity(data.quantityToProduce);
                    setReference(data.reference);
                    
                    const items = data.items || data.materials || [];
                    setComponents(items.map((d:any) => ({ 
                        materialId: d.materialId, 
                        qty: Number(d.requiredQty || d.qty),
                        status: d.status 
                    })));
                }
            }
        } catch(e) { console.error(e); } 
        finally { setLoading(false); }
     }
     if (id) loadData();
  }, [id, referenceParam, isCreateMode]);


  // --- 3. LOGIC COSTING & STATUS ---
  const totalEstimatedCost = components.reduce((acc, item) => {
      const mat = materials.find(m => Number(m.id) === Number(item.materialId));
      return acc + (Number(mat?.cost || 0) * item.qty);
  }, 0);

  useEffect(() => {
      if (!components.length || !materials.length) {
          setComponentStatus("Waiting Data...");
          return;
      }
      let allZero = true, allEnough = true;
      
      components.forEach(c => {
          const m = materials.find(mm => Number(mm.id) === Number(c.materialId));
          const stock = Number(m?.weight || m?.quantity || 0); 
          if (stock > 0) allZero = false;
          if (stock < (c.qty * quantity)) allEnough = false; // Cek qty total
      });
      
      if (allZero) setComponentStatus("Not Available");
      else if (allEnough) setComponentStatus("Available");
      else setComponentStatus("Partially Available");
  }, [components, materials, quantity]);


  // --- ACTIONS ---
  const handleConfirm = async () => {
      if(!productId) return alert("❌ Produk belum dipilih!");
      if(components.length === 0) return alert("❌ Komponen kosong!");

      const payload = { 
        productId: Number(productId), 
        quantityToProduce: Number(quantity), 
        reference: reference || `MANUAL-${Date.now()}`, 
        scheduledDate: new Date(), 
        endDate: new Date(),
        components // Kirim komponen agar backend bisa simpan manual input
      };
      
      setProcessing(true);
      try {
        const res = await fetch(`http://localhost:5000/api/manufacturing/mo`, { 
             method: 'POST', 
             headers: {'Content-Type': 'application/json'}, 
             body: JSON.stringify(payload) 
        });
        const json = await res.json();
        
        if(res.ok) { 
            const newId = json.data?.id || json.id;
            router.push(`/manufacturing/orders/${newId}`); 
        } else { 
            alert("❌ Gagal: " + (json.message || json.error)); 
        }
      } catch(e) { alert("Network Error"); }
      finally { setProcessing(false); }
  }

  const handleProduce = async () => {
      if(!confirm("Selesaikan Produksi? Stok akan dipotong.")) return;
      setProcessing(true);
      try {
          const res = await fetch(`http://localhost:5000/api/manufacturing/allocate/${id}`, { method: 'POST' });
          if(res.ok) { 
              alert("✔ Produksi Selesai!"); 
              window.location.reload(); 
          } else {
              const json = await res.json();
              alert("❌ Gagal: " + json.error);
          }
      } catch(e) { alert("Network Error"); }
      finally { setProcessing(false); }
  }

  // --- UI RENDER ---
  if (loading) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-gray-500 animate-pulse">Loading Data...</div>
  if (!isCreateMode && !moData) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-red-500">Order Not Found</div>

  const qtyDisplay = isCreateMode ? quantity : moData?.quantityToProduce;

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto bg-[#161b22] border border-gray-800 rounded-2xl shadow-xl p-8">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-gray-700 pb-6 mb-6">
          <div>
              <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight font-mono">
                      {isCreateMode ? "New MO" : moData?.moNumber}
                  </h1>
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getStatusColor(moData?.status || 'draft')}`}>
                      {moData?.status || "Draft"}
                  </span>
              </div>
              <p className="text-gray-400 text-sm">
                  Target Product: <span className='text-white font-medium'>{productName || products.find(p=>p.id==productId)?.name || '-'}</span>
              </p>
          </div>
          
          <div className="flex gap-3">
              {isCreateMode ? (
                  <button onClick={handleConfirm} disabled={processing} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-lg disabled:opacity-50 transition">
                    {processing ? "Saving..." : "Confirm Order"}
                  </button>
              ) : (
                  moData?.status !== "Done" && (
                      <button onClick={handleProduce} disabled={processing} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg disabled:opacity-50 transition">
                        {processing ? "Processing..." : "Produce & Complete"}
                      </button>
                  )
              )}
              <Link href="/manufacturing/orders/list" className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition">
                Back
              </Link>
          </div>
        </div>

        {/* FORM & INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* CARD 1: ORDER DETAILS */}
            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800 md:col-span-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Product</label>
                        {isCreateMode && !referenceParam ? (
                            <SearchableProductSelect products={products} selectedValue={productId} onChange={(val) => { setProductId(val); const p = products.find(x => x.id == val); if(p) setProductName(p.name); }} disabled={false} />
                        ) : (
                            <input disabled value={productName || products.find(p=>p.id==productId)?.name || "Loading..."} className="w-full bg-[#0D1117] border border-gray-700 p-2 rounded text-white opacity-70"/>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Quantity to Produce</label>
                        <input type="number" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} disabled={!isCreateMode} className="w-full bg-[#0D1117] border border-gray-700 p-2 rounded text-white focus:border-blue-500 outline-none font-mono"/>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Reference</label>
                        <input value={reference} onChange={e=>setReference(e.target.value)} disabled={!isCreateMode || !!referenceParam} className="w-full bg-[#0D1117] border border-gray-700 p-2 rounded text-white focus:border-blue-500 outline-none"/>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Material Availability</label>
                        <div className={`p-2 rounded border text-center font-bold text-sm ${
                            componentStatus === 'Available' ? 'bg-green-900/30 text-green-400 border-green-800' : 
                            componentStatus === 'Not Available' ? 'bg-red-900/30 text-red-400 border-red-800' : 
                            'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                        }`}>
                            {componentStatus}
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 2: COST ANALYSIS */}
            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Cost Analysis</h3>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Material Cost</span>
                        <span className="text-white">{formatRupiah(totalEstimatedCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Labor / Overhead</span>
                        <span className="text-white">Rp 0</span>
                    </div>
                    <div className="border-t border-gray-700 my-2"></div>
                </div>
                <div>
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-white">Total Cost</span>
                        <span className="text-xl font-mono font-bold text-emerald-400">{formatRupiah(totalEstimatedCost)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        Est. Unit Cost: {formatRupiah(totalEstimatedCost / (quantity || 1))}
                    </p>
                </div>
            </div>

        </div>

        {/* COMPONENTS TABLE */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Components & Fulfillment</h3>
          <div className="bg-[#0D1117] border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800 text-gray-400 uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4">Material</th>
                        <th className="p-4 text-center">Required</th>
                        <th className="p-4 text-right">Unit Cost</th>
                        <th className="p-4 text-right text-emerald-400">Subtotal</th>
                        <th className="p-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {components.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500 italic">No components loaded</td></tr>
                    ) : components.map((item: any, i: number) => {
                        const mat = materials.find((m) => Number(m.id) === Number(item.materialId));
                        const unitCost = Number(mat?.cost || mat?.price || 0); 
                        // Qty Required = Qty Per Unit * Total Produksi
                        const totalRequired = isCreateMode ? (item.qty * quantity) : item.qty; 
                        const subtotal = unitCost * totalRequired;

                        return (
                            <tr key={i} className="hover:bg-gray-800/30 transition">
                                <td className="p-4 font-medium text-white">
                                    {mat?.name || `Material #${item.materialId}`}
                                    <div className="text-xs text-gray-500">{mat?.internalReference || "-"}</div>
                                </td>
                                <td className="p-4 text-center font-mono text-blue-300">
                                    {Number(totalRequired).toFixed(2)}
                                </td>
                                <td className="p-4 text-right font-mono text-gray-400">
                                    {formatRupiah(unitCost)}
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-emerald-400">
                                    {formatRupiah(subtotal)}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Allocated' || moData?.status === 'Done' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                        {item.status === 'Allocated' || moData?.status === 'Done' ? 'ALLOCATED' : 'PENDING'}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot className="bg-gray-800/50 border-t border-gray-700">
                    <tr>
                        <td colSpan={3} className="p-4 text-right font-bold text-white uppercase text-xs">Total Material Cost</td>
                        <td className="p-4 text-right font-bold text-emerald-400 text-lg">
                            {formatRupiah(totalEstimatedCost * (isCreateMode ? quantity : 1))} 
                            {/* Note: Logic perkalian qty di atas sudah handle total, ini adjustment visual */}
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
              </table>
          </div>
        </div>

      </div>
    </section>
  )
}