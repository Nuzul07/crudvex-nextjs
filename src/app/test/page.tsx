"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/card";
import Modal from "@/components/modal";
import ConfirmDialog from "@/components/confirm_dialog";
import AlertDialog from "@/components/alert_dialog";

type Rating = { rate: number; count: number};

type Product =  {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
};

type ProductPayload = {
  title: string
  price: number
  description: string
  category: string
  image: string
}

const baseUrlApi = "https://fakestoreapi.com/products"

const normalizeText = (s: string) => {
  return (s ?? "").toLowerCase().trim()
}

const pagination = (page: number, totalPages: number) => {
  if (totalPages <= 1) return 1
  if (page < 1) return 1
  if (page > totalPages) return totalPages
  return page
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);

  // cari + pagination
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  // product form
  const ProductForm = ({
    mode,
    value,
    onChange,
  } : {
    mode: "add" | "edit" | "view"
    value: ProductPayload
    onChange: (v: ProductPayload) => void
  }) => {
    const readonly = mode === "view"
    // const imageDisabled = true

    const set = (k: keyof ProductPayload, v: any) => onChange({ ...value, [k]: v })

    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Title</label>
          <input 
            value={value.title}
            onChange={(e) => set("title", e.target.value)}
            disabled={readonly}
            className="mt-1 w-full rounded-lg border border-gray-200 text-gray-600 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50"
            placeholder="Judul Produk"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-gray-700">Price</label>
            <input 
              type="number"
              step="0.1"
              value={value.price}
              onChange={(e) => set("price", e.target.value)}
              disabled={readonly}
              className="mt-1 w-full rounded-lg border border-gray-200 text-gray-600 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-700">Category</label>
            <input
              value={value.category}
              onChange={(e) => set("category", e.target.value)}
              disabled={readonly}
              className="mt-1 w-full rounded-lg border border-gray-200 text-gray-600 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50"
              placeholder="misal: pakaian pria"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Description</label>
          <textarea
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            disabled={readonly}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-200 text-gray-600 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50"
            placeholder="Deskripsi produk"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Image URL</label>
          <input
            value={value.image}
            onChange={(e) => set("image", e.target.value)}
            disabled={readonly}
            className="mt-1 w-full rounded-lg border border-gray-200 text-gray-600 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50"
            placeholder="http://example.com"
          />
          {mode === "add" ? (
            <p className="mt-1 text-xs text-gray-500">
              Saat tambah produk, image URL boleh diisi.
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  // modal tambah
  const [openAdd, setOpenAdd] = useState(false)
  
  const TambahProdukModal = ({
    open,
    busy,
    onClose,
    onSubmit
  }: {
    open: boolean
    busy: boolean
    onClose: () => void
    onSubmit: (payload: ProductPayload) => void
  }) => {
    const [form, setForm] = useState<ProductPayload>({
      title: "",
      price: 0.1,
      description: "",
      category: "",
      image: ""
    })

    useEffect(() => {
      if (!open) return
      setForm({
        title: "",
        price: 0.1,
        description: "",
        category: "",
        image: ""
      })
    }, [open])

    const valid = 
      form.title.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      Number(form.price) > 0
    
    return(
      <Modal
        open={open}
        title="Tambah Produk"
        onClose={onClose}
        footer={
          <div className="flex justify-end gap-2">
            <button
              disabled={busy}
              onClick={onClose}
              className="rounded-lg border px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              disabled={busy || !valid}
              onClick={() => onSubmit({ ...form, price: Number(form.price) })}
              className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-900 disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        }
      >
        <ProductForm
          mode="add"
          value={form}
          onChange={setForm}
        />
        {!valid ? (
          <p className="mt-3 text-xs text-black">
            *Wajib: Lengkapi title, description, category, dan price &gt; 0
          </p>
        ) : null}
      </Modal>
    )
  }

  // modal detail
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detail, setDetail] = useState<Product | null>(null)

  const DetailProdukModal = ({
    open,
    busy,
    loading,
    error,
    product,
    onClose,
    onUpdate,
    onDelete,
  } : {
    open: boolean
    busy: boolean
    loading: boolean
    error: string | null
    product: Product | null
    onClose: () => void
    onUpdate: (id: number, payload: ProductPayload) => void
    onDelete: (id: number) => void
  }) => {
    const [editMode, setEditMode] = useState(false)

    const [form, setForm] = useState<ProductPayload>({
      title: "",
      price: 0.1,
      description: "",
      category: "",
      image: ""
    })

    useEffect(() => {
      if (!open) return 
      setEditMode(false)
    }, [open])

    useEffect(() => {
      if (!product) return
      setForm({
        title: product.title ?? "",
        price: product.price ?? 0.1,
        description: product.description ?? "",
        category: product.category ?? "",
        image: product.image ?? ""
      })
    }, [product])

    const canSave =
      form.title.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      Number(form.price) > 0 &&
      !!product;

    const footer = (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {product ? (
            <button
              disabled={busy}
              onClick={() => onDelete(product.id)}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              Hapus
            </button>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <button
            disabled={busy}
            onClick={() => {
              if (editMode) {
                // reset form ke data awal
                if (product) {
                  setForm({
                    title: product.title ?? "",
                    price: Number(product.price ?? 0.1),
                    description: product.description ?? "",
                    category: product.category ?? "",
                    image: product.image ?? "http://example.com",
                  });
                }
                setEditMode(false);
              } else {
                onClose();
              }
            }}
            className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            {editMode ? "Batal Edit" : "Tutup"}
          </button>

          {product ? (
            editMode ? (
              <button
                disabled={busy || !canSave}
                onClick={() => onUpdate(product.id, { ...form, price: Number(form.price) })}
                className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
              >
                Simpan Perubahan
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() => setEditMode(true)}
                className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
              >
                Edit
              </button>
            )
          ) : null}
        </div>
      </div>
    );

    return (
      <Modal
        open={open}
        title={product ? `Detail Produk #${product.id}` : "Detail Produk"}
        onClose={onClose}
        footer={footer}
        widthClassName="max-w-3xl"
      >
        {loading ? (
          <div className="text-sm text-gray-600">Loading detail...</div>
        ) : error ? (
          <div className="text-sm text-gray-600">
            Informasi produk tidak tersedia karena data ini tidak sebenarnya masuk ke database fakestoreapi, silahkan pilih detail produk lainnya.
          </div>
        ) : !product ? (
          <div className="text-sm text-gray-600">Data tidak tersedia.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <img
                src={product.image}
                alt={product.title}
                className="h-56 w-full rounded-xl border object-contain bg-white p-3"
              />
            </div>

            <div className="sm:col-span-2">
              <ProductForm
                mode={editMode ? "edit" : "view"}
                value={form}
                onChange={setForm}
              />
              {!canSave && editMode ? (
                <p className="mt-3 text-xs text-gray-500">
                  Lengkapi title, description, category, dan price &gt; 0.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    );
  }

  // konfirmasi (untuk tambah/update/hapus)
  const [confirm, setConfirm] = useState<{
    open: boolean
    title: string
    message: React.ReactNode
    danger?: boolean
    onYes?: () => Promise<void> | void
  }>({ open: false, title: "Konfirmasi", message: "" })

  const openConfirm = (opts: {
    title: string
    message: React.ReactNode
    danger?: boolean
    onYes: () => Promise<void> | void
  }) => setConfirm({ open: true, ...opts })

  const closeConfirm = () => {
    setConfirm((c) => ({ ...c, open: false, onYes: undefined }))
  }

  // alert dialog
  const [alert, setAlert] = useState<{
    open: boolean
    title?: string
    message: React.ReactNode
    type?: "success" | "error" | "info"
    autoCloseTime?: number
  }>({ open: false, message: "" })

  const showAlert = (opts: {
    title?: string
    message: React.ReactNode
    type?: "success" | "error" | "info"
    autoCloseTime?: number
  }) => setAlert({ open: true, ...opts })

  const closeAlert = () => setAlert((a) => ({ ...a, open: false }))

  // fetch data saat halaman pertama kali dibuka
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(baseUrlApi);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - gagal ambil data`);
        }
        const json: Product[] = await res.json();
        setProducts(json);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Terjadi error saat ambil data");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [])

  // filter data
  const filtered = useMemo(() => {
    const q = normalizeText(query)
    if (!q) return products

    return products.filter((p) => {
      const params =
        normalizeText(p.title) +
        " " +
        normalizeText(p.category)
      return params.includes(q)
    })
  }, [products, query])

  // pagination
  const totalPages = useMemo(() => {
    const total = filtered.length
    return Math.max(1, Math.ceil(total / pageSize))
  }, [filtered.length, pageSize])

  useEffect(() => {
    setPage((p) => pagination(p, totalPages))
  }, [totalPages])

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const openDetailById = async (id: number) => {
    setSelectedId(id)
    setOpenDetail(true)
    setDetail(null)
    setDetailError(null)

    try {
      setDetailLoading(true)
      const res = await fetch(`${baseUrlApi}/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status} - gagal dapat detail`)
      const json: Product = await res.json()
      setDetail(json)
    } catch (e: any) {
      setDetailError(e?.message ?? "Gagal mendapatkan detail produk")
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    if (busy) return
    setOpenDetail(false)
    setSelectedId(null)
    setDetail(null)
    setDetailError(null)
  }

  const tambahProduk = async (payload: ProductPayload) => {
    const res = await fetch(baseUrlApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} - gagal simpan produk`);
    const created: Product = await res.json()

    // update lokal (gaperlu fetch api, agar muncul)
    setProducts((prev) => [{ ...created }, ...prev])
  }

  const updateProduk = async (id: number, payload: ProductPayload) => {
    const res = await fetch(`${baseUrlApi}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} - gagal update produk`);
    const updated: Product = await res.json()

    // update lokal (gaperlu fetch api, agar terupdate)
    setProducts((prev) => prev.map((p) => (p.id === id ? {...p, ...updated} : p)))
    setDetail((prev) => (prev ? { ...prev, ...updated } : prev))
  }

  const hapusProduk = async (id: number) => {
    const res = await fetch(`${baseUrlApi}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error(`HTTP ${res.status} - gagal hapus produk`);

    // update lokal (gaperlu fetch api, agar terhapus)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    closeDetail()
  }

  const showingText = useMemo(() => {
    const total = filtered.length
    if (total === 0) return "Menampilkan 0 produk"
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)
    return `Menampilkan ${start}-${end} dari ${total} produk`
  }, [filtered.length, page, pageSize])

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans">
      <main className="min-h-screen w-full py-10 px-6 sm:px-10 lg:px-16">
        {/* header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Daftar Produk</h1>
            <p className="mt-1 text-sm text-gray-500">{showingText}</p>
          </div>

          <button
            onClick={() => setOpenAdd(true)}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-900 sm:w-auto"
          >
            + Tambah Produk
          </button>
        </div>

        {/* search + page size */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Cari judul / kategori..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-400"
            />
          </div>
        </div>
        
        <div className="mb-5 flex items-center gap-2">
          <span className="text-sm text-gray-600">Per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 cursor-pointer"
          >
            {[4, 8, 12, 16].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

          {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
          )}

          {loading ? (
              <div className="text-xl text-center text-gray-600">Loading...</div>
          ) : (
            <>
              {/* === grid card === */}
              { paged.length === 0  ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
                    Tidak ada produk yang cocok dengan pencarian
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {paged.map((product) => (
                      <Card<Product>
                      key={product.id}
                      data={product}
                      onClick={(item) => openDetailById(item.id)}
                      konten={(p) => (
                          <>
                            <img
                                src={p.image}
                                alt={p.title}
                                className="mb-3 h-40 w-full rounded-lg object-contain"
                            />

                            <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">
                                {p.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {p.description}
                            </p>
                          </>
                      )}
                      footer={(p) => (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-900">
                                ${p.price.toFixed(2)}
                            </span>
                            <span className="text-gray-500">
                                ⭐ {p.rating?.rate ?? "-"}
                            </span>
                          </div>
                      )}
                      />
                  ))}
                </div>
              )}

              {/* === pagination === */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  Halaman <span className="font-semibold">{page}</span> / {totalPages}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 disabled:opacity-50"
                  >
                    Kembali
                  </button>

                  {/* nomor halaman */}
                  <div className="flex items-center gap-1">
                    {Array.from({length: totalPages}).slice(0, 8).map((_, i) => {
                      const n = i + 1
                      const active = n === page
                      return (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className={`h-9 w-9 rounded-lg text-sm cursor-pointer ${active ? "bg-black text-white" : "border text-gray-700 hover:bg-gray-100"}`}
                        >
                          {n}
                        </button>
                      )
                    })}
                    {totalPages > 8 ? (
                      <span className="px-2 text-sm text-gray-500">...</span>
                    ) : null}
                  </div>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 disabled:opacity-50"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            </>
          )}

          {/* === modal tambah === */}
          <TambahProdukModal
            open={openAdd}
            busy={busy}
            onClose={() => (busy ? null : setOpenAdd(false))}
            onSubmit={(payload) => {
              openConfirm({
                title: "Simpan Produk",
                message: (
                  <div>
                    Yakin simpan produk baru: <b>{payload.title}</b>?
                  </div>
                ),
                onYes: async () => {
                  try {
                    setBusy(true)
                    await tambahProduk(payload)
                    setOpenAdd(false)
                    showAlert({
                      title: "Sukses",
                      type: "success",
                      message: "Data berhasil disimpan",
                      autoCloseTime: 3500,
                    })
                  } catch (e: any) {
                    showAlert({
                      title: "Gagal",
                      type: "error",
                      message: e?.message ?? "Gagal menyimpan produk",
                    })
                  } finally {
                    setBusy(false)
                    closeConfirm()
                  }
                }
              })
            }}
          />

          {/* === modal detail === */}
          <DetailProdukModal
            open={openDetail}
            busy={busy}
            loading={detailLoading}
            error={detailError}
            product={detail}
            onClose={closeDetail}
            onUpdate={(id, payload) => {
              openConfirm({
                title: "Udpdate Produk",
                message: (
                  <div>
                    Yakin update produk <b>#{id}</b>?
                  </div>
                ),
                onYes: async () => {
                  try {
                    setBusy(true)
                    await updateProduk(id, payload)
                    showAlert({
                      title: "Sukses",
                      type: "info",
                      message: "Data berhasil diperbarui",
                      autoCloseTime: 3500,
                    })
                  } catch (e: any) {
                    showAlert({
                      title: "Gagal",
                      type: "error",
                      message: e?.message ?? "Gagal memperbarui produk",
                    })
                  } finally {
                    setBusy(false)
                    closeConfirm()
                  }
                }
              })
            }}
            onDelete={(id) => {
              openConfirm({
                title: "Hapus Produk",
                danger: true,
                message: (
                  <div>
                    Produk <b>#{id}</b> akan dihapus. Yakin?
                  </div>
                ),
                onYes: async () => {
                  try {
                    setBusy(true)
                    await hapusProduk(id)
                    showAlert({
                      title: "Sukses",
                      type: "info",
                      message: "Data berhasil dihapus",
                      autoCloseTime: 3500,
                    })
                  } catch (e: any) {
                    showAlert({
                      title: "Gagal",
                      type: "error",
                      message: e?.message ?? "Gagal menghapus produk",
                    })
                  } finally {
                    setBusy(false)
                    closeConfirm()
                  }
                }
              })
            }}
          />

          {/* konfirmasi dialog */}
          <ConfirmDialog 
            open={confirm.open}
            title={confirm.title}
            message={confirm.message}
            danger={confirm.danger}
            loading={busy}
            onCancel={closeConfirm}
            onConfirm={async () => {
              if (!confirm.onYes) return
              await confirm.onYes()
            }}
          />

          {/* alert dialog */}
          <AlertDialog
            open={alert.open}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            autoCloseTime={alert.autoCloseTime}
            onClose={closeAlert}
          />
      </main>
    </div>
  );
}