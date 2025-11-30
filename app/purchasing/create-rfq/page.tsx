'use client'
import { useState, useEffect } from 'react'
import { apiGet } from '../../lib/api'
import { Vendor } from '../../../types'
import { useToast } from '../../../components/ToastProvider'
import { useRouter } from 'next/navigation'

export default function CreateRFQ() {

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<any[]>([])

  const [vendorId, setVendorId] = useState(0)
  const [orderDeadline, setOrderDeadline] = useState("")
  const [vendorReference, setVendorReference] = useState('')
  const [expectedArrival, setExpectedArrival] = useState('')
  const [components, setComponents] = useState<{ productId: number, qty: number, price: number }[]>([])
  const [statusRFQ, setStatusRFQ] = useState<'RFQ'|'RFQ Sent'|'Purchase Order'>('RFQ')
  const [rfqNumber, setRfqNumber] = useState("")

  const router = useRouter()
  const { push } = useToast()

  function formatDateTime() {
    const d = new Date()
    const pad = (n: number) => n < 10 ? "0" + n : n
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  function formatNumber(num: number) {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  useEffect(() => {
    apiGet<any[]>('/vendor').then(setVendors)
    apiGet<any[]>('/inventory/products').then(setProducts)
    setOrderDeadline(formatDateTime())
  }, [])

  const addProductLine = () => {
    setComponents([...components, { productId: 0, qty: 1.00, price: 0 }])
  }

  const availableProducts = (comp: { productId: number }[], current?: number) => {
    return products.filter(p => p.id === current || !comp.map(x => x.productId).includes(p.id))
  }

  const selectProduct = (i: number, value: number) => {
    const arr = [...components]
    arr[i].productId = value
    setComponents(arr)

    if (value !== 0 && expectedArrival === "") {
      setExpectedArrival(orderDeadline)
    }
  }

  const totalAmount = components.reduce((sum, item) => sum + (item.qty * item.price), 0)

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/purchase/next-rfq-number")
      const data = await res.json()
      setRfqNumber(data.number)
      push("Berhasil Disimpan", "success")
    } catch(e) {
      push("Gagal generate nomor RFQ", "error")
    }
  }

  const handleConfirm = async () => {
    setStatusRFQ("Purchase Order")

    const payload = {
      rfqNumber,
      vendorId,
      orderDeadline,
      vendorReference,
      expectedArrival,
      components: components.map(c => ({
        productId: c.productId,
        qty: c.qty,
        price: c.price,
        amount: c.qty * c.price
      })),
      status: "Purchase Order"
    }

    try {
      await fetch("http://localhost:5000/api/purchase/create-rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      push("Status berubah menjadi Purchase Order", "success")
    } catch(e) {
      push("RFQ gagal disimpan", "error")
    }
  }

  const handlePrint = () => {
    window.print()
    setStatusRFQ("RFQ Sent")
  }

  const handleCancel = () => {
    router.push("/purchasing")
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-700">

      <h1 className="text-3xl font-bold text-cyan-300 mb-3 text-left">New Request Of Quotation</h1>

      <div className="flex justify-between mb-6">

        <div className="flex gap-2">
          
          {!rfqNumber && statusRFQ === "RFQ" && (
            <button className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-500" onClick={handleSave}>
              Save
            </button>
          )}

          {statusRFQ === "RFQ" && (
            <button className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-500" onClick={handlePrint}>
              Print RFQ
            </button>
          )}

          {statusRFQ === "RFQ Sent" && (
            <button className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-500" onClick={handleConfirm}>
              Confirm Order
            </button>
          )}

          <button className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-500" onClick={handleCancel}>
            Kembali</button>

        </div>

        <div className="flex gap-2">

          <div className={`px-3 py-1 rounded border text-xs ${statusRFQ === "RFQ" ? "bg-cyan-300 text-black border-cyan-300" : "bg-gray-800 text-gray-400 border-gray-600"}`}>
            RFQ
          </div>

          <div className={`px-3 py-1 rounded border text-xs ${statusRFQ === "RFQ Sent" ? "bg-cyan-300 text-black border-cyan-300" : "bg-gray-800 text-gray-400 border-gray-600"}`}>
            RFQ Sent
          </div>

          <div className={`px-3 py-1 rounded border text-xs ${statusRFQ === "Purchase Order" ? "bg-cyan-300 text-black border-cyan-300" : "bg-gray-800 text-gray-400 border-gray-600"}`}>
            Purchase Order
          </div>
          
        </div>

      </div>

      {rfqNumber && (
        <div className="text-2xl font-semibold text-white mb-4 text-left">
          {rfqNumber}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="block text-gray-300 text-sm">Vendor</label>
          <select
            value={vendorId}
            onChange={e => setVendorId(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          >
            <option value={0}>Pilih Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.vendorName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm">Order Deadline</label>
          <input
            type="text"
            value={orderDeadline}
            onChange={e => setOrderDeadline(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm">Vendor Reference</label>
          <input
            value={vendorReference}
            onChange={e => setVendorReference(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm">Expected Arrival</label>
          <input
            type="text"
            value={expectedArrival}
            readOnly
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>
      </div>

      <div className="mt-10">
        <label className="block text-gray-300 text-sm mb-2">Products</label>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-800 border border-gray-700">
            <tr>
              <th className="p-2 border border-gray-700 text-left text-gray-300">Product</th>
              <th className="p-2 border border-gray-700 text-center text-gray-300">Quantity</th>
              <th className="p-2 border border-gray-700 text-center text-gray-300">Unit Price</th>
              <th className="p-2 border border-gray-700 text-center text-gray-300">Amount</th>
              <th className="p-2 border border-gray-700 w-16 text-center"></th>
            </tr>
          </thead>

          <tbody>
            {components.map((row, i) => (
              <tr key={i}>
                <td className="p-2 border border-gray-700">
                  <select
                    value={row.productId}
                    onChange={e => selectProduct(i, Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 px-2 py-1 rounded"
                  >
                    <option value={0}>Pilih Produk</option>
                    {availableProducts(components, row.productId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border border-gray-700 text-center">
                  {row.productId !== 0 && (
                    <input
                      type="text"
                      value={row.qty.toFixed(2)}
                      onChange={e => {
                        const arr = [...components]
                        arr[i].qty = Number(e.target.value)
                        setComponents(arr)
                      }}
                      className="w-20 bg-gray-800 border border-gray-600 px-2 py-1 rounded text-left"
                    />
                  )}
                </td>

                <td className="p-2 border border-gray-700 text-center">
                  {row.productId !== 0 && (
                    <input
                      type="text"
                      value={formatNumber(row.price)}
                      onChange={e => {
                        const arr = [...components]
                        arr[i].price = Number(e.target.value.replace(/,/g, ""))
                        setComponents(arr)
                      }}
                      className="w-24 bg-gray-800 border border-gray-600 px-2 py-1 rounded text-left"
                    />
                  )}
                </td>

                <td className="p-2 border border-gray-700 text-center text-green-400 font-semibold">
                  {formatNumber(row.qty * row.price)}
                </td>

                <td className="p-2 border border-gray-700 text-center">
                  <button
                    type="button"
                    onClick={() => setComponents(components.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addProductLine}
          className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
        >
          + Add Line
        </button>

        <div className="flex justify-end mt-6">
          <div className="text-right text-sm font-semibold text-white pr-1">
            Total: {formatNumber(totalAmount)}
          </div>
        </div>
      </div>

    </div>
  )
}
