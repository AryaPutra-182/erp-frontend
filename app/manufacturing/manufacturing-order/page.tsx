'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '../../../components/ToastProvider'

export default function ManufacturingOrder() {

  const searchParams = useSearchParams()
  const referenceParam = searchParams.get('ref')

  const [products, setProducts] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [components, setComponents] = useState<{ materialId: number, qty: number }[]>([])

  const [productId, setProductId] = useState(0)
  const [quantity, setQuantity] = useState(1.0)
  const [reference, setReference] = useState('')

  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const [moReference, setMoReference] = useState<string>("")
  const [savedMOId, setSavedMOId] = useState<number>(0)
  const [consumedRows, setConsumedRows] = useState<any[]>([])
  const [componentStatus, setComponentStatus] = useState<string>("")

  const router = useRouter()
  const { push } = useToast()


  // FORMAT BENAR UNTUK MYSQL & SEQUELIZE
  const formatDate = (d: Date) => {
    return d.toISOString().slice(0, 19).replace("T", " ")
  }


  const calculateComponentStatus = () => {
    let allZero = true
    let allEnough = true
    let someEnough = false  

    for (let c of components) {
      const m = materials.find(mm => mm.id === c.materialId)
      if (!m) continue

      const stock = Number(m.weight)
      const need = Number(c.qty)

      if (stock > 0) allZero = false  
      if (stock >= need) someEnough = true  
      if (stock < need) allEnough = false  
    }

    if (allZero) return "Not Available"
    if (allEnough) return "Available"
    if (someEnough) return "Partially Available"
    return "Waiting Materials"
  }


  const handleConfirm = async () => {
    const res = await fetch(`http://localhost:5000/api/manufacturing/mo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantityToProduce: quantity,
        reference,
        scheduledDate,
        endDate
      }),
    });

    const data = await res.json()

    setMoReference(data.data.moNumber)
    setSavedMOId(data.data.id)

    setConsumedRows(
      components.map(c => ({
        materialId: c.materialId,
        qty: c.qty,
        consumed: false
      }))
    )
    
    const stat = calculateComponentStatus()
    setComponentStatus(stat)
  }


  const handleProduce = async () => {

    const res2 = await fetch(`http://localhost:5000/api/manufacturing/allocate/${savedMOId}`, {
      method: "POST",
    })

    const data2 = await res2.json()

    push("Berhasil memproduksi manufacturing order", "success")
    
    router.push("/manufacturing/mo-list")

  }


  const handleToggleConsumed = (index: number) => {
    const updated = [...consumedRows]
    updated[index].consumed = !updated[index].consumed
    setConsumedRows(updated)
  }


  useEffect(() => {

    // set waktu SEKARANG
    const now = new Date()
    const end = new Date(now.getTime() + 1 * 60 * 60 * 1000)

    // SIMPAN format ke MYSQL
    setScheduledDate(formatDate(now))
    setEndDate(formatDate(end))

    fetch('http://localhost:5000/api/materials')
      .then(r => r.json())
      .then(setMaterials)

    if (!referenceParam) {

      fetch('http://localhost:5000/api/inventory/products')
        .then(r => r.json())
        .then(setProducts)

    } else {

      fetch(`http://localhost:5000/api/manufacturing-materials/${referenceParam}`)
        .then(r => r.json())
        .then(res => {

          if (!Array.isArray(res) || res.length === 0) return

          setProductId(res[0].productId)
          setReference(referenceParam)  // ← PENTING

          setQuantity(
            res.reduce((sum, r) => sum + Number(r.requiredQty), 0)
          )

          setComponents(
            res.map((r: any) => ({
              materialId: r.materialId,
              qty: r.requiredQty
            }))
          )

          setProducts([{ id: res[0].product.id, name: res[0].product.name }])
        })
    }

  }, [referenceParam])



  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-700">

      <h2 className="text-3xl font-bold text-cyan-300">New Manufacturing Order</h2>

      {moReference && (
        <div className="mt-2 mb-2 text-2xl font-semibold text-white">
          {moReference}
        </div>
      )}

      {!moReference && (
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      )}
      {moReference && (
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition"
            onClick={handleProduce}
          >
            Produce
          </button>
        </div>
      )}


      <div className="grid grid-cols-2 gap-6 mt-6">

        <div>
          <label className="block text-gray-300 text-sm">Product</label>
          <input
            type="text"
            disabled
            value={products.length > 0 ? products[0].name : ""}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm">Scheduled Date</label>
          <input
            type="text"
            disabled
            value={scheduledDate}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm">Quantity</label>
          <input
            type="text"
            disabled
            value={quantity.toFixed(2)}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm">End</label>
          <input
            type="text"
            disabled
            value={endDate}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm">
            Bills Of Material
          </label>
          <input
            value={reference}
            disabled
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

        {moReference && (
          <div>
            <label className="block text-gray-300 text-sm">
              Components Status
            </label>
            <input
              type="text"
              disabled
              value={componentStatus}
              className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded text-green-300 font-bold"
            />
          </div>
        )}

      </div>


      <div className="mt-10">
        <label className="block text-gray-300 text-sm mb-2">Komponen</label>

        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-800 border border-gray-700">
            <tr>
              <th className="p-2 border border-gray-700 text-gray-300 text-left">
                Material
              </th>
              <th className="p-2 border border-gray-700 text-gray-300 text-center w-32">
                To Consume
              </th>
              {moReference && (
                <>
                  <th className="p-2 border border-gray-700 text-gray-300 text-center w-32">
                    Quantity
                  </th>
                  <th className="p-2 border border-gray-700 text-gray-300 text-center w-32">
                    Consumed
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {components.map((row, i) => (
              <tr key={i}>
                <td className="p-2 border border-gray-700 text-left">
                  <span className="text-gray-200">
                    {materials.find((m) => m.id === row.materialId)?.name || ""}
                  </span>
                </td>

                <td className="p-2 border border-gray-700 text-center">
                  <span className="text-gray-200">{row.qty.toFixed(2)}</span>
                </td>

                {moReference && (
                  <>
                    <td className="p-2 border border-gray-700 text-center text-gray-200">
                      {row.qty.toFixed(2)}
                    </td>

                    <td className="p-2 border border-gray-700 text-center">
                      <input
                        type="checkbox"
                        checked={consumedRows[i]?.consumed || false}
                        onChange={() => handleToggleConsumed(i)}
                      />
                    </td>
                  </>
                )}

              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="flex justify-end mt-10 gap-3">
        <button
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          onClick={() => router.push("/manufacturing")}
        >
          Back
        </button>
      </div>

    </div>
  )
}
