'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ManufacturingOrder() {

  const searchParams = useSearchParams()
  const referenceParam = searchParams.get('ref') 
  const idParam = searchParams.get('id')         

  // State Data Master
  const [products, setProducts] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  
  // State Transaksi
  const [components, setComponents] = useState<{ materialId: number, qty: number }[]>([])
  
  const [productId, setProductId] = useState<number | string>("") 
  const [productName, setProductName] = useState<string>("") 
  const [quantity, setQuantity] = useState(1.0)
  const [reference, setReference] = useState('')

  // State Tanggal
  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // State Hasil Simpan
  const [moReference, setMoReference] = useState<string>("")
  const [savedMOId, setSavedMOId] = useState<number>(0)
  const [status, setStatus] = useState<string>("Draft")
  const [consumedRows, setConsumedRows] = useState<any[]>([])
  const [componentStatus, setComponentStatus] = useState<string>("")
  const [loadingData, setLoadingData] = useState(false)

  const router = useRouter()

  // --- HELPER FORMAT ---
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  }

  const formatDate = (d: Date) => {
    return d.toISOString().slice(0, 19).replace("T", " ")
  }

  // --- HITUNG TOTAL BIAYA ---
  const totalEstimatedCost = components.reduce((acc, item) => {
      const mat = materials.find(m => Number(m.id) === Number(item.materialId));
      const unitCost = Number(mat?.cost || mat?.price || 0);
      return acc + (unitCost * item.qty);
  }, 0);


  // --- HANDLE CONFIRM ---
  const handleConfirm = async () => {
    if (!productId || Number(productId) === 0) return alert("❌ Error: Produk belum dipilih.");
    if (!reference) return alert("❌ Error: Referensi BOM kosong.");

    try {
        const payload = {
            productId: Number(productId),
            quantityToProduce: Number(quantity),
            reference: reference,
            scheduledDate,
            endDate
        };

        const res = await fetch(`http://localhost:5000/api/manufacturing/mo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    
        const data = await res.json()

        if (!res.ok) return alert(data.error || "Gagal menyimpan MO");

        const moData = data.data || data; 
        if (!moData || !moData.moNumber) return alert("Format data server salah.");

        setMoReference(moData.moNumber)
        setSavedMOId(moData.id)
        setStatus(moData.status || "Confirmed")
    
        setConsumedRows(components.map(c => ({
            materialId: c.materialId,
            qty: c.qty,
            consumed: false
        })))
        
        // Status akan dihitung otomatis oleh useEffect di bawah

    } catch (error) {
        console.error("Network Error:", error);
        alert("Gagal menghubungi server.");
    }
  }

  // --- HANDLE PRODUCE ---
  const handleProduce = async () => {
    try {
        const res2 = await fetch(`http://localhost:5000/api/manufacturing/allocate/${savedMOId}`, {
            method: "POST",
        })
    
        if(res2.ok) {
            alert("✔ Produksi Selesai! Stok diperbarui.");
            router.push("/manufacturing/mo-list")
        } else {
            const err = await res2.json();
            alert("❌ Gagal: " + err.error);
        }
    } catch (error) {
        alert("Network Error");
    }
  }

  const handleToggleConsumed = (index: number) => {
    const updated = [...consumedRows]
    updated[index].consumed = !updated[index].consumed
    setConsumedRows(updated)
  }

  // =======================================================
  // 1. LOAD MASTER DATA
  // =======================================================
  useEffect(() => {
    const loadData = async () => {
        try {
            const [matRes, prodRes] = await Promise.all([
                fetch('http://localhost:5000/api/materials'),
                fetch('http://localhost:5000/api/inventory/products')
            ]);
            
            if(matRes.ok) setMaterials(await matRes.json());
            if(prodRes.ok) setProducts(await prodRes.json());

        } catch (err) {
            console.error("Gagal load data master:", err);
        }
    };
    loadData();

    const now = new Date()
    const end = new Date(now.getTime() + 1 * 60 * 60 * 1000) 
    setScheduledDate(formatDate(now))
    setEndDate(formatDate(end))
  }, []); 


  // =======================================================
  // 2. LOAD EXISTING MO (VIEW MODE)
  // =======================================================
  useEffect(() => {
    if (!idParam) return; 

    setLoadingData(true);
    fetch(`http://localhost:5000/api/manufacturing/mo/${idParam}`)
      .then(r => r.json())
      .then(res => {
         const data = res.data || res; 

         setSavedMOId(data.id);
         setMoReference(data.moNumber);
         setProductId(data.productId);
         
         const pName = data.Product?.name || data.product?.name || "";
         setProductName(pName);

         setQuantity(data.quantityToProduce);
         setReference(data.reference);
         setScheduledDate(data.scheduledDate);
         setEndDate(data.endDate);
         setStatus(data.status);

         const items = data.items || data.ManufacturingOrderMaterials || [];
         const mappedComponents = items.map((item: any) => ({
             materialId: item.materialId,
             qty: Number(item.requiredQty || item.qty)
         }));

         setComponents(mappedComponents);
         
         setConsumedRows(mappedComponents.map((c: any) => ({
             materialId: c.materialId,
             consumed: data.status === "Done"
         })));
      })
      .catch(err => console.error("Failed load MO:", err))
      .finally(() => setLoadingData(false));

  }, [idParam]);


  // =======================================================
  // 3. LOAD BOM (CREATE MODE)
  // =======================================================
  useEffect(() => {
    if (!referenceParam || idParam) return; 

    setLoadingData(true);
    fetch(`http://localhost:5000/api/manufacturing-materials/${referenceParam}`)
    .then(r => r.json())
    .then(res => {
        if (!Array.isArray(res) || res.length === 0) return;

        const foundProductId = res[0].productId || res[0].product?.id;
        const foundProductName = res[0].product?.name || "";

        if(foundProductId) {
            setProductId(foundProductId);
            setProductName(foundProductName);
        }

        setReference(referenceParam);
        setQuantity(1); 

        setComponents(
            res.map((r: any) => ({
                materialId: r.materialId,
                qty: Number(r.requiredQty) 
            }))
        );
    })
    .catch(err => console.error("Failed fetch BOM", err))
    .finally(() => setLoadingData(false));

  }, [referenceParam, idParam])


  // =======================================================
  // 4. AUTO CALCULATE STATUS (SOLUSI CHECKING...)
  // =======================================================
  useEffect(() => {
    if (components.length === 0 || materials.length === 0) return;

    let allZero = true;
    let allEnough = true;
    let someEnough = false;

    for (let c of components) {
      const m = materials.find(mm => Number(mm.id) === Number(c.materialId));
      if (!m) continue;

      // Ganti 'weight' dengan nama kolom stok yang benar dari API materials
      const stock = Number(m.weight || m.quantity || m.stock || 0); 
      const need = Number(c.qty);

      if (stock > 0) allZero = false;
      if (stock >= need) someEnough = true;
      if (stock < need) allEnough = false;
    }

    let statusResult = "Waiting Materials";
    if (allZero) statusResult = "Not Available";
    else if (allEnough) statusResult = "Available";
    else if (someEnough) statusResult = "Partially Available";

    setComponentStatus(statusResult);

  }, [components, materials]);


  // --- RENDER ---
  const handleProductChange = (e: any) => {
      const selectedId = Number(e.target.value);
      setProductId(selectedId);
      const p = products.find(x => x.id == selectedId);
      if(p) {
          setReference(`MANUAL-${p.name}`);
          setProductName(p.name);
      }
  }

  const isReadOnly = !!idParam || !!referenceParam || !!moReference;

  return (
    <div className="bg-[#161b22] text-gray-200 p-8 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-800 mt-6">

      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-6 mb-6">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
                {moReference ? "Manufacturing Order" : "New Manufacturing Order"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
                {moReference ? `Track status and production for ${moReference}` : "Create production plan based on BOM."}
            </p>
        </div>
        
        {moReference && (
             <div className="text-right">
                 <div className="bg-green-900/30 border border-green-800 px-4 py-2 rounded-lg mb-2">
                    <span className="text-xs text-green-400 uppercase font-bold block">Reference</span>
                    <span className="text-2xl font-mono font-bold text-white">{moReference}</span>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status === "Done" ? "bg-blue-600 text-white" : "bg-yellow-600 text-white"}`}>
                    {status}
                 </span>
             </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mb-8">
          {!moReference ? (
             <button
                disabled={loadingData}
                className={`flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-lg transition-all shadow-lg ${loadingData ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'}`}
                onClick={handleConfirm}
              >
                {loadingData ? "Loading..." : "Confirm Order"}
              </button>
          ) : (
              status !== "Done" && (
                  <button
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-900/20"
                    onClick={handleProduce}
                  >
                    Produce (Allocate Stock)
                  </button>
              )
          )}
          
          <button 
            onClick={() => router.push('/manufacturing/mo-list')}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg"
          >
            Back to List
          </button>
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left: Form Inputs */}
        <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-xl border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Product</label>
                {isReadOnly ? (
                    <input
                        type="text"
                        disabled
                        value={productName || products.find(p => p.id === Number(productId))?.name || "Loading..."}
                        className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-70 cursor-not-allowed"
                    />
                ) : (
                    <select
                        value={productId}
                        onChange={handleProductChange}
                        className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">BOM Reference</label>
                <input
                    value={reference || ""}
                    onChange={(e) => setReference(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                />
            </div>

            <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Quantity to Produce</label>
                <div className="relative">
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        disabled={!!moReference} 
                        className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-2.5 rounded-lg font-mono focus:border-blue-500 outline-none disabled:opacity-70"
                    />
                    <span className="absolute right-4 top-2.5 text-gray-500 text-sm">Units</span>
                </div>
            </div>

            <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Scheduled Date</label>
                <input
                    type="text"
                    disabled
                    value={scheduledDate}
                    className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-70 cursor-not-allowed"
                />
            </div>

            {moReference && (
                <div className="md:col-span-2">
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Components Availability</label>
                    <div className={`w-full border px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 ${
                        componentStatus === "Available" ? "bg-green-900/20 border-green-800 text-green-400" :
                        componentStatus === "Not Available" ? "bg-red-900/20 border-red-800 text-red-400" :
                        "bg-yellow-900/20 border-yellow-800 text-yellow-400"
                    }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                            componentStatus === "Available" ? "bg-green-500" :
                            componentStatus === "Not Available" ? "bg-red-500" : "bg-yellow-500"
                        }`}></span>
                        {componentStatus || "Checking..."}
                    </div>
                </div>
            )}
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex flex-col justify-between">
            <div>
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                    Cost Analysis
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Material Cost</span>
                        <span>{formatRupiah(totalEstimatedCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Labor / Overhead</span>
                        <span>Rp 0</span>
                    </div>
                </div>
                <div className="my-4 border-t border-gray-700"></div>
            </div>
            
            <div>
                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-white">Total Cost</span>
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                        {formatRupiah(totalEstimatedCost)}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                    Est. per unit: {formatRupiah(totalEstimatedCost / (quantity || 1))}
                </p>
            </div>
        </div>

      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Components & Costing</h3>
        <div className="overflow-hidden rounded-xl border border-gray-700">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-400 uppercase font-bold text-xs">
                <tr>
                <th className="p-4">Material</th>
                <th className="p-4 text-center">To Consume</th>
                <th className="p-4 text-right">Unit Cost</th>
                <th className="p-4 text-right text-emerald-400">Subtotal</th>
                {moReference && <th className="p-4 text-center">Consumed?</th>}
                </tr>
            </thead>

            <tbody className="divide-y divide-gray-800 bg-[#0D1117]">
                {components.length > 0 ? components.map((row, i) => {
                    const mat = materials.find((m) => Number(m.id) === Number(row.materialId));
                    const unitCost = Number(mat?.cost || mat?.price || 0); 
                    const subtotal = unitCost * row.qty;

                    return (
                        <tr key={i} className="hover:bg-gray-800/50 transition">
                            <td className="p-4 font-medium text-white">
                                {mat?.name || `Material #${row.materialId}`}
                            </td>
                            <td className="p-4 text-center font-mono text-blue-300">
                                {row.qty.toFixed(2)}
                            </td>
                            <td className="p-4 text-right font-mono text-gray-400">
                                {formatRupiah(unitCost)}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-emerald-400">
                                {formatRupiah(subtotal)}
                            </td>
                            {moReference && (
                                <td className="p-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={consumedRows[i]?.consumed || status === "Done"}
                                        disabled={status === "Done"}
                                        onChange={() => handleToggleConsumed(i)}
                                        className="w-5 h-5 rounded cursor-pointer"
                                    />
                                </td>
                            )}
                        </tr>
                    );
                }) : (
                    <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                            {loadingData ? "Loading components..." : "No components loaded."}
                        </td>
                    </tr>
                )}
            </tbody>
            <tfoot className="bg-gray-800/50 border-t border-gray-700">
                <tr>
                    <td colSpan={3} className="p-4 text-right font-bold text-white uppercase text-xs">
                        Total Material Cost
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-400 text-lg">
                        {formatRupiah(totalEstimatedCost)}
                    </td>
                    {moReference && <td></td>}
                </tr>
            </tfoot>
            </table>
        </div>
      </div>
    </div>
  )
}