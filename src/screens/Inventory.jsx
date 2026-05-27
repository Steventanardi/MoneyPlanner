import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import BarcodeScanner from '../components/BarcodeScanner';
import { getExpiryInfo, EMPTY_FORM } from '../components/inventory/inventoryUtils';
import InventoryHeader from '../components/inventory/InventoryHeader';
import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryItemList from '../components/inventory/InventoryItemList';
import InventoryFormModal from '../components/inventory/InventoryFormModal';

const Inventory = () => {
  const { data, currentUser, addInventoryItem, updateInventoryItem, deleteInventoryItem, pushToSupabase } = useStore();
  const [filter, setFilter]         = useState('all');
  const [sort, setSort]             = useState('expiry');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showScanner, setShowScanner]   = useState(false);

  const items = useMemo(() =>
    (data.inventory || []).filter(i => i.userId === currentUser?.id),
    [data.inventory, currentUser]
  );

  const stats = useMemo(() => {
    const totalQty   = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const totalValue = items.reduce((s, i) => s + Number(i.buyPrice || 0), 0);
    const urgent     = items.filter(i => { const { daysLeft } = getExpiryInfo(i.expiryDate); return daysLeft !== null && daysLeft <= 7; }).length;
    return { total: items.length, totalQty, totalValue, urgent };
  }, [items]);

  const sortedItems = useMemo(() => {
    const list = filter === 'expiring'
      ? items.filter(i => { const { daysLeft } = getExpiryInfo(i.expiryDate); return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7; })
      : filter === 'expired'
      ? items.filter(i => { const { daysLeft } = getExpiryInfo(i.expiryDate); return daysLeft !== null && daysLeft < 0; })
      : [...items];

    const filtered = search.trim()
      ? list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.notes || '').toLowerCase().includes(search.toLowerCase()))
      : list;

    return filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'value') return Number(b.buyPrice || 0) - Number(a.buyPrice || 0);
      if (sort === 'newest') return new Date(b.buyDate || 0) - new Date(a.buyDate || 0);
      const ai = getExpiryInfo(a.expiryDate), bi = getExpiryInfo(b.expiryDate);
      if (ai.daysLeft === null && bi.daysLeft === null) return 0;
      if (ai.daysLeft === null) return 1;
      if (bi.daysLeft === null) return -1;
      return ai.daysLeft - bi.daysLeft;
    });
  }, [items, filter, sort, search]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, buyDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name || '', quantity: item.quantity || '', buyDate: item.buyDate || '', expiryDate: item.expiryDate || '', buyPrice: item.buyPrice || '', notes: item.notes || '' });
    setShowModal(true);
  };

  const isFormValid = form.name.trim() && form.quantity && form.buyPrice && form.buyDate;

  const handleSave = () => {
    if (!isFormValid) return;
    const payload = { ...form, quantity: Number(form.quantity), buyPrice: Number(form.buyPrice) };
    if (editItem) updateInventoryItem(editItem.id, payload);
    else addInventoryItem(payload);
    pushToSupabase();
    setShowModal(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteInventoryItem(id);
      pushToSupabase();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(c => c === id ? null : c), 3000);
    }
  };

  const handleScanResult = ({ name }) => {
    setShowScanner(false);
    if (name) setForm(f => ({ ...f, name }));
  };

  return (
    <div className="screen-container" style={{ paddingBottom: '120px' }}>
      <InventoryHeader stats={stats} onAdd={openAdd} />

      <InventoryFilters
        search={search} setSearch={setSearch}
        filter={filter} setFilter={setFilter}
        sort={sort} setSort={setSort}
      />

      <InventoryItemList
        sortedItems={sortedItems}
        filter={filter}
        deleteConfirm={deleteConfirm}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <AnimatePresence>
        {showScanner && (
          <BarcodeScanner
            onResult={handleScanResult}
            onCancel={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>

      <InventoryFormModal
        showModal={showModal}
        editItem={editItem}
        form={form}
        setForm={setForm}
        isFormValid={isFormValid}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
        onScanClick={() => setShowScanner(true)}
      />
    </div>
  );
};

export default Inventory;
