import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

/**
 * Обща логика за модални форми с една снимка (категории, банери):
 * отваряне за създаване/редакция, полета, файл, запис и изтриване.
 */
export const useImageEntityForm = ({ empty, toForm, api, invalidates, labels }) => {
  const [editing, setEditing] = useState(null); // null = затворено, {} = ново, обект = редакция
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const isEdit = Boolean(editing?._id);

  const open = (entity = {}) => {
    setEditing(entity);
    setForm(entity._id ? toForm(entity) : empty);
    setFile(null);
    setRemoveImage(false);
  };
  const close = () => setEditing(null);

  const save = useMutation({
    mutationFn: (values) => (isEdit ? api.update(editing._id, values, file) : api.create(values, file)),
    meta: { successMessage: isEdit ? labels.updated : labels.created, invalidates },
    onSuccess: close,
  });

  const remove = useMutation({
    mutationFn: (id) => api.remove(id),
    meta: { successMessage: labels.deleted, invalidates },
    onSuccess: () => setToDelete(null),
  });

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const currentImage = !removeImage && !file ? editing?.image : null;

  return {
    editing,
    isEdit,
    form,
    set,
    file,
    setFile,
    currentImage,
    removeCurrentImage: () => setRemoveImage(true),
    removeImage,
    open,
    close,
    save,
    remove,
    toDelete,
    setToDelete,
  };
};
